import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/admin
 * Valida credenciales de admin server-side.
 * Aquí process.env.ADMIN_PASSWORD SÍ está disponible en runtime
 * (a diferencia del client-side donde NEXT_PUBLIC_ se hornea al build).
 */
export async function POST(req: NextRequest) {
  try {
    const { loginId, password } = await req.json();

    const adminPassword = process.env.ADMIN_PASSWORD
      || process.env.NEXT_PUBLIC_ADMIN_PASSWORD
      || 'admin147258';

    if (loginId?.toLowerCase() === 'admin' && password === adminPassword) {
      // Generar token mock (mismo formato que usaba el client-side)
      const token = btoa(JSON.stringify({
        userId: 0,
        role: 'admin',
        alias: 'admin',
        exp: Date.now() + 86400000, // 24h
      }));

      return NextResponse.json({ success: true, accessToken: token });
    }

    return NextResponse.json(
      { success: false, message: 'Credenciales inválidas' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error procesando solicitud' },
      { status: 400 }
    );
  }
}
