import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact_page");
  return {
    title: t("page_title"),
    description: t("page_description"),
  };
}

export default async function ContactoPage() {
  const t = await getTranslations("contact_page");

  return (
    <>
      <Header />
      <main className="bg-cream min-h-screen py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          {/* Header */}
          <div className="text-center">
            <span className="font-mono text-xs text-gold font-bold tracking-[0.2em] uppercase">
              {t("tag")}
            </span>
            <h1 className="font-sans font-800 text-[#0A1628] text-3xl md:text-5xl mt-2 mb-4 tracking-tight">
              {t("title")}
            </h1>
            <p className="font-sans text-sm md:text-base text-muted max-w-xl mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Tarjeta Informativa de la Labor */}
          <div className="bg-white border border-[#003082]/10 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-4">
            <h2 className="font-sans font-bold text-lg text-navy flex items-center gap-2">
              <span>🎗</span> {t("about_title")}
            </h2>
            <p className="font-sans text-sm text-[#0A1628] leading-relaxed">
              {t("about_body")}
            </p>
            <div className="w-full h-px bg-[#003082]/5 my-2" />
            <p className="font-sans text-xs text-muted leading-relaxed">
              {t("about_transparency")}
            </p>
          </div>

          {/* Opciones de contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Correo */}
            <div className="bg-white border border-[#003082]/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
              <div>
                <span className="text-2xl">✉</span>
                <h3 className="font-sans font-bold text-base text-[#0A1628] mt-2 mb-1">{t("email_title")}</h3>
                <p className="font-sans text-xs text-muted leading-relaxed">
                  {t("email_body")}
                </p>
              </div>
              <a
                href="mailto:sendhopevenezuela@gmail.com"
                className="block font-mono font-bold text-sm text-navy hover:text-navy-mid break-all"
              >
                sendhopevenezuela@gmail.com
              </a>
            </div>

            {/* Donaciones Físicas */}
            <div className="bg-white border border-[#003082]/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
              <div>
                <span className="text-2xl">📦</span>
                <h3 className="font-sans font-bold text-base text-[#0A1628] mt-2 mb-1">{t("physical_title")}</h3>
                <p className="font-sans text-xs text-muted leading-relaxed">
                  {t("physical_body")}
                </p>
              </div>
              <div className="flex flex-col gap-2 font-mono text-sm text-navy">
                <a
                  href="https://wa.me/584129292701"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-navy-mid flex items-center gap-1.5 cursor-pointer"
                >
                  💬 0412-9292701
                </a>
                <a
                  href="https://wa.me/584121519715"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-navy-mid flex items-center gap-1.5 cursor-pointer"
                >
                  💬 0412-1519715
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
