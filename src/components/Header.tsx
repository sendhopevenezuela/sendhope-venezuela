import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "./LanguageToggle";

export async function Header() {
  const t = await getTranslations("header");

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-navy/10">
      <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          {/* Micro-bandera: tres líneas finas decorativas */}
          <span className="flex flex-col gap-[3px] opacity-80">
            <span className="block w-4 h-[3px] rounded-full bg-gold" />
            <span className="block w-4 h-[3px] rounded-full bg-navy" />
            <span className="block w-4 h-[3px] rounded-full bg-scarlet" />
          </span>
          <span className="font-sans font-800 text-lg text-navy leading-none">
            SendHope
          </span>
          <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-navy/40 group-hover:text-navy/60 transition-colors duration-200">
            Venezuela
          </span>
        </a>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <a
            href="/donar"
            className="bg-gold text-navy-dark text-sm font-sans font-700 px-5 py-2 rounded-full hover:bg-gold-dark transition-colors duration-200 active:scale-95 shadow-sm"
          >
            {t("donar")}
          </a>
        </div>
      </div>
    </header>
  );
}
