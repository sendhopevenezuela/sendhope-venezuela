import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CheckCircle } from "lucide-react";

const PREVIEW_ITEMS = [
  {
    id: 1,
    description: "12 kg arroz + 6 L aceite",
    shelter: "Refugio La Candelaria",
    location: "Barquisimeto",
    date: "28 Jun 2026",
    amount: "$18",
  },
  {
    id: 2,
    description: "Kits de aseo personal ×20",
    shelter: "Refugio El Ujano",
    location: "Barquisimeto",
    date: "27 Jun 2026",
    amount: "$45",
  },
  {
    id: 3,
    description: "Agua potable ×24 unid.",
    shelter: "Refugio Parque del Este",
    location: "Cabudare",
    date: "26 Jun 2026",
    amount: "$12",
  },
] as const;

export async function TransparencyPreview() {
  const t = await getTranslations("transparency");

  return (
    <section className="bg-navy-light py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-sans font-800 text-3xl md:text-4xl text-navy mb-3">
            {t("title")}
          </h2>
          <p className="font-sans font-400 text-muted text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {PREVIEW_ITEMS.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-2xl border border-navy/8 p-5 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
            >
              {/* Badge verificado */}
              <div className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-verified flex-shrink-0" />
                <span className="font-mono text-[10px] text-verified tracking-[0.15em] uppercase">
                  {t("purchase_label")}
                </span>
              </div>

              {/* Placeholder foto */}
              <div className="w-full h-32 bg-navy-light rounded-xl flex items-center justify-center">
                <span className="font-mono text-xs text-navy/30">foto</span>
              </div>

              {/* Descripción */}
              <div>
                <p className="font-sans font-600 text-navy text-sm leading-snug">
                  {item.description}
                </p>
                <p className="font-mono text-[11px] text-muted mt-1">
                  {item.date} · {item.amount}
                </p>
              </div>

              {/* Refugio */}
              <div className="border-t border-navy/8 pt-3 mt-auto">
                <p className="font-mono text-[10px] text-muted uppercase tracking-[0.12em]">
                  {t("delivery_label")}
                </p>
                <p className="font-sans font-500 text-sm text-navy mt-0.5">
                  {item.shelter},{" "}
                  <span className="font-400 text-muted">{item.location}</span>
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/transparencia"
            className="inline-flex items-center gap-2 font-sans font-600 text-sm text-navy border-2 border-navy px-6 py-3 rounded-full hover:bg-navy hover:text-white transition-all duration-200"
          >
            {t("cta")} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
