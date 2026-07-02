"use client";

import { useState, useTransition } from "react";
import { deletePaymentMethod, togglePaymentMethodStatus } from "@/app/actions/payment-methods";
import PaymentMethodForm from "@/components/admin/PaymentMethodForm";

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

export default function PagosClient({ methods }: { methods: PaymentMethod[] }) {
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null | "new">(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePaymentMethod(id);
      setConfirmDeleteId(null);
    });
  }

  function handleToggleStatus(id: string, currentStatus: boolean) {
    startTransition(async () => {
      await togglePaymentMethodStatus(id, !currentStatus);
    });
  }

  const zelles = methods.filter((m) => m.type === "zelle");
  const pagoMovils = methods.filter((m) => m.type === "pago_movil");
  const transfers = methods.filter((m) => m.type === "transfer");
  const paypals = methods.filter((m) => m.type === "paypal");
  const otros = methods.filter((m) => m.type === "otros");

  function MethodCard({ m }: { m: PaymentMethod }) {
    const isZelle = m.type === "zelle";
    const isPagoMovil = m.type === "pago_movil";
    const isTransfer = m.type === "transfer";
    const isPaypal = m.type === "paypal";
    const isOtros = m.type === "otros";

    return (
      <div
        className={`bg-white rounded-2xl border ${
          m.is_active ? "border-[#003082]/10" : "border-gray-200 opacity-60"
        } p-5 flex flex-col justify-between gap-4`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="flex flex-col gap-[2px]">
                <span className="block w-2.5 h-[1.5px] rounded-full bg-[#F4C31D]" />
                <span className="block w-2.5 h-[1.5px] rounded-full bg-[#003082]" />
                <span className="block w-2.5 h-[1.5px] rounded-full bg-[#CE1126]" />
              </span>
              <h3 className="font-sans font-bold text-sm text-[#0A1628] leading-tight">
                {m.title}
              </h3>
            </div>
            {/* Status Switch */}
            <button
              onClick={() => handleToggleStatus(m.id, m.is_active)}
              disabled={isPending}
              className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                m.is_active ? "bg-[#059669]" : "bg-gray-300"
              }`}
              aria-label="Toggle active status"
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 ${
                  m.is_active ? "translate-x-3.5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <dl className="flex flex-col gap-2 text-xs font-sans">
            {isZelle && (
              <>
                <div>
                  <dt className="text-[#64748B] font-mono text-[9px] uppercase tracking-wide">
                    Email / Teléfono
                  </dt>
                  <dd className="font-mono font-semibold text-[#003082] mt-0.5">{m.details.contact}</dd>
                </div>
                <div>
                  <dt className="text-[#64748B] font-mono text-[9px] uppercase tracking-wide">
                    A nombre de
                  </dt>
                  <dd className="font-semibold text-[#0A1628] mt-0.5">{m.details.name}</dd>
                </div>
              </>
            )}

            {isPagoMovil && (
              <>
                <div>
                  <dt className="text-[#64748B] font-mono text-[9px] uppercase tracking-wide">
                    Teléfono
                  </dt>
                  <dd className="font-mono font-semibold text-[#003082] mt-0.5">{m.details.phone}</dd>
                </div>
                <div>
                  <dt className="text-[#64748B] font-mono text-[9px] uppercase tracking-wide">
                    Banco
                  </dt>
                  <dd className="font-semibold text-[#0A1628] mt-0.5">{m.details.bank}</dd>
                </div>
                <div>
                  <dt className="text-[#64748B] font-mono text-[9px] uppercase tracking-wide">
                    Cédula / RIF
                  </dt>
                  <dd className="font-mono font-semibold text-[#0A1628] mt-0.5">{m.details.cedula}</dd>
                </div>
              </>
            )}

            {isTransfer && (
              <>
                <div>
                  <dt className="text-[#64748B] font-mono text-[9px] uppercase tracking-wide">
                    Banco
                  </dt>
                  <dd className="font-semibold text-[#003082] mt-0.5">{m.details.bank}</dd>
                </div>
                <div>
                  <dt className="text-[#64748B] font-mono text-[9px] uppercase tracking-wide">
                    Cuenta
                  </dt>
                  <dd className="font-mono font-semibold text-[#0A1628] mt-0.5 break-all">{m.details.account}</dd>
                </div>
                {m.details.name && (
                  <div>
                    <dt className="text-[#64748B] font-mono text-[9px] uppercase tracking-wide">
                      A nombre de
                    </dt>
                    <dd className="font-semibold text-[#0A1628] mt-0.5">{m.details.name}</dd>
                  </div>
                )}
                {m.details.cedula && (
                  <div>
                    <dt className="text-[#64748B] font-mono text-[9px] uppercase tracking-wide">
                      Cédula / RIF
                    </dt>
                    <dd className="font-mono font-semibold text-[#0a1628] mt-0.5">{m.details.cedula}</dd>
                  </div>
                )}
              </>
            )}

            {isPaypal && (
              <>
                <div>
                  <dt className="text-[#64748B] font-mono text-[9px] uppercase tracking-wide">
                    Email de PayPal
                  </dt>
                  <dd className="font-mono font-semibold text-[#003082] mt-0.5">{m.details.contact}</dd>
                </div>
                <div>
                  <dt className="text-[#64748B] font-mono text-[9px] uppercase tracking-wide">
                    A nombre de
                  </dt>
                  <dd className="font-semibold text-[#0A1628] mt-0.5">{m.details.name}</dd>
                </div>
              </>
            )}

            {isOtros && (
              <div>
                <dt className="text-[#64748B] font-mono text-[9px] uppercase tracking-wide">
                  Instrucciones
                </dt>
                <dd className="font-sans font-semibold text-xs text-[#0A1628] mt-1 whitespace-pre-line leading-relaxed">
                  {m.details.instructions}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="flex gap-1.5 pt-2.5 border-t border-gray-100 mt-auto">
          {confirmDeleteId === m.id ? (
            <>
              <button
                onClick={() => handleDelete(m.id)}
                disabled={isPending}
                className="flex-1 text-[10px] font-mono bg-[#CE1126] text-white py-1.5 rounded hover:bg-[#a80d1f] disabled:opacity-50"
              >
                {isPending ? "..." : "Confirmar"}
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 text-[10px] font-mono bg-gray-100 text-gray-600 py-1.5 rounded"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditingMethod(m)}
                className="flex-1 text-[10px] font-mono bg-[#EEF4FF] text-[#003082] py-1.5 rounded hover:bg-[#003082] hover:text-white transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => setConfirmDeleteId(m.id)}
                className="flex-1 text-[10px] font-mono bg-[#FFF0F2] text-[#CE1126] py-1.5 rounded hover:bg-[#CE1126] hover:text-white transition-colors"
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner / Add Action */}
      <div className="flex justify-end">
        <button
          onClick={() => setEditingMethod("new")}
          className="flex items-center gap-2 bg-[#003082] text-white font-sans font-medium text-sm px-4 py-2 rounded-lg hover:bg-[#0042A6] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Agregar Método de Pago
        </button>
      </div>

      {methods.length === 0 ? (
        <div className="text-center py-16 text-[#64748B] text-sm font-sans border-2 border-dashed border-[#003082]/10 rounded-2xl">
          No hay métodos de pago registrados.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Zelle */}
          {zelles.length > 0 && (
            <div>
              <h2 className="font-sans font-bold text-sm text-[#0A1628] mb-3 uppercase tracking-wider text-[#003082]">
                Zelle
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {zelles.map((m) => (
                  <MethodCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          )}

          {/* Pago Móvil */}
          {pagoMovils.length > 0 && (
            <div>
              <h2 className="font-sans font-bold text-sm text-[#0A1628] mb-3 uppercase tracking-wider text-[#003082]">
                Pago Móvil
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pagoMovils.map((m) => (
                  <MethodCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          )}

          {/* Transferencias */}
          {transfers.length > 0 && (
            <div>
              <h2 className="font-sans font-bold text-sm text-[#0A1628] mb-3 uppercase tracking-wider text-[#003082]">
                Transferencias Bancarias
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {transfers.map((m) => (
                  <MethodCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          )}

          {/* PayPal */}
          {paypals.length > 0 && (
            <div>
              <h2 className="font-sans font-bold text-sm text-[#0A1628] mb-3 uppercase tracking-wider text-[#003082]">
                PayPal
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paypals.map((m) => (
                  <MethodCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          )}

          {/* Otros */}
          {otros.length > 0 && (
            <div>
              <h2 className="font-sans font-bold text-sm text-[#0A1628] mb-3 uppercase tracking-wider text-[#003082]">
                Otros Métodos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otros.map((m) => (
                  <MethodCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {editingMethod !== null && (
        <PaymentMethodForm
          method={editingMethod === "new" ? null : editingMethod}
          onClose={() => setEditingMethod(null)}
        />
      )}
    </div>
  );
}
