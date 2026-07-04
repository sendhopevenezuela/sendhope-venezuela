import { Resend } from "resend";

const resendClient = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[Resend] Falta RESEND_API_KEY en las variables de entorno.");
    return null;
  }
  return new Resend(key);
};

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "SendHope <onboarding@resend.dev>";

// Estilos globales de plantilla HTML premium
export const htmlTemplate = (content: string, previewText: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SendHope Venezuela</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FEFBF6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #FEFBF6;
      padding: 30px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid rgba(0, 48, 130, 0.08);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(10, 22, 40, 0.03);
    }
    .header {
      background: linear-gradient(150deg, #001D4E 0%, #003082 100%);
      padding: 35px 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .header p {
      color: rgba(255, 255, 255, 0.7);
      margin: 5px 0 0 0;
      font-size: 13px;
      font-family: monospace;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .content {
      padding: 35px 30px;
      color: #0A1628;
    }
    .footer {
      background-color: #F8FAFF;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid rgba(0, 48, 130, 0.05);
    }
    .footer p {
      margin: 0;
      color: #64748B;
      font-size: 12px;
      line-height: 1.5;
    }
    .footer a {
      color: #003082;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <span style="display:none;font-size:1px;color:#FEFBF6;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</span>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>SendHope Venezuela</h1>
        <p>Transparencia Extrema</p>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>Este es un correo automático enviado por <strong>SendHope Venezuela</strong>.</p>
        <p style="margin-top: 8px;">Hecho por: <span style="color:#a855f7; font-weight:600;">BrenakosLab Development</span></p>
        <p style="margin-top: 15px; font-size: 10px; color: #94A3B8;">
          <a href="https://sendhope-venezuela.online">sendhope-venezuela.online</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * 1. Donación Recibida (Pendiente) - Al donante
 */
export async function sendDonationReceivedEmail(
  email: string,
  donorName: string | null,
  trackingCode: string,
  amount: number,
  currency: string
) {
  const resend = resendClient();
  if (!resend) return;

  const name = donorName || "Donante de SendHope";
  const formattedAmount = `${currency === "USD" ? "$" : ""}${amount.toFixed(2)} ${currency}`;

  const html = htmlTemplate(`
    <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; color: #003082;">¡Gracias por tu intención de ayuda, ${name}!</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 25px;">
      Hemos recibido tu reporte de donación de <strong>${formattedAmount}</strong>. Nuestro equipo de administración verificará la transferencia bancaria en las próximas horas.
    </p>
    
    <div style="background-color: #F8FAFF; border: 1px solid rgba(0, 48, 130, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
      <h3 style="font-size: 12px; text-transform: uppercase; color: #64748B; margin: 0 0 10px 0; font-family: monospace; letter-spacing: 0.05em;">Código de Rastreo Único</h3>
      <p style="font-size: 22px; font-family: monospace; font-weight: 700; color: #003082; margin: 0 0 8px 0; letter-spacing: 0.05em;">
        ${trackingCode}
      </p>
      <p style="font-size: 12px; color: #64748B; margin: 0;">
        Usa este código en nuestro <strong>Muro de Transparencia</strong> para rastrear el estado de tu donación y las compras de insumos que financie.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://sendhope-venezuela.online/transparencia?search=${trackingCode}" 
         style="background-color: #003082; color: #ffffff; padding: 12px 30px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 48, 130, 0.15);">
        Rastrear mi donación
      </a>
    </div>
  `, `Reporte de donación recibido para el código de rastreo ${trackingCode}`);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Donación Reportada — Código: ${trackingCode}`,
      html,
    });
  } catch (error) {
    console.error("[Resend] Error al enviar correo de donación recibida:", error);
  }
}

/**
 * 2. Notificación al Administrador - Cuando llega una donación
 */
export async function sendAdminNewDonationNotification(
  amount: number,
  currency: string,
  donorName: string | null,
  trackingCode: string,
  reference: string | null
) {
  const resend = resendClient();
  if (!resend) return;

  const adminEmailsString = process.env.ADMIN_NOTIFICATION_EMAILS;
  if (!adminEmailsString) {
    console.warn("[Resend] No se configuró ADMIN_NOTIFICATION_EMAILS. Enviando a sendhopevenezuela@gmail.com por defecto.");
  }
  const recipients = adminEmailsString
    ? adminEmailsString.split(",").map(e => e.trim())
    : ["sendhopevenezuela@gmail.com"];

  const name = donorName || "Anónimo";
  const formattedAmount = `${currency === "USD" ? "$" : ""}${amount.toFixed(2)} ${currency}`;

  const html = htmlTemplate(`
    <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; color: #b45309;">⚠️ Nueva donación reportada por verificar</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 25px;">
      Se ha reportado un nuevo aporte en la plataforma pública y requiere validación en el panel administrativo.
    </p>
    
    <div style="background-color: #FFFDF5; border: 1px solid rgba(244, 195, 29, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
          <td style="padding: 8px 0; font-weight: 600; color: #64748B;">Código:</td>
          <td style="padding: 8px 0; font-family: monospace; font-weight: 700; color: #003082;">${trackingCode}</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
          <td style="padding: 8px 0; font-weight: 600; color: #64748B;">Monto:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0A1628;">${formattedAmount}</td>
        </tr>
        <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
          <td style="padding: 8px 0; font-weight: 600; color: #64748B;">Donante:</td>
          <td style="padding: 8px 0; color: #0A1628;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #64748B;">Referencia:</td>
          <td style="padding: 8px 0; font-family: monospace; color: #0A1628;">${reference ?? "—"}</td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://sendhope-venezuela.online/login" 
         style="background-color: #003082; color: #ffffff; padding: 12px 30px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
        Ir al Panel de Control
      </a>
    </div>
  `, `Nueva donación de ${formattedAmount} por verificar (${trackingCode})`);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      subject: `[Nueva Donación] ${formattedAmount} por verificar — Código: ${trackingCode}`,
      html,
    });
  } catch (error) {
    console.error("[Resend] Error al enviar alerta de administrador para nueva donación:", error);
  }
}

/**
 * 3. Donación Verificada (Confirmada) - Al donante
 */
export async function sendDonationVerifiedEmail(
  email: string,
  donorName: string | null,
  trackingCode: string,
  amount: number,
  currency: string
) {
  const resend = resendClient();
  if (!resend) return;

  const name = donorName || "Donante de SendHope";
  const formattedAmount = `${currency === "USD" ? "$" : ""}${amount.toFixed(2)} ${currency}`;

  const html = htmlTemplate(`
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="font-size: 40px;">✅</span>
    </div>
    <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; text-align: center; color: #059669;">¡Tu donación ha sido verificada!</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; text-align: center; margin-bottom: 25px;">
      Hola ${name}, te confirmamos que tu transferencia de <strong>${formattedAmount}</strong> fue validada con éxito por nuestro equipo de administración.
    </p>
    
    <div style="background-color: #ECFDF5; border: 1px solid rgba(5, 150, 105, 0.15); border-radius: 12px; padding: 20px; margin-bottom: 25px; text-align: center;">
      <p style="font-size: 13px; color: #047857; margin: 0; font-weight: 600;">
        ¡Tu aporte ya está listo para comprar suministros urgentes!
      </p>
      <p style="font-size: 12px; color: #065F46; margin: 5px 0 0 0;">
        A partir de ahora, cuando asociemos tu dinero a compras de alimentos, medicinas o agua en los refugios, te llegará un correo detallado de transparencia.
      </p>
    </div>

    <p style="font-size: 12px; text-align: center; color: #64748B; margin-top: 25px;">
      Código de Rastreo: <strong>${trackingCode}</strong>
    </p>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://sendhope-venezuela.online/transparencia?search=${trackingCode}" 
         style="background-color: #059669; color: #ffffff; padding: 12px 30px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.15);">
        Ver mi donación verificada
      </a>
    </div>
  `, `Tu donación de ${formattedAmount} fue verificada con éxito (${trackingCode})`);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Donación Verificada con Éxito — Código: ${trackingCode}`,
      html,
    });
  } catch (error) {
    console.error("[Resend] Error al enviar correo de donación verificada:", error);
  }
}

/**
 * 4. Donación Asignada a una Compra - Al donante
 */
export async function sendDonationAllocatedEmail(
  email: string,
  donorName: string | null,
  trackingCode: string,
  amountAllocated: number,
  purchaseDescription: string,
  shelterName: string
) {
  const resend = resendClient();
  if (!resend) return;

  const name = donorName || "Donante de SendHope";
  const formattedAllocated = `$${amountAllocated.toFixed(2)} USD`;

  const html = htmlTemplate(`
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="font-size: 40px;">🚚</span>
    </div>
    <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; text-align: center; color: #003082;">¡Tu aporte ya se transformó en ayuda!</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 25px;">
      Hola ${name}, te informamos con total transparencia en qué se ha invertido tu ayuda. Hemos destinado <strong>${formattedAllocated}</strong> de tu donación para la adquisición de suministros.
    </p>
    
    <div style="background-color: #F8FAFF; border: 1px solid rgba(0, 48, 130, 0.08); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
      <h3 style="font-size: 12px; text-transform: uppercase; color: #64748B; margin: 0 0 12px 0; font-family: monospace; letter-spacing: 0.05em;">Detalle del Insumo Adquirido</h3>
      
      <p style="font-size: 15px; font-weight: 700; color: #0A1628; margin: 0 0 6px 0;">
        ${purchaseDescription}
      </p>
      
      <p style="font-size: 13px; color: #003082; font-weight: 600; margin: 0 0 12px 0;">
        📍 Destino: ${shelterName}
      </p>
      
      <div style="border-top: 1px dashed rgba(0, 48, 130, 0.1); padding-top: 12px; font-size: 12px; color: #64748B;">
        Código de Rastreo: <strong>${trackingCode}</strong>
      </div>
    </div>
    
    <p style="font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 25px;">
      Puedes acceder a nuestro Muro de Transparencia para ver las fotos de la compra, los recibos contables y las fotos de la entrega física.
    </p>

    <div style="text-align: center; margin-top: 30px;">
      <a href="https://sendhope-venezuela.online/transparencia?search=${trackingCode}" 
         style="background-color: #003082; color: #ffffff; padding: 12px 30px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 48, 130, 0.15);">
        Ver soporte de compra y fotos
      </a>
    </div>
  `, `Tu aporte fue asignado a la compra de: ${purchaseDescription} (${trackingCode})`);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Ayuda en Camino — Tu aporte fue asignado a: ${purchaseDescription}`,
      html,
    });
  } catch (error) {
    console.error("[Resend] Error al enviar correo de asignación de donación:", error);
  }
}
