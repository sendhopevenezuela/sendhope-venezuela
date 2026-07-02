"use client";

import { useState, useTransition } from "react";
import { setLinkedDonations } from "@/app/actions/purchases";

type Donation = {
  id: string;
  donor_name: string | null;
  amount: number;
  currency: string;
  reference_note: string | null;
  tracking_code: string | null;
  created_at: string;
};

type Props = {
  purchaseId: string;
  allDonations: Donation[];
  initialLinkedIds: string[];
};

export function DonationLinker({ purchaseId, allDonations, initialLinkedIds }: Props) {
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set(initialLinkedIds));
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const filtered = allDonations.filter((d) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (d.tracking_code ?? "").toLowerCase().includes(q) ||
      (d.donor_name ?? "").toLowerCase().includes(q) ||
      (d.reference_note ?? "").toLowerCase().includes(q)
    );
  });

  function toggleDonation(id: string) {
    setLinkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSavedMsg(null);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await setLinkedDonations(purchaseId, Array.from(linkedIds));
      if ("error" in result) {
        setSavedMsg(`⚠ ${result.error}`);
      } else {
        setSavedMsg(`✓ Vinculaciones guardadas (${linkedIds.size} donación${linkedIds.size !== 1 ? "es" : ""})`);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-sans text-xs text-[#64748B]">
          Selecciona las donaciones que financiaron esta compra. Solo se muestran donaciones <strong className="text-[#0A1628]">confirmadas</strong>.
        </p>
        <span className="font-mono text-xs bg-[#003082]/10 text-[#003082] px-2.5 py-1 rounded-full">
          {linkedIds.size} vinculadas
        </span>
      </div>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar por código SH-, donante o referencia..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 text-xs font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/20"
      />

      {/* Lista */}
      <div className="max-h-56 overflow-y-auto flex flex-col gap-1 border border-[#003082]/10 rounded-xl p-2 bg-[#F8FAFF]">
        {filtered.length === 0 ? (
          <p className="text-center text-xs text-[#64748B] py-4">
            {allDonations.length === 0
              ? "No hay donaciones confirmadas aún."
              : "No coincide ninguna donación con la búsqueda."}
          </p>
        ) : (
          filtered.map((d) => {
            const isLinked = linkedIds.has(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleDonation(d.id)}
                className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded-lg transition-all duration-150 ${
                  isLinked
                    ? "bg-[#003082] text-white"
                    : "bg-white hover:bg-[#EEF4FF] text-[#0A1628]"
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${isLinked ? "border-white bg-white" : "border-[#003082]/30"}`}>
                  {isLinked && <span className="text-[#003082] text-[10px] font-bold">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {d.tracking_code && (
                      <span className={`font-mono text-[10px] font-bold tracking-wider ${isLinked ? "text-[#F4C31D]" : "text-[#003082]"}`}>
                        {d.tracking_code}
                      </span>
                    )}
                    <span className={`font-sans text-xs font-semibold truncate ${isLinked ? "text-white" : "text-[#0A1628]"}`}>
                      {d.donor_name ?? "Anónimo"} — ${d.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {d.currency}
                    </span>
                  </div>
                  {d.reference_note && (
                    <p className={`font-mono text-[9px] truncate mt-0.5 ${isLinked ? "text-white/60" : "text-[#64748B]"}`}>
                      {d.reference_note}
                    </p>
                  )}
                </div>
                <span className={`font-mono text-[9px] flex-shrink-0 ${isLinked ? "text-white/50" : "text-[#64748B]"}`}>
                  {new Date(d.created_at).toLocaleDateString("es-VE")}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Guardar */}
      <div className="flex items-center justify-between gap-3">
        {savedMsg && (
          <p className={`font-sans text-xs font-semibold ${savedMsg.startsWith("✓") ? "text-green-700" : "text-red-600"}`}>
            {savedMsg}
          </p>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="ml-auto flex items-center gap-2 bg-[#003082] hover:bg-[#0042A6] text-white font-sans font-medium text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
        >
          {isPending ? (
            <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
          ) : (
            "Guardar vinculaciones"
          )}
        </button>
      </div>
    </div>
  );
}
