import { ctaButton, emailLayout, heading, paragraph } from "./base";

export interface PartnerApprovedData {
  partnerName: string;
  portalUrl?: string;
}

export function partnerApproved(data: PartnerApprovedData): string {
  const portalUrl = data.portalUrl ?? "https://cooldownblog.vercel.app/partners/portal";

  const content = `
    ${heading("Bienvenido a Cooldown Partners")}
    ${paragraph(`<strong style="color:#f5f500;">${data.partnerName}</strong>, tu solicitud ha sido aprobada.`)}
    ${paragraph("Ya puedes acceder al portal de partners para enviar solicitudes de eventos y gestionar tu perfil en la plataforma.")}
    ${paragraph("Desde el portal puedes:")}
    <ul style="margin:0 0 20px 0;padding-left:20px;color:#c8c8c8;font-size:15px;line-height:1.8;">
      <li>Enviar solicitudes de nuevos eventos</li>
      <li>Consultar el estado de tus solicitudes</li>
      <li>Acceder a tu perfil de partner</li>
    </ul>
    ${ctaButton("Acceder al portal", portalUrl)}
  `;

  return emailLayout(content);
}
