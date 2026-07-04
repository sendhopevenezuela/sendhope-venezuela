import type { Metadata } from "next";
import { getGalleryPhotos } from "@/app/actions/gallery";
import { GalleryClient } from "./GalleryClient";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("gallery");
  return {
    title: t("page_title"),
    description: t("page_description"),
  };
}

export default async function GaleriaPage() {
  const photos = await getGalleryPhotos();
  const t = await getTranslations("gallery");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream">
        {/* Hero */}
        <section className="relative py-16 md:py-20 px-6 text-center overflow-hidden bg-navy">
          {/* Fondo decorativo */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #F4C31D 0%, transparent 50%), radial-gradient(circle at 80% 50%, #003082 0%, transparent 60%)" }} />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block font-mono text-gold text-xs uppercase tracking-[0.2em] font-bold mb-3">
              {t("tag")}
            </span>
            <h1 className="font-sans font-800 text-3xl md:text-5xl text-white leading-tight mb-4">
              {t("title")}
            </h1>
            <p className="font-sans font-400 text-white/70 text-sm md:text-base leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </section>

        {/* Contador */}
        {photos.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-2">
            <p className="font-mono text-xs text-muted uppercase tracking-wider">
              {photos.length === 1
                ? t("count_single", { count: photos.length })
                : t("count_plural", { count: photos.length })}
            </p>
          </div>
        )}

        {/* Galería Pinterest */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <GalleryClient photos={photos} />
        </section>

        {/* CTA donar */}
        <section className="bg-navy py-12 px-6 text-center mt-8">
          <p className="font-sans font-700 text-white text-lg mb-4">
            {t("cta_text")}
          </p>
          <a
            href="/donar"
            className="inline-block bg-gold hover:bg-gold-dark text-navy-dark font-sans font-700 px-8 py-3 rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
          >
            {t("cta_button")}
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}
