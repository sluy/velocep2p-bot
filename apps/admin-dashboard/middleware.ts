import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CLIENT_SLUG = process.env.NEXT_PUBLIC_CLIENT_SLUG || 'kaizenholding';
const JWT_COOKIE  = `${CLIENT_SLUG}_jwt`;

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // ── Demo Mode: skip ALL auth for free demo access ────────────────
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return NextResponse.next();
  }

  // ── Protección de rutas /admin ────────────────────────────────────
  if (url.pathname.startsWith('/admin')) {
    // En desarrollo: omitir auth para facilitar testing
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }

    // 1. Si ya tiene JWT cookie válida (viene del login web) → pasar
    const jwtToken = req.cookies.get(JWT_COOKIE);
    if (jwtToken?.value) {
      try {
        const payload = JSON.parse(atob(jwtToken.value));
        if (payload.role === 'admin' && payload.exp > Date.now()) {
          return NextResponse.next();
        }
      } catch { /* Token malformado, continúa a Basic Auth */ }
    }

    // 2. Fallback: Basic Auth (acceso directo a /admin sin pasar por login)
    //    Usa NEXT_PUBLIC_ porque en Edge Runtime las vars sin prefijo no están
    //    disponibles en producción (Next.js solo las inlinea al build si son NEXT_PUBLIC_)
    const basicAuth = req.headers.get('authorization');
    const AdminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
      || process.env.ADMIN_PASSWORD
      || 'admin147258';

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');
      if (user === 'admin' && pwd === AdminPassword) {
        return NextResponse.next();
      }
    }

    // 3. Sin auth → redirigir al login en vez de mostrar popup Basic Auth
    return NextResponse.redirect(new URL('/portal/login', req.url));
  }

  // ── Protección de rutas /portal/dashboard (JWT cookie) ────────────
  if (url.pathname.startsWith('/portal/dashboard')) {
    const token = req.cookies.get(JWT_COOKIE);
    if (!token) {
      return NextResponse.redirect(new URL('/portal/login', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/portal/dashboard/:path*'],
};
