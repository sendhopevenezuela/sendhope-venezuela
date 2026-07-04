import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationForm } from "@/components/DonationForm";
import { CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("donar");
  return {
    title: t("page_title"),
    description: t("page_description"),
  };
}

async function getPaymentMethods() {
  const defaults = [
    {
      id: "default-zelle",
      type: "zelle",
      title: "Zelle Principal",
      details: { contact: "donaciones@sendhope.org", name: "SendHope Venezuela" }
    },
    {
      id: "default-pago-movil",
      type: "pago_movil",
      title: "Pago Móvil",
      details: { phone: "0412-123-4567", bank: "Banco de Venezuela", cedula: "J-12345678-9" }
    },
    {
      id: "default-transfer",
      type: "transfer",
      title: "Transferencia Bancaria",
      details: { bank: "Banesco", account: "0134-1234-56-1234567890", name: "SendHope Venezuela", cedula: "J-12345678-9" }
    }
  ];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("is_active", true)
      .order("order_index");

    if (error) {
      console.error("[DonarPage getPaymentMethods] Supabase error:", error.message);
      return defaults;
    }
    if (!data || data.length === 0) {
      return defaults;
    }

    return data;
  } catch {
    return defaults;
  }
}


export default async function DonarPage() {
  const t = await getTranslations("donar");
  const paymentMethods = await getPaymentMethods();

  return (
    <>
      <Header />
      <main>
        {/* ── Mini-hero: strip navy, mucho más corto que el del landing ──── */}
        <section
          className="relative py-12 md:py-16 px-6 text-center overflow-hidden"
          style={{
            background:
              "linear-gradient(150deg, #001D4E 0%, #003082 55%, #0042A6 100%)",
          }}
        >
          {/* Halo sutil */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(244,195,29,0.06) 0%, transparent 100%)",
            }}
          />
          {/* Link volver */}
          <a
            href="/"
            className="relative inline-block font-mono text-xs text-white/40 hover:text-white/70 transition-colors mb-6"
          >
            {t("back")}
          </a>
          <h1 className="relative font-sans font-800 text-white text-3xl md:text-4xl mb-3">
            {t("mini_hero_title")}
          </h1>
          <p className="relative font-sans font-400 text-white/60 max-w-md mx-auto text-sm md:text-base leading-relaxed">
            {t("mini_hero_subtitle")}
          </p>
        </section>

        {/* ── Cuerpo: form centrado ────────────────────────────────────────── */}
        <section className="bg-cream py-12 px-5">
          <div className="max-w-lg mx-auto">
            {/* Trust badge — recordatorio antes de que el usuario llene */}
            <div className="flex items-center gap-2 mb-8 bg-verified-light border border-verified/20 rounded-xl px-4 py-3">
              <CheckCircle size={16} className="text-verified flex-shrink-0" />
              <p className="font-sans text-sm text-verified">
                {t("trust_badge_alert")}
              </p>
            </div>

            {/* Formulario en sí */}
            <DonationForm paymentMethods={paymentMethods} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
