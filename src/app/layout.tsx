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
  title: "SendHope Venezuela | Donaciones y Ayuda Humanitaria",
  description:
    "Donaciones para Venezuela con transparencia en tiempo real. Apoya a damnificados de Caracas y La Guaira con comida y kits médicos desde Barquisimeto.",
  keywords: [
    "donaciones venezuela",
    "ayuda humanitaria venezuela",
    "damnificados caracas",
    "damnificados la guaira",
    "terremoto 24 de julio",
    "transparencia en tiempo real",
    "centro de acopio barquisimeto",
    "kits medicos",
    "donar comida venezuela",
    "sendhope venezuela",
    "ayuda de emergencia",
    "refugios caracas",
    "donar zelle venezuela",
    "pago movil donaciones"
  ],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
    shortcut: "/icon.png",
  },
  openGraph: {
    title: "SendHope Venezuela | Donaciones y Ayuda Humanitaria",
    description:
      "Donaciones para Venezuela con transparencia en tiempo real. Apoya a damnificados de Caracas y La Guaira con comida y kits médicos desde Barquisimeto.",
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
    title: "SendHope Venezuela | Donaciones y Ayuda Humanitaria",
    description: "Donaciones para Venezuela con transparencia en tiempo real. Apoya a damnificados de Caracas y La Guaira.",
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
