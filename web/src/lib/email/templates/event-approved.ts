import { ctaButton, emailLayout, heading, infoBox, paragraph } from "./base";

export interface EventApprovedData {
  partnerName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventCity: string;
  eventSlug?: string;
  siteUrl?: string;
}

export function eventApproved(data: EventApprovedData): string {
  const siteUrl = data.siteUrl ?? "https://cooldownblog.vercel.app";
  const eventUrl = data.eventSlug ? `${siteUrl}/events/${data.eventSlug}` : `${siteUrl}/events`;

  const infoRows = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    ${infoBox("Evento", data.eventTitle)}
    ${infoBox("Fecha", data.eventDate)}
    ${infoBox("Venue", data.eventVenue)}
    ${infoBox("Ciudad", data.eventCity)}
  </table>`;

  const content = `
    ${heading("Tu evento está publicado")}
    ${paragraph(`El evento de <strong style="color:#f5f500;">${data.partnerName}</strong> ha sido aprobado y ya está publicado en Cooldown.`)}
    ${infoRows}
    ${paragraph("Ya aparece en nuestra agenda y será visible para toda la comunidad Cooldown.")}
    ${ctaButton("Ver evento publicado", eventUrl)}
  `;

  return emailLayout(content);
}
