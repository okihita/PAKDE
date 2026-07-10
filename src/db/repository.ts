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
  /** INSERT a row (id auto-stamped with created_at/updated_at). */
  insert: (id: string, columns: Record<string, unknown>) => Promise<void>;
  /** UPDATE a row by id (updated_at auto-stamped). */
  update: (id: string, patch: Record<string, unknown>) => Promise<void>;
  /** DELETE a row by id. */
  remove: (id: string) => Promise<void>;
  /** Ad-hoc SELECT for queries the CRUD helpers don't cover (joins, aggregates). */
  select: <R = unknown>(sql: string, params?: unknown[]) => Promise<R>;
  /** Ad-hoc execute for multi-step operations that stay in this table's DB. */
  execute: (sql: string, params?: unknown[]) => Promise<void>;
}

export function createRepository<T extends object>(table: string, dbProvider: DbProvider = getDb): Repository<T> {
  return {
    list: async (where = "") => {
      const db = await dbProvider();
      return db.select<T[]>(`SELECT * FROM ${table} ${where}`);
    },

    insert: async (id, columns) => {
      const db = await dbProvider();
      const cols = ["id", ...Object.keys(columns), "created_at", "updated_at"];
      const placeholders = ["?", ...Object.keys(columns).map(() => "?"), "datetime('now')", "datetime('now')"];
      const values = [id, ...Object.values(columns)];
      await db.execute(`INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders.join(", ")})`, values);
    },

    update: async (id, patch) => {
      const db = await dbProvider();
      const setClause = [...Object.keys(patch).map((c) => `${c} = ?`), "updated_at = datetime('now')"].join(", ");
      await db.execute(`UPDATE ${table} SET ${setClause} WHERE id = ?`, [...Object.values(patch), id]);
    },

    remove: async (id) => {
      const db = await dbProvider();
      await db.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
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
