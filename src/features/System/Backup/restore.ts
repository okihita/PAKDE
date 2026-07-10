// ── Backup reader / restore ──────────────────────────────────────
//
// Parses a `.pakde` file, decrypts it (if needed), and applies it: writes the
// coop's `coops/<uuid>.db` and INSERT OR REPLACEs its registry row. On a UUID
// collision the existing coop is replaced (restore semantics). The UUID is the
// coop's identity, so everything re-links automatically.

import { unzipSync, strFromU8 } from "fflate";
import { appDataDir, join } from "@tauri-apps/api/path";
import { writeFile, remove, exists } from "@tauri-apps/plugin-fs";
import { getRegistryDb, initRegistryDb } from "@/db/registry";
import { invalidateCoopDb, initCoopDb } from "@/db/coopDb";
import { deriveKey, decryptBytes, fromBase64 } from "./crypto";
import { BACKUP_MAGIC } from "./pack";
import type { BackupEnvelope, BackupManifest } from "./types";

export interface ParsedBackup {
  manifest: BackupManifest;
  registryRow: Record<string, unknown>;
  coopDbBytes: Uint8Array;
}

/** Split a raw file into its envelope header and encrypted/plain payload. */
export function readEnvelope(bytes: Uint8Array): { envelope: BackupEnvelope; payload: Uint8Array } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const envLen = view.getUint32(0, false);
  const envBytes = bytes.slice(4, 4 + envLen);
  const payload = bytes.slice(4 + envLen);
  const envelope = JSON.parse(new TextDecoder().decode(envBytes)) as BackupEnvelope;
  if (envelope.magic !== BACKUP_MAGIC) throw new Error("File bukan backup PAKDE yang valid.");
  return { envelope, payload };
}

/** Decrypt (if encrypted) and unzip the payload into its components. */
export async function decryptAndUnzip(
  envelope: BackupEnvelope,
  payload: Uint8Array,
  passphrase?: string,
): Promise<ParsedBackup> {
  let zip = payload;
  if (envelope.encrypted) {
    if (!envelope.kdf || !envelope.iv) throw new Error("Backup terenkripsi rusak.");
    if (!passphrase) throw new Error("PASSPHRASE_REQUIRED");
    const salt = fromBase64(envelope.kdf.salt);
    const iv = fromBase64(envelope.iv);
    const key = await deriveKey(passphrase, salt);
    try {
      zip = await decryptBytes(payload, key, iv);
    } catch {
      throw new Error("Passphrase salah atau backup rusak.");
    }
  }

  const unzipped = unzipSync(zip);
  const coopDbBytes = unzipped["coop.db"];
  if (!coopDbBytes) throw new Error("Backup tidak menyertakan coop.db.");
  const manifest = JSON.parse(strFromU8(unzipped["manifest.json"])) as BackupManifest;
  const registryRow = JSON.parse(strFromU8(unzipped["registry/cooperatives.json"]));
  return { manifest, registryRow, coopDbBytes };
}

/** Write the coop DB + registry row. Replaces an existing coop with the same UUID. */
export async function applyBackup(parsed: ParsedBackup): Promise<void> {
  const coopId = parsed.manifest.coop_id;
  if (!coopId) throw new Error("Backup tidak menyertakan coop_id.");

  // Release any open connection to this coop's DB so the file isn't locked
  // (Windows os error 32) when we overwrite it.
  await invalidateCoopDb(coopId);

  const dataDir = await appDataDir();
  const dbPath = await join(dataDir, "coops", `${coopId}.db`);
  if (await exists(dbPath)) await remove(dbPath);
  await writeFile(dbPath, parsed.coopDbBytes);

  // INSERT OR REPLACE the registry row using its dynamic columns (schema-tolerant).
  const regDb = await getRegistryDb();
  await initRegistryDb();
  const keys = Object.keys(parsed.registryRow);
  const cols = keys.map((k) => `"${k}"`).join(", ");
  const placeholders = keys.map(() => "?").join(", ");
  const values = keys.map((k) => parsed.registryRow[k]);
  await regDb.execute(`INSERT OR REPLACE INTO cooperatives (${cols}) VALUES (${placeholders})`, values);

  // Bring the restored file up to the current schema (idempotent).
  await initCoopDb(coopId);
}
