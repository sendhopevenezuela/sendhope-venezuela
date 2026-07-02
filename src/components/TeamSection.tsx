import { getTranslations } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";

// ── Datos del equipo estáticos (Fallback en caso de que la BDD esté vacía) ────
const FALLBACK_TEAM_MEMBERS = [
  {
    id: "fb1",
    name: "Ignacio Mendoza",
    role: "Fundador · Coordinación general",
    bio: "Barquisimeto, Lara. Organiza el equipo y mantiene el proyecto corriendo desde el primer día.",
    initials: "IM",
  },
  {
    id: "fb2",
    name: "María Fernández",
    role: "Coordinadora de campo",
    bio: "Se encarga del contacto directo con los refugios y de priorizar qué se compra cada día.",
    initials: "MF",
  },
  {
    id: "fb3",
    name: "Carlos Rondón",
    role: "Logística y compras",
    bio: "Va al mercado, negocia precios, trae el recibo y lo escanea antes de que anochezca.",
    initials: "CR",
  },
  {
    id: "fb4",
    name: "Valentina Herrera",
    role: "Comunicaciones",
    bio: "Documenta cada entrega con foto y mantiene al público informado en redes.",
    initials: "VH",
  },
  {
    id: "fb5",
    name: "Roberto Pérez",
    role: "Finanzas y transparencia",
    bio: "Revisa cada número, cuadra los recibos y publica el estado de cuentas semanalmente.",
    initials: "RP",
  },
  {
    id: "fb6",
    name: "Ana González",
    role: "Coordinadora de refugios",
    bio: "Mantiene el mapa actualizado de refugios activos y coordina las entregas con sus líderes.",
    initials: "AG",
  },
  {
    id: "fb7",
    name: "David Castillo",
    role: "Tecnología",
    bio: "Construye y mantiene la plataforma para que donantes y equipo siempre tengan información en tiempo real.",
    initials: "DC",
  },
];

const AVATAR_STYLES = [
  "bg-navy text-white",
  "bg-gold text-navy-dark",
  "bg-verified text-white",
];

export async function TeamSection() {
  const t = await getTranslations("team");

  type DbTeamMember = {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    initials: string;
    is_active: boolean;
    order_index: number;
  };

  let members: DbTeamMember[] = [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("team_members")
      .select("id, name, role, bio, initials, is_active, order_index")
      .eq("is_active", true)
      .order("order_index", { ascending: true });
    members = data ?? [];
  } catch (err) {
    console.warn("[TeamSection] Error fetching team members:", err);
  }

  // Fallback si no hay registros en la base de datos
  const activeMembers = members.length > 0 ? members : FALLBACK_TEAM_MEMBERS;

  return (
    <section className="bg-navy-light py-24 px-5">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-sans font-800 text-3xl md:text-4xl text-navy mb-3">
            {t("title")}
          </h2>
          <p className="font-sans font-400 text-muted text-base max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Grid de tarjetas */}
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          role="list"
        >
          {activeMembers.map((member, idx) => {
            const avatarStyle = AVATAR_STYLES[idx % AVATAR_STYLES.length];
            return (
              <li
                key={member.id}
                className="bg-white rounded-2xl border border-navy/8 p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              >
                {/* Avatar de iniciales */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-sans font-700 text-base flex-shrink-0 ${avatarStyle}`}
                  aria-hidden
                >
                  {member.initials}
                </div>

                {/* Nombre y rol */}
                <div>
                  <p className="font-sans font-700 text-navy text-base leading-snug">
                    {member.name}
                  </p>
                  <p className="font-mono text-[11px] text-gold tracking-wide mt-0.5 font-semibold">
                    {member.role}
                  </p>
                </div>

                {/* Bio */}
                {member.bio && (
                  <p className="font-sans font-400 text-muted text-sm leading-relaxed mt-auto">
                    {member.bio}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
