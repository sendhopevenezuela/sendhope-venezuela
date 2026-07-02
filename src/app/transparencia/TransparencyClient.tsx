"use client";

import { useState, useTransition } from "react";
import { searchDonationByReference } from "@/app/actions/donations";

type PurchasePhoto = {
  id: string;
  photo_url: string;
  photo_type: "receipt" | "product" | "delivery";
};

type PurchaseItem = {
  id: string;
  item_description: string;
  category: string | null;
  amount: number;
  currency: string;
  shelter_name: string;
  purchase_date: string;
  notes: string | null;
  original_amount: number | null;
  original_currency: string | null;
  exchange_rate_used: number | null;
  purchase_photos: PurchasePhoto[];
};

type FoundDonation = {
  id: string;
  donor_name: string | null;
  amount: number;
  currency: string;
  created_at: string;
};

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "alimentos", label: "Alimentos" },
  { id: "agua", label: "Agua" },
  { id: "medicinas", label: "Medicinas" },
  { id: "aseo", label: "Aseo" },
  { id: "otros", label: "Otros" },
];

export function TransparencyClient({ initialPurchases }: { initialPurchases: PurchaseItem[] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchRef, setSearchRef] = useState("");
  const [isPending, startTransition] = useTransition();
  const [searchError, setSearchError] = useState<string | null>(null);
  const [foundDonation, setFoundDonation] = useState<FoundDonation | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [activeInvoice, setActiveInvoice] = useState<PurchaseItem | null>(null);

  // Filtrado de compras por categoría
  const filteredPurchases = initialPurchases.filter((p) => {
    if (activeCategory === "all") return true;
    return p.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  // Buscar donación por referencia
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchError(null);
    setFoundDonation(null);

    if (searchRef.trim().length < 3) {
      setSearchError("Ingresa al menos 3 caracteres.");
      return;
    }

    startTransition(async () => {
      const res = await searchDonationByReference(searchRef);
      if ("error" in res) {
        setSearchError(res.error || "Error al buscar la donación");
      } else if (res.donation) {
        setFoundDonation(res.donation);
      }
    });
  }

  return (
    <>
      <main className="bg-cream min-h-screen">
        {/* ── Hero Banner ────────────────────────────────────────────────── */}
        <section
          className="relative py-16 md:py-24 px-6 text-center overflow-hidden"
          style={{
            background: "linear-gradient(150deg, #001D4E 0%, #003082 55%, #0042A6 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(244,195,29,0.08) 0%, transparent 100%)",
            }}
          />
          <h1 className="relative font-sans font-800 text-white text-3xl md:text-5xl mb-4 tracking-tight">
            Muro de Transparencia
          </h1>
          <p className="relative font-sans font-400 text-white/70 max-w-2xl mx-auto text-sm md:text-lg leading-relaxed">
            Aquí demostramos visual y públicamente el uso de cada donación. Cada compra física realizada en Barquisimeto cuenta con su factura auditada y foto de entrega en el refugio correspondiente.
          </p>
        </section>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-10">
          {/* ── Buscador "Busca tu Aporte" (Idea 8) ───────────────────────── */}
          <section className="bg-white border border-[#003082]/10 rounded-2xl p-6 md:p-8 shadow-sm max-w-3xl mx-auto w-full">
            <h2 className="font-sans font-bold text-lg text-navy mb-2 flex items-center gap-2">
              <span>🔍</span> Busca tu donación y hazle seguimiento
            </h2>
            <p className="font-sans text-xs md:text-sm text-muted mb-5">
              Ingresa la referencia bancaria, últimos 4 dígitos o tu alias para verificar el destino y las compras asociadas a tu dinero en vivo.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 flex-wrap sm:flex-nowrap">
              <input
                type="text"
                placeholder="ej: Zelle de Carlos, Ref: 4521 o 982143..."
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2.5 text-sm font-sans border border-[#003082]/20 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-navy/20"
              />
              <button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto bg-navy hover:bg-navy-mid text-white px-6 py-2.5 rounded-xl font-sans font-600 text-sm transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isPending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Buscar"
                )}
              </button>
            </form>

            {searchError && (
              <p className="text-xs text-scarlet font-sans mt-3 font-semibold">⚠ {searchError}</p>
            )}

            {/* Resultado de donación encontrada */}
            {foundDonation && (
              <div className="mt-6 bg-verified-light/40 border border-verified/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                <div>
                  <h3 className="font-sans font-bold text-sm text-verified-dark">
                    ¡Donación encontrada y confirmada! 🎉
                  </h3>
                  <p className="font-sans text-xs text-navy/80 mt-1 leading-relaxed">
                    Agradecemos enormemente el aporte de{" "}
                    <strong>{foundDonation.donor_name ?? "Donante Anónimo"}</strong> por un valor de{" "}
                    <strong>
                      ${foundDonation.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                      {foundDonation.currency}
                    </strong>{" "}
                    el día {new Date(foundDonation.created_at).toLocaleDateString("es-VE")}.
                  </p>
                </div>
                <div className="flex-shrink-0 self-start sm:self-center bg-verified text-white font-mono text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
                  Resaltando compras compras
                </div>
              </div>
            )}
          </section>

          {/* ── Filtro de Categorías (Idea 4) ────────────────────────────── */}
          <div className="flex justify-center gap-1.5 md:gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full font-sans text-xs md:text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-navy text-white shadow-md scale-105"
                    : "bg-white border border-[#003082]/10 text-navy hover:bg-[#EEF4FF]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* ── Masonry Grid de Compras (Idea 1) ──────────────────────────── */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredPurchases.length === 0 ? (
              <div className="text-center py-20 text-muted font-sans text-sm w-full col-span-full">
                No hay compras registradas en esta categoría.
              </div>
            ) : (
              filteredPurchases.map((purchase) => {
                // Determinar si esta compra se destaca (Idea 8: ±3 días de la donación buscada)
                const isHighlighted =
                  foundDonation &&
                  Math.abs(
                    new Date(purchase.purchase_date).getTime() -
                      new Date(foundDonation.created_at).getTime()
                  ) <= 3 * 24 * 60 * 60 * 1000;

                return (
                  <PurchaseCard
                    key={purchase.id}
                    purchase={purchase}
                    isHighlighted={!!isHighlighted}
                    onOpenInvoice={(p) => setActiveInvoice(p)}
                    onZoomImg={(src) => setLightboxImg(src)}
                  />
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* ── Modal Detalle de Factura / Soporte (Reemplazo Flip-Card) ── */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-navy/10 flex flex-col max-h-[90vh] animate-fadeIn">
            {/* Cabecera */}
            <div className="p-5 border-b border-[#003082]/10 flex items-center justify-between bg-navy-light text-navy">
              <div>
                <h3 className="font-sans font-bold text-base leading-snug">Soporte de Compra</h3>
                <p className="font-mono text-[10px] text-navy/70 mt-0.5">ID: #{activeInvoice.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setActiveInvoice(null)}
                className="text-navy/55 hover:text-navy text-lg p-1 px-2.5 rounded-full hover:bg-navy/10 transition-colors font-sans"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Contenido (Scrollable) */}
            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-5">
              <div>
                <h4 className="font-sans font-bold text-[#0A1628] text-sm mb-1">{activeInvoice.item_description}</h4>
                <p className="font-sans text-xs text-[#64748B]">
                  Entregado en: <strong className="text-navy">{activeInvoice.shelter_name}</strong> · {new Date(activeInvoice.purchase_date).toLocaleDateString("es-VE")}
                </p>
              </div>

              {/* Imagen de factura */}
              <div>
                <span className="block font-sans font-semibold text-xs text-[#0A1628] mb-2">Comprobante / Recibo digitalizado:</span>
                <div className="relative bg-navy/5 border border-dashed border-[#003082]/20 rounded-xl overflow-hidden h-64 flex items-center justify-center">
                  {activeInvoice.purchase_photos.find((ph) => ph.photo_type === "receipt")?.photo_url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeInvoice.purchase_photos.find((ph) => ph.photo_type === "receipt")!.photo_url}
                        alt="Factura digitalizada"
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => {
                          setLightboxImg(activeInvoice.purchase_photos.find((ph) => ph.photo_type === "receipt")!.photo_url);
                        }}
                        className="absolute bg-black/60 hover:bg-black/85 text-white rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors shadow-md flex items-center gap-1"
                      >
                        🔍 Ampliar imagen
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-6 text-muted flex flex-col items-center gap-1.5">
                      <span className="text-3xl">🧾</span>
                      <p className="text-xs">Comprobante de compra en proceso de digitalización.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalles de Auditoría */}
              <div className="bg-[#EEF4FF] border border-[#003082]/10 rounded-xl p-4 flex flex-col gap-2.5 text-xs font-sans">
                <div className="flex justify-between border-b border-[#003082]/5 pb-2">
                  <span className="text-[#64748B]">Monto auditado (USD):</span>
                  <span className="font-mono font-bold text-navy text-sm">
                    ${activeInvoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {activeInvoice.original_amount && (
                  <>
                    <div className="flex justify-between border-b border-[#003082]/5 pb-2">
                      <span className="text-[#64748B]">Monto VES original:</span>
                      <span className="font-mono font-bold text-[#0A1628]">
                        Bs. {activeInvoice.original_amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#003082]/5 pb-2">
                      <span className="text-[#64748B]">Tasa oficial de cambio:</span>
                      <span className="font-mono text-[#0A1628]">
                        Bs. {activeInvoice.exchange_rate_used?.toLocaleString("es-VE", { minimumFractionDigits: 4 })}
                      </span>
                    </div>
                  </>
                )}
                {activeInvoice.notes && (
                  <div className="text-[11px] text-[#64748B] italic leading-relaxed pt-1">
                    <strong>Notas:</strong> {activeInvoice.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setActiveInvoice(null)}
                className="bg-navy text-white hover:bg-navy-mid px-5 py-2.5 rounded-xl font-sans font-600 text-xs transition-colors"
              >
                Cerrar Soporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox de Facturas (Idea 1) ───────────────────────────────── */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImg}
              alt="Documento ampliado"
              className="max-w-full max-h-full object-contain rounded-lg border border-white/10"
            />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/90 text-white rounded-full p-2 text-sm transition-colors"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── SUB-COMPONENTE: TARJETA DE AUDITORÍA SIMPLE ──────────────────────────────

function PurchaseCard({
  purchase,
  isHighlighted,
  onOpenInvoice,
  onZoomImg,
}: {
  purchase: PurchaseItem;
  isHighlighted: boolean;
  onOpenInvoice: (p: PurchaseItem) => void;
  onZoomImg: (src: string) => void;
}) {
  // Extraer las fotos
  const purchasePhoto = purchase.purchase_photos.find((p) => p.photo_type === "product")?.photo_url;
  const deliveryPhoto = purchase.purchase_photos.find((p) => p.photo_type === "delivery")?.photo_url;

  // Foto de portada (frente): prioridad entrega > compra > placeholder
  const coverPhoto = deliveryPhoto ?? purchasePhoto ?? "/placeholder-help.jpg";

  // Estado del ciclo de transparencia
  const hasDelivery = !!deliveryPhoto;

  return (
    <div
      className={`break-inside-avoid relative w-full rounded-2xl bg-white border border-[#003082]/10 overflow-hidden flex flex-col transition-all duration-300 ${
        isHighlighted
          ? "ring-4 ring-gold ring-offset-2 scale-[1.02] shadow-[0_0_20px_rgba(244,195,29,0.4)]"
          : "hover:shadow-lg hover:-translate-y-0.5"
      }`}
    >
      {/* Badge de Trazabilidad Flotante si está destacada */}
      {isHighlighted && (
        <span className="absolute -top-3 left-4 z-20 bg-gold text-navy-dark font-sans font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md animate-bounce">
          ✨ Financiado por tu aporte
        </span>
      )}

      {/* Portada */}
      <div className="relative h-48 w-full bg-navy/5 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverPhoto}
          alt={purchase.item_description}
          className="w-full h-full object-cover"
        />
        {/* Badge de Estado */}
        <span
          className={`absolute top-3 right-3 font-sans font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm ${
            hasDelivery
              ? "bg-verified text-white"
              : "bg-gold text-navy-dark animate-pulse"
          }`}
        >
          {hasDelivery ? "✓ Entregado y Verificado" : "Coordinando entrega"}
        </span>
      </div>

      {/* Información */}
      <div className="p-5 flex flex-col justify-between gap-4 flex-1">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[9px] text-[#64748B] uppercase font-bold tracking-wide">
              {purchase.category ?? "Ayuda"}
            </span>
            <span className="font-mono text-[10px] text-[#64748B]">
              {new Date(purchase.purchase_date).toLocaleDateString("es-VE")}
            </span>
          </div>
          <h3 className="font-sans font-bold text-base text-[#0A1628] leading-snug">
            {purchase.item_description}
          </h3>
          <p className="font-sans text-xs text-[#64748B]">
            Destinado a: <strong className="text-navy">{purchase.shelter_name}</strong>
          </p>
        </div>

        {/* Monto y Botones */}
        <div className="flex items-end justify-between pt-3 border-t border-[#003082]/5">
          <div>
            <span className="block font-mono text-[8px] text-[#64748B] uppercase">Costo Total</span>
            <span className="font-mono font-800 text-[#0A1628] text-lg">
              ${purchase.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
            </span>
            {purchase.original_amount && (
              <span className="block font-mono text-[9px] text-[#64748B] mt-0.5">
                Original: Bs. {purchase.original_amount.toLocaleString("es-VE")}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onOpenInvoice(purchase)}
              className="bg-navy-light text-navy hover:bg-navy hover:text-white px-3 py-1.5 rounded-lg font-sans font-600 text-xs transition-all duration-200"
            >
              Ver factura 🧾
            </button>
            {hasDelivery && deliveryPhoto && (
              <button
                onClick={() => onZoomImg(deliveryPhoto)}
                className="bg-verified-light text-verified-dark hover:bg-verified hover:text-white px-3 py-1.5 rounded-lg font-sans font-600 text-xs transition-all duration-200"
              >
                Ver entrega 📦
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
