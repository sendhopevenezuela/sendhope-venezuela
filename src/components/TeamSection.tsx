import { getTranslations } from "next-intl/server";

// ── Datos del equipo ─────────────────────────────────────────────────────────
// Cambia nombres, roles y descripciones aquí directamente.
// El campo `color` controla el fondo del avatar de iniciales:
//   "navy"  → azul oscuro   "gold" → dorado   "verified" → verde
const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Ignacio Mendoza",
    role: "Fundador · Coordinación general",
    bio: "Barquisimeto, Lara. Organiza el equipo y mantiene el proyecto corriendo desde el primer día.",
    color: "navy" as const,
  },
  {
    id: 2,
    name: "María Fernández",
    role: "Coordinadora de campo",
    bio: "Se encarga del contacto directo con los refugios y de priorizar qué se compra cada día.",
    color: "gold" as const,
  },
  {
    id: 3,
    name: "Carlos Rondón",
    role: "Logística y compras",
    bio: "Va al mercado, negocia precios, trae el recibo y lo escanea antes de que anochezca.",
    color: "verified" as const,
  },
  {
    id: 4,
    name: "Valentina Herrera",
    role: "Comunicaciones",
    bio: "Documenta cada entrega con foto y mantiene al público informado en redes.",
    color: "navy" as const,
  },
  {
    id: 5,
    name: "Roberto Pérez",
    role: "Finanzas y transparencia",
    bio: "Revisa cada número, cuadra los recibos y publica el estado de cuentas semanalmente.",
    color: "gold" as const,
  },
  {
    id: 6,
    name: "Ana González",
    role: "Coordinadora de refugios",
    bio: "Mantiene el mapa actualizado de refugios activos y coordina las entregas con sus líderes.",
    color: "verified" as const,
  },
  {
    id: 7,
    name: "David Castillo",
    role: "Tecnología",
    bio: "Construye y mantiene la plataforma para que donantes y equipo siempre tengan información en tiempo real.",
    color: "navy" as const,
  },
] as const;

// ── Estilos de avatar por color ───────────────────────────────────────────────
const AVATAR_STYLES: Record<"navy" | "gold" | "verified", string> = {
  navy:     "bg-navy text-white",
  gold:     "bg-gold text-navy-dark",
  verified: "bg-verified text-white",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ── Componente ────────────────────────────────────────────────────────────────
export async function TeamSection() {
  const t = await getTranslations("team");

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

        {/* Grid de tarjetas
            mobile: 1 col · sm: 2 col · md: 3 col · lg: 4 col
            Con 7 tarjetas: 4+3 en lg, 3+3+1 en md — la última queda izquierda,
            comportamiento natural del grid que no distrae. */}
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
          role="list"
        >
          {TEAM_MEMBERS.map((member) => (
            <li
              key={member.id}
              className="bg-white rounded-2xl border border-navy/8 p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
            >
              {/* Avatar de iniciales */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-sans font-700 text-base flex-shrink-0 ${AVATAR_STYLES[member.color]}`}
                aria-hidden
              >
                {getInitials(member.name)}
              </div>

              {/* Nombre y rol */}
              <div>
                <p className="font-sans font-700 text-navy text-base leading-snug">
                  {member.name}
                </p>
                <p className="font-mono text-[11px] text-gold tracking-wide mt-0.5">
                  {member.role}
                </p>
              </div>

              {/* Bio */}
              <p className="font-sans font-400 text-muted text-sm leading-relaxed mt-auto">
                {member.bio}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
