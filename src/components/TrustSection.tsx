import { getTranslations } from "next-intl/server";
import { CheckCircle, FileText, Camera } from "lucide-react";

export async function TrustSection() {
  const t = await getTranslations("trust");

  const pillars = [
    { icon: FileText, key: "pillar_receipt" as const },
    { icon: Camera, key: "pillar_photo_buy" as const },
    { icon: Camera, key: "pillar_photo_delivery" as const },
  ] as const;

  return (
    <section className="bg-cream py-24 px-6">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
        {/* Sello "Recibo Verificado" en verde — distinto del oro para no confundir acción con verificación */}
        <div className="inline-flex flex-col items-center gap-2 border-2 border-verified rounded-2xl px-8 py-5 mb-12 bg-verified-light">
          <CheckCircle size={28} className="text-verified" />
          <span className="font-mono font-600 text-verified tracking-[0.18em] text-sm uppercase">
            {t("seal_label")}
          </span>
          <span className="font-mono text-xs text-verified/70">
            {t("seal_sublabel")}
          </span>
        </div>

        <h2 className="font-sans font-800 text-3xl md:text-4xl text-navy mb-6">
          {t("title")}
        </h2>

        <p className="font-sans font-400 text-muted text-base md:text-lg leading-relaxed max-w-2xl">
          {t("body")}
        </p>

        {/* Los tres pilares del sello */}
        <div className="grid grid-cols-3 gap-6 mt-14 w-full max-w-sm">
          {pillars.map(({ icon: Icon, key }) => (
            <div key={key} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-navy-light flex items-center justify-center">
                <Icon size={18} className="text-navy" />
              </div>
              <span className="font-mono text-[11px] text-muted leading-tight text-center">
                {t(key)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
