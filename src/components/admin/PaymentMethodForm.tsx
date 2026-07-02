"use client";

import { useState, useTransition } from "react";
import { createPaymentMethod, updatePaymentMethod } from "@/app/actions/payment-methods";

type PaymentMethod = {
  id: string;
  type: "zelle" | "pago_movil" | "transfer" | "paypal" | "otros";
  title: string;
  details: {
    contact?: string;
    name?: string;
    phone?: string;
    bank?: string;
    cedula?: string;
    account?: string;
    instructions?: string;
  };
  is_active: boolean;
};

export default function PaymentMethodForm({
  method,
  onClose,
}: {
  method: PaymentMethod | null;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"zelle" | "pago_movil" | "transfer" | "paypal" | "otros">(() => {
    return method?.type ?? "zelle";
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = method
        ? await updatePaymentMethod(method.id, formData)
        : await createPaymentMethod(formData);

      if ("error" in result) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#003082]/10 p-6 w-full max-w-md flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-sans font-bold text-lg text-[#0A1628]">
            {method ? "Editar Método de Pago" : "Agregar Método de Pago"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0A1628] transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-[#FFF0F2] border border-[#CE1126]/20 text-[#CE1126] rounded-xl px-3 py-2 text-xs">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tipo de método */}
          <div>
            <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
              Tipo de método *
            </label>
            <select
              name="type"
              value={type}
              disabled={!!method} // Bloqueado al editar
              onChange={(e) => setType(e.target.value as "zelle" | "pago_movil" | "transfer" | "paypal" | "otros")}
              className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
            >
              <option value="zelle">Zelle</option>
              <option value="pago_movil">Pago Móvil</option>
              <option value="transfer">Transferencia Bancaria</option>
              <option value="paypal">PayPal</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          {/* Título identificador */}
          <div>
            <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
              Nombre identificador *
            </label>
            <input
              name="title"
              type="text"
              required
              defaultValue={method?.title}
              placeholder="ej. Zelle Principal, Pago Móvil Banesco..."
              className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
            />
          </div>

          {/* Campos condicionales Zelle */}
          {type === "zelle" && (
            <>
              <div>
                <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
                  Email o teléfono Zelle *
                </label>
                <input
                  name="zelle_contact"
                  type="text"
                  required={type === "zelle"}
                  defaultValue={method?.details.contact}
                  placeholder="donar@ejemplo.com"
                  className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
                  A nombre de (Titular) *
                </label>
                <input
                  name="zelle_name"
                  type="text"
                  required={type === "zelle"}
                  defaultValue={method?.details.name}
                  placeholder="Titular de la cuenta"
                  className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
                />
              </div>
            </>
          )}

          {/* Campos condicionales Pago Móvil */}
          {type === "pago_movil" && (
            <>
              <div>
                <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
                  Teléfono *
                </label>
                <input
                  name="pago_movil_phone"
                  type="text"
                  required={type === "pago_movil"}
                  defaultValue={method?.details.phone}
                  placeholder="ej. 0412-555-5555"
                  className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
                  Banco *
                </label>
                <input
                  name="pago_movil_bank"
                  type="text"
                  required={type === "pago_movil"}
                  defaultValue={method?.details.bank}
                  placeholder="ej. Banesco, Banco de Venezuela..."
                  className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
                  Cédula / RIF *
                </label>
                <input
                  name="pago_movil_cedula"
                  type="text"
                  required={type === "pago_movil"}
                  defaultValue={method?.details.cedula}
                  placeholder="ej. V-12345678 o J-123456789"
                  className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
                />
              </div>
            </>
          )}

          {/* Campos condicionales Transferencia */}
          {type === "transfer" && (
            <>
              <div>
                <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
                  Banco *
                </label>
                <input
                  name="transfer_bank"
                  type="text"
                  required={type === "transfer"}
                  defaultValue={method?.details.bank}
                  placeholder="ej. BBVA Provincial, Banco Mercantil..."
                  className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
                  Número de cuenta *
                </label>
                <input
                  name="transfer_account"
                  type="text"
                  required={type === "transfer"}
                  defaultValue={method?.details.account}
                  placeholder="20 dígitos sin espacios"
                  className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30 font-mono"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
                  Titular de cuenta <span className="text-[#64748B] text-xs">(opcional)</span>
                </label>
                <input
                  name="transfer_name"
                  type="text"
                  defaultValue={method?.details.name}
                  placeholder="Nombre de la asociación u organización"
                  className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
                  Cédula / RIF <span className="text-[#64748B] text-xs">(opcional)</span>
                </label>
                <input
                  name="transfer_cedula"
                  type="text"
                  defaultValue={method?.details.cedula}
                  placeholder="ej. J-12345678-9"
                  className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
                />
              </div>
            </>
          )}

          {/* Campos condicionales PayPal */}
          {type === "paypal" && (
            <>
              <div>
                <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
                  Email de PayPal *
                </label>
                <input
                  name="paypal_email"
                  type="email"
                  required={type === "paypal"}
                  defaultValue={method?.details.contact}
                  placeholder="donaciones-paypal@ejemplo.com"
                  className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
                  A nombre de (Titular) *
                </label>
                <input
                  name="paypal_name"
                  type="text"
                  required={type === "paypal"}
                  defaultValue={method?.details.name}
                  placeholder="Nombre o razón social"
                  className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
                />
              </div>
            </>
          )}

          {/* Campos condicionales Otros */}
          {type === "otros" && (
            <div>
              <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
                Instrucciones del método de pago *
              </label>
              <textarea
                name="otros_instructions"
                rows={3}
                required={type === "otros"}
                defaultValue={method?.details.instructions}
                placeholder="ej. Transferir en USDT a la red Tron (TRC20): TXxxxxxxxxxx o contactar por WhatsApp al +58..."
                className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
              />
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="is_active_check"
              name="is_active"
              value="true"
              defaultChecked={method?.is_active ?? true}
              onChange={(e) => {
                const hiddenInput = e.currentTarget.form?.elements.namedItem("is_active_hidden") as HTMLInputElement | null;
                if (hiddenInput) hiddenInput.value = e.currentTarget.checked ? "true" : "false";
              }}
              className="w-4 h-4 accent-[#003082]"
            />
            <input type="hidden" name="is_active" defaultValue={method?.is_active ? "true" : "false"} />
            <label htmlFor="is_active_check" className="font-sans text-sm text-[#0A1628]">
              Método activo (se muestra al público)
            </label>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 font-sans text-sm text-[#64748B] border border-[#64748B]/20 rounded-lg hover:bg-[#64748B]/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 font-sans text-sm font-medium bg-[#003082] text-white rounded-lg hover:bg-[#0042A6] transition-colors disabled:opacity-60"
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : method ? (
                "Guardar"
              ) : (
                "Agregar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
