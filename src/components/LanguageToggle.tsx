"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();

  const toggle = () => {
    const next = locale === "es" ? "en" : "es";
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a español"}
      className="font-mono text-xs tracking-widest text-navy/70 hover:text-navy border border-navy/20 hover:border-navy/50 px-2.5 py-1 rounded transition-all duration-200"
    >
      {locale === "es" ? "EN" : "ES"}
    </button>
  );
}
