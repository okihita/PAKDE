# Plan: Consolidate `pengurus` as members (Board / Struktur Pengurus)

## Problem
A koperasi's `pengurus` (ketua/sekretaris/bendahara) and `pengawas` **must be drawn from
its anggota** — they are members holding a position, not separate people. Today the app has
three disconnected notions of "pengurus":

1. `members.status_keanggotaan` — membership class; has no "pengurus" concept.
2. `local_users.role IN ('admin','operator','pengawas')` — *app auth*, not coop org.
3. `CooperativeProfile.officers` — a free-text JSON string, unlinked to any member.

Goal (confirmed with user): a **real feature** that models the board as positions referencing
`members.id`, replacing the free-text `officers`, and surfaces it in the Dashboard/Leveling
readiness signal ("Struktur pengurus minimal 3 orang").

## Approach (elegant, minimal-blast-radius)
Single source of truth = a new `pengurus` table where each row is `member_id` + `jabatan`
+ `periode`. No person PII is duplicated. The `local_users` auth table is intentionally left
alone (different concern). The `officers` free-text field is retired.

### 1. Schema — `src/db/coopDb.ts`
Add (idempotent `CREATE TABLE IF NOT EXISTS`, placed alongside the `equipment` block so
existing coops pick it up on next launch without a version migration):
```sql
CREATE TABLE IF NOT EXISTS pengurus (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  jabatan TEXT NOT NULL CHECK(jabatan IN ('ketua','sekretaris','bendahara','pengawas')),
  periode TEXT,
  status TEXT DEFAULT 'aktif' CHECK(status IN ('aktif','nonaktif')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_pengurus_member ON pengurus(member_id);
```

### 2. Types — `src/types/index.ts`
- Add `export type Jabatan = "ketua" | "sekretaris" | "bendahara" | "pengawas";`
- Add `Pengurus` interface (`id?`, `member_id`, `jabatan`, `periode?`, `status`).
- **Retire `officers`** from `CooperativeProfile` (deprecation per user): remove the field
  from the TS type and every *write* path. The legacy `officers` column in the registry DB
  is left in place (no destructive `DROP COLUMN` migration) but no longer written/read.

### 3. Remove `officers` write paths
- `src/db/registry.ts` — remove `officers` from the `INSERT` column/value list in
  `createCooperative` (leave the column itself; new rows simply omit it).
- `src/features/System/ProfileSelect/cooperativeDb.ts` — stop building `officersJson`; drop
  from the INSERT.
- `src/features/System/Settings/Settings.tsx` — stop passing `officers` in `updateCooperative`.
- `src/db/seed-demo.ts` — stop seeding the `officers` JSON; instead seed `pengurus` rows for
  the demo coop (ketua/sekretaris/bendahara referencing 3 seeded active members).

### 4. Hook — `src/hooks/usePengurus.ts` (new)
Mirror `useMembers` pattern:
- `pengurusRepo = createRepository<Pengurus>("pengurus", { createdAt: false })`.
- `loadPengurus()` → returns rows `JOIN members` for `name`/`nik` of the assigned member.
- `addPengurus`, `updatePengurus`, `removePengurus`, `countActivePengurus()`.
- Guard: a member can hold only one active jabatan (prevent double-assign).

### 5. UI — `src/features/Community/Pengurus/`
- `Pengurus.tsx` — page grouped by jabatan (Ketua / Sekretaris / Bendahara / Pengawas),
  each card shows assigned member name + periode, with edit/remove. "Tambah Pengurus"
  button opens the form. Header shows a readiness chip:
  `Struktur: {n}/3 terisi` (green check when `n >= 3`, mirroring the Leveling governance
  quest "Struktur pengurus minimal 3 orang").
- `PengurusFormDialog.tsx` — pick an **active member** (Select from `members` where
  `status='aktif'`) + `jabatan` + `periode`. Reuses `Dialog`, `Select`, `Input`, `Button`.

### 6. Navigation wiring
- `src/features/System/moduleUnlock.ts` — add `pengurus: 0` to `TABS_LEVEL_REQUIREMENTS`
  (auto-included in `TabId`).
- `src/features/System/Sidebar.tsx` — add nav item in the `komunitas` group:
  `{ id: "pengurus", icon: <UserSwitch/>, label: t("sidebar.nav.pengurus") }`.
- `src/App.tsx` — `import Pengurus`, render `{activeTab === "pengurus" && <Pengurus
  onPengurusChanged={...} />}`.

### 7. Dashboard / readiness linkage
- `Pengurus.tsx` readiness chip (above) is the primary live signal.
- `src/features/Home/Dashboard/Dashboard.tsx` — on load/refresh, read
  `countActivePengurus()`; if `>= 3`, auto-mark the Rintisan `q3` task
  ("Siapkan struktur pengurus…") done (idempotent, doesn't fight manual toggles of other
  tasks). This is the lightweight stand-in for the Leveling governance quest, which is not
  yet rendered in the UI (`leveling-data.ts` quests are currently display-only).

### 8. i18n — `src/i18n/locales/{id,en}.json`
- `sidebar.nav.pengurus`
- `pengurus.*`: `title`, `subtitle`, `add`, `jabatan`, `jabatanLabels`
  (ketua/sekretaris/bendahara/pengawas), `selectMember`, `periode`, `empty`,
  `readiness` (`Struktur: {n}/3`), `readinessDone`, `removeConfirm`, `saved`, `exists`.

## Files touched
- NEW: `src/db` (schema), `src/hooks/usePengurus.ts`,
  `src/features/Community/Pengurus/Pengurus.tsx`, `.../PengurusFormDialog.tsx`
- EDIT: `src/db/coopDb.ts`, `src/types/index.ts`, `src/db/registry.ts`,
  `src/features/System/ProfileSelect/cooperativeDb.ts`, `src/features/System/Settings/Settings.tsx`,
  `src/db/seed-demo.ts`, `src/features/System/moduleUnlock.ts`,
  `src/features/System/Sidebar.tsx`, `src/App.tsx`,
  `src/features/Home/Dashboard/Dashboard.tsx`, `src/i18n/locales/{id,en}.json`

## Verification
- `pnpm check` (lint + tsc + prettier) passes.
- `pnpm build` succeeds.
- Manual: open demo coop → Pengurus tab shows 3 seeded officers; add/remove works; assigning
  an already-assigned member is blocked; Dashboard Rintisan q3 auto-completes at ≥3; removing
  below 3 reverts the chip to incomplete.
