"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition, useRef, useCallback } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { createDonation, type DonateResult } from "@/app/actions/donate";

// ── Tipos ────────────────────────────────────────────────────────────────────
type PaymentMethod = "zelle" | "pago_movil" | "transfer" | "paypal" | "otros";
type PrivacyMode = "anonymous" | "public";

type ZelleDetails = { contact: string; name: string };
type PagoMovilDetails = { phone: string; bank: string; cedula: string };
type TransferDetails = { bank: string; account: string; name?: string; cedula?: string };
type PaypalDetails = { contact: string; name: string };
type OtrosDetails = { instructions: string };

type PaymentMethodItem = {
  id: string;
  type: PaymentMethod;
  title: string;
  details: ZelleDetails | PagoMovilDetails | TransferDetails | PaypalDetails | OtrosDetails;
  is_active: boolean;
};

const PRESET_AMOUNTS = [5, 10, 25, 50] as const;

// ── Compresor de imágenes (Canvas API) ───────────────────────────────────────
async function compressImage(file: File, maxDimension = 1280, quality = 0.72): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) { height = Math.round((height * maxDimension) / width); width = maxDimension; }
        else { width = Math.round((width * maxDimension) / height); height = maxDimension; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) { resolve(file); return; }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }));
      }, "image/jpeg", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

// ── Componente principal ──────────────────────────────────────────────────────
export function DonationForm({ paymentMethods }: { paymentMethods: PaymentMethodItem[] }) {
  const t = useTranslations("donar");
  const [isPending, startTransition] = useTransition();

  const availableTabs = [
    { id: "zelle" as const, label: t("tab_zelle"), count: paymentMethods.filter(m => m.type === "zelle").length },
    { id: "pago_movil" as const, label: t("tab_pago_movil"), count: paymentMethods.filter(m => m.type === "pago_movil").length },
    { id: "transfer" as const, label: t("tab_transfer"), count: paymentMethods.filter(m => m.type === "transfer").length },
    { id: "paypal" as const, label: t("tab_paypal"), count: paymentMethods.filter(m => m.type === "paypal").length },
    { id: "otros" as const, label: t("tab_otros"), count: paymentMethods.filter(m => m.type === "otros").length },
  ].filter(tab => tab.count > 0);

  const [selectedPreset, setSelectedPreset] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>(() => availableTabs[0]?.id ?? "zelle");
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>("anonymous");
  const [referenceNote, setReferenceNote] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  // Comprobante de pago
  const proofInputRef = useRef<HTMLInputElement>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofCompressing, setProofCompressing] = useState(false);

  // Estado de envío
  const [clientError, setClientError] = useState<string | null>(null);
  const [result, setResult] = useState<DonateResult | null>(null);
  const [copied, setCopied] = useState(false);

  const finalAmount: number | null = selectedPreset
    ? selectedPreset
    : customAmount ? parseFloat(customAmount) : null;

  const formatAmount = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

  const handleReset = () => {
    setResult(null); setSelectedPreset(10); setCustomAmount(""); setActiveMethod("zelle");
    setPrivacyMode("anonymous"); setReferenceNote(""); setDonorName(""); setDonorEmail("");
    setClientError(null); setProofPreview(null); setProofFile(null); setCopied(false);
  };

  const handleProofFile = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setProofCompressing(true);
    const compressed = await compressImage(file);
    setProofFile(compressed);
    setProofPreview(URL.createObjectURL(compressed));
    setProofCompressing(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!finalAmount || finalAmount < 1 || isNaN(finalAmount)) {
      setClientError(t("error_amount")); return;
    }
    if (!referenceNote.trim()) {
      setClientError(t("error_reference")); return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("amount", String(finalAmount));
      formData.set("paymentMethod", activeMethod);
      formData.set("referenceNote", referenceNote);
      if (privacyMode === "public" && donorName.trim()) formData.set("donorName", donorName);
      if (donorEmail.trim()) formData.set("donorEmail", donorEmail);
      if (proofFile) formData.set("proof_image", proofFile);

      const res = await createDonation(formData);
      setResult(res);
    });
  };

  // ── Estado de éxito ────────────────────────────────────────────────────────
  if (result && "success" in result) {
    const trackingCode = result.trackingCode;
    return (
      <div className="flex flex-col items-center text-center py-12 px-6 gap-8">
        <div className="w-20 h-20 rounded-full bg-verified-light flex items-center justify-center shadow-lg">
          <CheckCircle size={40} className="text-verified" />
        </div>
        <div>
          <h2 className="font-sans font-800 text-2xl md:text-3xl text-navy">
            {t("success_title")}
          </h2>
          <p className="font-sans font-400 text-muted max-w-md leading-relaxed mt-2">
            {t("success_body")}
          </p>
        </div>

        {/* Credencial de rastreo */}
        <div className="w-full max-w-sm bg-navy rounded-2xl p-6 flex flex-col items-center gap-3 shadow-xl">
          <p className="font-sans text-white/70 text-xs uppercase tracking-[0.15em] font-semibold">
            Tu Credencial de Rastreo
          </p>
          <div className="font-mono font-800 text-white text-3xl tracking-[0.25em] select-all">
            {trackingCode}
          </div>
          <p className="font-sans text-white/60 text-[11px] leading-relaxed text-center max-w-xs">
            Guarda este código. Úsalo en el{" "}
            <a href="/transparencia" className="underline text-gold hover:text-gold-light">
              Muro de Transparencia
            </a>{" "}
            para ver en qué compras fue utilizada tu donación.
          </p>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(trackingCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
            className="mt-1 flex items-center gap-2 bg-gold hover:bg-gold-dark text-navy-dark font-sans font-700 text-sm px-5 py-2.5 rounded-full transition-all duration-150 active:scale-95"
          >
            {copied ? "✓ Copiado!" : "📋 Copiar código"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt} type="button"
              onClick={() => { setSelectedPreset(amt); setCustomAmount(""); }}
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

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-muted text-sm pointer-events-none">$</span>
          <input
            type="number" min="1" step="1" value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setSelectedPreset(null); }}
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
        <p className="font-sans font-400 text-muted text-sm mb-5 ml-10">{t("step2_subtitle")}</p>

        <div className="flex gap-1 bg-navy-light p-1 rounded-xl mb-4" role="tablist" aria-label="Método de pago">
          {availableTabs.map((tab) => (
            <button
              key={tab.id} type="button" role="tab"
              aria-selected={activeMethod === tab.id}
              onClick={() => setActiveMethod(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg font-sans font-600 text-sm transition-all duration-150 ${
                activeMethod === tab.id ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border-2 border-navy/10 p-5 flex flex-col gap-5">
          {activeMethod === "zelle" && (
            <div className="flex flex-col gap-5">
              {paymentMethods.filter(m => m.type === "zelle").map((m, idx) => {
                const details = m.details as ZelleDetails;
                return (
                  <div key={m.id} className={idx > 0 ? "pt-5 border-t border-dashed border-navy/10" : ""}>
                    <p className="font-sans font-bold text-xs text-navy/60 uppercase tracking-wider mb-2.5">{m.title}</p>
                    <dl className="flex flex-col gap-3">
                      <PaymentRow label={t("zelle_label")} value={details.contact} copyable />
                      <PaymentRow label={t("zelle_name_label")} value={details.name} />
                    </dl>
                  </div>
                );
              })}
            </div>
          )}
          {activeMethod === "pago_movil" && (
            <div className="flex flex-col gap-5">
              {paymentMethods.filter(m => m.type === "pago_movil").map((m, idx) => {
                const details = m.details as PagoMovilDetails;
                return (
                  <div key={m.id} className={idx > 0 ? "pt-5 border-t border-dashed border-navy/10" : ""}>
                    <p className="font-sans font-bold text-xs text-navy/60 uppercase tracking-wider mb-2.5">{m.title}</p>
                    <dl className="flex flex-col gap-3">
                      <PaymentRow label={t("pago_movil_phone_label")} value={details.phone} copyable />
                      <PaymentRow label={t("pago_movil_bank_label")} value={details.bank} />
                      <PaymentRow label={t("pago_movil_cedula_label")} value={details.cedula} copyable />
                    </dl>
                  </div>
                );
              })}
            </div>
          )}
          {activeMethod === "transfer" && (
            <div className="flex flex-col gap-5">
              {paymentMethods.filter(m => m.type === "transfer").map((m, idx) => {
                const details = m.details as TransferDetails;
                return (
                  <div key={m.id} className={idx > 0 ? "pt-5 border-t border-dashed border-navy/10" : ""}>
                    <p className="font-sans font-bold text-xs text-navy/60 uppercase tracking-wider mb-2.5">{m.title}</p>
                    <dl className="flex flex-col gap-3">
                      <PaymentRow label={t("transfer_bank_label")} value={details.bank} />
                      <PaymentRow label={t("transfer_account_label")} value={details.account} copyable />
                      {details.name && <PaymentRow label="Titular" value={details.name} />}
                      {details.cedula && <PaymentRow label="Cédula / RIF" value={details.cedula} copyable />}
                    </dl>
                  </div>
                );
              })}
            </div>
          )}
          {activeMethod === "paypal" && (
            <div className="flex flex-col gap-5">
              {paymentMethods.filter(m => m.type === "paypal").map((m, idx) => {
                const details = m.details as PaypalDetails;
                return (
                  <div key={m.id} className={idx > 0 ? "pt-5 border-t border-dashed border-navy/10" : ""}>
                    <p className="font-sans font-bold text-xs text-navy/60 uppercase tracking-wider mb-2.5">{m.title}</p>
                    <dl className="flex flex-col gap-3">
                      <PaymentRow label="Email de PayPal" value={details.contact} copyable />
                      <PaymentRow label="Titular" value={details.name} />
                    </dl>
                  </div>
                );
              })}
            </div>
          )}
          {activeMethod === "otros" && (
            <div className="flex flex-col gap-5">
              {paymentMethods.filter(m => m.type === "otros").map((m, idx) => {
                const details = m.details as OtrosDetails;
                return (
                  <div key={m.id} className={idx > 0 ? "pt-5 border-t border-dashed border-navy/10" : ""}>
                    <p className="font-sans font-bold text-xs text-navy/60 uppercase tracking-wider mb-2.5">{m.title}</p>
                    <div className="bg-[#EEF4FF]/50 border border-[#003082]/10 rounded-xl px-4 py-3 text-sm text-[#0A1628] leading-relaxed whitespace-pre-line">
                      {details.instructions}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {finalAmount && finalAmount >= 1 && (
            <div className="mt-4 pt-4 border-t border-navy/10 flex items-center justify-between">
              <span className="font-sans text-sm text-muted">Monto a transferir</span>
              <span className="font-mono font-600 text-navy text-lg">{formatAmount(finalAmount)}</span>
            </div>
          )}
        </div>
      </section>

      {/* ── PASO 3: Confirmación + comprobante ────────────────────────────── */}
      <section aria-labelledby="step3-heading">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-mono font-600 text-gold text-2xl leading-none select-none">
            {t("step3_label")}
          </span>
          <h2 id="step3-heading" className="font-sans font-700 text-navy text-lg">
            {t("step3_title")}
          </h2>
        </div>
        <p className="font-sans font-400 text-muted text-sm mb-5 ml-10">{t("step3_subtitle")}</p>

        <div className="flex flex-col gap-5">
          {/* Referencia */}
          <div>
            <label htmlFor="reference_note" className="block font-sans font-600 text-navy text-sm mb-1.5">
              {t("reference_label")}
            </label>
            <input
              id="reference_note" type="text" value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
              placeholder={t("reference_placeholder")} required
              className="w-full px-4 py-3 rounded-xl border-2 border-navy/20 font-sans text-navy placeholder:text-muted/60 focus:outline-none focus:border-navy transition-colors duration-150 bg-white"
            />
            <p className="font-sans text-xs text-muted mt-1.5">{t("reference_hint")}</p>
          </div>

          {/* Comprobante de pago (opcional) */}
          <div>
            <label className="block font-sans font-600 text-navy text-sm mb-1.5">
              Comprobante de pago{" "}
              <span className="font-sans font-400 text-muted text-xs">(opcional — te ayuda a confirmar más rápido)</span>
            </label>
            {proofPreview ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-navy/20 bg-navy/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proofPreview} alt="Comprobante" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => { setProofPreview(null); setProofFile(null); if (proofInputRef.current) proofInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/85 text-white rounded-full p-1.5 text-xs transition-colors"
                  aria-label="Quitar comprobante"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                onClick={() => proofInputRef.current?.click()}
                className="w-full border-2 border-dashed border-navy/20 rounded-xl px-4 py-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#EEF4FF]/50 transition-colors bg-white"
              >
                {proofCompressing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                    <p className="font-sans text-xs text-navy font-semibold animate-pulse">Comprimiendo...</p>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">📎</span>
                    <p className="font-sans text-xs text-muted text-center">
                      Arrastra o <span className="text-navy font-semibold">haz clic</span> para subir tu comprobante
                    </p>
                    <p className="font-mono text-[9px] text-muted/60">JPG, PNG, WEBP — Se comprime automáticamente</p>
                  </>
                )}
                <input
                  ref={proofInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleProofFile(e.target.files)}
                />
              </div>
            )}
          </div>

          {/* Toggle público / anónimo */}
          <div>
            <p className="font-sans font-600 text-navy text-sm mb-3">{t("privacy_toggle_label")}</p>
            <div className="grid grid-cols-2 gap-3">
              <PrivacyOption id="opt-anonymous" label={t("anonymous_option")} hint={t("anonymous_option_hint")} icon="🥷"
                selected={privacyMode === "anonymous"} onSelect={() => setPrivacyMode("anonymous")} />
              <PrivacyOption id="opt-public" label={t("public_option")} hint={t("public_option_hint")} icon="👤"
                selected={privacyMode === "public"} onSelect={() => setPrivacyMode("public")} />
            </div>
          </div>

          {privacyMode === "public" && (
            <div>
              <label htmlFor="donor_name" className="block font-sans font-600 text-navy text-sm mb-1.5">
                {t("name_label")}
              </label>
              <input
                id="donor_name" type="text" value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder={t("name_placeholder")}
                className="w-full px-4 py-3 rounded-xl border-2 border-navy/20 font-sans text-navy placeholder:text-muted/60 focus:outline-none focus:border-navy transition-colors duration-150 bg-white"
              />
            </div>
          )}

          <div>
            <label htmlFor="donor_email" className="block font-sans font-600 text-navy text-sm mb-1.5">
              {t("email_label")}
            </label>
            <input
              id="donor_email" type="email" value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              placeholder={t("email_placeholder")}
              className="w-full px-4 py-3 rounded-xl border-2 border-navy/20 font-sans text-navy placeholder:text-muted/60 focus:outline-none focus:border-navy transition-colors duration-150 bg-white"
            />
          </div>
        </div>

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
        type="submit" disabled={isPending}
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

// ── Subcomponentes ────────────────────────────────────────────────────────────
function PaymentRow({ label, value, copyable = false }: { label: string; value: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="font-mono text-xs text-muted uppercase tracking-wider flex-shrink-0 pt-0.5">{label}</dt>
      <dd className="font-mono font-600 text-navy text-sm text-right break-all">
        {value}
        {copyable && value !== "—" && (
          <button type="button" onClick={handleCopy} className="ml-2 font-sans font-400 text-xs text-navy/40 hover:text-navy transition-colors" aria-label={`Copiar ${label}`}>
            {copied ? "✓" : "copiar"}
          </button>
        )}
      </dd>
    </div>
  );
}

function PrivacyOption({ id, label, hint, icon, selected, onSelect }: { id: string; label: string; hint: string; icon: string; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" id={id} onClick={onSelect} aria-pressed={selected}
      className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition-all duration-150 ${selected ? "border-navy bg-navy text-white" : "border-navy/20 bg-white text-navy hover:border-navy/50"}`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="font-sans font-700 text-sm leading-snug">{label}</span>
      <span className={`font-sans font-400 text-xs leading-snug ${selected ? "text-white/60" : "text-muted"}`}>{hint}</span>
    </button>
  );
}
