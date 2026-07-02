"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { AlertCircle } from "lucide-react";
import { loginAdmin } from "@/app/actions/auth";

export function LoginForm() {
  const t = useTranslations("admin_auth");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!username || !password) {
      setError(t("username_label") + " y " + t("password_label") + " requeridos.");
      return;
    }

    startTransition(async () => {
      const res = await loginAdmin(formData);
      if ("error" in res) {
        setError(res.error);
      } else {
        // Redirige al panel forzando recarga para que el middleware valide la sesión fresca
        window.location.href = "/admin";
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-navy/10 p-6 sm:p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Error global */}
        {error && (
          <div className="flex items-start gap-2.5 bg-scarlet-light border border-scarlet/20 text-scarlet rounded-xl px-4 py-3">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span className="font-sans text-sm">{error}</span>
          </div>
        )}

        {/* Input: Usuario */}
        <div>
          <label
            htmlFor="username"
            className="block font-sans font-600 text-navy text-sm mb-1.5"
          >
            {t("username_label")}
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            disabled={isPending}
            placeholder={t("username_placeholder")}
            className="w-full px-4 py-3 rounded-xl border-2 border-navy/20 font-sans text-navy placeholder:text-muted/60 focus:outline-none focus:border-navy transition-colors duration-150 bg-white disabled:opacity-50"
          />
        </div>

        {/* Input: Contraseña */}
        <div>
          <label
            htmlFor="password"
            className="block font-sans font-600 text-navy text-sm mb-1.5"
          >
            {t("password_label")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            disabled={isPending}
            placeholder={t("password_placeholder")}
            className="w-full px-4 py-3 rounded-xl border-2 border-navy/20 font-sans text-navy placeholder:text-muted/60 focus:outline-none focus:border-navy transition-colors duration-150 bg-white disabled:opacity-50"
          />
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gold text-navy-dark font-sans font-700 text-base py-4 rounded-full hover:bg-gold-dark active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isPending ? t("logging_in") : t("login_button")}
        </button>
      </form>
    </div>
  );
}
