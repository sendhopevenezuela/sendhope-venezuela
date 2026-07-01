import { getTranslations } from "next-intl/server";

export async function ClosingCTA() {
  const t = await getTranslations("closing");

  return (
    /* Sección en ORO — inversión del hero. Si el hero es el cielo venezolano,
       este cierre es el sol. Navy sobre gold = identidad + acción. */
    <section className="bg-gold py-28 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-sans font-800 text-3xl md:text-5xl text-navy-dark leading-tight mb-10">
          {t("headline")}
        </h2>
        <a
          href="/donar"
          className="inline-block bg-navy text-white font-sans font-700 text-xl px-12 py-5 rounded-full hover:bg-navy-dark active:scale-95 transition-all duration-200 shadow-lg shadow-navy-dark/30"
        >
          {t("cta")}
        </a>
      </div>
    </section>
  );
}
