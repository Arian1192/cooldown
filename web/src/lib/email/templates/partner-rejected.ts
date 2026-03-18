import { emailLayout, heading, paragraph } from "./base";

export interface PartnerRejectedData {
  partnerName: string;
  reason?: string;
}

export function partnerRejected(data: PartnerRejectedData): string {
  const reasonBlock = data.reason
    ? `<div style="margin:20px 0;padding:16px;border-left:3px solid #e8253a;background-color:#171717;">
        <p style="margin:0;font-family:'Barlow Condensed',Arial,sans-serif;font-weight:700;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#808080;margin-bottom:6px;">Motivo</p>
        <p style="margin:0;font-size:14px;color:#f5f5f5;">${data.reason}</p>
      </div>`
    : "";

  const content = `
    ${heading("Solicitud no aprobada")}
    ${paragraph(`Hemos revisado la solicitud de <strong style="color:#f5f5f5;">${data.partnerName}</strong> y en este momento no podemos incorporarla a nuestra red de partners.`)}
    ${reasonBlock}
    ${paragraph("Si crees que hay un error o tienes nueva información que aportar, puedes contactarnos directamente respondiendo a este email.")}
    ${paragraph("Gracias por tu interés en Cooldown.")}
  `;

  return emailLayout(content);
}
