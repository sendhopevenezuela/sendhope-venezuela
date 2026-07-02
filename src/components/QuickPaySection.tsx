import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { CopyButton } from "./CopyButton";

// ── Fetch de datos de pago ──────────────────────────────────────────────────
// Si no hay datos en la DB o falla, retorna datos de ejemplo visibles
// para que el diseño no quede oculto ni roto.
async function getPaymentMethods() {
  const defaults = [
    {
      id: "default-zelle",
      type: "zelle",
      title: "Zelle Principal",
      details: { contact: "sendhopevenezuela@gmail.com", name: "SendHope Venezuela" }
    },
    {
      id: "default-pago-movil",
      type: "pago_movil",
      title: "Pago Móvil",
      details: { phone: "0412-9292701", bank: "Banco Mercantil", cedula: "V-12345678" }
    },
    {
      id: "default-transfer",
      type: "transfer",
      title: "Transferencia Bancaria",
      details: { bank: "Banesco", account: "0134-0000-00-0000000000", name: "SendHope Venezuela", cedula: "J-12345678-9" }
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
      console.error("[QuickPaySection getPaymentMethods] Supabase error:", error.message);
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
  const methods = await getPaymentMethods();

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
          {methods.map((m) => {
            const isZelle = m.type === "zelle";
            const isPagoMovil = m.type === "pago_movil";
            const isTransfer = m.type === "transfer";
            const isPaypal = m.type === "paypal";
            const isOtros = m.type === "otros";
            const details = m.details as Record<string, string>;

            return (
              <div key={m.id} className="rounded-2xl border-2 border-navy/10 bg-cream p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  {/* Stripe de colores bandera como identificador de método */}
                  <span className="flex flex-col gap-[2px]">
                    <span className="block w-3 h-[2px] rounded-full bg-gold" />
                    <span className="block w-3 h-[2px] rounded-full bg-navy" />
                    <span className="block w-3 h-[2px] rounded-full bg-scarlet" />
                  </span>
                  <h3 className="font-mono font-600 text-navy text-sm uppercase tracking-widest">
                    {m.title}
                  </h3>
                </div>
                <dl className="flex flex-col gap-3">
                  {isZelle && (
                    <>
                      <Field label="Email / Teléfono" value={details.contact ?? ""} copyable />
                      <Field label="A nombre de" value={details.name ?? ""} />
                    </>
                  )}
                  {isPagoMovil && (
                    <>
                      <Field label="Teléfono" value={details.phone ?? ""} copyable />
                      <Field label="Banco" value={details.bank ?? ""} />
                      <Field label="RIF / Cédula" value={details.cedula ?? ""} copyable />
                    </>
                  )}
                  {isTransfer && (
                    <>
                      <Field label="Banco" value={details.bank ?? ""} />
                      <Field label="Cuenta" value={details.account ?? ""} copyable />
                      {details.name && <Field label="A nombre de" value={details.name} />}
                      {details.cedula && <Field label="Cédula / RIF" value={details.cedula} copyable />}
                    </>
                  )}
                  {isPaypal && (
                    <>
                      <Field label="Email de PayPal" value={details.contact ?? ""} copyable />
                      {details.name && <Field label="Titular" value={details.name} />}
                    </>
                  )}
                  {isOtros && (
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.15em] text-navy/40 mb-1">Instrucciones</dt>
                      <dd className="font-sans text-xs text-navy/80 leading-relaxed whitespace-pre-line">
                        {details.instructions ?? ""}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            );
          })}
        </div>

        {/* ── Donaciones Físicas Coordination Banner ── */}
        <div className="mt-8 bg-verified-light/30 border border-verified/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl mt-0.5">📦</span>
            <div>
              <h3 className="font-sans font-bold text-base text-navy">
                ¿Deseas donar insumos físicos en Barquisimeto?
              </h3>
              <p className="font-sans text-xs md:text-sm text-navy/85 mt-1 leading-relaxed">
                Coordinamos entregas directas de ropa, cobijas, alimentos no perecederos o medicinas. Escríbenos a cualquiera de nuestros WhatsApps de atención:
              </p>
              <div className="flex gap-4 flex-wrap mt-2 font-mono text-xs text-navy font-semibold">
                <a href="https://wa.me/584129292701" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                  💬 0412-9292701
                </a>
                <a href="https://wa.me/584121519715" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                  💬 0412-1519715
                </a>
              </div>
            </div>
          </div>
          <a
            href="mailto:sendhopevenezuela@gmail.com"
            className="flex-shrink-0 bg-navy text-white hover:bg-navy-mid px-5 py-2.5 rounded-xl font-sans font-600 text-xs transition-colors duration-150"
          >
            Contacto por Correo
          </a>
        </div>
      </div>
    </section>
  );
}
