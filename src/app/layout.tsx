import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

// Plus Jakarta Sans — humanista, moderno, cálido a todos los pesos
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// IBM Plex Mono — exclusivo para números, stats y códigos
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SendHope Venezuela — Donaciones verificadas para refugios en Barquisimeto",
  description:
    "Cada bolívar donado se convierte en una compra real con foto y recibo, entregada directamente a los refugios afectados por las inundaciones en Barquisimeto. Transparencia total.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/icon.png",
  },
  openGraph: {
    title: "SendHope Venezuela — Ayuda Verificada al Terremoto del 24 de Julio",
    description:
      "Donaciones verificadas para refugios en Barquisimeto, Caracas y La Guaira. Cada compra documentada con foto y recibo. Transparencia total.",
    locale: "es_VE",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 600,
        height: 600,
        alt: "SendHope Venezuela",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SendHope Venezuela",
    description: "Donaciones verificadas para refugios del terremoto del 24 de julio.",
    images: ["/icon.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${plusJakartaSans.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
