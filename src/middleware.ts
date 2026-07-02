import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPPORTED_LOCALES = ["es", "en"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

function detectLocale(request: NextRequest): Locale {
  // 1. Cookie tiene prioridad
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // 2. Parsear Accept-Language — solo el primary tag
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const primary = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();

  // Solo reconocemos 'en' explícitamente; todo lo demás cae a 'es'
  return primary === "en" ? "en" : "es";
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login";
  const isRegisterPage = pathname === "/admin/register";
  const isAuthPage = isLoginPage || isRegisterPage;
  const isAdminRoute = pathname.startsWith("/admin");

  // ── 1. PROTECCIÓN DE RUTAS DE ADMINISTRACIÓN ─────────────────────────────────
  if (isAdminRoute) {
    const token = request.cookies.get("sendhope_admin_session")?.value;

    if (isAuthPage) {
      // Si ya está logueado con sesión válida, redirigir directo al backoffice
      if (token) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } }
        );

        const { data } = await supabase
          .from("admin_sessions")
          .select("id")
          .eq("token", token)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();

        if (data) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
    } else {
      // Rutas protegidas (/admin, /admin/compras, etc.)
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { data, error } = await supabase
        .from("admin_sessions")
        .select("id")
        .eq("token", token)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (error || !data) {
        // Token inválido o expirado: redirige a login y limpia la cookie
        const response = NextResponse.redirect(new URL("/admin/login", request.url));
        response.cookies.delete("sendhope_admin_session");
        return response;
      }
    }
  }

  // ── 2. MANEJO DE LOCALE (i18n) ───────────────────────────────────────────────
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const hasCookie = cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as Locale);

  if (hasCookie) {
    return NextResponse.next();
  }

  // Primera visita: detectar y fijar la cookie por 1 año
  const locale = detectLocale(request);
  const response = NextResponse.next();
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  // Asegura capturar /admin y todas sus subrutas
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico).*)"],
};
