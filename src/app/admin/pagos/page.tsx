import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import PagosClient from "./PagosClient";

export const metadata: Metadata = {
  title: "Métodos de Pago — SendHope Admin",
};

export default async function PagosPage() {
  const supabase = createAdminClient();

  const { data: methods, error } = await supabase
    .from("payment_methods")
    .select("*")
    .order("order_index");

  const paymentMethods = (methods ?? []) as {
    id: string;
    type: "zelle" | "pago_movil" | "transfer";
    title: string;
    details: {
      contact?: string;
      name?: string;
      phone?: string;
      bank?: string;
      cedula?: string;
      account?: string;
    };
    is_active: boolean;
  }[];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-sans font-bold text-2xl text-[#0A1628]">Métodos de Pago</h1>
        <p className="font-sans text-sm text-[#64748B] mt-1">
          Administra las cuentas activas para recibir donaciones. Puedes registrar múltiples
          cuentas del mismo tipo y activarlas o desactivarlas según las necesidades de la operación.
        </p>
      </div>

      {error && (
        <div className="bg-[#FFF0F2] border border-[#CE1126]/20 text-[#CE1126] rounded-xl px-4 py-3 text-sm font-sans">
          Error al cargar métodos de pago: {error.message}
        </div>
      )}

      <PagosClient methods={paymentMethods} />
    </div>
  );
}
