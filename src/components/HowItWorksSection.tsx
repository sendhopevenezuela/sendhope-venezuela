import { getTranslations } from "next-intl/server";

const STEPS = ["step1", "step2", "step3", "step4"] as const;

export async function HowItWorksSection() {
  const t = await getTranslations("how");

  return (
    <section className="bg-cream py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-sans font-800 text-3xl md:text-4xl text-navy text-center mb-4">
          {t("title")}
        </h2>
        {/* Línea decorativa bajo el título — colores bandera */}
        <div className="flex justify-center gap-1 mb-16">
          <span className="block h-[3px] w-8 rounded-full bg-gold" />
          <span className="block h-[3px] w-8 rounded-full bg-navy" />
          <span className="block h-[3px] w-8 rounded-full bg-scarlet" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
          {STEPS.map((step, i) => (
            <div key={step} className="flex gap-5 group">
              {/* Número en oro — señal clara de secuencia */}
              <div className="flex-shrink-0">
                <span className="font-mono font-600 text-gold text-4xl leading-none select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="pt-1 border-t-2 border-transparent group-hover:border-gold/30 transition-colors duration-300 flex-1">
                <h3 className="font-sans font-700 text-navy text-base mb-2">
                  {t(`${step}_title`)}
                </h3>
                <p className="font-sans font-400 text-muted text-sm leading-relaxed">
                  {t(`${step}_body`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
