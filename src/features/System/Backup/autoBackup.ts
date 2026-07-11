// ── Unattended local auto-backup ─────────────────────────────────
//
// Silently snapshots the active cooperative into a private app-data directory
// on a schedule, so a crash or bad manual restore can't wipe a coop's history.
// Reuses the exact same portable `.pakde` writer as the manual Export, just
// stamps files into <appDataDir>/backups/auto/<coopId>/ and prunes old ones.

import { appDataDir, join } from "@tauri-apps/api/path";
import { readFile, writeFile, exists, mkdir, remove, readDir } from "@tauri-apps/plugin-fs";
import { buildBackup } from "./pack";
import { readEnvelope, decryptAndUnzip, applyBackup } from "./restore";

export const AUTO_BACKUP_ENABLED_KEY = "pakde-auto-backup-enabled";
export const AUTO_BACKUP_RETENTION = 7;
export const AUTO_BACKUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

/** Default ON; only an explicit "false" disables it. */
export function isAutoBackupEnabled(): boolean {
  return localStorage.getItem(AUTO_BACKUP_ENABLED_KEY) !== "false";
}

export function setAutoBackupEnabled(value: boolean): void {
  localStorage.setItem(AUTO_BACKUP_ENABLED_KEY, value ? "true" : "false");
}

export interface AutoBackupEntry {
  path: string;
  date: Date;
  label: string;
}

/**
 * Compact, lexically-sortable timestamp safe for filenames on every OS
 * (e.g. "20260711071743123" = yyyyMMddHHmmssSSS). No ':' or other reserved chars.
 */
function stamp(): string {
  const d = new Date();
  const p = (n: number, w: number) => String(n).padStart(w, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1, 2)}${p(d.getDate(), 2)}` +
    `${p(d.getHours(), 2)}${p(d.getMinutes(), 2)}${p(d.getSeconds(), 2)}${p(d.getMilliseconds(), 3)}`
  );
}

function parseStamp(s: string): Date {
  const m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{3})$/.exec(s);
  if (!m) return new Date(0);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6]), Number(m[7]));
}

async function coopAutoBackupDir(coopId: string): Promise<string> {
  const dataDir = await appDataDir();
  const dir = await join(dataDir, "backups", "auto", coopId);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  return dir;
}

/** Take one unencrypted snapshot and prune to the newest `AUTO_BACKUP_RETENTION`. */
export async function takeAutoBackup(coopId: string): Promise<void> {
  if (!coopId) return;
  const bytes = await buildBackup(coopId, { encrypted: false });
  const dir = await coopAutoBackupDir(coopId);
  await writeFile(await join(dir, `pakde-auto-${stamp()}.pkd`), bytes);
  await pruneAutoBackups(coopId);
}

/** Keep only the newest `AUTO_BACKUP_RETENTION` snapshots for a coop. */
async function pruneAutoBackups(coopId: string): Promise<void> {
  const entries = await listAutoBackups(coopId);
  const excess = entries.slice(AUTO_BACKUP_RETENTION); // oldest first
  await Promise.all(excess.map((e) => remove(e.path)));
}

/** Newest-first list of available auto-backups for a coop. */
export async function listAutoBackups(coopId: string): Promise<AutoBackupEntry[]> {
  if (!coopId) return [];
  const dir = await coopAutoBackupDir(coopId);
  const items = await readDir(dir);
  const files = await Promise.all(
    items
      .filter((f) => f.name?.startsWith("pakde-auto-") && f.name.endsWith(".pkd"))
      .map(async (f) => {
        const name = f.name ?? "";
        const raw = name.slice("pakde-auto-".length, -".pkd".length);
        return {
          path: await join(dir, name),
          date: parseStamp(raw),
          label: name,
        } satisfies AutoBackupEntry;
      }),
  );
  return files.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/** Restore a previously taken auto-backup (always unencrypted, no passphrase). */
export async function restoreAutoBackup(filePath: string): Promise<void> {
  const bytes = await readFile(filePath);
  const { envelope, payload } = readEnvelope(bytes);
  const parsed = await decryptAndUnzip(envelope, payload);
  await applyBackup(parsed);
  localStorage.setItem("pakde-active-profile-id", parsed.manifest.coop_id);
}
