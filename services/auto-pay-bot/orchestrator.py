import os
import asyncio
import base64
import re
import aiohttp
from banesco_rpa import ejecutar_pago_banesco, cerrar_sesion_banesco, cargar_cuentas_banesco

def normalize_telegram_chat_id(cid: str) -> str:
    if not cid:
        return ""
    cid_str = str(cid).strip()
    if cid_str.startswith("-") and not cid_str.startswith("-100"):
        return f"-100{cid_str[1:]}"
    return cid_str

# Configuración
NEXTJS_API_URL = os.getenv("NEXTJS_API_URL", "http://admin-dashboard:3000") # Docker service name en EasyPanel
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = normalize_telegram_chat_id(os.getenv("TELEGRAM_CHAT_ID", ""))
TELEGRAM_REPORTS_CHAT_ID = normalize_telegram_chat_id(os.getenv("TELEGRAM_REPORTS_CHAT_ID", ""))

engine_state = {
    "is_running": False,
    "assigned_orders": set(), # Para no re-procesar las mismas todo el tiempo
    "last_payment_time": 0,
    "rr_index": 0
}

async def send_telegram(text: str, chat_id: str = None, is_error: bool = False):
    if not TELEGRAM_BOT_TOKEN:
        return
    
    target_chats = []
    if chat_id:
        target_chats.append(normalize_telegram_chat_id(chat_id))
    else:
        # Siempre enviar al canal General para visualización paso a paso y estancamientos
        if TELEGRAM_CHAT_ID:
            target_chats.append(TELEGRAM_CHAT_ID)
        # Si es un error/alerta y existe canal de reportes separado, enviar también allí
        if is_error and TELEGRAM_REPORTS_CHAT_ID and TELEGRAM_REPORTS_CHAT_ID not in target_chats:
            target_chats.append(TELEGRAM_REPORTS_CHAT_ID)

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    try:
        async with aiohttp.ClientSession() as session:
            for cid in target_chats:
                payload = {"chat_id": cid, "text": text, "parse_mode": "HTML"}
                await session.post(url, json=payload)
    except Exception as e:
        print(f"[Telegram Error] {e}")

async def send_telegram_photo(photo_path: str, caption: str, chat_id: str = None, is_error: bool = False):
    if not TELEGRAM_BOT_TOKEN or not os.path.exists(photo_path):
        return
        
    target_chats = []
    if chat_id:
        target_chats.append(normalize_telegram_chat_id(chat_id))
    else:
        if TELEGRAM_CHAT_ID:
            target_chats.append(TELEGRAM_CHAT_ID)
        if is_error and TELEGRAM_REPORTS_CHAT_ID and TELEGRAM_REPORTS_CHAT_ID not in target_chats:
            target_chats.append(TELEGRAM_REPORTS_CHAT_ID)

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendPhoto"
    try:
        with open(photo_path, 'rb') as f:
            photo_bytes = f.read()

        filename = os.path.basename(photo_path) or "photo.png"
        async with aiohttp.ClientSession() as session:
            for cid in target_chats:
                data = aiohttp.FormData()
                data.add_field('chat_id', cid)
                data.add_field('caption', caption)
                data.add_field('photo', photo_bytes, filename=filename)
                async with session.post(url, data=data) as resp:
                    if resp.status != 200:
                        err_text = await resp.text()
                        print(f"[Telegram Photo Error to {cid}] Status {resp.status}: {err_text}")
    except Exception as e:
        print(f"[Telegram Error] {e}")

async def assign_order(session, order_id):
    url = f"{NEXTJS_API_URL}/api/orders/assignments"
    try:
         async with session.post(url, json={"orderId": order_id, "operatorId": "BOT", "operatorName": "Auto-Pay Bot"}) as r:
             return r.status in [200, 201]
    except:
         return False

async def process_payment_task(o_id, order, cedula, account, formatted_amount, cuenta_asignada, banco_destino="0134", nombre_beneficiario="Pago"):
    try:
        async with aiohttp.ClientSession() as session:
            # PASO A PASO: Inyección automática al RPA en Background
            print(f"[Orchestrator] Lanzando pago {o_id} en cuenta {cuenta_asignada['user']} (Background)")
            success = await ejecutar_pago_banesco(cedula, account, account, float(formatted_amount), cuenta_asignada=cuenta_asignada, banco_destino=banco_destino, nombre_beneficiario=nombre_beneficiario)
            engine_state["session_active"] = True
            
            import time
            engine_state["last_payment_time"] = time.time()
            
            if success:
                print(f"[Orchestrator] Pago RPA completado para {o_id}. Enviando comprobante a Binance...")
                await send_telegram(f"⏳ RPA Banesco Exitoso para <b>{o_id}</b> (Cuenta: {cuenta_asignada['user']}). Subiendo comprobante a la plataforma...")
                
                # 1. Subir Comprobante a Telegram y Binance
                receipt_path = f"debug_recibo_{account}.png"
                if not os.path.exists(receipt_path):
                    # Fallback por si acaso guardó con el nombre genérico
                    if os.path.exists("debug_recibo.png"):
                        import shutil
                        shutil.copy("debug_recibo.png", receipt_path)
                
                if os.path.exists(receipt_path):
                    await send_telegram_photo(receipt_path, f"✅ Operación Sometida Definitiva (Operador Banesco: {cuenta_asignada['user']}) para {o_id}")
                    
                try:
                    if os.path.exists(receipt_path):
                        with open(receipt_path, "rb") as f:
                            form = aiohttp.FormData()
                            form.add_field('image', f, filename='comprobante.png', content_type='image/png')
                            upload_url = f"{NEXTJS_API_URL}/api/{order['exchange']}/order/{o_id}/upload-proof"
                            async with session.post(upload_url, data=form) as up_res:
                                up_data = await up_res.json()
                                if up_data.get("ok"):
                                    print(f"[Orchestrator] Comprobante subido OK para {o_id}")
                                    try:
                                        os.remove(receipt_path)
                                    except:
                                        pass
                                else:
                                    print(f"[Orchestrator] Falla al subir comprobante para {o_id}: {up_data}")
                except Exception as upload_e:
                    print(f"[Orchestrator] Excepción al subir comprobante: {upload_e}")
                
                # 2. Marcar como Pagado
                try:
                    pay_url = f"{NEXTJS_API_URL}/api/{order['exchange']}/order/{o_id}/mark-paid"
                    async with session.post(pay_url, json={}) as mark_res:
                        mark_data = await mark_res.json()
                        if mark_data.get("ok"):
                            print(f"[Orchestrator] Orden {o_id} marcada como PAGADA con éxito.")
                            await send_telegram(f"✅ <b>¡ORDEN {o_id} COMPLETADA FULL RPA!</b>\nOperador Banesco: <b>{cuenta_asignada['user']}</b>\nComprobante adjuntado y marcada como pagada en {order['exchange'].capitalize()}.")
                        else:
                            print(f"[Orchestrator] Falla al marcar pagado para {o_id}: {mark_data}")
                            await send_telegram(f"⚠️ RPA completó el pago pero falló al presionar el botón 'Pagado' en {order['exchange'].capitalize()} para la orden {o_id}.\nOperador: {cuenta_asignada['user']}\nMotivo: {mark_data.get('error', 'Desconocido')}", is_error=True)
                except Exception as mark_e:
                    print(f"[Orchestrator] Excepción al marcar pagado: {mark_e}")
            else:
                print(f"[Orchestrator] RPA Falló para la orden {o_id}. Abortando Subida de Recibo y Marca de Pago.")
                await send_telegram(f"❌ <b>RPA Falló</b> para la orden {o_id} usando cuenta {cuenta_asignada['user']}. El pago <b>NO</b> fue ejecutado ni marcado en plataforma. Por favor, revise manualmente.", is_error=True)
                
        # Al finalizar, marcamos como procesado permanentemente en esta sesion para evitar pago doble
        # NO lo removemos de processing_orders, porque si la API de Binance tiene lag de caché,
        # lo volverá a procesar al instante causando un doble pago.
        engine_state.setdefault("completed_orders", set()).add(o_id)
    except Exception as e:
        print(f"[Orchestrator Task Error] Fallo critico en tarea de pago {o_id}: {e}")

async def run_orchestrator_loop():
    print("[Orchestrator] Bucle iniciado en segundo plano.")
    
    # Initialize state variables
    engine_state.setdefault("requested_data_orders", {})
    engine_state.setdefault("session_active", False)
    
    async with aiohttp.ClientSession() as session:
        
        while True:
            if not engine_state["is_running"]:
                await asyncio.sleep(5)
                continue
            
            orders_processed = False
            try:
                # 1. Obtener órdenes
                async with session.get(f"{NEXTJS_API_URL}/api/binance/orders") as r:
                    bin_data = await r.json() if r.status == 200 else {"orders": []}
                async with session.get(f"{NEXTJS_API_URL}/api/bybit/orders") as r:
                    byb_data = await r.json() if r.status == 200 else {"orders": []}
                async with session.get(f"{NEXTJS_API_URL}/api/orders/assignments") as r:
                    assignments = await r.json() if r.status == 200 else {}

                all_orders = bin_data.get("orders", []) + byb_data.get("orders", [])
                
                # Filtrar órdenes
                target_orders = [
                    o for o in all_orders 
                    if o.get("side") == "BUY" 
                    and o.get("statusRaw") in ["PENDING", "TRADING"]
                    and ("banesco" in (o.get("paymentMethod") or "").lower() or "pago" in (o.get("paymentMethod") or "").lower() or "mobile" in (o.get("paymentMethod") or "").lower())
                ]
                
                # ORDENAR DE MÁS VIEJA A MÁS NUEVA:
                # La API devuelve createdAt en formato ISO. Ordenamos alfabéticamente (lo cual es cronológico en ISO8601)
                target_orders.sort(key=lambda x: x.get("createdAt", ""))

                # Separar ordenes invalidas y ordenes validas
                valid_orders = []
                for order in target_orders:
                    o_id = order["id"]
                    is_binance = order["exchange"] == "binance"
                    details_url = f"{NEXTJS_API_URL}/api/binance/order/{o_id}" if is_binance else f"{NEXTJS_API_URL}/api/bybit/order/{o_id}"
                    
                    async with session.get(details_url) as r:
                        order_details = await r.json() if r.status == 200 else {}
                    
                    order["cached_details"] = order_details
                        
                    result = order_details.get("result", {})
                    account = result.get("chatDetectedAccount")
                    status_raw = result.get("statusRaw")
                    
                    if status_raw and status_raw not in ["PENDING", "TRADING", 1, 2, "1", "2"]:
                        print(f"[Orquestador] ⚠️ Orden {o_id} ya no está PENDIENTE/TRADING (Estado: {status_raw}). Evitando pago doble.")
                        # await send_telegram(f"ℹ️ La orden <b>{o_id}</b> fue procesada externamente (Estado: {status_raw}). Saltando pago.", chat_id="-1003879902403")
                        continue
                        
                    es_pago_movil_ord = "pago" in (order.get("paymentMethod") or "").lower() or "mobile" in (order.get("paymentMethod") or "").lower() or (account and len(account) == 11 and account.startswith("04"))
                    
                    if account and not account.startswith("0134") and not es_pago_movil_ord:
                        if o_id not in engine_state.get("notified_bad_orders", set()):
                            print(f"[Orquestador] ⚠️ Cuenta {account} inválida para Banesco/Pago Movil. Saltando orden {o_id}.")
                            await send_telegram(f"⚠️ La cuenta <code>{account}</code> de la orden <b>{o_id}</b> NO es de Banesco ni Pago Móvil. Orden saltada.", is_error=True)
                            if "notified_bad_orders" not in engine_state:
                                engine_state["notified_bad_orders"] = set()
                            engine_state["notified_bad_orders"].add(o_id)
                    else:
                        valid_orders.append(order)

                # PERO si pasa más de 2 minutos inactivo, cerramos por seguridad.
                import time
                if not valid_orders:
                    if engine_state.get("session_active"):
                        tiempo_inactivo = time.time() - engine_state.get("last_payment_time", time.time())
                        if tiempo_inactivo > 120:
                            print(f"[Orquestador] Más de 120s sin pagos ({int(tiempo_inactivo)}s). Cerrando sesión de Banesco por seguridad.")
                            await cerrar_sesion_banesco()
                            engine_state["session_active"] = False
                        else:
                            print(f"[Orquestador] Cola vacía o con órdenes inválidas. Manteniendo sesión en Background (Inactivo: {int(tiempo_inactivo)}s)...")
                
                for order in valid_orders:
                    if not engine_state["is_running"]:
                        break
                        
                    o_id = order["id"]
                    
                    # Chequeo CRÍTICO anti-spam y anti-doble pago al inicio del bucle
                    if o_id in engine_state.setdefault("processing_orders", set()) or o_id in engine_state.setdefault("completed_orders", set()):
                        continue
                        
                    assign = assignments.get(o_id)
                    
                    if assign and assign.get("operatorId") != "BOT":
                        continue # Tomada por un humano

                    # 1. Asignar al BOT si es nueva
                    if not assign and o_id not in engine_state.setdefault("assigned_orders", set()):
                        assigned_ok = await assign_order(session, o_id)
                        if assigned_ok:
                            engine_state["assigned_orders"].add(o_id)
                            await send_telegram(f"🤖 <b>Orden {o_id}</b> tomada por el Bot.\nMonto: {order['amount']} {order['currencyId']}")
                        else:
                            print(f"[Orquestador] Falla al asignar orden {o_id} en la BD. Reintentando próximo ciclo.")
                            continue
                        
                    is_binance = order["exchange"] == "binance"
                    
                    # Reutilizar los detalles cacheados en el bucle de validación para evitar duplicar el scrapeo lento de Binance
                    order_details = order.get("cached_details", {})
                        
                    # Extraer datos usando la lógica del API
                    result = order_details.get("result", {})
                    account = result.get("chatDetectedAccount")
                    cedula = result.get("chatDetectedCedula")
                    banco = result.get("chatDetectedBank") or result.get("bankName") or "0134"
                    nombre_beneficiario = result.get("accountHolder") or "Pago"
                    
                    if account and cedula:

                        amount_val = order.get('amountFiat') or order.get('amount')
                        try:
                            formatted_amount = f"{float(amount_val):.2f}"
                            float_amount = float(amount_val)
                        except ValueError:
                            formatted_amount = str(amount_val)
                            float_amount = 0.0
                            
                        # Mensaje formateado para copiar fácil en Telegram
                        msg = f"✅ Datos obtenidos para la orden <b>{o_id}</b>\n\nToca el bloque de abajo para copiar todo:\n\n"
                        msg += f"<code>{formatted_amount}\n{account}\n{cedula}</code>"
                        
                        await send_telegram(msg)
                        
                        cuentas_disponibles = cargar_cuentas_banesco()
                        if not cuentas_disponibles:
                             print("[Orchestrator] ALERTA: No hay cuentas configuradas para operar. Abortando orden.")
                             continue
                             
                        # Filtrar cuentas por limites
                        cuentas_elegibles = [
                            c for c in cuentas_disponibles 
                            if c.get("min", 0) <= float_amount <= c.get("max", 9999999)
                        ]
                        
                        if not cuentas_elegibles:
                             print(f"[Orchestrator] ALERTA: Ninguna cuenta Banesco activa tiene limites que cubran el monto de {float_amount} VES para la orden {o_id}. Abortando orden.")
                             await send_telegram(f"⚠️ <b>ALERTA DE LÍMITES</b>\nLa orden <b>{o_id}</b> por <code>{formatted_amount} VES</code> no pudo ser procesada porque ninguna de tus cuentas activas tiene un rango (Min-Max) que cubra este monto. Se ha saltado la orden.", is_error=True)
                             # Lo agregamos a procesadas para no repetir la alerta en bucle
                             engine_state.setdefault("completed_orders", set()).add(o_id)
                             continue
                             
                        # Obtener cuenta actual por Round-Robin
                        idx = engine_state.get("rr_index", 0) % len(cuentas_elegibles)
                        cuenta_asignada = cuentas_elegibles[idx]
                        engine_state["rr_index"] = idx + 1
                        
                        # Marcar como que ya estamos procesando para no disparar otra tarea en el prox ciclo
                        engine_state["processing_orders"].add(o_id)
                        
                        # Disparar tarea en segundo plano real
                        asyncio.create_task(process_payment_task(o_id, order, cedula, account, formatted_amount, cuenta_asignada, banco, nombre_beneficiario))
                        orders_processed = True
                        engine_state["session_active"] = True
                        import time
                        engine_state["last_payment_time"] = time.time()
                            
                    else:
                        import time
                        now_ts = time.time()
                        last_req = engine_state.setdefault("requested_data_orders", {}).get(o_id, 0)
                        
                        if is_binance and (now_ts - last_req > 180):
                            engine_state["requested_data_orders"][o_id] = now_ts
                            
                            # Disparamos la petición de datos en segundo plano
                            async def request_data_bg(order_id):
                                try:
                                    async with aiohttp.ClientSession() as bg_session:
                                        await bg_session.post(f"{NEXTJS_API_URL}/api/binance/order/{order_id}/chat/request-data")
                                except Exception as e:
                                    print(f"[Orquestador] Error al solicitar datos en BG para {order_id}: {e}")
                                    
                            asyncio.create_task(request_data_bg(o_id))
                            
                            await send_telegram(f"⚠️ <b>Orden incompleta por falta de datos ({o_id})</b>. Pidiendo a NextJS que revise el chat en segundo plano...", is_error=True)
                        else:
                            # Ya se pidió la data, pero sigue sin llegar
                            # Solo imprimir cada 5 ciclos para no hacer spam (rr_index se incrementa, podemos usarlo, o un contador global)
                            if int(time.time()) % 15 == 0:
                                print(f"[Orquestador] ⏳ Esperando datos bancarios (cuenta/cédula) para la orden {o_id} desde la API de NextJS...")

            except Exception as e:
                engine_state["last_error"] = str(e)
                print(f"[Orchestrator Error] {e}")
            
            if orders_processed:
                await asyncio.sleep(2)
            else:
                await asyncio.sleep(15)
