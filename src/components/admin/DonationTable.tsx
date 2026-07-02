"use client";

import { useState, useTransition } from "react";
import { confirmDonation, rejectDonation, deleteDonation } from "@/app/actions/donations";

type Donation = {
  id: string;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  currency: string;
  method: string;
  reference_note: string | null;
  proof_image_url: string | null;
  status: "pending" | "confirmed" | "rejected";
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
};

type Props = {
  donations: Donation[];
  defaultTab?: "pending" | "confirmed" | "rejected" | "all";
};

const TAB_LABELS = {
  pending:   "Pendientes",
  confirmed: "Confirmadas",
  rejected:  "Rechazadas",
  all:       "Todas",
};

const STATUS_BADGES: Record<string, string> = {
  pending:   "bg-[#FEF3C7] text-[#92400E]",
  confirmed: "bg-[#D1FAE5] text-[#047857]",
  rejected:  "bg-[#FFF0F2] text-[#CE1126]",
};

const STATUS_LABELS: Record<string, string> = {
  pending:   "Pendiente",
  confirmed: "Confirmada",
  rejected:  "Rechazada",
};

export function DonationTable({ donations, defaultTab = "pending" }: Props) {
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "rejected" | "all">(defaultTab);
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = donations.filter((d) => {
    const matchTab = activeTab === "all" || d.status === activeTab;
    const matchSearch =
      !search ||
      (d.donor_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (d.reference_note ?? "").toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const pendingCount = donations.filter((d) => d.status === "pending").length;

  function act(fn: () => Promise<unknown>) {
    startTransition(async () => { await fn(); });
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#EEF4FF] rounded-xl w-fit mb-4">
        {(["pending", "confirmed", "rejected", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all
              ${activeTab === tab
                ? "bg-white text-[#003082] shadow-sm"
                : "text-[#64748B] hover:text-[#003082]"
              }
            `}
          >
            {TAB_LABELS[tab]}
            {tab === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 bg-[#CE1126] text-white rounded-full text-[10px] px-1.5 py-0.5 font-mono">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]/60">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por nombre o referencia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm pl-9 pr-4 py-2 text-sm font-sans border border-[#003082]/15 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#003082]/10 bg-white">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b border-[#003082]/8 bg-[#EEF4FF]">
              <th className="text-left px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">Fecha</th>
              <th className="text-left px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">Donante</th>
              <th className="text-right px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">Monto</th>
              <th className="text-left px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide hidden md:table-cell">Referencia</th>
              <th className="text-center px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">Estado</th>
              <th className="text-center px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[#64748B] text-sm">
                  No hay donaciones en esta vista.
                </td>
              </tr>
            ) : (
              filtered.map((d, i) => (
                <tr key={d.id} className={`border-b border-[#003082]/5 hover:bg-[#EEF4FF]/50 transition-colors ${i % 2 === 0 ? "" : "bg-[#FEFBF6]"}`}>
                  <td className="px-4 py-3 font-mono text-xs text-[#64748B] whitespace-nowrap">
                    {new Date(d.created_at).toLocaleDateString("es-VE")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0A1628]">{d.donor_name ?? "Anónimo"}</p>
                    {d.donor_email && <p className="text-xs text-[#64748B]">{d.donor_email}</p>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-[#003082] whitespace-nowrap">
                    {d.currency} {Number(d.amount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B] hidden md:table-cell max-w-[160px] truncate">
                    {d.reference_note ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${STATUS_BADGES[d.status]}`}>
                      {STATUS_LABELS[d.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      {d.proof_image_url && (
                        <button
                          onClick={() => setLightbox(d.proof_image_url)}
                          className="text-[10px] font-mono bg-[#EEF4FF] text-[#003082] px-2 py-1 rounded hover:bg-[#003082] hover:text-white transition-colors"
                        >
                          Comprobante
                        </button>
                      )}
                      {d.status === "pending" && (
                        <>
                          <button
                            onClick={() => act(() => confirmDonation(d.id))}
                            disabled={isPending}
                            className="text-[10px] font-mono bg-[#D1FAE5] text-[#047857] px-2 py-1 rounded hover:bg-[#059669] hover:text-white transition-colors disabled:opacity-50"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => act(() => rejectDonation(d.id))}
                            disabled={isPending}
                            className="text-[10px] font-mono bg-[#FFF0F2] text-[#CE1126] px-2 py-1 rounded hover:bg-[#CE1126] hover:text-white transition-colors disabled:opacity-50"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {confirmDelete === d.id ? (
                        <>
                          <button
                            onClick={() => act(async () => { await deleteDonation(d.id); setConfirmDelete(null); })}
                            disabled={isPending}
                            className="text-[10px] font-mono bg-[#CE1126] text-white px-2 py-1 rounded disabled:opacity-50"
                          >
                            {isPending ? "..." : "Sí, eliminar"}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(d.id)}
                          className="text-[10px] font-mono text-[#64748B]/60 px-1 py-1 hover:text-[#CE1126] transition-colors"
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox} alt="Comprobante" className="w-full rounded-xl" />
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
