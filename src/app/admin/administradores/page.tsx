import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminsClient from "./AdminsClient";

export const metadata: Metadata = { title: "Administradores — SendHope Admin" };

export default async function AdministradoresPage() {
  const supabase = createAdminClient();
  const { data: admins } = await supabase
    .from("admin_users")
    .select("id, username, created_at")
    .order("created_at");

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-sans font-bold text-2xl text-[#0A1628]">Administradores</h1>
        <p className="font-sans text-sm text-[#64748B] mt-1">
          Cuentas con acceso al backoffice. Para crear una cuenta nueva, usa la página{" "}
          <a href="/admin/register" className="text-[#003082] underline underline-offset-2">de registro</a>{" "}
          con el código secreto.
        </p>
      </div>
      <AdminsClient admins={admins ?? []} />
    </div>
  );
}
