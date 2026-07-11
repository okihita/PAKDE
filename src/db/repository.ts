// ── Generic per-table data access ──────────────────────────────
//
// Every feature hook re-implements the same shape: open the active coop DB,
// run a SELECT/INSERT/UPDATE/DELETE, and (on updates) stamp `updated_at`.
// This factory owns that boilerplate so hooks stay focused on validation and
// toasts (single responsibility). Timestamps follow the codebase convention:
// `created_at`/`updated_at` are stamped with `datetime('now')` server-side.
//
// Note: `datetime('now')` must be inlined as SQL, not bound as a parameter,
// so timestamps are appended as literal expressions rather than `?` values.

import { getDb } from "./coopDb";
import { getRegistryDb } from "./registry";
import type Database from "@tauri-apps/plugin-sql";

/** Provider that resolves the Database a repository operates on. Defaults to the active coop DB. */
export type DbProvider = () => Promise<Database>;

/** Generate a collision-resistant row id with a table-specific prefix. */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface Repository<T extends object> {
  /** SELECT * FROM <table> <where> */
  list: (where?: string) => Promise<T[]>;
  /** INSERT a row (id + configured timestamp columns auto-stamped). */
  insert: (id: string, columns: Record<string, unknown>) => Promise<void>;
  /** UPDATE a row by id (updated_at auto-stamped when configured). */
  update: (id: string, patch: Record<string, unknown>) => Promise<void>;
  /** DELETE a row by id. */
  remove: (id: string) => Promise<void>;
  /** Ad-hoc SELECT for queries the CRUD helpers don't cover (joins, aggregates). */
  select: <R = unknown>(sql: string, params?: unknown[]) => Promise<R>;
  /** Ad-hoc execute for multi-step operations that stay in this table's DB. */
  execute: (sql: string, params?: unknown[]) => Promise<void>;
}

export interface RepoOptions {
  /** DB connection provider. Defaults to the active cooperative DB. */
  dbProvider?: DbProvider;
  /**
   * Name of the primary-key column. Defaults to `"id"`, but some tables use a
   * different key (e.g. `simpanan_anggota.simpanan_ref`, `coa_accounts.code`),
   * and the generic CRUD must target the real column.
   */
  idColumn?: string;
  /**
   * Column stamped on insert. Pass `false` for tables without one
   * (e.g. `categories`). Defaults to `"created_at"`.
   */
  createdAt?: string | false;
  /**
   * Column stamped on every update. Pass `false` for tables without one
   * (e.g. `local_users`, `layout_zones`). Defaults to `"updated_at"`.
   */
  updatedAt?: string | false;
}

/**
 * Single gateway for per-table CRUD. Feature code depends on this abstraction
 * (Dependency Inversion), never on the raw Tauri `Database`. Timestamps are
 * stamped with SQLite `datetime('now')` — the one canonical "now" for the app —
 * so every write shares the same clock convention.
 */
export function createRepository<T extends object>(table: string, options: RepoOptions = {}): Repository<T> {
  const { dbProvider = getDb, idColumn = "id", createdAt = "created_at", updatedAt = "updated_at" } = options;

  return {
    list: async (where = "") => {
      const db = await dbProvider();
      return db.select<T[]>(`SELECT * FROM ${table} ${where}`);
    },

    insert: async (id, columns) => {
      const db = await dbProvider();
      const cols = [idColumn];
      const placeholders = ["?"];
      const values: unknown[] = [id];
      if (createdAt) {
        cols.push(createdAt);
        placeholders.push("datetime('now')");
      }
      for (const [key, value] of Object.entries(columns)) {
        cols.push(key);
        placeholders.push("?");
        values.push(value);
      }
      if (updatedAt) {
        cols.push(updatedAt);
        placeholders.push("datetime('now')");
      }
      await db.execute(`INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders.join(", ")})`, values);
    },

    update: async (id, patch) => {
      const db = await dbProvider();
      const setParts = Object.keys(patch).map((c) => `${c} = ?`);
      if (updatedAt) setParts.push(`${updatedAt} = datetime('now')`);
      await db.execute(`UPDATE ${table} SET ${setParts.join(", ")} WHERE ${idColumn} = ?`, [
        ...Object.values(patch),
        id,
      ]);
    },

    remove: async (id) => {
      const db = await dbProvider();
      await db.execute(`DELETE FROM ${table} WHERE ${idColumn} = ?`, [id]);
    },

    select: async <R = unknown>(sql: string, params: unknown[] = []) => {
      const db = await dbProvider();
      return db.select<R>(sql, params);
    },

    execute: async (sql: string, params: unknown[] = []) => {
      const db = await dbProvider();
      await db.execute(sql, params);
    },
  };
}

/** Repository over the active cooperative's operational DB (the default). */
export function createCoopRepository<T extends object>(
  table: string,
  options?: Omit<RepoOptions, "dbProvider">,
): Repository<T> {
  return createRepository<T>(table, options);
}

/** Repository over the cross-cooperative `registry.db` (the `cooperatives` table). */
export function createRegistryRepository<T extends object>(
  table: string,
  options?: Omit<RepoOptions, "dbProvider">,
): Repository<T> {
  return createRepository<T>(table, { dbProvider: getRegistryDb, ...options });
}
