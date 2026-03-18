import { ctaButton, emailLayout, heading, infoBox, paragraph } from "./base";

export interface PartnerRegistrationReceivedData {
  partnerName: string;
  contactEmail: string;
}

export function partnerRegistrationReceived(data: PartnerRegistrationReceivedData): string {
  const infoRows = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    ${infoBox("Club / marca", data.partnerName)}
    ${infoBox("Email de contacto", data.contactEmail)}
  </table>`;

  const content = `
    ${heading("Solicitud recibida")}
    ${paragraph("Hemos recibido tu solicitud de incorporación a la red de partners de Cooldown.")}
    ${paragraph("Nuestro equipo revisará tu perfil y te contactaremos en los próximos días. Recibirás un email con la resolución.")}
    ${infoRows}
    ${paragraph("Mientras tanto, puedes explorar nuestros eventos en cooldownblog.vercel.app.")}
    ${ctaButton("Ver eventos", "https://cooldownblog.vercel.app/events")}
  `;

  return emailLayout(content);
}
