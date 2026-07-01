import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonationForm } from "@/components/DonationForm";
import { CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Hacer una donación — SendHope Venezuela",
    description:
      "Elige un monto, realiza la transferencia y confirma tu referencia. Tu donación queda registrada y verificada.",
  };
}

// ── Datos de pago desde la base de datos ─────────────────────────────────────
// Tabla: public.payment_config (singleton, id = 1).
// Se leen con la anon key — la política RLS permite SELECT público.
// Si algún campo es null (aún sin configurar), se muestra "—" para
// que la página no quede en blanco ni lance error.
async function getPaymentInfo() {
  const defaults = {
    zelleContact:    "donaciones@sendhope.org",
    zelleName:       "SendHope Venezuela",
    pagoMovilPhone:  "0412-123-4567",
    pagoMovilBank:   "Banco de Venezuela",
    pagoMovilCedula: "J-12345678-9",
    transferBank:    "Banesco",
    transferAccount: "0134-1234-56-1234567890",
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payment_config")
      .select(
        "zelle_contact, zelle_name, pago_movil_phone, pago_movil_bank, pago_movil_cedula, transfer_bank, transfer_account"
      )
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("[DonarPage getPaymentInfo] Supabase error:", error.message, error.details);
      return defaults;
    }
    if (!data) {
      console.warn("[DonarPage getPaymentInfo] No row found with id = 1 in payment_config");
      return defaults;
    }

    return {
      zelleContact:    data.zelle_contact    ?? defaults.zelleContact,
      zelleName:       data.zelle_name       ?? defaults.zelleName,
      pagoMovilPhone:  data.pago_movil_phone  ?? defaults.pagoMovilPhone,
      pagoMovilBank:   data.pago_movil_bank   ?? defaults.pagoMovilBank,
      pagoMovilCedula: data.pago_movil_cedula ?? defaults.pagoMovilCedula,
      transferBank:    data.transfer_bank    ?? defaults.transferBank,
      transferAccount: data.transfer_account  ?? defaults.transferAccount,
    };
  } catch {
    return defaults;
  }
}


// ── Page ─────────────────────────────────────────────────────────────────────
export default async function DonarPage() {
  const t = await getTranslations("donar");
  const payment = await getPaymentInfo();

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
                Tu donación queda registrada y se confirma manualmente por el equipo en menos de 24 h.
              </p>
            </div>

            {/* Formulario en sí */}
            <DonationForm payment={payment} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
