"use client";

import { useState, useTransition } from "react";
import { deleteAdminUser } from "@/app/actions/admins";

type Admin = { id: string; username: string; created_at: string };

export default function AdminsClient({ admins }: { admins: Admin[] }) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteAdminUser(id);
      if ("error" in result) {
        setError(result.error);
      }
      setConfirmId(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="bg-[#FFF0F2] border border-[#CE1126]/20 text-[#CE1126] rounded-xl px-4 py-3 text-sm font-sans">
          ⚠ {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#003082]/10 overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b border-[#003082]/8 bg-[#EEF4FF]">
              <th className="text-left px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">Usuario</th>
              <th className="text-left px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide hidden sm:table-cell">Creado</th>
              <th className="text-center px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">Acción</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-[#64748B] text-sm">
                  No hay administradores registrados.
                </td>
              </tr>
            ) : (
              admins.map((admin, i) => (
                <tr key={admin.id} className={`border-b border-[#003082]/5 ${i % 2 === 0 ? "" : "bg-[#FEFBF6]"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#003082] text-white flex items-center justify-center font-mono text-[11px] font-bold flex-shrink-0">
                        {admin.username[0].toUpperCase()}
                      </div>
                      <span className="font-mono text-sm text-[#0A1628]">{admin.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#64748B] hidden sm:table-cell">
                    {new Date(admin.created_at).toLocaleDateString("es-VE", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {confirmId === admin.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleDelete(admin.id)}
                          disabled={isPending}
                          className="text-[10px] font-mono bg-[#CE1126] text-white px-2 py-1 rounded hover:bg-[#a80d1f] disabled:opacity-50"
                        >
                          {isPending ? "..." : "Sí, eliminar"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(admin.id)}
                        className="text-[10px] font-mono bg-[#FFF0F2] text-[#CE1126] px-3 py-1 rounded hover:bg-[#CE1126] hover:text-white transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="font-sans text-xs text-[#64748B]">
        ⚠ Eliminar una cuenta es permanente. El administrador eliminado perderá acceso inmediatamente.
      </p>
    </div>
  );
}
