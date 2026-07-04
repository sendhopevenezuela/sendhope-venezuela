"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity";
import { cookies } from "next/headers";
import { htmlTemplate } from "@/lib/resend";
import { Resend } from "resend";

export type DiffusionResult =
  | { success: true; count: number }
  | { error: string };

async function getAdminName(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sendhope_admin_session")?.value;
    if (!token) return "Administrador";
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("admin_sessions")
      .select("admin_users(username)")
      .eq("token", token)
      .single();
    // @ts-expect-error – join inference
    return data?.admin_users?.username ?? "Administrador";
  } catch {
    return "Administrador";
  }
}

export async function sendDiffusionEmail(
  target: "admins" | "donors",
  subject: string,
  bodyContent: string,
): Promise<DiffusionResult> {
  const adminName = await getAdminName();
  const supabase = createAdminClient();

  if (!subject.trim()) {
    return { error: "El asunto del correo es requerido." };
  }
  if (!bodyContent.trim()) {
    return { error: "El cuerpo del correo es requerido." };
  }

  // 1. Obtener destinatarios
  let recipients: string[] = [];

  if (target === "admins") {
    const adminEmailsString = process.env.ADMIN_NOTIFICATION_EMAILS;
    recipients = adminEmailsString
      ? adminEmailsString.split(",").map((e) => e.trim()).filter(Boolean)
      : ["sendhopevenezuela@gmail.com"];
  } else {
    // Buscar todos los donantes que reportaron email
    const { data, error } = await supabase
      .from("donations")
      .select("donor_email")
      .neq("donor_email", null);

    if (error) {
      return { error: `Error al consultar donantes: ${error.message}` };
    }

    const rawEmails = (data ?? []).map((r) => r.donor_email?.trim()).filter(Boolean) as string[];
    // Remover duplicados y validar formato básico de email
    recipients = Array.from(
      new Set(
        rawEmails.filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      )
    );
  }

  if (recipients.length === 0) {
    return { error: "No hay destinatarios disponibles para esta difusión." };
  }

  // 2. Inicializar Resend
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { error: "Resend no está configurado (falta RESEND_API_KEY)." };
  }
  const resend = new Resend(key);
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "SendHope <onboarding@resend.dev>";

  // Generar HTML final usando el template centralizado
  const emailHtml = htmlTemplate(
    `<div style="font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-line;">${bodyContent}</div>`,
    subject
  );

  // 3. Enviar correos por lotes (de 100 en 100) para no exceder límites de Resend batch API
  let sentCount = 0;
  const chunkSize = 100;

  try {
    for (let i = 0; i < recipients.length; i += chunkSize) {
      const chunk = recipients.slice(i, i + chunkSize);
      const batchPayload = chunk.map((email) => ({
        from: FROM_EMAIL,
        to: email,
        subject: subject,
        html: emailHtml,
      }));

      const { error: batchError } = await resend.batch.send(batchPayload);
      if (batchError) {
        console.error("[Diffusion Action] Resend batch error:", batchError);
        return { error: `Error parcial al enviar correos: ${batchError.message}` };
      }
      sentCount += chunk.length;
    }
  } catch (err: any) {
    console.error("[Diffusion Action] Exception:", err);
    return { error: `Excepción durante el envío: ${err?.message ?? "Error desconocido"}` };
  }

  // 4. Registrar la actividad en el log de auditoría
  await logActivity(
    supabase,
    adminName,
    "sent_diffusion",
    "purchase",
    `Envió difusión masiva a ${sentCount} destinatarios (${target === "admins" ? "Administradores" : "Donantes"})`,
    null
  );

  return { success: true, count: sentCount };
}
