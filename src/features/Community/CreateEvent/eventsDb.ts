// ── Kegiatan (community events) data access ─────────────────────────────
//
// Coop-scoped event archive backed by the SQL `events` table. Replaces the
// old `localStorage` "pakde-events" array, so events now survive profile
// switching and live alongside every other entity.

import { createRepository, getCoopDb } from "@/db";
import { getActiveCoopId } from "@/db/active-coop";

const eventsRepo = createRepository<EventRow>("events");

export type EventType = "member_meeting" | "arisan" | "social" | "training" | "other";

export interface EventFileMeta {
  /** Relative path (coop-relative), e.g. "coop_id/events/evt-…/file.pdf". */
  path: string;
  name: string;
  mime: string;
  size: number;
}

export interface Kegiatan {
  id: string;
  coop_id: string;
  type: EventType;
  title: string;
  date: string;
  location: string;
  duration_min: number | null;
  participant_ids: string[];
  proposal: EventFileMeta | null;
  report: EventFileMeta | null;
  social_links: string[];
  description: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface NewEventInput {
  type: EventType;
  title: string;
  date: string;
  location: string;
  duration_min: number | null;
  participant_ids: string[];
  proposal: EventFileMeta | null;
  report: EventFileMeta | null;
  social_links: string[];
  description: string;
  notes: string;
}

interface EventRow {
  id: string;
  type: EventType;
  title: string;
  date: string;
  location: string | null;
  duration_min: number | null;
  participant_ids: string | null;
  proposal_path: string | null;
  proposal_name: string | null;
  proposal_mime: string | null;
  proposal_size: number | null;
  report_path: string | null;
  report_name: string | null;
  report_mime: string | null;
  report_size: number | null;
  social_links: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToKegiatan(r: EventRow, coopId: string): Kegiatan {
  return {
    id: r.id,
    coop_id: coopId,
    type: r.type,
    title: r.title,
    date: r.date,
    location: r.location ?? "",
    duration_min: r.duration_min,
    participant_ids: r.participant_ids ? JSON.parse(r.participant_ids) : [],
    proposal:
      r.proposal_path && r.proposal_name
        ? { path: r.proposal_path, name: r.proposal_name, mime: r.proposal_mime ?? "", size: r.proposal_size ?? 0 }
        : null,
    report:
      r.report_path && r.report_name
        ? { path: r.report_path, name: r.report_name, mime: r.report_mime ?? "", size: r.report_size ?? 0 }
        : null,
    social_links: r.social_links ? JSON.parse(r.social_links) : [],
    description: r.description ?? "",
    notes: r.notes ?? "",
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export async function listEvents(coopId: string = getActiveCoopId()): Promise<Kegiatan[]> {
  const rows = await eventsRepo.list("ORDER BY date DESC, created_at DESC");
  return rows.map((r) => rowToKegiatan(r, coopId));
}

export async function createEvent(
  coopId: string,
  data: NewEventInput,
  id: string = `evt-${crypto.randomUUID()}`,
): Promise<Kegiatan> {
  await eventsRepo.insert(id, {
    type: data.type,
    title: data.title,
    date: data.date,
    location: data.location,
    duration_min: data.duration_min,
    participant_ids: JSON.stringify(data.participant_ids),
    proposal_path: data.proposal?.path ?? null,
    proposal_name: data.proposal?.name ?? null,
    proposal_mime: data.proposal?.mime ?? null,
    proposal_size: data.proposal?.size ?? null,
    report_path: data.report?.path ?? null,
    report_name: data.report?.name ?? null,
    report_mime: data.report?.mime ?? null,
    report_size: data.report?.size ?? null,
    social_links: JSON.stringify(data.social_links),
    description: data.description,
    notes: data.notes,
  });
  const rows = await eventsRepo.select<EventRow[]>("SELECT * FROM events WHERE id = ?", [id]);
  return rowToKegiatan(rows[0], coopId);
}

export async function deleteEvent(_coopId: string, id: string): Promise<void> {
  await eventsRepo.remove(id);
}

/**
 * One-time migration of legacy `localStorage` "pakde-events" into the SQL
 * table, scoped to the currently active cooperative. Idempotent: the source
 * key is cleared on success, so a second call is a no-op.
 *
 * @returns true if any legacy events were migrated.
 */
export async function migrateLocalStorageEvents(coopId: string): Promise<boolean> {
  const raw = localStorage.getItem("pakde-events");
  if (!raw) return false;
  try {
    const legacy = JSON.parse(raw) as Array<{
      id: string;
      name: string;
      date: string;
      time: string;
      location: string;
      description: string;
      createdAt: string;
    }>;
    const db = await getCoopDb(coopId);
    for (const e of legacy) {
      await db.execute(
        `INSERT OR IGNORE INTO events (
           id, type, title, date, location, duration_min, participant_ids,
           social_links, description, notes, created_at, updated_at
         ) VALUES (?, 'other', ?, ?, ?, NULL, '[]', '[]', ?, ?, datetime('now'), datetime('now'))`,
        [e.id, e.name, e.date, e.location ?? "", e.description ?? "", ""],
      );
    }
  } catch (err) {
    console.error("[events] migration failed, leaving localStorage intact:", err);
    return false;
  }
  localStorage.removeItem("pakde-events");
  return true;
}
