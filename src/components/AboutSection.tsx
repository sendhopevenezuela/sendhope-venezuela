import { getTranslations } from "next-intl/server";

export async function AboutSection() {
  const t = await getTranslations("about");

  return (
    <section className="bg-white py-16 px-6 border-t border-b border-[#003082]/5">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-center">
        {/* Lado izquierdo - Título y Badge */}
        <div className="w-full md:w-1/3 flex flex-col items-start text-left">
          <span className="font-mono text-gold text-xs uppercase tracking-[0.2em] font-bold mb-2">
            {t("tag")}
          </span>
          <h2 className="font-sans font-800 text-3xl md:text-4xl text-navy leading-tight">
            {t("title")}
          </h2>
          {/* Mini bandera venezolana estilizada */}
          <div className="flex gap-[3px] mt-4">
            <span className="block w-6 h-[4px] rounded-full bg-gold" />
            <span className="block w-6 h-[4px] rounded-full bg-navy" />
            <span className="block w-6 h-[4px] rounded-full bg-scarlet" />
          </div>
        </div>

        {/* Lado derecho - Mensaje */}
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          <p className="font-sans text-[#0A1628] text-base md:text-lg leading-relaxed font-light">
            {t("description")}
          </p>
          <p className="font-sans text-muted text-sm leading-relaxed border-l-2 border-gold pl-4 italic">
            {t("future")}
          </p>
        </div>
      </div>
    </section>
  );
}
