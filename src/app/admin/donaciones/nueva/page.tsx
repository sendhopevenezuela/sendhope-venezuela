"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { createManualDonation } from "@/app/actions/donations";

const PAY_METHODS = ["Zelle", "Pago Móvil", "Transferencia bancaria", "Efectivo USD", "Otro"];
const CURRENCIES = ["USD", "VES", "EUR"];

export default function NuevaDonacionPage() {
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
      const result = await createManualDonation(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.push("/admin/donaciones");
      }
    });
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-sans text-[#64748B] hover:text-[#003082] transition-colors mb-4">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver a donaciones
        </button>
        <h1 className="font-sans font-bold text-2xl text-[#0A1628]">Registrar Donación Manual</h1>
        <p className="font-sans text-sm text-[#64748B] mt-1">
          Registra una donación recibida vía Pago Móvil, Zelle, transferencia u otro método.
          Se creará en estado <strong>Pendiente</strong> para que puedas confirmarla después.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-[#FFF0F2] border border-[#CE1126]/20 text-[#CE1126] rounded-xl px-4 py-3 text-sm font-sans">⚠ {error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-[#003082]/10 p-6 flex flex-col gap-5">
          <h2 className="font-sans font-semibold text-base text-[#0A1628]">Datos del donante</h2>

          <div>
            <label htmlFor="donor_name" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">
              Nombre del donante <span className="text-[#64748B] text-xs font-normal">(opcional — puede ser anónimo)</span>
            </label>
            <input id="donor_name" name="donor_name" type="text" placeholder="Nombre o alias" className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30" />
          </div>

          <div>
            <label htmlFor="donor_email" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">
              Email <span className="text-[#64748B] text-xs font-normal">(opcional)</span>
            </label>
            <input id="donor_email" name="donor_email" type="email" placeholder="correo@ejemplo.com" className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#003082]/10 p-6 flex flex-col gap-5">
          <h2 className="font-sans font-semibold text-base text-[#0A1628]">Datos del pago</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="amount" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">Monto *</label>
              <input
                id="amount"
                name="amount"
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
              />
            </div>
            <div>
              <label htmlFor="currency" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">Moneda</label>
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

          {/* Live rate preview */}
          {currency === "VES" && (
            <div className="text-xs font-sans p-3 rounded-lg border flex flex-col gap-1 bg-[#EEF4FF] border-[#003082]/10 text-[#003082]">
              {rateLoading ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-[#003082]/30 border-t-[#003082] rounded-full animate-spin" />
                  Obteniendo tasa oficial del BCV...
                </div>
              ) : rate ? (
                <>
                  <div className="font-semibold">
                    Tasa Oficial BCV: Bs. {rate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                  </div>
                  {convertedUSD !== null && (
                    <div className="font-bold text-sm text-[#059669] mt-0.5 animate-pulse">
                      Equivalente aproximado: ${convertedUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                    </div>
                  )}
                  {rateDate && (
                    <div className="text-[10px] text-[#64748B] opacity-70">
                      Actualizado: {new Date(rateDate).toLocaleString("es-VE")}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-[#D97706]">
                  No se pudo cargar la tasa oficial de la DolarAPI. Se guardará el monto en VES nativo.
                </span>
              )}
            </div>
          )}

          <div>
            <label htmlFor="pay_method" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">Método de pago</label>
            <select id="pay_method" name="pay_method" className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30">
              {PAY_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="reference_note" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">
              Referencia / Últimos 4 dígitos <span className="text-[#64748B] text-xs font-normal">(opcional)</span>
            </label>
            <input id="reference_note" name="reference_note" type="text" placeholder="ej. 4521 o Ref. #001234" className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30" />
          </div>

          <div>
            <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">
              Comprobante de pago <span className="text-[#64748B] text-xs font-normal">(opcional)</span>
            </label>
            <input
              name="proof_image"
              type="file"
              accept="image/*"
              className="w-full text-sm font-sans file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-[#EEF4FF] file:text-[#003082] hover:file:bg-[#003082] hover:file:text-white file:transition-colors cursor-pointer"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 font-sans text-sm font-medium text-[#64748B] border border-[#64748B]/20 rounded-lg hover:bg-[#64748B]/5 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={isPending} className="flex items-center gap-2 px-5 py-2.5 font-sans text-sm font-medium bg-[#003082] text-white rounded-lg hover:bg-[#0042A6] transition-colors disabled:opacity-60">
            {isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Registrando...</> : "Registrar Donación"}
          </button>
        </div>
      </form>
    </div>
  );
}
