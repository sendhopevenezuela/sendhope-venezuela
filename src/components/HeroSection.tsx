import { getTranslations } from "next-intl/server";
import { HeroCarousel } from "./HeroCarousel";

export async function HeroSection() {
  const t = await getTranslations("hero");

  return (
    <section
      className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden"
      style={{
        background:
          "linear-gradient(150deg, #001D4E 0%, #003082 55%, #0042A6 100%)",
      }}
    >
      {/* Carrusel de fondo (con superposición azul transparente) */}
      <HeroCarousel />

      {/* Halo dorado sutil — como el sol detrás del escudo */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(244,195,29,0.05) 0%, transparent 100%)",
        }}
      />

      {/* ── Logo insignia del hero ──────────────────────────────────── */}
      <div className="relative z-10 mb-8 flex flex-col items-center gap-2.5">
        <span className="flex flex-col gap-[4px] opacity-90 mb-1">
          <span className="block w-14 h-1 bg-gold rounded-full" />
          <span className="block w-14 h-1 bg-white rounded-full" />
          <span className="block w-14 h-1 bg-scarlet rounded-full" />
        </span>
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-gold/80">
          Barquisimeto, Venezuela
        </span>
      </div>

      {/* ── Headline ─────────────────────────────────────────────────────── */}
      <h1 className="relative z-10 font-sans font-800 text-white text-3xl md:text-5xl max-w-2xl leading-tight mb-5 drop-shadow-sm">
        {t("headline")}
      </h1>

      <p className="relative z-10 font-sans font-400 text-white/75 max-w-lg text-base md:text-lg leading-relaxed mb-12">
        {t("subheadline")}
      </p>

      {/* CTA — oro sobre azul, máximo contraste y calidez */}
      <a
        href="/donar"
        className="relative z-10 bg-gold text-navy-dark font-sans font-700 text-lg px-10 py-4 rounded-full hover:bg-gold-dark active:scale-95 transition-all duration-200 shadow-lg shadow-navy-dark/40"
      >
        {t("cta")}
      </a>

      {/* Indicador de scroll */}
      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10"
      >
        <span className="font-mono text-xs text-white/40 tracking-widest">
          ↓
        </span>
      </div>
    </section>
  );
}
