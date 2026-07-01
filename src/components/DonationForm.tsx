"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { createDonation, type DonateResult } from "@/app/actions/donate";

// ── Tipos ────────────────────────────────────────────────────────────────────
type PaymentMethod = "zelle" | "pago_movil" | "transfer";
type PrivacyMode = "anonymous" | "public";

type PaymentInfo = {
  zelleContact: string;
  zelleName: string;
  pagoMovilPhone: string;
  pagoMovilBank: string;
  pagoMovilCedula: string;
  transferBank: string;
  transferAccount: string;
};

const PRESET_AMOUNTS = [5, 10, 25, 50] as const;

// ── Componente principal ──────────────────────────────────────────────────────
export function DonationForm({ payment }: { payment: PaymentInfo }) {
  const t = useTranslations("donar");
  const [isPending, startTransition] = useTransition();

  // Selección de monto
  const [selectedPreset, setSelectedPreset] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState("");

  // Método de pago activo
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>("zelle");

  // Modo privacidad — anónimo por defecto (menos fricción)
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("anonymous");

  // Campos del formulario
  const [referenceNote, setReferenceNote] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  // Estado de envío
  const [clientError, setClientError] = useState<string | null>(null);
  const [result, setResult] = useState<DonateResult | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const finalAmount: number | null = selectedPreset
    ? selectedPreset
    : customAmount
    ? parseFloat(customAmount)
    : null;

  const formatAmount = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);

  // Resetea el form para "hacer otra donación"
  const handleReset = () => {
    setResult(null);
    setSelectedPreset(10);
    setCustomAmount("");
    setActiveMethod("zelle");
    setPrivacyMode("anonymous");
    setReferenceNote("");
    setDonorName("");
    setDonorEmail("");
    setClientError(null);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!finalAmount || finalAmount < 1 || isNaN(finalAmount)) {
      setClientError(t("error_amount"));
      return;
    }
    if (!referenceNote.trim()) {
      setClientError(t("error_reference"));
      return;
    }

    startTransition(async () => {
      const res = await createDonation({
        amount: finalAmount,
        paymentMethod: activeMethod,
        referenceNote,
        // Si el modo es anónimo, nunca enviamos el nombre aunque el campo tenga valor
        donorName: privacyMode === "public" ? (donorName || undefined) : undefined,
        donorEmail: donorEmail || undefined,
      });
      setResult(res);
    });
  };

  // ── Estado de éxito ────────────────────────────────────────────────────────
  if (result && "success" in result) {
    return (
      <div className="flex flex-col items-center text-center py-16 px-6 gap-6">
        <div className="w-16 h-16 rounded-full bg-verified-light flex items-center justify-center">
          <CheckCircle size={32} className="text-verified" />
        </div>
        <h2 className="font-sans font-800 text-2xl md:text-3xl text-navy">
          {t("success_title")}
        </h2>
        <p className="font-sans font-400 text-muted max-w-md leading-relaxed">
          {t("success_body")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto">
          {/* Hacer otra donación — resetea el formulario en el cliente */}
          <button
            type="button"
            onClick={handleReset}
            className="bg-gold text-navy-dark font-sans font-700 px-6 py-3 rounded-full text-sm hover:bg-gold-dark active:scale-95 transition-all duration-200 text-center"
          >
            {t("success_another")}
          </button>
          <a
            href="/transparencia"
            className="bg-navy text-white font-sans font-600 px-6 py-3 rounded-full text-sm hover:bg-navy-dark transition-colors duration-200 text-center"
          >
            {t("success_cta")}
          </a>
          <a
            href="/"
            className="border-2 border-navy text-navy font-sans font-600 px-6 py-3 rounded-full text-sm hover:bg-navy hover:text-white transition-all duration-200 text-center"
          >
            {t("success_back")}
          </a>
        </div>
      </div>
    );
  }

  const tabs: { id: PaymentMethod; label: string }[] = [
    { id: "zelle", label: t("tab_zelle") },
    { id: "pago_movil", label: t("tab_pago_movil") },
    { id: "transfer", label: t("tab_transfer") },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
      {/* ── PASO 1: Monto ─────────────────────────────────────────────────── */}
      <section aria-labelledby="step1-heading">
        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono font-600 text-gold text-2xl leading-none select-none">
            {t("step1_label")}
          </span>
          <h2 id="step1-heading" className="font-sans font-700 text-navy text-lg">
            {t("step1_title")}
          </h2>
        </div>

        {/* Montos preset */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setSelectedPreset(amt);
                setCustomAmount("");
              }}
              className={`py-3 rounded-xl font-mono font-600 text-base border-2 transition-all duration-150 ${
                selectedPreset === amt
                  ? "bg-navy border-navy text-white"
                  : "bg-white border-navy/20 text-navy hover:border-navy/60"
              }`}
            >
              {formatAmount(amt)}
            </button>
          ))}
        </div>

        {/* Monto personalizado */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-muted text-sm pointer-events-none">
            $
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedPreset(null);
            }}
            placeholder={t("amount_custom_placeholder")}
            className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-navy/20 font-mono text-navy placeholder:text-muted/60 focus:outline-none focus:border-navy transition-colors duration-150 bg-white"
          />
        </div>
      </section>

      {/* ── PASO 2: Método de pago ────────────────────────────────────────── */}
      <section aria-labelledby="step2-heading">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-mono font-600 text-gold text-2xl leading-none select-none">
            {t("step2_label")}
          </span>
          <h2 id="step2-heading" className="font-sans font-700 text-navy text-lg">
            {t("step2_title")}
          </h2>
        </div>
        <p className="font-sans font-400 text-muted text-sm mb-5 ml-10">
          {t("step2_subtitle")}
        </p>

        {/* Tabs */}
        <div
          className="flex gap-1 bg-navy-light p-1 rounded-xl mb-4"
          role="tablist"
          aria-label="Método de pago"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeMethod === tab.id}
              onClick={() => setActiveMethod(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg font-sans font-600 text-sm transition-all duration-150 ${
                activeMethod === tab.id
                  ? "bg-white text-navy shadow-sm"
                  : "text-muted hover:text-navy"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Detalle del método seleccionado */}
        <div className="bg-white rounded-2xl border-2 border-navy/10 p-5">
          {activeMethod === "zelle" && (
            <dl className="flex flex-col gap-3">
              <PaymentRow label={t("zelle_label")} value={payment.zelleContact} copyable />
              <PaymentRow label={t("zelle_name_label")} value={payment.zelleName} />
            </dl>
          )}
          {activeMethod === "pago_movil" && (
            <dl className="flex flex-col gap-3">
              <PaymentRow label={t("pago_movil_phone_label")} value={payment.pagoMovilPhone} copyable />
              <PaymentRow label={t("pago_movil_bank_label")} value={payment.pagoMovilBank} />
              <PaymentRow label={t("pago_movil_cedula_label")} value={payment.pagoMovilCedula} copyable />
            </dl>
          )}
          {activeMethod === "transfer" && (
            <dl className="flex flex-col gap-3">
              <PaymentRow label={t("transfer_bank_label")} value={payment.transferBank} />
              <PaymentRow label={t("transfer_account_label")} value={payment.transferAccount} copyable />
            </dl>
          )}

          {/* Monto a transferir — calculado en vivo */}
          {finalAmount && finalAmount >= 1 && (
            <div className="mt-4 pt-4 border-t border-navy/10 flex items-center justify-between">
              <span className="font-sans text-sm text-muted">Monto a transferir</span>
              <span className="font-mono font-600 text-navy text-lg">
                {formatAmount(finalAmount)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── PASO 3: Confirmación ──────────────────────────────────────────── */}
      <section aria-labelledby="step3-heading">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-mono font-600 text-gold text-2xl leading-none select-none">
            {t("step3_label")}
          </span>
          <h2 id="step3-heading" className="font-sans font-700 text-navy text-lg">
            {t("step3_title")}
          </h2>
        </div>
        <p className="font-sans font-400 text-muted text-sm mb-5 ml-10">
          {t("step3_subtitle")}
        </p>

        <div className="flex flex-col gap-5">
          {/* Referencia — requerida */}
          <div>
            <label
              htmlFor="reference_note"
              className="block font-sans font-600 text-navy text-sm mb-1.5"
            >
              {t("reference_label")}
            </label>
            <input
              id="reference_note"
              type="text"
              value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
              placeholder={t("reference_placeholder")}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-navy/20 font-sans text-navy placeholder:text-muted/60 focus:outline-none focus:border-navy transition-colors duration-150 bg-white"
            />
            <p className="font-sans text-xs text-muted mt-1.5">{t("reference_hint")}</p>
          </div>

          {/* Toggle público / anónimo */}
          <div>
            <p className="font-sans font-600 text-navy text-sm mb-3">
              {t("privacy_toggle_label")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <PrivacyOption
                id="opt-anonymous"
                label={t("anonymous_option")}
                hint={t("anonymous_option_hint")}
                icon="🥷"
                selected={privacyMode === "anonymous"}
                onSelect={() => setPrivacyMode("anonymous")}
              />
              <PrivacyOption
                id="opt-public"
                label={t("public_option")}
                hint={t("public_option_hint")}
                icon="👤"
                selected={privacyMode === "public"}
                onSelect={() => setPrivacyMode("public")}
              />
            </div>
          </div>

          {/* Nombre — solo si "Con mi nombre" */}
          {privacyMode === "public" && (
            <div>
              <label
                htmlFor="donor_name"
                className="block font-sans font-600 text-navy text-sm mb-1.5"
              >
                {t("name_label")}
              </label>
              <input
                id="donor_name"
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder={t("name_placeholder")}
                className="w-full px-4 py-3 rounded-xl border-2 border-navy/20 font-sans text-navy placeholder:text-muted/60 focus:outline-none focus:border-navy transition-colors duration-150 bg-white"
              />
            </div>
          )}

          {/* Email — siempre visible, siempre opcional */}
          <div>
            <label
              htmlFor="donor_email"
              className="block font-sans font-600 text-navy text-sm mb-1.5"
            >
              {t("email_label")}
            </label>
            <input
              id="donor_email"
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              placeholder={t("email_placeholder")}
              className="w-full px-4 py-3 rounded-xl border-2 border-navy/20 font-sans text-navy placeholder:text-muted/60 focus:outline-none focus:border-navy transition-colors duration-150 bg-white"
            />
          </div>
        </div>

        {/* Nota de privacidad */}
        <p className="font-sans text-xs text-muted mt-3 flex items-start gap-1.5">
          <span className="mt-0.5 flex-shrink-0">🔒</span>
          {t("privacy_note")}
        </p>
      </section>

      {/* ── Error global ─────────────────────────────────────────────────── */}
      {(clientError || (result && "error" in result)) && (
        <div className="flex items-start gap-2.5 bg-scarlet-light border border-scarlet/20 text-scarlet rounded-xl px-4 py-3">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p className="font-sans text-sm">
            {clientError ?? (result && "error" in result ? result.error : null)}
          </p>
        </div>
      )}

      {/* ── Botón de envío ────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gold text-navy-dark font-sans font-700 text-base py-4 rounded-full hover:bg-gold-dark active:scale-[0.98] transition-all duration-150 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending
          ? t("submitting")
          : finalAmount && finalAmount >= 1
          ? t("submit", { amount: formatAmount(finalAmount) })
          : t("submit", { amount: "—" })}
      </button>
    </form>
  );
}

// ── Subcomponente: fila de dato de pago ──────────────────────────────────────
function PaymentRow({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="font-mono text-xs text-muted uppercase tracking-wider flex-shrink-0 pt-0.5">
        {label}
      </dt>
      <dd className="font-mono font-600 text-navy text-sm text-right break-all">
        {value}
        {copyable && value !== "—" && (
          <button
            type="button"
            onClick={handleCopy}
            className="ml-2 font-sans font-400 text-xs text-navy/40 hover:text-navy transition-colors"
            aria-label={`Copiar ${label}`}
          >
            {copied ? "✓" : "copiar"}
          </button>
        )}
      </dd>
    </div>
  );
}

// ── Subcomponente: opción de privacidad ──────────────────────────────────────
function PrivacyOption({
  id,
  label,
  hint,
  icon,
  selected,
  onSelect,
}: {
  id: string;
  label: string;
  hint: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      id={id}
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
        selected
          ? "border-navy bg-navy text-white"
          : "border-navy/20 bg-white text-navy hover:border-navy/50"
      }`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="font-sans font-700 text-sm leading-snug">{label}</span>
      <span
        className={`font-sans font-400 text-xs leading-snug ${
          selected ? "text-white/60" : "text-muted"
        }`}
      >
        {hint}
      </span>
    </button>
  );
}
