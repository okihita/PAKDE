import { createRegistryRepository, getRegistryDb, invalidateCoopDb } from "@/db";
import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, remove } from "@tauri-apps/plugin-fs";
import type { CooperativeProfile } from "@/types";

const coopRepo = createRegistryRepository<CooperativeProfile>("cooperatives");

export async function updateCooperative(id: string, data: Partial<CooperativeProfile>): Promise<void> {
  // Strip identity/audit columns — `id` would collide with the WHERE clause
  // and the timestamps are owned by the repository.
  const { id: _id, created_at: _created_at, updated_at: _updated_at, ...columns } = data;
  await coopRepo.update(id, columns as Record<string, unknown>);
}

export async function deleteCooperative(id: string): Promise<void> {
  const db = await getRegistryDb();
  // Operational data lives in its own file — delete it directly (children too).
  const dataDir = await appDataDir();
  const coopFile = await join(dataDir, "coops", `${id}.db`);
  if (await exists(coopFile)) await remove(coopFile);
  // Drop any cached connection so nothing writes to the deleted file.
  await invalidateCoopDb(id);
  // Coop-scoped event attachment files live under <dataDir>/<id>/events/...
  const coopFolder = await join(dataDir, id);
  if (await exists(coopFolder)) await remove(coopFolder, { recursive: true });

  // Finally drop the registry row.
  await db.execute("DELETE FROM cooperatives WHERE id = ?", [id]);
}
