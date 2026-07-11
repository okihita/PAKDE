import { createRepository } from "@/db";
import type { Jabatan, Pengurus } from "@/types";
import { emitPengurusChanged } from "@/lib/pengurusEvents";

const pengurusRepo = createRepository<Pengurus>("pengurus", { createdAt: false });

/**
 * Assign (or clear) a member's board position. A member may hold at most one
 * active position, so any existing active row for them is replaced. `jabatan`
 * of null clears the position. Emits the shared signal so the Dashboard
 * readiness quest updates instantly.
 */
export async function setMemberJabatan(memberId: string, jabatan: Jabatan | null): Promise<void> {
  await pengurusRepo.execute("DELETE FROM pengurus WHERE member_id = ? AND status = 'aktif'", [memberId]);
  if (jabatan) {
    await pengurusRepo.insert(newIdSafe(), {
      member_id: memberId,
      jabatan,
      periode: null,
      status: "aktif",
    });
  }
  emitPengurusChanged();
}

/** member_id → active jabatan, for display inside the Members feature. */
export async function getMemberJabatanMap(): Promise<Record<string, Jabatan>> {
  try {
    const rows = await pengurusRepo.select<Array<{ member_id: string; jabatan: Jabatan }>>(
      "SELECT member_id, jabatan FROM pengurus WHERE status = 'aktif'",
    );
    const map: Record<string, Jabatan> = {};
    for (const r of rows) map[r.member_id] = r.jabatan;
    return map;
  } catch {
    return {};
  }
}

/** Count of currently-active board positions — used by Dashboard readiness. */
export async function countActivePengurus(): Promise<number> {
  try {
    const rows = await pengurusRepo.select<Array<{ c: number }>>(
      "SELECT COUNT(*) as c FROM pengurus WHERE status = 'aktif'",
    );
    return rows[0]?.c ?? 0;
  } catch {
    return 0;
  }
}

/** Collision-resistant row id (kept local to avoid a wider import cycle). */
function newIdSafe(): string {
  return `pgr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
