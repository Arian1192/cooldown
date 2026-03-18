import { emailLayout, heading, infoBox, paragraph } from "./base";

export interface EventRequestReceivedData {
  partnerName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventCity: string;
}

export function eventRequestReceived(data: EventRequestReceivedData): string {
  const infoRows = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    ${infoBox("Evento", data.eventTitle)}
    ${infoBox("Fecha", data.eventDate)}
    ${infoBox("Venue", data.eventVenue)}
    ${infoBox("Ciudad", data.eventCity)}
  </table>`;

  const content = `
    ${heading("Solicitud de evento recibida")}
    ${paragraph(`Hemos recibido la solicitud de evento de <strong style="color:#f5f500;">${data.partnerName}</strong>.`)}
    ${paragraph("Nuestro equipo de moderación revisará los detalles del evento. Te notificaremos cuando haya una resolución.")}
    ${infoRows}
    ${paragraph("El proceso de revisión suele completarse en 24-48 horas.")}
  `;

  return emailLayout(content);
}
