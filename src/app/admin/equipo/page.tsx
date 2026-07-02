import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import TeamAdminClient from "./TeamAdminClient";

export const metadata: Metadata = { title: "Equipo — SendHope Admin" };

export default async function EquipoPage() {
  const supabase = createAdminClient();
  const { data: members } = await supabase
    .from("team_members")
    .select("*")
    .order("order_index");

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-sans font-bold text-2xl text-[#0A1628]">Equipo</h1>
          <p className="font-sans text-sm text-[#64748B] mt-1">
            Gestiona los miembros del equipo que aparecen en el sitio público.
          </p>
        </div>
      </div>
      <TeamAdminClient members={members ?? []} />
    </div>
  );
}
