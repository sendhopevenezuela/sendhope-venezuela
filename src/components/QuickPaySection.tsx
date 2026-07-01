import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { CopyButton } from "./CopyButton";

// ── Fetch de datos de pago ──────────────────────────────────────────────────
// Si no hay datos en la DB o falla, retorna datos de ejemplo visibles
// para que el diseño no quede oculto ni roto.
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
      console.error("[QuickPaySection getPaymentInfo] Supabase error:", error.message, error.details);
      return defaults;
    }
    if (!data) {
      console.warn("[QuickPaySection getPaymentInfo] No row found with id = 1 in payment_config");
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

// ── Subcomponente: campo de dato de pago ──────────────────────────────────────
function Field({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40">
        {label}
      </dt>
      <dd className="flex items-center gap-2 flex-wrap">
        <span className="font-mono font-600 text-sm text-navy">
          {value}
        </span>
        {copyable && <CopyButton value={value} />}
      </dd>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export async function QuickPaySection() {
  const t = await getTranslations("pay_info");
  const p = await getPaymentInfo();

  return (
    // Borde dorado arriba: transición visual del hero azul hacia el blanco
    <section className="bg-white border-t-4 border-gold py-14 px-5">
      <div className="max-w-5xl mx-auto">
        {/* ── Encabezado ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-10">
          <div>
            <h2 className="font-sans font-800 text-2xl md:text-3xl text-navy mb-2">
              {t("title")}
            </h2>
            <p className="font-sans font-400 text-muted text-sm max-w-md leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
          {/* CTA rápido — lleva al form de confirmación */}
          <Link
            href="/donar"
            className="flex-shrink-0 self-start flex flex-col items-center sm:items-end gap-0.5"
          >
            <span className="bg-gold text-navy-dark font-sans font-700 text-sm px-5 py-2.5 rounded-full hover:bg-gold-dark transition-colors duration-200 whitespace-nowrap">
              {t("cta")}
            </span>
            <span className="font-mono text-[10px] text-muted tracking-wide">
              {t("cta_hint")}
            </span>
          </Link>
        </div>

        {/* ── Cards de métodos de pago ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Zelle */}
          <div className="rounded-2xl border-2 border-navy/10 bg-cream p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {/* Stripe de colores bandera como identificador de método */}
              <span className="flex flex-col gap-[2px]">
                <span className="block w-3 h-[2px] rounded-full bg-gold" />
                <span className="block w-3 h-[2px] rounded-full bg-navy" />
                <span className="block w-3 h-[2px] rounded-full bg-scarlet" />
              </span>
              <h3 className="font-mono font-600 text-navy text-sm uppercase tracking-widest">
                {t("zelle_title")}
              </h3>
            </div>
            <dl className="flex flex-col gap-3">
              <Field label="Email / Teléfono" value={p.zelleContact} copyable />
              <Field label="A nombre de" value={p.zelleName} />
            </dl>
          </div>

          {/* Pago Móvil */}
          <div className="rounded-2xl border-2 border-navy/10 bg-cream p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex flex-col gap-[2px]">
                <span className="block w-3 h-[2px] rounded-full bg-gold" />
                <span className="block w-3 h-[2px] rounded-full bg-navy" />
                <span className="block w-3 h-[2px] rounded-full bg-scarlet" />
              </span>
              <h3 className="font-mono font-600 text-navy text-sm uppercase tracking-widest">
                {t("pago_movil_title")}
              </h3>
            </div>
            <dl className="flex flex-col gap-3">
              <Field label="Teléfono" value={p.pagoMovilPhone} copyable />
              <Field label="Banco" value={p.pagoMovilBank} />
              <Field label="RIF / Cédula" value={p.pagoMovilCedula} copyable />
            </dl>
          </div>

          {/* Transferencia */}
          <div className="rounded-2xl border-2 border-navy/10 bg-cream p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex flex-col gap-[2px]">
                <span className="block w-3 h-[2px] rounded-full bg-gold" />
                <span className="block w-3 h-[2px] rounded-full bg-navy" />
                <span className="block w-3 h-[2px] rounded-full bg-scarlet" />
              </span>
              <h3 className="font-mono font-600 text-navy text-sm uppercase tracking-widest">
                {t("transfer_title")}
              </h3>
            </div>
            <dl className="flex flex-col gap-3">
              <Field label="Banco" value={p.transferBank} />
              <Field label="Cuenta" value={p.transferAccount} copyable />
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
