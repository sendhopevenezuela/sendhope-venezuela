import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Ingreso Administrativo — SendHope Venezuela",
    description: "Ingresa tus credenciales para acceder al panel de control.",
  };
}

export default async function AdminLoginPage() {
  const t = await getTranslations("admin_auth");

  return (
    <main className="min-h-[100svh] flex flex-col items-center justify-center bg-cream px-5 py-12">
      {/* Contenedor principal centrado */}
      <div className="w-full max-w-md flex flex-col gap-6">
        
        {/* Logo / Retorno a Inicio */}
        <div className="flex flex-col items-center gap-4 text-center">
          <a href="/" className="flex items-center gap-2 group">
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

          <div className="mt-2">
            <h1 className="font-sans font-800 text-2xl text-navy">
              {t("title")}
            </h1>
            <p className="font-sans font-400 text-muted text-sm mt-1">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <LoginForm />

        {/* Volver */}
        <p className="text-center">
          <a
            href="/"
            className="font-mono text-xs text-navy/50 hover:text-navy transition-colors"
          >
            ← Volver a la página principal
          </a>
        </p>
      </div>
    </main>
  );
}
