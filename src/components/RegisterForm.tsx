"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { registerAdmin } from "@/app/actions/auth";

export function RegisterForm() {
  const t = useTranslations("admin_auth");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username")?.toString().trim();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();
    const secretCode = formData.get("secretCode")?.toString().trim();

    if (!username || !password || !confirmPassword || !secretCode) {
      setError(t("username_label") + ", contraseñas y código son requeridos.");
      return;
    }

    if (password !== confirmPassword) {
      setError(t("error_password_match"));
      return;
    }

    if (secretCode !== "venezuela2026") {
      setError(t("error_code"));
      return;
    }

    startTransition(async () => {
      const res = await registerAdmin(formData);
      if ("error" in res) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl border-2 border-navy/10 p-6 sm:p-8 shadow-sm flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-verified-light flex items-center justify-center">
          <CheckCircle size={32} className="text-verified" />
        </div>
        <div>
          <h2 className="font-sans font-800 text-xl text-navy">
            Registro Completado
          </h2>
          <p className="font-sans text-sm text-muted mt-2">
            {t("success_register")}
          </p>
        </div>
        <a
          href="/admin/login"
          className="w-full bg-navy text-white font-sans font-700 text-sm py-4 rounded-full hover:bg-navy-dark transition-colors duration-150 text-center shadow-sm"
        >
          {t("to_login_link")}
        </a>
      </div>
    );
  }

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

        {/* Input: Confirmar Contraseña */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block font-sans font-600 text-navy text-sm mb-1.5"
          >
            {t("confirm_password_label")}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            disabled={isPending}
            placeholder={t("confirm_password_placeholder")}
            className="w-full px-4 py-3 rounded-xl border-2 border-navy/20 font-sans text-navy placeholder:text-muted/60 focus:outline-none focus:border-navy transition-colors duration-150 bg-white disabled:opacity-50"
          />
        </div>

        {/* Input: Código de Registro */}
        <div>
          <label
            htmlFor="secretCode"
            className="block font-sans font-600 text-navy text-sm mb-1.5"
          >
            {t("code_label")}
          </label>
          <input
            id="secretCode"
            name="secretCode"
            type="password"
            required
            disabled={isPending}
            placeholder={t("code_placeholder")}
            className="w-full px-4 py-3 rounded-xl border-2 border-navy/20 font-sans text-navy placeholder:text-muted/60 focus:outline-none focus:border-navy transition-colors duration-150 bg-white disabled:opacity-50"
          />
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gold text-navy-dark font-sans font-700 text-base py-4 rounded-full hover:bg-gold-dark active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isPending ? t("registering") : t("register_button")}
        </button>
      </form>
    </div>
  );
}
