import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { logoutAdmin } from "@/app/actions/auth";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Backoffice — SendHope Venezuela",
};

async function getAdminName(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sendhope_admin_session")?.value;
    if (!token) return "Administrador";

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("admin_sessions")
      .select("admin_users(username)")
      .eq("token", token)
      .single();

    // @ts-expect-error – join type inference
    return data?.admin_users?.username ?? "Administrador";
  } catch {
    return "Administrador";
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminName = await getAdminName();

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      {/* Sidebar (Server renders shell, Client handles collapse) */}
      <AdminSidebar />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header bar */}
        <header className="flex-shrink-0 flex items-center justify-between bg-[#001D4E] text-white px-5 py-3 border-b border-white/10 h-[65px]">
          {/* Mobile: logo (sidebar is hidden on mobile) */}
          <div className="flex items-center gap-2.5 md:hidden">
            <span className="flex flex-col gap-[3px]">
              <span className="block w-3.5 h-[2.5px] rounded-full bg-[#F4C31D]" />
              <span className="block w-3.5 h-[2.5px] rounded-full bg-white" />
              <span className="block w-3.5 h-[2.5px] rounded-full bg-[#CE1126]" />
            </span>
            <span className="font-sans font-bold text-sm">SendHope Admin</span>
          </div>

          {/* Desktop: breadcrumb placeholder */}
          <div className="hidden md:block" />

          {/* Right: admin name + logout */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-white/50 hidden sm:block">
              {adminName}
            </span>
            <form action={async () => {
              "use server";
              await logoutAdmin();
            }}>
              <button
                type="submit"
                className="font-mono text-xs text-white/60 hover:text-[#F4C31D] border border-white/20 hover:border-[#F4C31D]/50 px-3 py-1.5 rounded transition-all duration-200"
              >
                Salir
              </button>
            </form>
          </div>
        </header>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
