import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Shield, Zap, Clock, TrendingUp, CheckCircle2, ArrowRight,
  Terminal, Bot, Users, Banknote, Calculator, Lock,
  ChevronDown, ChevronUp, Star, Crown, Sparkles, DollarSign, Timer
} from 'lucide-react';
import { CALENDLY_URL, getDemoUrl } from '../config';

// Loom video URL from env, or empty to hide the section
const LOOM_VIDEO_URL = 'https://www.loom.com/share/555b816928064198ab1bb0a8a26b8fd7';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
};

/* ─── Loom Video Embed ─── */
function LoomVideo() {
  if (!LOOM_VIDEO_URL) return null;

  // Convert share URL to embed URL
  // https://www.loom.com/share/xxx → https://www.loom.com/embed/xxx
  const embedUrl = LOOM_VIDEO_URL.replace('/share/', '/embed/');

  return (
    <motion.div {...fadeUp} transition={{ duration: 0.7 }}>
      <div style={{
        maxWidth: 800, margin: '0 auto 60px',
        borderRadius: 16, overflow: 'hidden',
        border: '1px solid var(--j-border)',
        boxShadow: '0 0 40px rgba(0,255,65,0.06)',
      }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={embedUrl}
            frameBorder="0"
            allowFullScreen
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── ROI Calculator ─── */
function RoiCalculator() {
  const [ordersPerDay, setOrdersPerDay] = useState(600);
  const [profitPerOrder, setProfitPerOrder] = useState(0.50);

  const dailyProfit = ordersPerDay * profitPerOrder;
  const monthlyProfit = dailyProfit * 30;
  const escaladoCostDay = 149 / 30;
  const magnateCostDay = 497 / 30;

  return (
    <motion.div {...fadeUp} transition={{ duration: 0.7 }}>
      <div className="jarvis-card jarvis-card-highlight" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--j-green-bg2)', border: '1px solid rgba(0,255,65,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Calculator size={22} style={{ color: 'var(--j-green)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Calculadora de Rentabilidad</h3>
            <p style={{ fontSize: 13, color: 'var(--j-text-dim)' }}>Ajusta los valores a tu operación real</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
          {/* Orders per day */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--j-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'block' }}>
              Órdenes procesadas / Día
            </label>
            <input
              type="range" min={100} max={1200} step={50} value={ordersPerDay}
              onChange={e => setOrdersPerDay(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--j-green)' }}
            />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 800, color: 'var(--j-green)', marginTop: 4 }}>
              {ordersPerDay} órdenes
            </div>
            <div style={{ fontSize: 11, color: 'var(--j-text-muted)', marginTop: 2 }}>
              El bot puede procesar ~600 pagos en 5 horas
            </div>
          </div>
          {/* Profit per order */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--j-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'block' }}>
              Ganancia por orden (USD)
            </label>
            <input
              type="range" min={0.25} max={2.00} step={0.05} value={profitPerOrder}
              onChange={e => setProfitPerOrder(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--j-green)' }}
            />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 800, color: 'var(--j-green)', marginTop: 4 }}>
              ${profitPerOrder.toFixed(2)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--j-text-muted)', marginTop: 2 }}>
              Ganancia neta promedio por orden P2P
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{
          background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.15)',
          borderRadius: 12, padding: 24,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--j-text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>Ganancia diaria</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 900, color: 'var(--j-green)' }}>
                ${dailyProfit.toFixed(0)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--j-text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>Ganancia mensual</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 900, color: '#fff' }}>
                ${monthlyProfit.toLocaleString('en-US')}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--j-text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>Costo Escalado / día</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--j-cyan)' }}>
                ${escaladoCostDay.toFixed(2)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--j-green)', fontWeight: 700, marginTop: 4 }}>
                Ganancia neta: ${(dailyProfit - escaladoCostDay).toFixed(0)}/día
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--j-text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>Costo Magnate / día</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--j-violet)' }}>
                ${magnateCostDay.toFixed(2)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--j-green)', fontWeight: 700, marginTop: 4 }}>
                Ganancia neta: ${(dailyProfit - magnateCostDay).toFixed(0)}/día
              </div>
            </div>
          </div>

          {/* Highlight */}
          <div style={{
            marginTop: 20, padding: '12px 16px', borderRadius: 8,
            background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)',
            textAlign: 'center', fontSize: 14, color: 'var(--j-text)',
          }}>
            💰 Con <strong style={{ color: 'var(--j-green)' }}>{ordersPerDay} órdenes/día</strong> a <strong style={{ color: 'var(--j-green)' }}>${profitPerOrder.toFixed(2)}</strong> por orden, 
            tu ganancia mensual es <strong style={{ color: '#fff', fontSize: 16 }}>${monthlyProfit.toLocaleString('en-US')}</strong> — 
            el plan Magnate cuesta solo el <strong style={{ color: 'var(--j-violet)' }}>{((497 / monthlyProfit) * 100).toFixed(1)}%</strong> de tu ganancia
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Comparison Table ─── */
function ComparisonSection() {
  const rows = [
    { feature: 'Panel de Gestión de Órdenes', escalado: true, magnate: true },
    { feature: 'Multi-Exchange (Binance + Bybit)', escalado: true, magnate: true },
    { feature: 'Asignación de Operadores', escalado: true, magnate: true },
    { feature: 'Monitoreo en Tiempo Real', escalado: true, magnate: true },
    { feature: 'Historial y Métricas', escalado: true, magnate: true },
    { feature: 'Sin verificar múltiples cuentas Binance', escalado: true, magnate: true },
    { feature: 'Auto-Pay Bot (Pagos Automáticos)', escalado: false, magnate: true },
    { feature: 'Cuenta Banesco automatizada', escalado: false, magnate: true },
    { feature: 'Comprobantes automáticos a Telegram', escalado: false, magnate: true },
    { feature: 'Liberación automática de órdenes', escalado: false, magnate: true },
    { feature: 'Soporte prioritario 24/7', escalado: false, magnate: true },
  ];

  return (
    <motion.div {...fadeUp} transition={{ duration: 0.7 }} style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 14, color: 'var(--j-text-dim)', borderBottom: '1px solid var(--j-border)' }}>
                Funcionalidad
              </th>
              <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 14, color: 'var(--j-cyan)', borderBottom: '1px solid var(--j-border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Star size={14} /> Escalado
                </span>
              </th>
              <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 14, color: 'var(--j-violet)', borderBottom: '1px solid var(--j-border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Crown size={14} /> Magnate
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--j-text)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {row.feature}
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {row.escalado ? (
                    <CheckCircle2 size={18} style={{ color: 'var(--j-green)', margin: '0 auto' }} />
                  ) : (
                    <span style={{ color: 'var(--j-text-muted)', fontSize: 18 }}>—</span>
                  )}
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {row.magnate ? (
                    <CheckCircle2 size={18} style={{ color: 'var(--j-green)', margin: '0 auto' }} />
                  ) : (
                    <span style={{ color: 'var(--j-text-muted)', fontSize: 18 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ─── FAQ ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="jarvis-card"
      style={{ padding: '20px 24px', cursor: 'pointer' }}
      onClick={() => setOpen(!open)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{q}</span>
        {open ? <ChevronUp size={18} style={{ color: 'var(--j-green)' }} /> : <ChevronDown size={18} style={{ color: 'var(--j-text-dim)' }} />}
      </div>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ fontSize: 14, color: 'var(--j-text-dim)', marginTop: 12, lineHeight: 1.7 }}
        >
          {a}
        </motion.p>
      )}
    </div>
  );
}

/* ═════════════════════════════════════
   MAIN PAGE
   ═════════════════════════════════════ */
export default function MiembrosPage() {
  return (
    <div className="jarvis-grid-bg" style={{ minHeight: '100vh' }}>

      {/* ── Top Bar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,6,17,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--j-border)',
        padding: '14px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--j-green-bg2)', border: '1px solid rgba(0,255,65,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Terminal size={18} style={{ color: 'var(--j-green)' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.02em' }}>
            JARVIS<span className="glow-green">P2P</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="jarvis-badge" style={{
            color: 'var(--j-amber)',
            background: 'rgba(255,170,0,0.1)',
            borderColor: 'rgba(255,170,0,0.25)',
            fontSize: 11,
          }}>
            <Lock size={10} /> EXCLUSIVO MIEMBROS
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <div className="jarvis-badge" style={{
              color: 'var(--j-green)', background: 'var(--j-green-bg)',
              borderColor: 'var(--j-border-glow)', margin: '0 auto 20px',
            }}>
              <Sparkles size={12} /> BENEFICIO EXCLUSIVO PARA MIEMBROS DE LA ACADEMIA
            </div>
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900,
              lineHeight: 1.1, marginBottom: 20,
              color: '#fff', letterSpacing: '-0.03em',
            }}>
              Automatiza tu mesa P2P
              <br />
              <span className="gradient-text-green">con tecnología de nivel institucional</span>
            </h1>
            <p style={{
              fontSize: 18, color: 'var(--j-text-dim)', lineHeight: 1.7,
              maxWidth: 600, margin: '0 auto 32px',
            }}>
              Ya aprendiste a operar. Ahora deja que JarvisP2P haga el trabajo pesado 
              por ti — mientras tú escalas tu negocio.
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--j-green)',
              background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)',
              padding: '10px 20px', borderRadius: 8, display: 'inline-block',
            }}>
              🎁 3 meses GRATIS incluidos con tu membresía
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Loom Video ── */}
      <section style={{ padding: '0 24px 20px' }}>
        <LoomVideo />
      </section>

      {/* ── Problem ── */}
      <section className="section" style={{ padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20,
            }}>
              {[
                { icon: Clock, title: '1 min por pago manual', desc: 'Abrir banco, verificar datos, transferir, subir comprobante... por cada orden. Multiplicalo por cientos de órdenes al día.' },
                { icon: Users, title: 'Operadores sin control', desc: 'WhatsApp, Excel, notas... un caos cuando creces a +20 órdenes diarias. Sin visibilidad de quién está haciendo qué.' },
                { icon: TrendingUp, title: 'Pierdes oportunidades', desc: 'Mientras pagas manualmente, nuevas órdenes se van a la competencia. Tu tiempo vale más que eso.' },
              ].map((item, i) => (
                <div key={i} className="jarvis-card" style={{ padding: 24 }}>
                  <item.icon size={24} style={{ color: 'var(--j-red)', marginBottom: 12 }} />
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--j-text-dim)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="section" style={{ padding: '60px 24px 80px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                Elige tu nivel de automatización
              </h2>
              <p style={{ fontSize: 16, color: 'var(--j-text-dim)', maxWidth: 500, margin: '0 auto' }}>
                Ambos planes incluyen <strong style={{ color: 'var(--j-green)' }}>3 meses GRATIS</strong> con tu membresía activa
              </p>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 28 }}>
            {/* ── ESCALADO CARD ── */}
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}>
              <div className="jarvis-card jarvis-card-cyan" style={{
                padding: 0, height: '100%', display: 'flex', flexDirection: 'column',
                borderColor: 'rgba(0,212,255,0.2)',
              }}>
                {/* Header */}
                <div style={{
                  padding: '28px 32px 20px',
                  borderBottom: '1px solid rgba(0,212,255,0.1)',
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.04) 0%, transparent 100%)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Star size={20} style={{ color: 'var(--j-cyan)' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--j-cyan)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Para miembros Escalado
                    </span>
                  </div>
                  <h3 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
                    Gestión de Órdenes
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--j-text-dim)' }}>
                    Controla toda tu operación P2P desde un solo panel
                  </p>
                </div>

                {/* Pricing */}
                <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, color: 'var(--j-text-dim)', textDecoration: 'line-through' }}>$149/mes</span>
                    <span className="jarvis-badge" style={{
                      color: 'var(--j-green)', background: 'rgba(0,255,65,0.1)',
                      borderColor: 'rgba(0,255,65,0.2)', fontSize: 10, marginLeft: 8,
                    }}>
                      3 MESES GRATIS
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 900, color: '#fff' }}>$149</span>
                    <span style={{ fontSize: 16, color: 'var(--j-text-dim)' }}>/mes</span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--j-cyan)',
                    marginTop: 4,
                  }}>
                    = <strong>$4.97/día</strong>
                  </div>
                  <div style={{
                    marginTop: 12, padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)',
                    fontSize: 13, color: 'var(--j-text-dim)', lineHeight: 1.5,
                  }}>
                    💡 Menos de <strong style={{ color: 'var(--j-cyan)' }}>$5 al día</strong> para gestionar 
                    ilimitadas órdenes en múltiples exchanges
                  </div>
                </div>

                {/* Features */}
                <div style={{ padding: '24px 32px', flex: 1 }}>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      'Panel centralizado multi-exchange',
                      'Binance + Bybit en un solo dashboard',
                      'Asignación inteligente de operadores',
                      'Monitoreo de órdenes en tiempo real',
                      'Contador de tiempo por orden',
                      'Historial completo y métricas',
                      'Filtros por exchange, banco, estado',
                      'Sin verificar múltiples cuentas de Binance ni congelar $800 por cuenta',
                      'Ahorra el 20% adicional que le pagas a operadores por cuenta',
                    ].map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <CheckCircle2 size={16} style={{ color: i >= 7 ? 'var(--j-amber)' : 'var(--j-cyan)', flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 14, color: i >= 7 ? '#fff' : 'var(--j-text)', fontWeight: i >= 7 ? 700 : 400 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div style={{ padding: '20px 32px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <a
                    href={getDemoUrl('starter')}
                    target="_blank" rel="noopener noreferrer"
                    className="jarvis-btn-secondary"
                    style={{ textDecoration: 'none', textAlign: 'center', width: '100%' }}
                  >
                    Ver Demo en Vivo <ArrowRight size={16} />
                  </a>
                  <a
                    href={CALENDLY_URL}
                    target="_blank" rel="noopener noreferrer"
                    className="jarvis-btn-primary"
                    style={{ textDecoration: 'none', textAlign: 'center', width: '100%', background: 'var(--j-cyan)', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}
                  >
                    Activar mi acceso <Zap size={16} />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* ── MAGNATE CARD ── */}
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="jarvis-card" style={{
                padding: 0, height: '100%', display: 'flex', flexDirection: 'column',
                borderColor: 'rgba(139,92,246,0.3)',
                boxShadow: '0 0 40px rgba(139,92,246,0.1), 0 0 80px rgba(139,92,246,0.05)',
              }}>
                {/* Popular tag */}
                <div style={{
                  background: 'linear-gradient(90deg, var(--j-violet), #a855f7)',
                  padding: '6px 0', textAlign: 'center',
                  fontSize: 11, fontWeight: 800, color: '#fff',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  borderRadius: '16px 16px 0 0',
                }}>
                  ⚡ Máxima Automatización — Recomendado
                </div>

                {/* Header */}
                <div style={{
                  padding: '28px 32px 20px',
                  borderBottom: '1px solid rgba(139,92,246,0.15)',
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, transparent 100%)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Crown size={20} style={{ color: 'var(--j-violet)' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--j-violet)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      Para miembros Magnate
                    </span>
                  </div>
                  <h3 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
                    Gestión + Auto-Pay Bot
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--j-text-dim)' }}>
                    Todo automatizado — desde la orden hasta el pago bancario
                  </p>
                </div>

                {/* Pricing */}
                <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, color: 'var(--j-text-dim)', textDecoration: 'line-through' }}>$497/mes</span>
                    <span className="jarvis-badge" style={{
                      color: 'var(--j-green)', background: 'rgba(0,255,65,0.1)',
                      borderColor: 'rgba(0,255,65,0.2)', fontSize: 10, marginLeft: 8,
                    }}>
                      3 MESES GRATIS
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 900, color: '#fff' }}>$497</span>
                    <span style={{ fontSize: 16, color: 'var(--j-text-dim)' }}>/mes</span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--j-violet)',
                    marginTop: 4,
                  }}>
                    = <strong>$16.57/día</strong>
                  </div>
                  <div style={{
                    marginTop: 12, padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)',
                    fontSize: 13, color: 'var(--j-text-dim)', lineHeight: 1.5,
                  }}>
                    💡 <strong style={{ color: 'var(--j-violet)' }}>$16.57/día</strong> y el bot paga solo, 
                    24/7. A <strong style={{ color: '#fff' }}>$0.50 de ganancia por orden</strong> × 600 órdenes en 5 horas 
                    = <strong style={{ color: 'var(--j-green)' }}>$300/día</strong>. 
                    El plan se paga con <strong style={{ color: '#fff' }}>las primeras 34 órdenes del día</strong>.
                  </div>
                </div>

                {/* Features */}
                <div style={{ padding: '24px 32px', flex: 1 }}>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      'Todo lo de Gestión de Órdenes',
                      'Auto-Pay Bot — pagos bancarios automáticos',
                      '1 cuenta Banesco automatizada',
                      'Pago estándar + Pago Móvil automático',
                      'Comprobante enviado a Telegram al instante',
                      'Liberación automática de orden en el exchange',
                      'Tiempo promedio por pago: 30-40 segundos',
                      'Soporte prioritario 24/7',
                    ].map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--j-green)', flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 14, color: 'var(--j-text)' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div style={{ padding: '20px 32px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <a
                    href={getDemoUrl('enterprise')}
                    target="_blank" rel="noopener noreferrer"
                    className="jarvis-btn-secondary"
                    style={{ textDecoration: 'none', textAlign: 'center', width: '100%', color: 'var(--j-violet)', borderColor: 'rgba(139,92,246,0.4)' }}
                  >
                    Ver Demo en Vivo <ArrowRight size={16} />
                  </a>
                  <a
                    href={CALENDLY_URL}
                    target="_blank" rel="noopener noreferrer"
                    className="jarvis-btn-primary"
                    style={{ textDecoration: 'none', textAlign: 'center', width: '100%', background: 'var(--j-violet)', boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}
                  >
                    Activar mi acceso <Zap size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ROI Calculator ── */}
      <section className="section" style={{ padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                ¿Vale la pena? Haz los números
              </h2>
              <p style={{ fontSize: 15, color: 'var(--j-text-dim)', maxWidth: 500, margin: '0 auto' }}>
                Ajusta los sliders a tu operación real y ve cuánto ganas vs. cuánto cuesta
              </p>
            </div>
          </motion.div>
          <RoiCalculator />
        </div>
      </section>

      {/* ── Time Savings ── */}
      <section className="section" style={{ padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                Tu tiempo tiene valor
              </h2>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 32 }}>
            {[
              {
                label: 'Pago manual',
                time: '~1 min',
                color: 'var(--j-red)',
                desc: 'Abrir banco, verificar, transferir, capturar pantalla, subir comprobante, liberar orden...',
                perDay: '600 órdenes × 1 min = 10 horas/día',
              },
              {
                label: 'Con JarvisP2P Auto-Pay',
                time: '30-40 seg',
                color: 'var(--j-green)',
                desc: 'El bot detecta la orden, paga automáticamente, envía comprobante y libera. 100% automatizado — tu tiempo invertido: CERO.',
                perDay: '600 órdenes en ~5 horas (automático)',
              },
              {
                label: 'Tu tiempo liberado',
                time: '10 hrs',
                color: 'var(--j-violet)',
                desc: 'El bot trabaja solo. Tú usas esas 10 horas para operar otros bancos, otras cuentas, escalar tu negocio o simplemente descansar.',
                perDay: '10 horas libres para enfocarte en crecer',
              },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="jarvis-card" style={{ textAlign: 'center', padding: 28 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 900,
                    color: item.color, marginBottom: 8,
                  }}>
                    {item.time}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                    {item.label}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--j-text-dim)', lineHeight: 1.6, marginBottom: 12 }}>
                    {item.desc}
                  </p>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 12, color: item.color,
                    padding: '6px 12px', background: `${item.color}10`, borderRadius: 6,
                    display: 'inline-block',
                  }}>
                    {item.perDay}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Key insight */}
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <div style={{
              padding: '20px 24px', borderRadius: 12,
              background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)',
              textAlign: 'center', maxWidth: 700, margin: '0 auto',
            }}>
              <p style={{ fontSize: 15, color: 'var(--j-text)', lineHeight: 1.7 }}>
                🧠 <strong style={{ color: '#fff' }}>No es solo ahorrar tiempo — es multiplicar tu capacidad.</strong>
                <br />
                <span style={{ color: 'var(--j-text-dim)' }}>
                  Mientras el bot paga una cuenta Banesco automáticamente, tú puedes estar operando otros bancos, 
                  gestionando otras cuentas, o atendiendo nuevos clientes. <strong style={{ color: 'var(--j-violet)' }}>Tu negocio crece sin que tú trabajes más.</strong>
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section className="section" style={{ padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                Comparación de planes
              </h2>
            </div>
          </motion.div>
          <ComparisonSection />
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section" style={{ padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                ¿Cómo activo mi acceso?
              </h2>
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { step: '01', title: 'Agenda tu llamada de activación', desc: 'Selecciona un horario y nos conectamos en 15 minutos para configurar todo.', icon: Banknote },
              { step: '02', title: 'Conectamos tu exchange + banco', desc: 'Configuramos Binance y/o Bybit, y para Magnate conectamos tu cuenta Banesco.', icon: Shield },
              { step: '03', title: 'Activo desde el día 1', desc: 'Tu panel queda operativo inmediatamente. Los 3 meses gratis empiezan a contar.', icon: Zap },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="jarvis-card" style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: 24 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 900,
                    color: 'var(--j-green)', minWidth: 48,
                  }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{item.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--j-text-dim)', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section" style={{ padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
                Preguntas frecuentes
              </h2>
            </div>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FaqItem
              q="¿Los 3 meses gratis son reales?"
              a="Sí. Al activar tu acceso como miembro de la academia, los primeros 3 meses no tienen costo. Después del período de prueba, se cobra el plan mensual correspondiente. Puedes cancelar en cualquier momento."
            />
            <FaqItem
              q="¿Qué pasa si cancelo?"
              a="Sin compromiso. Si decides no continuar después de los 3 meses, simplemente cancelas y no se cobra nada más. Tu operación manual sigue funcionando normal."
            />
            <FaqItem
              q="¿El Auto-Pay es seguro?"
              a="Totalmente. El bot opera dentro de la sesión de tu propio banco, en un servidor seguro dedicado. Tú mantienes el control total — hay un Kill Switch que detiene todo al instante. Cada pago genera comprobante que se envía a tu Telegram."
            />
            <FaqItem
              q="¿Por qué solo 1 cuenta Banesco?"
              a="Para garantizar la estabilidad y el soporte dedicado. Cada cuenta automatizada requiere recursos de servidor exclusivos. Si necesitas más cuentas, contáctanos para un plan personalizado."
            />
            <FaqItem
              q="¿Funciona con Binance y Bybit?"
              a="Sí. El panel de Gestión de Órdenes soporta ambos exchanges simultáneamente. Ves todas las órdenes P2P en un solo lugar, sin importar de qué exchange vengan."
            />
            <FaqItem
              q="¿Necesito conocimientos técnicos?"
              a="No. Nosotros hacemos toda la configuración. Tú solo necesitas tus credenciales del exchange y del banco. En 15 minutos quedas operativo."
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="section" style={{ padding: '40px 24px 100px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <motion.div {...fadeUp} transition={{ duration: 0.7 }}>
            <div className="jarvis-card jarvis-card-highlight" style={{
              padding: '48px 40px',
              background: 'linear-gradient(135deg, rgba(0,255,65,0.04) 0%, rgba(139,92,246,0.04) 100%)',
              borderColor: 'rgba(0,255,65,0.2)',
            }}>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: '#fff', marginBottom: 16 }}>
                Tu competencia sigue pagando manual
              </h2>
              <p style={{ fontSize: 16, color: 'var(--j-text-dim)', lineHeight: 1.7, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
                Cada día que esperas, pierdes horas y órdenes. 
                Activa JarvisP2P hoy y opera en piloto automático desde mañana.
              </p>
              <a
                href={CALENDLY_URL}
                target="_blank" rel="noopener noreferrer"
                className="jarvis-btn-primary"
                style={{ textDecoration: 'none', fontSize: 16, padding: '16px 40px' }}
              >
                Agendar Activación Ahora <ArrowRight size={18} />
              </a>
              <p style={{ fontSize: 12, color: 'var(--j-text-muted)', marginTop: 16 }}>
                🎁 Recuerda: 3 meses sin costo con tu membresía activa
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--j-border)',
        padding: '24px',
        textAlign: 'center',
        fontSize: 13,
        color: 'var(--j-text-muted)',
      }}>
        JarvisP2P © {new Date().getFullYear()} — Página exclusiva para miembros de la academia
      </footer>
    </div>
  );
}
