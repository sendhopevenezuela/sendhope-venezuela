import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { logoutAdmin } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Dashboard — SendHope Admin" };

function StatCard({
  label, value, sub, accent,
}: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border px-5 py-4 ${accent ? "bg-[#EEF4FF] border-[#003082]/20" : "bg-white border-[#003082]/10"}`}>
      <p className="font-mono text-[11px] text-[#64748B] uppercase tracking-wider">{label}</p>
      <p className={`font-sans font-bold text-2xl mt-1 ${accent ? "text-[#003082]" : "text-[#0A1628]"}`}>{value}</p>
      {sub && <p className="font-sans text-xs text-[#64748B] mt-1">{sub}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Fetch en paralelo
  const [
    { data: donStats },
    { data: purchStats },
    { data: recentActivity },
    { data: pendingDonations },
  ] = await Promise.all([
    supabase
      .from("donations")
      .select("amount, currency, status, confirmed_at"),
    supabase
      .from("purchases")
      .select("amount, currency, purchase_photos(photo_type)"),
    supabase
      .from("activity_log")
      .select("admin_name, action, description, entity_type, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("donations")
      .select("id, donor_name, amount, currency, method, reference_note, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const confirmed = (donStats ?? []).filter((d) => d.status === "confirmed");
  const totalRaisedUSD = confirmed
    .filter((d) => d.currency === "USD")
    .reduce((s, d) => s + Number(d.amount), 0);
  const donorCount = confirmed.length;
  const pendingCount = (donStats ?? []).filter((d) => d.status === "pending").length;

  const totalSpentUSD = (purchStats ?? [])
    .filter((p) => (p as { currency: string }).currency === "USD")
    .reduce((s, p) => s + Number((p as { amount: number }).amount), 0);

  const purchasesTotal = (purchStats ?? []).length;
  const deliveredCount = (purchStats ?? []).filter((p) =>
    (p as { purchase_photos: { photo_type: string }[] }).purchase_photos.some((ph) => ph.photo_type === "delivery"),
  ).length;

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
  }

  const ACTION_ICONS: Record<string, string> = {
    created_purchase: "🛒",
    updated_purchase: "✏️",
    deleted_purchase: "🗑",
    confirmed_donation: "✅",
    rejected_donation: "❌",
    created_manual_donation: "💸",
    updated_payment_config: "💳",
    created_team_member: "👤",
    updated_team_member: "✏️",
    deleted_team_member: "🗑",
    deleted_admin_user: "🔒",
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Page title */}
      <div>
        <h1 className="font-sans font-bold text-2xl text-[#0A1628]">Dashboard</h1>
        <p className="font-sans text-sm text-[#64748B] mt-1">
          Resumen general de la operación de SendHope Venezuela.
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Recaudado (USD)" value={`$${totalRaisedUSD.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`} sub={`${donorCount} donaciones confirmadas`} accent />
        <StatCard label="Pendientes de confirmar" value={pendingCount} sub={pendingCount > 0 ? "Revisa la bandeja" : "Todo al día ✓"} />
        <StatCard label="Total compras" value={purchasesTotal} sub={`${deliveredCount} entregadas`} />
        <StatCard label="Gasto total (USD)" value={`$${totalSpentUSD.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donaciones pendientes */}
        <div className="bg-white rounded-2xl border border-[#003082]/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#003082]/8 flex items-center justify-between">
            <h2 className="font-sans font-semibold text-sm text-[#0A1628]">
              Donaciones pendientes
              {pendingCount > 0 && (
                <span className="ml-2 bg-[#CE1126] text-white rounded-full text-[10px] px-1.5 py-0.5 font-mono">
                  {pendingCount}
                </span>
              )}
            </h2>
            <a href="/admin/donaciones" className="font-mono text-xs text-[#003082] hover:underline">Ver todas →</a>
          </div>
          <div className="divide-y divide-[#003082]/5">
            {(pendingDonations ?? []).length === 0 ? (
              <div className="py-8 text-center text-sm text-[#64748B]">No hay donaciones pendientes 🎉</div>
            ) : (
              (pendingDonations ?? []).map((d) => (
                <div key={d.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-medium text-[#0A1628] truncate">{d.donor_name ?? "Anónimo"}</p>
                    <p className="font-mono text-[11px] text-[#64748B]">{timeAgo(d.created_at)}</p>
                  </div>
                  <span className="font-mono font-bold text-[#003082] whitespace-nowrap text-sm">
                    {d.currency} {Number(d.amount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity log */}
        <div className="bg-white rounded-2xl border border-[#003082]/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#003082]/8">
            <h2 className="font-sans font-semibold text-sm text-[#0A1628]">Actividad reciente</h2>
          </div>
          <div className="divide-y divide-[#003082]/5">
            {(recentActivity ?? []).length === 0 ? (
              <div className="py-8 text-center text-sm text-[#64748B]">Sin actividad registrada aún.</div>
            ) : (
              (recentActivity ?? []).map((log, i) => (
                <div key={i} className="px-5 py-3 flex items-start gap-3">
                  <span className="text-base flex-shrink-0 mt-0.5">
                    {ACTION_ICONS[log.action] ?? "•"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-xs text-[#0A1628] leading-snug line-clamp-2">{log.description}</p>
                    <p className="font-mono text-[10px] text-[#64748B] mt-0.5">
                      {log.admin_name} · {timeAgo(log.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/compras/nueva", label: "Nueva Compra", icon: "🛒" },
          { href: "/admin/donaciones/nueva", label: "Registrar Donación", icon: "💸" },
          { href: "/admin/pagos", label: "Editar Datos de Pago", icon: "💳" },
          { href: "/admin/muro-preview", label: "Ver Muro Público", icon: "👁" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="bg-white border border-[#003082]/10 rounded-xl px-4 py-4 flex flex-col gap-2 hover:border-[#003082]/30 hover:shadow-sm transition-all"
          >
            <span className="text-xl">{link.icon}</span>
            <span className="font-sans text-xs font-medium text-[#0A1628]">{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
