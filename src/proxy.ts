import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "losandes-inmobiliaria-secure-jwt-secret-key-2026"
);

const COOKIE_NAME = "losandes_session";

// Proxy perimetral de seguridad para interceptar y bloquear rutas no autorizadas en Next.js 16
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  // Rutas publicas fuera de /admin se entregan de inmediato
  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        algorithms: ["HS256"],
      });
      // Verifica expiracion valida y rol administrativo
      if (payload && payload.id && payload.role === "ADMIN") {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Si intenta acceder a una ruta protegida de /admin sin sesion valida, redirigir al login
  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    // Limpia cualquier cookie invalida o expirada
    if (token) {
      response.cookies.delete(COOKIE_NAME);
    }
    return response;
  }

  // Si ya esta autenticado e intenta ingresar a /admin/login, redirigir al dashboard
  if (isAuthenticated && isLoginPage) {
    const dashboardUrl = new URL("/admin", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Permite el paso a la ruta solicitada
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

