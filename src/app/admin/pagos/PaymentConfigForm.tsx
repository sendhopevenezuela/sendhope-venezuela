"use client";

import { useTransition, useState } from "react";
import { updatePaymentConfig } from "@/app/actions/payment-config";

type Config = {
  zelle_contact: string | null;
  zelle_name: string | null;
  pago_movil_phone: string | null;
  pago_movil_bank: string | null;
  pago_movil_cedula: string | null;
  transfer_bank: string | null;
  transfer_account: string | null;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="font-sans font-semibold text-base text-[#0A1628]">{children}</h2>
      <div className="flex-1 h-px bg-[#003082]/10" />
    </div>
  );
}

function Field({
  id, name, label, placeholder, defaultValue,
}: { id: string; name: string; label: string; placeholder?: string; defaultValue?: string | null }) {
  return (
    <div>
      <label htmlFor={id} className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">{label}</label>
      <input
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
      />
    </div>
  );
}

export default function PaymentConfigForm({ config }: { config: Config | null }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updatePaymentConfig(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="bg-[#FFF0F2] border border-[#CE1126]/20 text-[#CE1126] rounded-xl px-4 py-3 text-sm font-sans">⚠ {error}</div>
      )}
      {success && (
        <div className="bg-[#D1FAE5] border border-[#059669]/20 text-[#047857] rounded-xl px-4 py-3 text-sm font-sans">✓ Datos de pago actualizados correctamente.</div>
      )}

      {/* Zelle */}
      <div className="bg-white rounded-2xl border border-[#003082]/10 p-6">
        <SectionTitle>Zelle</SectionTitle>
        <div className="flex flex-col gap-4">
          <Field id="zelle_contact" name="zelle_contact" label="Email o teléfono Zelle" placeholder="correo@ejemplo.com" defaultValue={config?.zelle_contact} />
          <Field id="zelle_name" name="zelle_name" label="Nombre del titular" placeholder="SendHope Venezuela" defaultValue={config?.zelle_name} />
        </div>
      </div>

      {/* Pago Móvil */}
      <div className="bg-white rounded-2xl border border-[#003082]/10 p-6">
        <SectionTitle>Pago Móvil</SectionTitle>
        <div className="flex flex-col gap-4">
          <Field id="pago_movil_phone" name="pago_movil_phone" label="Teléfono" placeholder="0412-555-5555" defaultValue={config?.pago_movil_phone} />
          <Field id="pago_movil_bank" name="pago_movil_bank" label="Banco" placeholder="Banco de Venezuela" defaultValue={config?.pago_movil_bank} />
          <Field id="pago_movil_cedula" name="pago_movil_cedula" label="Cédula / RIF" placeholder="V-12345678" defaultValue={config?.pago_movil_cedula} />
        </div>
      </div>

      {/* Transferencia */}
      <div className="bg-white rounded-2xl border border-[#003082]/10 p-6">
        <SectionTitle>Transferencia bancaria</SectionTitle>
        <div className="flex flex-col gap-4">
          <Field id="transfer_bank" name="transfer_bank" label="Banco" placeholder="BBVA Provincial" defaultValue={config?.transfer_bank} />
          <Field id="transfer_account" name="transfer_account" label="Número de cuenta" placeholder="0108-0000-00-0000000000" defaultValue={config?.transfer_account} />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 font-sans text-sm font-medium bg-[#003082] text-white rounded-lg hover:bg-[#0042A6] transition-colors disabled:opacity-60"
        >
          {isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</> : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
