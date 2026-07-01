import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

type DonationStats = {
  total_confirmed: number | null;
  donor_count: number | null;
};

async function getDonationStats(): Promise<DonationStats | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("public_donation_stats")
      .select("total_confirmed, donor_count")
      .maybeSingle();
    if (error || !data) return null;
    return data as DonationStats;
  } catch {
    return null;
  }
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function HeroSection() {
  const t = await getTranslations("hero");
  const stats = await getDonationStats();
  const hasStats = stats?.total_confirmed != null && stats.total_confirmed > 0;

  return (
    <section
      className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 py-24 text-center overflow-hidden"
      style={{
        background:
          "linear-gradient(150deg, #001D4E 0%, #003082 55%, #0042A6 100%)",
      }}
    >
      {/* Halo dorado sutil — como el sol detrás del escudo */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(244,195,29,0.07) 0%, transparent 100%)",
        }}
      />

      {/* ── El número: corazón del hero ──────────────────────────────────── */}
      <div className="relative mb-8 flex flex-col items-center">
        {hasStats ? (
          <>
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-gold/60 mb-3">
              {t("stat_label")}
            </p>
            {/* Número grande en oro — la promesa visible */}
            <p
              className="font-mono font-600 text-gold leading-none"
              style={{ fontSize: "clamp(3.5rem, 11vw, 8rem)" }}
            >
              {formatUSD(stats!.total_confirmed!)}
            </p>
            {stats?.donor_count != null && stats.donor_count > 0 && (
              <p className="font-mono text-xs text-gold/40 mt-4 tracking-wider">
                {t("stat_donors", { count: stats.donor_count })}
              </p>
            )}
          </>
        ) : (
          /* Estado vacío — digno, no un cero feo */
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-[2px] bg-gold/30 rounded-full" />
            <p className="font-mono text-xs text-gold/50 tracking-[0.25em] uppercase">
              {t("stat_empty")}
            </p>
            <div className="w-16 h-[2px] bg-gold/30 rounded-full" />
          </div>
        )}
      </div>

      {/* ── Headline ─────────────────────────────────────────────────────── */}
      <h1 className="font-sans font-800 text-white text-3xl md:text-5xl max-w-2xl leading-tight mb-5">
        {t("headline")}
      </h1>

      <p className="font-sans font-400 text-white/60 max-w-lg text-base md:text-lg leading-relaxed mb-12">
        {t("subheadline")}
      </p>

      {/* CTA — oro sobre azul, máximo contraste y calidez */}
      {/* /donar es ruta propia: contexto aislado en el momento de decisión,
          URL compartible directamente, tracking de conversión limpio */}
      <a
        href="/donar"
        className="bg-gold text-navy-dark font-sans font-700 text-lg px-10 py-4 rounded-full hover:bg-gold-dark active:scale-95 transition-all duration-200 shadow-lg shadow-navy-dark/40"
      >
        {t("cta")}
      </a>

      {/* Indicador de scroll */}
      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <span className="font-mono text-xs text-white/20 tracking-widest">
          ↓
        </span>
      </div>
    </section>
  );
}
