import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const partnersTable = sqliteTable("partners", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  contactEmail: text("contact_email").notNull(),
  raProfileUrl: text("ra_profile_url"),
  description: text("description"),
  createdAt: text("created_at").notNull(),
});

export const eventsTable = sqliteTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  city: text("city").notNull(),
  venue: text("venue").notNull(),
  organizer: text("organizer").notNull(),
  genres: text("genres").notNull(), // JSON array
  lineUp: text("line_up").notNull(), // JSON array
  eventType: text("event_type").notNull(),
  priceEur: integer("price_eur"),
  ticketUrl: text("ticket_url"),
  origin: text("origin").notNull(),
  status: text("status").notNull(),
  source: text("source").notNull(), // JSON object
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const eventRequestsTable = sqliteTable("event_requests", {
  id: text("id").primaryKey(),
  partnerId: text("partner_id").notNull(),
  partnerName: text("partner_name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  city: text("city").notNull(),
  venue: text("venue").notNull(),
  genres: text("genres").notNull(), // JSON array
  lineUp: text("line_up").notNull(), // JSON array
  eventType: text("event_type").notNull(),
  priceEur: integer("price_eur"),
  ticketUrl: text("ticket_url"),
  sourceRaUrl: text("source_ra_url"),
  status: text("status").notNull(),
  moderationNotes: text("moderation_notes"),
  linkedEventId: text("linked_event_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

const DB_KEY = "__COOLDOWN_EVENTS_DB__";

type DbInstance = ReturnType<typeof drizzle>;

function getDb(): DbInstance {
  const globalWithDb = globalThis as typeof globalThis & {
    [DB_KEY]?: DbInstance;
  };

  if (!globalWithDb[DB_KEY]) {
    const dbPath =
      process.env.EVENTS_DB_PATH ??
      path.join(process.cwd(), "data", "events.db");

    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    const sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");

    const db = drizzle(sqlite);
    globalWithDb[DB_KEY] = db;
    initSchema(sqlite);
  }

  return globalWithDb[DB_KEY] as DbInstance;
}

function initSchema(sqlite: Database.Database): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS partners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      contact_email TEXT NOT NULL,
      ra_profile_url TEXT,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      city TEXT NOT NULL,
      venue TEXT NOT NULL,
      organizer TEXT NOT NULL,
      genres TEXT NOT NULL,
      line_up TEXT NOT NULL,
      event_type TEXT NOT NULL,
      price_eur INTEGER,
      ticket_url TEXT,
      origin TEXT NOT NULL,
      status TEXT NOT NULL,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS event_requests (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL,
      partner_name TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      city TEXT NOT NULL,
      venue TEXT NOT NULL,
      genres TEXT NOT NULL,
      line_up TEXT NOT NULL,
      event_type TEXT NOT NULL,
      price_eur INTEGER,
      ticket_url TEXT,
      source_ra_url TEXT,
      status TEXT NOT NULL,
      moderation_notes TEXT,
      linked_event_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Migrations for existing databases
  try { sqlite.exec(`ALTER TABLE partners ADD COLUMN description TEXT`); } catch { /* column exists */ }
}

export { getDb };
