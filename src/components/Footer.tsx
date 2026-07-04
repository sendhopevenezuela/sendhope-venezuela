import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="bg-navy-dark text-white/40 py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs font-mono">
        {/* Micro-bandera en el footer */}
        <div className="flex items-center gap-3">
          <span className="flex flex-col gap-[2px] opacity-50">
            <span className="block w-3 h-[2px] rounded-full bg-gold" />
            <span className="block w-3 h-[2px] rounded-full bg-white" />
            <span className="block w-3 h-[2px] rounded-full bg-scarlet" />
          </span>
          <p>{t("rights")}</p>
        </div>
        <nav className="flex gap-6">
          <Link
            href="/transparencia"
            className="hover:text-gold transition-colors duration-200"
          >
            {t("transparency")}
          </Link>
          <Link
            href="/galeria"
            className="hover:text-gold transition-colors duration-200"
          >
            {t("gallery")}
          </Link>
          <Link
            href="/contacto"
            className="hover:text-gold transition-colors duration-200"
          >
            {t("contact")}
          </Link>
          <Link
            href="/admin"
            className="hover:text-gold transition-colors duration-200"
          >
            Admin
          </Link>
        </nav>
      </div>
      <div className="max-w-5xl mx-auto border-t border-white/5 mt-6 pt-4 text-center text-[10px] font-mono">
        <p>{t("attribution")} <span className="text-[#a855f7] font-semibold">BreinakosLab</span></p>
      </div>
    </footer>
  );
}
