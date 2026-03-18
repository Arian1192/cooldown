export type EventOrigin = "native" | "partner" | "ra_imported";

export type EventStatus = "draft" | "published";

export type EventRequestStatus = "pending_review" | "approved" | "rejected";

export type EventType = "club_night" | "showcase" | "pop_up" | "workshop";

export interface EventSourceMetadata {
  source: "native" | "partner_portal" | "resident_advisor";
  sourceExternalId?: string;
  sourceUrl?: string;
  importedAt?: string;
}

export interface EventRecord {
  id: string;
  title: string;
  description?: string;
  date: string;
  city: string;
  venue: string;
  organizer: string;
  genres: string[];
  lineUp: string[];
  eventType: EventType;
  priceEur?: number;
  ticketUrl?: string;
  origin: EventOrigin;
  status: EventStatus;
  source: EventSourceMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerRecord {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  raProfileUrl?: string;
  description?: string;
  createdAt: string;
}

export interface EventRequestRecord {
  id: string;
  partnerId: string;
  partnerName: string;
  title: string;
  description?: string;
  date: string;
  city: string;
  venue: string;
  genres: string[];
  lineUp: string[];
  eventType: EventType;
  priceEur?: number;
  ticketUrl?: string;
  sourceRaUrl?: string;
  status: EventRequestStatus;
  moderationNotes?: string;
  linkedEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventsBackendState {
  partners: PartnerRecord[];
  eventRequests: EventRequestRecord[];
  events: EventRecord[];
}
