// ── Backup builder ───────────────────────────────────────────────
//
// Produces a single portable `.pakde` file for one cooperative:
//
//   [ uint32 envelope-length ][ envelope JSON ][ payload ]
//
// The payload is a zip (fflate) containing manifest.json, the cooperatives
// registry row, and a consistent snapshot of the coop's SQLite file. When
// encrypted, the payload is AES-256-GCM ciphertext of that zip.
//
// The coop's random UUID is its identity (it is also the DB filename
// `coops/<uuid>.db`), so no ID remapping is needed — see ARCHITECTURE.

import { zipSync, strToU8, type Zippable } from "fflate";
import { appDataDir, join } from "@tauri-apps/api/path";
import { readFile, remove, exists } from "@tauri-apps/plugin-fs";
import { getVersion } from "@tauri-apps/api/app";
import { getCoopDb } from "@/db/coopDb";
import { getRegistryDb } from "@/db/registry";
import { deriveKey, encryptBytes, toBase64, PBKDF2_ITERATIONS } from "./crypto";
import type { BackupEnvelope, BackupManifest, ExportOptions } from "./types";

export const BACKUP_MAGIC = "PAKDE-BACKUP";
export const BACKUP_FORMAT = 1;

/** SQLite schema version stamped into the manifest for forward-compat checks. */
const COOP_SCHEMA_VERSION = 6;

function serializeFile(envelope: BackupEnvelope, payload: Uint8Array): Uint8Array {
  const envBytes = strToU8(JSON.stringify(envelope));
  const out = new Uint8Array(4 + envBytes.length + payload.length);
  new DataView(out.buffer).setUint32(0, envBytes.length, false);
  out.set(envBytes, 4);
  out.set(payload, 4 + envBytes.length);
  return out;
}

export async function buildBackup(coopId: string, opts: ExportOptions): Promise<Uint8Array> {
  // 1. Registry row (cross-cooperative metadata).
  const regDb = await getRegistryDb();
  const rows = await regDb.select<Record<string, unknown>[]>("SELECT * FROM cooperatives WHERE id = ?", [coopId]);
  if (rows.length === 0) throw new Error("Koperasi tidak ditemukan di registry.");
  const registryRow = rows[0];

  // 2. Consistent snapshot of the coop DB via VACUUM INTO (checkpoints WAL).
  const dataDir = await appDataDir();
  const coopsDir = await join(dataDir, "coops");
  const snapPath = await join(coopsDir, `_pakde_export_${coopId}.db`);
  if (await exists(snapPath)) await remove(snapPath);
  const db = await getCoopDb(coopId);
  // VACUUM INTO rejects bound parameters, so the literal path is inlined. The
  // path is fully app-controlled (no user input) and single-quote-escaped.
  const safePath = snapPath.replace(/'/g, "''");
  await db.execute(`VACUUM INTO '${safePath}'`);
  const coopDbBytes = await readFile(snapPath);
  await remove(snapPath);

  // 3. Manifest.
  const manifest: BackupManifest = {
    format: BACKUP_FORMAT,
    app_version: await getVersion(),
    exported_at: new Date().toISOString(),
    coop_id: coopId,
    coop_name: String(registryRow.name ?? ""),
    schema_version: COOP_SCHEMA_VERSION,
  };

  // 4. Zip (users already live inside the coop DB file).
  const files: Zippable = {
    "manifest.json": strToU8(JSON.stringify(manifest, null, 2)),
    "registry/cooperatives.json": strToU8(JSON.stringify(registryRow, null, 2)),
    "coop.db": coopDbBytes,
  };
  const zip = zipSync(files, { level: 6 });

  // 5. Envelope + payload.
  let envelope: BackupEnvelope = { magic: BACKUP_MAGIC, format: BACKUP_FORMAT, encrypted: false };
  let payload = zip;
  if (opts.encrypted) {
    if (!opts.passphrase) throw new Error("Passphrase wajib untuk backup terenkripsi.");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(opts.passphrase, salt);
    const cipher = await encryptBytes(zip, key, iv);
    envelope = {
      magic: BACKUP_MAGIC,
      format: BACKUP_FORMAT,
      encrypted: true,
      kdf: { algo: "PBKDF2", hash: "SHA-256", iterations: PBKDF2_ITERATIONS, salt: toBase64(salt) },
      iv: toBase64(iv),
    };
    payload = cipher;
  }

  return serializeFile(envelope, payload);
}
