# Plan: Prevent Demo Cooperative from Appearing in "Koperasi Saya"

> **Bug**: Clicking the Demo card calls `seedDemoCooperativeAtLevel()` which inserts a real row into the `cooperatives` table. Because there is no schema-level distinction between demo and real cooperatives, that row leaks into `listCooperatives()` and is therefore shown under "Koperasi Saya" alongside real coops.
>
> **Root cause**: No `is_demo` flag on the `cooperatives` table; demo-ness is only inferred via the hardcoded `DEMO_COOP_UUID` literal scattered across UI files. `listCooperatives()` does `SELECT * FROM cooperatives` with no filter.
>
> This plan does the **minimal root-cause fix** (schema separation + filtered query) plus two low-risk polish items.

---

## Context for the implementing agent

Key files and lines (verify before editing — line numbers may have drifted):

| Concern | Location |
|---|---|
| Schema / migrations | `src/db/init.ts:11` (`ensureColumn` helper), `:21` (`cooperatives` CREATE) |
| Demo seed | `src/db/seed-demo.ts:6` (`DEMO_COOP_UUID`), `:39` (`seedDemoCooperativeAtLevel`), `:47` (INSERT), `:124` (`isDemoSeeded`) |
| Coop DB helpers | `src/features/System/ProfileSelect/cooperativeDb.ts:73` (`listCooperatives`), `:78` (`getCooperativeById`) |
| TS type | `src/types/index.ts:67` (`CooperativeProfile`) |
| ProfileSelect demo enter | `src/features/System/ProfileSelect/ProfileSelect.tsx:155` (`handleDemoEnter`), `:158` |
| App.tsx auto-resume on mount | `src/App.tsx:196` (fallback `listCooperatives()[0]`), `:201` |
| App.tsx demo auto-login | `src/App.tsx:285` (`=== DEMO_COOP_UUID`) — **leave as-is** |
| Settings demo reset | `src/features/System/Settings/Settings.tsx:101` (`=== DEMO_COOP_UUID`), `:140` (`handleResetDemo` hardcodes `"lanjutan"`) |
| mock member seeder (under demo uuid) | `src/data/seed-members.ts:205` |

`DEMO_COOP_UUID` is referenced in 5 files. The literal comparisons in `App.tsx` and `Settings.tsx` are **not** the bug — they answer "is the current session the demo?" and `Settings.tsx:388-407` switches its destructive-action UI accordingly. Replacing them is **optional cleanup, not required** for the fix.

---

## Scope

### Required (the bug fix)
1. Add schema column `is_demo INTEGER NOT NULL DEFAULT 0`.
2. Mark the seeded demo row with `is_demo = 1`.
3. Filter `listCooperatives()` (and the App.tsx mount fallback) to exclude demo rows so "Koperasi Saya" only shows real coops.
4. Provide a separate accessor for the demo coop so the demo-enter flow still resolves it.
5. Reflect the column on the `CooperativeProfile` TS type.

### Optional polish (do not block on review; ship if trivial)
6. Persist chosen demo tier so "Reset Demo" restores the user's tier instead of always `"lanjutan"`.
7. Centralize the "is this the demo?" check behind a small helper to stop UUID-literal duplication.
8. Wrap `seedDemoCooperativeAtLevel` in a transaction.

**Explicitly out of scope**: redesigning demo data, adding wik/transactional cascade FKs, refactoring the Settings demo UI. Keep the diff small.

---

## Step-by-step

### Step 1 — Add the `is_demo` column (`src/db/init.ts`)

Right after the `cooperatives` CREATE TABLE block (after line ~29), add a forward-compatible migration using the existing `ensureColumn` helper:

```ts
await ensureColumn("cooperatives", "is_demo INTEGER NOT NULL DEFAULT 0", "is_demo");
```

Place it next to the other `ensureColumn(...)` calls in `initDb` (search the file for `ensureColumn(` and append one alongside them; ordering relative to existing ones does not matter).

No re-creation, no data backfill needed — default 0 is correct for all existing real rows.

### Step 2 — Seed the demo row with `is_demo = 1` (`src/db/seed-demo.ts`)

In `seedDemoCooperativeAtLevel` (line ~47), extend the INSERT statement to set the column explicitly:

```ts
await db.execute(
  `INSERT INTO cooperatives (id, name, regency, province, level, business_units, officers, status, founded_date, category, is_demo)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
  [ /* existing 10 params unchanged */ ],
);
```

Why explicit: guarantees the flag is on even on databases where the row is re-inserted after a partial state, and documents intent at the write site.

### Step 3 — Extend the TS type (`src/types/index.ts`)

Add to `CooperativeProfile` (line ~67):

```ts
is_demo?: number; // 0 = real, 1 = demo. Optional for legacy test rows.
```

`number` (not `boolean`) because SQLite stores integers and the rest of the codebase uses numeric booleans (see `EwsAlert.is_active: number` at `types/index.ts:106`).

### Step 4 — Filter the real-coop list (`src/features/System/ProfileSelect/cooperativeDb.ts`)

Modify `listCooperatives()` (line 73):

```ts
export async function listCooperatives(): Promise<CooperativeProfile[]> {
  const db = await getDb();
  return db.select<CooperativeProfile[]>(
    "SELECT * FROM cooperatives WHERE is_demo = 0 ORDER BY created_at DESC",
  );
}
```

Add a new dedicated accessor for the demo (used by the demo-enter flow):

```ts
/** Returns the seeded demo cooperative, or null if not yet seeded. */
export async function getDemoCooperative(): Promise<CooperativeProfile | null> {
  const db = await getDb();
  const rows = await db.select<CooperativeProfile[]>(
    "SELECT * FROM cooperatives WHERE is_demo = 1 LIMIT 1",
  );
  return rows.length > 0 ? rows[0] : null;
}
```

Keep `getCooperativeById()` unfiltered — it is used by `App.tsx` auto-resume to honor an explicitly saved active-profile id (which may legitimately be the demo).

### Step 5 — Update the demo-enter flow (`src/features/System/ProfileSelect/ProfileSelect.tsx`)

In `handleDemoEnter` (line ~155) replace `getCooperativeById(DEMO_COOP_UUID)` with the new `getDemoCooperative()`:

```ts
import { seedDemoCooperativeAtLevel, type DemoLevel } from "@/db/seed-demo";
import { getDemoCooperative } from "./cooperativeDb";

const handleDemoEnter = async (level: DemoLevel) => {
  try {
    await seedDemoCooperativeAtLevel(level);
    const coop = await getDemoCooperative();
    if (coop) {
      sfx.playChime();
      setTimeout(() => onProfileSelect(coop), 280);
    }
  } catch (e) {
    console.error("[Demo] Failed:", e);
    setDevResult({ open: true, ok: false, message: e instanceof Error ? e.message : String(e) });
  }
};
```

Drop the now-unused `DEMO_COOP_UUID` import from this file (it is no longer referenced here — verify with a grep before removing). The `getCooperativeById` import may also become unused; prune it if so.

### Step 6 — Patch the App.tsx auto-resume fallback (`src/App.tsx`)

The block at lines ~196-204 has a SECOND leak path: when no `pakde-active-profile-id` is set, it does `listCooperatives()` and resumes into `profiles[0]`. After Step 4 that query is already filtered, so this line requires **no code change** — but verify by re-reading after the Step 4 edit. The behavior we want:

- No saved active id + real coops exist → resume into the most recent real coop. ✅ (filtered list)
- No saved active id + only the demo exists → `profiles.length === 0` → fall through to profile-select. ✅

If for any reason `listCooperatives()` is also imported from a different module path (check usages with a grep), confirm all call sites now intend "real coops only". Anywhere that genuinely wants "all coops including demo" should call a new `listAllCooperatives()` (add only if such a caller exists; none currently does).

### Step 7 — Update `isDemoSeeded()` in `src/db/seed-demo.ts` (line 124) — optional

Switch it from id-equality to flag-equality for consistency:

```ts
export async function isDemoSeeded(): Promise<boolean> {
  const db = await getDb();
  const rows = await db.select<Array<{ id: string }>>(
    "SELECT id FROM cooperatives WHERE is_demo = 1 LIMIT 1",
  );
  return rows.length > 0;
}
```

Trivial and improves correctness if a future ever changes the demo UUID. Not strictly required.

---

## Polish items (optional)

### P1 — Persist the chosen demo tier

`Settings.handleResetDemo` hardcodes `"lanjutan"` (`Settings.tsx:143`). On reset, a `pemula`/`menengah` user loses their tier.

- In `ProfileSelect.handleDemoEnter`, after a successful seed, store `localStorage.setItem("pakde-demo-tier", level)`.
- In `Settings.handleResetDemo`, read `localStorage.getItem("pakde-demo-tier") ?? "lanjutan"` and pass that to `seedDemoCooperativeAtLevel`.
- Clear the key in `clearDemoCooperative()`? No — keep it; it represents user preference, not state.

### P2 — Centralize the "is this demo?" predicate

Add to `src/db/seed-demo.ts`:

```ts
export const isDemoCooperative = (p?: { is_demo?: number } | null): boolean =>
  !!p && p.is_demo === 1;
```

Replace `coopProfile?.id === DEMO_COOP_UUID` in `Settings.tsx:101` and `App.tsx:285` with `isDemoCooperative(coopProfile)`. Keep the `DEMO_COOP_UUID` export — `ProfileSelect` still uses it indirectly and tests may reference it.

### P3 — Wrap the seed in a transaction

`seedDemoCooperativeAtLevel` runs ~30+ statements with no transaction. A mid-run crash leaves a half-seeded coop. Wrap clear+insert+seed calls in `db.execute("BEGIN")` … `COMMIT` with a `catch` that does `ROLLBACK`. Verify the `getDb()` client supports nested-transaction semantics inline (it does — sqlite.serialize callbacks are not in use here; the helper returns a sql.js / Tauri plugin DB whose `.execute` is awaitable).

---

## Verification (do NOT skip)

The implementing agent must demonstrate correctness before declaring done.

1. **Build / typecheck**: run whatever the repo uses (likely `pnpm tsc --noEmit` or `pnpm build`). No new TS errors.

2. **Migration sanity** — start the app once on an existing DB (with a real coop already created + the demo previously seeded). Then:
   - Open Settings → confirm real coop shows "Delete Cooperative" path, demo session (if active) shows "Reset Demo" path.
   - SQLite check (run via the devtools / a throwaway script):
     ```sql
     SELECT id, name, is_demo FROM cooperatives;
     ```
     Real rows have `is_demo = 0`, demo row `is_demo = 1`.

3. **Bug repro** — the exact reported scenario:
   - With demo previously seeded AND zero real coops created → open ProfileSelect → click "Koperasi Saya" (the "Masuk" link) → the demo must NOT appear in the coop list. List should be empty / show the "no profiles" empty state.
   - Then click "Coba Demo" → still works, tier cards render, selecting a tier enters the demo session and lands on the dashboard as before.

4. **Real coop creation** — create a real coop, then open ProfileSelect → "Koperasi Saya" → lists the real coop, never lists the demo. Logout/switch-profile loops work.

5. **Auto-resume** — with no `pakde-active-profile-id` in localStorage and the demo already seeded (no real coops): launching the app must NOT silently resume into the demo. It should land on ProfileSelect. (Confirms Step 6 leak is closed.)

6. **App reset behavior** (only if P1 is implemented):
   - Enter demo as `pemula`, navigate, then Settings → Reset Demo → confirm the coop comes back with the `pemula` inventory set (only `item_urea`, `item_npk`), not the `lanjutan` set.

7. **No regression in Settings demo path** — Settings "Reset Demo" still reseeds and reloads; "Delete Cooperative" still only appears for real coops.

8. Provide a git diff review summarizing touched files; the diff should be small (target: ≤ ~6 files, mostly `seed-demo.ts`, `cooperativeDb.ts`, `init.ts`, `types/index.ts`, `ProfileSelect.tsx`, optionally `Settings.tsx`/`App.tsx`).

---

## Definition of done

- `SELECT * FROM cooperatives WHERE is_demo = 0` returns only real coops in every existing scenario.
- The "Koperasi Saya" list never contains the demo cooperative under any sequence of user actions.
- The demo-enter flow still resolves and resumes the demo session as before.
- All verification steps above pass; agent posts the SQL query output and a screenshot/log of the bug-repro step proving the list is empty when only the demo is seeded.