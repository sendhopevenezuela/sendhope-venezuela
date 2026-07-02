import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { DonationTable } from "@/components/admin/DonationTable";
import Link from "next/link";

export const metadata: Metadata = { title: "Donaciones — SendHope Admin" };

export default async function DonacionesPage() {
  const supabase = createAdminClient();

  const { data: donations, error } = await supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false });

  const items = (donations ?? []) as {
    id: string; donor_name: string | null; donor_email: string | null;
    amount: number; currency: string; method: string; reference_note: string | null;
    proof_image_url: string | null; status: "pending" | "confirmed" | "rejected";
    confirmed_by: string | null; confirmed_at: string | null; created_at: string;
  }[];

  const pending   = items.filter((d) => d.status === "pending").length;
  const confirmed = items.filter((d) => d.status === "confirmed").length;
  const totalUSD  = items.filter((d) => d.status === "confirmed" && d.currency === "USD")
                         .reduce((s, d) => s + Number(d.amount), 0);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-bold text-2xl text-[#0A1628]">Donaciones</h1>
          <p className="font-sans text-sm text-[#64748B] mt-1">
            Gestiona y confirma las donaciones recibidas.
          </p>
        </div>
        <Link
          href="/admin/donaciones/nueva"
          className="flex items-center gap-2 bg-[#003082] text-white font-sans font-medium text-sm px-4 py-2 rounded-lg hover:bg-[#0042A6] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nueva Donación
        </Link>
      </div>

      {error && (
        <div className="bg-[#FFF0F2] border border-[#CE1126]/20 text-[#CE1126] rounded-xl px-4 py-3 text-sm font-sans">
          Error: {error.message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total recibidas", value: items.length },
          { label: "Pendientes", value: pending, highlight: pending > 0 },
          { label: "Confirmadas", value: confirmed },
          { label: "Recaudado (USD)", value: `$${totalUSD.toLocaleString("es-VE", { minimumFractionDigits: 2 })}` },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border px-4 py-3 ${stat.highlight ? "bg-[#FFF3CD] border-[#F4C31D]/40" : "bg-white border-[#003082]/10"}`}
          >
            <p className="font-mono text-xs text-[#64748B] uppercase tracking-wide">{stat.label}</p>
            <p className={`font-sans font-bold text-xl mt-1 ${stat.highlight ? "text-[#92400E]" : "text-[#003082]"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <DonationTable donations={items} defaultTab={pending > 0 ? "pending" : "all"} />
    </div>
  );
}
