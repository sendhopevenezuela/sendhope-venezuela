"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { createPurchase } from "@/app/actions/purchases";
import { PhotoUploader } from "@/components/admin/PhotoUploader";

const CATEGORIES = ["alimentos", "medicinas", "agua", "aseo", "otros"];
const CURRENCIES = ["USD", "VES", "EUR"];

export default function NuevaCompraPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Conversión VES → USD
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  useEffect(() => {
    if (currency !== "VES") { setRate(null); return; }
    setRateLoading(true);
    fetch("https://ve.dolarapi.com/v1/dolares/oficial")
      .then((r) => r.json())
      .then((data) => {
        setRate(data.promedio ?? data.venta ?? null);
        setRateDate(data.fechaActualizacion ?? null);
      })
      .catch(() => setRate(null))
      .finally(() => setRateLoading(false));
  }, [currency]);

  const amountNum = parseFloat(amount);
  const convertedUSD =
    currency === "VES" && rate && !isNaN(amountNum) && amountNum > 0
      ? Math.round((amountNum / rate) * 100) / 100
      : null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createPurchase(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.push("/admin/compras");
      }
    });
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-sans text-[#64748B] hover:text-[#003082] transition-colors mb-4"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver a compras
        </button>
        <h1 className="font-sans font-bold text-2xl text-[#0A1628]">Nueva Compra</h1>
        <p className="font-sans text-sm text-[#64748B] mt-1">
          Registra una compra realizada para un refugio con su recibo y fotos.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-[#FFF0F2] border border-[#CE1126]/20 text-[#CE1126] rounded-xl px-4 py-3 text-sm font-sans flex items-start gap-2">
          <span>⚠</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-[#003082]/10 p-6 flex flex-col gap-5">
          <h2 className="font-sans font-semibold text-base text-[#0A1628]">Información de la compra</h2>

          {/* Descripción */}
          <div>
            <label htmlFor="item_description" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">
              Descripción <span className="text-[#CE1126]">*</span>
            </label>
            <input
              id="item_description"
              name="item_description"
              type="text"
              required
              placeholder="ej. 20 cajas de agua potable de 6 litros"
              className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
            />
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="category" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">
              Categoría
            </label>
            <select
              id="category"
              name="category"
              className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
            >
              <option value="">Sin categoría</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Monto + Moneda */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="amount" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">
                Monto <span className="text-[#CE1126]">*</span>
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
              />
            </div>
            <div>
              <label htmlFor="currency" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">
                Moneda
              </label>
              <select
                id="currency"
                name="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Conversión VES → USD en tiempo real */}
          {currency === "VES" && (
            <div className={`rounded-xl px-4 py-3 text-sm font-sans flex items-center gap-2 ${
              convertedUSD
                ? "bg-[#D1FAE5] border border-[#059669]/20 text-[#047857]"
                : "bg-[#EEF4FF] border border-[#003082]/15 text-[#64748B]"
            }`}>
              {rateLoading ? (
                <><span className="w-3.5 h-3.5 border-2 border-[#003082]/30 border-t-[#003082] rounded-full animate-spin flex-shrink-0" /> Obteniendo tasa oficial...</>
              ) : rate ? (
                convertedUSD ? (
                  <>
                    <span className="text-base">✓</span>
                    <span>
                      <strong>Bs. {Number(amount).toLocaleString("es-VE")}</strong> ={" "}
                      <strong>${convertedUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</strong>
                      {" "}<span className="opacity-70">(tasa: Bs. {rate.toLocaleString("es-VE")} / USD</span>
                      {rateDate && <span className="opacity-70">, {new Date(rateDate).toLocaleDateString("es-VE")})</span>}
                    </span>
                  </>
                ) : (
                  <><span className="text-base">💱</span> Tasa oficial: <strong>Bs. {rate.toLocaleString("es-VE")} / USD</strong>. Ingresa el monto para ver la conversión.</>
                )
              ) : (
                <><span className="text-base">⚠</span> No se pudo obtener la tasa. Se guardará en VES sin convertir.</>
              )}
            </div>
          )}

          {/* Refugio + Fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="shelter_name" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">
                Refugio destino <span className="text-[#CE1126]">*</span>
              </label>
              <input
                id="shelter_name"
                name="shelter_name"
                type="text"
                required
                placeholder="ej. Refugio San Judas"
                className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
              />
            </div>
            <div>
              <label htmlFor="purchase_date" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">
                Fecha de compra <span className="text-[#CE1126]">*</span>
              </label>
              <input
                id="purchase_date"
                name="purchase_date"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label htmlFor="notes" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">
              Notas adicionales
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Detalles adicionales relevantes..."
              className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
            />
          </div>
        </div>

        {/* Fotos */}
        <div className="bg-white rounded-2xl border border-[#003082]/10 p-6 flex flex-col gap-5">
          <div>
            <h2 className="font-sans font-semibold text-base text-[#0A1628]">Fotos</h2>
            <p className="font-sans text-xs text-[#64748B] mt-1">
              Si no adjuntas foto de entrega, la compra aparecerá sin indicador de entrega en el Muro de Transparencia hasta que subas la foto.
            </p>
          </div>
          <PhotoUploader type="receipt" label="Foto del recibo" />
          <PhotoUploader type="product" label="Foto del producto" />
          <PhotoUploader type="delivery" label="Foto de entrega al refugio" />
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 font-sans text-sm font-medium text-[#64748B] border border-[#64748B]/20 rounded-lg hover:bg-[#64748B]/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 font-sans text-sm font-medium bg-[#003082] text-white rounded-lg hover:bg-[#0042A6] transition-colors disabled:opacity-60"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              "Registrar Compra"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
