// ── Backup/restore types ─────────────────────────────────────────

/** Plaintext header prefixed to every backup file (before the payload). */
export interface BackupEnvelope {
  magic: "PAKDE-BACKUP";
  format: number;
  encrypted: boolean;
  kdf?: {
    algo: "PBKDF2";
    hash: "SHA-256";
    iterations: number;
    /** base64 salt used for key derivation. */
    salt: string;
  };
  /** base64 AES-GCM IV. Present only when `encrypted` is true. */
  iv?: string;
}

/** Metadata written inside the zip, used for validation and display. */
export interface BackupManifest {
  format: number;
  app_version: string;
  exported_at: string;
  coop_id: string;
  coop_name: string;
  schema_version: number;
}

export interface ExportOptions {
  encrypted: boolean;
  passphrase?: string;
}
