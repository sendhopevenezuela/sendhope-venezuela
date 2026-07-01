import { NextRequest, NextResponse } from "next/server";

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

export function middleware(request: NextRequest): NextResponse {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const hasCookie =
    cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as Locale);

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
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico).*)"],
};
