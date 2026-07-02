"use client";

import { useState, useTransition } from "react";
import { createTeamMember, updateTeamMember, deleteTeamMember } from "@/app/actions/team";

type Member = {
  id: string;
  name: string;
  role: string;
  initials: string;
  bio: string | null;
  order_index: number;
  is_active: boolean;
};

function computeInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["bg-[#003082] text-white", "bg-[#F4C31D] text-[#001D4E]", "bg-[#059669] text-white"];

function MemberCard({
  member,
  colorClass,
  onEdit,
  onDelete,
}: {
  member: Member;
  colorClass: string;
  onEdit: (m: Member) => void;
  onDelete: (id: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`bg-white rounded-2xl border ${member.is_active ? "border-[#003082]/10" : "border-[#64748B]/20 opacity-60"} p-5 flex flex-col gap-3`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-sans font-bold text-sm flex-shrink-0 ${colorClass}`}>
          {member.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans font-bold text-sm text-[#0A1628] leading-tight">{member.name}</p>
          <p className="font-mono text-[11px] text-[#F4C31D] mt-0.5 truncate">{member.role}</p>
        </div>
        {!member.is_active && (
          <span className="flex-shrink-0 text-[10px] font-mono bg-[#64748B]/10 text-[#64748B] px-2 py-0.5 rounded-full">
            inactivo
          </span>
        )}
      </div>
      {member.bio && (
        <p className="font-sans text-xs text-[#64748B] leading-relaxed line-clamp-2">{member.bio}</p>
      )}
      <div className="flex gap-1.5 pt-1 border-t border-[#003082]/5">
        {confirm ? (
          <>
            <button
              onClick={() => startTransition(async () => { await onDelete(member.id); setConfirm(false); })}
              disabled={isPending}
              className="flex-1 text-[10px] font-mono bg-[#CE1126] text-white py-1 rounded hover:bg-[#a80d1f] disabled:opacity-50"
            >
              {isPending ? "..." : "Confirmar"}
            </button>
            <button onClick={() => setConfirm(false)} className="flex-1 text-[10px] font-mono bg-gray-100 text-gray-600 py-1 rounded">
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEdit(member)}
              className="flex-1 text-[10px] font-mono bg-[#EEF4FF] text-[#003082] py-1 rounded hover:bg-[#003082] hover:text-white transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => setConfirm(true)}
              className="flex-1 text-[10px] font-mono bg-[#FFF0F2] text-[#CE1126] py-1 rounded hover:bg-[#CE1126] hover:text-white transition-colors"
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function MemberForm({
  member,
  onClose,
}: {
  member: Member | null;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(member?.name ?? "");
  const [initials, setInitials] = useState(member?.initials ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = member
        ? await updateTeamMember(member.id, formData)
        : await createTeamMember(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[#003082]/10 p-6 w-full max-w-md flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-sans font-bold text-lg text-[#0A1628]">
            {member ? "Editar miembro" : "Agregar miembro"}
          </h2>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0A1628] transition-colors">✕</button>
        </div>

        {error && <div className="bg-[#FFF0F2] border border-[#CE1126]/20 text-[#CE1126] rounded-xl px-3 py-2 text-xs">⚠ {error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">Nombre *</label>
            <input
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setInitials(computeInitials(e.target.value));
              }}
              className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
            />
          </div>
          <div>
            <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">Iniciales</label>
            <input
              name="initials"
              type="text"
              maxLength={3}
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30 uppercase font-mono"
            />
          </div>
          <div>
            <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">Rol *</label>
            <input
              name="role"
              type="text"
              required
              defaultValue={member?.role}
              className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
            />
          </div>
          <div>
            <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">Bio</label>
            <textarea
              name="bio"
              rows={2}
              defaultValue={member?.bio ?? ""}
              className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_check"
              name="is_active"
              value="true"
              defaultChecked={member?.is_active ?? true}
              onChange={(e) => {
                const hiddenInput = e.currentTarget.form?.elements.namedItem("is_active_hidden") as HTMLInputElement | null;
                if (hiddenInput) hiddenInput.value = e.currentTarget.checked ? "true" : "false";
              }}
              className="w-4 h-4 accent-[#003082]"
            />
            <input type="hidden" name="is_active" defaultValue={member?.is_active ? "true" : "false"} />
            <label htmlFor="is_active_check" className="font-sans text-sm text-[#0A1628]">Miembro activo</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 font-sans text-sm text-[#64748B] border border-[#64748B]/20 rounded-lg hover:bg-[#64748B]/5 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 font-sans text-sm font-medium bg-[#003082] text-white rounded-lg hover:bg-[#0042A6] transition-colors disabled:opacity-60">
              {isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : member ? "Guardar" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeamAdminClient({ members }: { members: Member[] }) {
  const [editingMember, setEditingMember] = useState<Member | null | "new">(null);
  const [, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTeamMember(id);
    });
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setEditingMember("new")}
          className="flex items-center gap-2 bg-[#003082] text-white font-sans font-medium text-sm px-4 py-2 rounded-lg hover:bg-[#0042A6] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Agregar Miembro
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-16 text-[#64748B] text-sm font-sans border-2 border-dashed border-[#003082]/10 rounded-2xl">
          No hay miembros del equipo registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m, i) => (
            <MemberCard
              key={m.id}
              member={m}
              colorClass={AVATAR_COLORS[i % AVATAR_COLORS.length]}
              onEdit={setEditingMember}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editingMember !== null && (
        <MemberForm
          member={editingMember === "new" ? null : editingMember}
          onClose={() => setEditingMember(null)}
        />
      )}
    </>
  );
}
