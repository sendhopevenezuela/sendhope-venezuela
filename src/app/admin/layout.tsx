import type { Metadata } from "next";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
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
    <AdminNavigation adminName={adminName}>
      {children}
    </AdminNavigation>
  );
}
