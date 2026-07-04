"use client";

import { useState, useTransition } from "react";
import { sendDiffusionEmail } from "@/app/actions/diffusion";

export function DiffusionClient() {
  const [target, setTarget] = useState<"admins" | "donors">("admins");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      setStatusMsg({ type: "error", text: "El asunto y el cuerpo del mensaje son requeridos." });
      return;
    }

    setStatusMsg(null);
    startTransition(async () => {
      const res = await sendDiffusionEmail(target, subject, body);
      if ("error" in res) {
        setStatusMsg({ type: "error", text: res.error });
      } else {
        setStatusMsg({
          type: "success",
          text: `¡Difusión enviada con éxito a ${res.count} destinatario(s)!`,
        });
        // Limpiar formulario si tuvo éxito
        setSubject("");
        setBody("");
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col lg:flex-row gap-8">
      {/* Columna Izquierda: Formulario */}
      <div className="flex-1 bg-white border border-[#003082]/10 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl">📢</span>
          <div>
            <h1 className="font-sans font-800 text-xl md:text-2xl text-navy">
              Módulo de Difusiones
            </h1>
            <p className="font-sans text-xs text-muted">
              Redacta y envía correos masivos a través del API de Resend
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Destinatarios */}
          <div>
            <label className="block font-sans font-700 text-xs text-navy uppercase tracking-wider mb-2">
              Enviar difusión a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTarget("admins")}
                className={`py-3 px-4 rounded-xl font-sans font-semibold text-xs border-2 text-center transition-all duration-150 ${
                  target === "admins"
                    ? "bg-navy border-navy text-white shadow-sm"
                    : "bg-white border-navy/10 text-navy hover:border-navy/40"
                }`}
              >
                👥 Administradores
                <span className="block font-mono text-[9px] font-normal opacity-70 mt-0.5">
                  Lista configurable en envs
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTarget("donors")}
                className={`py-3 px-4 rounded-xl font-sans font-semibold text-xs border-2 text-center transition-all duration-150 ${
                  target === "donors"
                    ? "bg-navy border-navy text-white shadow-sm"
                    : "bg-white border-navy/10 text-navy hover:border-navy/40"
                }`}
              >
                🎗 Donantes Registrados
                <span className="block font-mono text-[9px] font-normal opacity-70 mt-0.5">
                  Correos de aportes confirmados
                </span>
              </button>
            </div>
          </div>

          {/* Asunto */}
          <div>
            <label htmlFor="subject" className="block font-sans font-700 text-xs text-navy uppercase tracking-wider mb-1.5">
              Asunto del Correo (Subject):
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej: Reporte de Compras y Entregas de esta Semana"
              className="w-full px-4 py-3 rounded-xl border border-navy/20 font-sans text-navy placeholder:text-muted/50 focus:outline-none focus:border-navy transition-colors bg-white text-sm"
            />
          </div>

          {/* Cuerpo */}
          <div>
            <label htmlFor="body" className="block font-sans font-700 text-xs text-navy uppercase tracking-wider mb-1.5">
              Cuerpo del Mensaje (Soporta salto de línea):
            </label>
            <textarea
              id="body"
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe aquí el contenido del correo..."
              className="w-full px-4 py-3 rounded-xl border border-navy/20 font-sans text-navy placeholder:text-muted/50 focus:outline-none focus:border-navy transition-colors bg-white text-sm"
            />
          </div>

          {/* Estado de envío */}
          {statusMsg && (
            <div
              className={`p-4 rounded-xl font-sans text-xs border ${
                statusMsg.type === "success"
                  ? "bg-verified-light border-verified/20 text-verified-dark"
                  : "bg-scarlet-light border-scarlet/20 text-scarlet"
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#F4C31D] hover:bg-gold-dark text-[#001D4E] font-sans font-700 text-sm py-3.5 rounded-full shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Enviando difusión..." : "🚀 Enviar Difusión Masiva"}
          </button>
        </form>
      </div>

      {/* Columna Derecha: Previsualización */}
      <div className="w-full lg:w-96 flex flex-col gap-3">
        <h2 className="font-sans font-700 text-xs text-navy uppercase tracking-wider">
          Previsualización en tiempo real:
        </h2>
        
        <div className="bg-[#FEFBF6] border border-[#003082]/10 rounded-2xl overflow-hidden shadow-xs flex flex-col">
          {/* Cabecera del correo previsualizado */}
          <div className="bg-gradient-to-r from-[#001D4E] to-[#003082] p-4 text-center">
            <span className="font-sans font-extrabold text-sm text-white block">
              SendHope Venezuela
            </span>
            <span className="font-mono text-[9px] tracking-wider text-white/50 block mt-0.5 uppercase">
              Juntos podemos ayudar más
            </span>
          </div>

          {/* Cuerpo previsualizado */}
          <div className="p-5 bg-white min-h-[160px] flex flex-col justify-between">
            <div>
              <p className="font-sans text-[11px] font-bold text-[#64748B] mb-2 uppercase tracking-wide">
                Asunto: {subject || <span className="italic opacity-50">Sin asunto redactado</span>}
              </p>
              <div className="font-sans text-xs text-[#334155] whitespace-pre-wrap leading-relaxed">
                {body || <span className="italic opacity-50">El contenido del correo que redactes aparecerá aquí...</span>}
              </div>
            </div>
          </div>

          {/* Footer previsualizado */}
          <div className="bg-[#F8FAFF] p-4 text-center border-t border-navy/5">
            <p className="font-sans text-[10px] text-[#64748B]">
              Este es un correo automático enviado por <strong>SendHope Venezuela</strong>.
            </p>
            <p className="font-sans text-[10px] text-[#64748B] mt-1.5">
              Hecho por: <span className="text-[#a855f7] font-semibold">BrenakosLab Development</span>
            </p>
            <p className="font-mono text-[9px] text-[#94A3B8] mt-3">
              sendhope-venezuela.online
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
