# Plan: Gamification — XP Sources & Economic Readiness Alignment (Hackathon Demo)

**Goal:** Make PAKDE's gamification (a) visibly multi-source (wire the dead XP
actions) and (b) defensibly meaningful — every progression tier is anchored to
an **Economic Readiness Level (ERL) 1–9** mapped onto internationally recognized
maturity frameworks, so a co-op's rank is comparable beyond Indonesia.

**Constraints:** Dead simple. No new architecture, no background timers, no new
backend. XP sources map to natural, already-existing user actions so they are
demoable in seconds. Abuse guards (`REQUIRE_VERIFICATION`, `DAILY_XP_CAP`) stay
OFF — this is a demo.

---

## Part 1 — Economic Readiness Level (ERL) 1–9 Alignment

### Design decisions
- **Multi-standard synthesis, not a single standard.** ERL 1–9 is the PAKDE-native
  band; each band names its equivalent point on three public frameworks so the
  label is "internationally compatible" without inventing metrics.
- **Overlay, not renumber.** The existing 10 XP tiers (Rintisan→Teladan) stay.
  Each tier is *tagged* with its ERL band. No churn to XP, scoring, or module
  unlock.
- **Descriptors drafted in cooperative context** (below), mapped to the intent
  of the three anchor standards.

### Anchor frameworks

| Abbrev | Framework | Origin | What 1→9 means |
|--------|-----------|--------|----------------|
| **IRL** | Investment Readiness Level | European Commission / EIC | Ability to absorb investment: team → scale-up/exit-ready |
| **TRL·MRL** | Technology / Market Readiness Level | ISO 16290 / NASA | Concept → proven & operating in real market |
| **CMM** | Cooperative Maturity Model | Synthesized from ICA / GIZ / KfW coop-development stages | Informal group → exemplary model coop |

> A co-op does not need to "pass" all three; ERL is the *convergence* band — when
> a co-op sits at, say, ERL 5 on the PAKDE curve, it is broadly comparable to
> IRL 5 / TRL·MRL 6–7 / CMM 5 elsewhere.

### ERL 1–9 (drafted, cooperative context)

| ERL | PAKDE name (En / Id) | Drafted descriptor (En) | Drafted descriptor (Id) | IRL | TRL·MRL | CMM |
|-----|----------------------|-------------------------|-------------------------|-----|---------|-----|
| 1 | Nascent / Embrio | Idea stage; members gather and save informally, no legal entity. | Gagasan; anggota berkumpul dan menabung secara informal, belum berbadan hukum. | 1 | 1–2 | 1 |
| 2 | Founded / Berbadan Hukum | Legally established with AD/ART and first members; no core services yet. | Berdiri resmi dengan AD/ART dan anggota pertama; layanan inti belum ada. | 2 | 3 | 2 |
| 3 | Operational / Beroperasi | Basic services running (savings & loan) with simple bookkeeping; daily ops active. | Layanan dasar berjalan (simpan pinjam) dengan pembukuan sederhana; operasi harian aktif. | 3 | 4–5 | 3 |
| 4 | Productive / Produktif | Business units generate income; regular savings & loan; healthy liquidity. | Unit usaha menghasilkan pendapatan; simpan pinjam teratur; likuiditas sehat. | 4 | 5–6 | 4 |
| 5 | Established / Mapan | Stable ops, healthy financial ratios, multiple services, on-time reporting. | Operasi stabil, rasio keuangan sehat, multi-layanan, laporan tepat waktu. | 5 | 6–7 | 5 |
| 6 | Resilient / Tangguh | Strong risk management, full compliance, no warnings, active supervision. | Manajemen risiko kuat, kepatuhan penuh tanpa teguran, pengawas aktif. | 6 | 7 | 6 |
| 7 | Advanced / Maju | Multiple profitable units, professional governance, certified management. | Banyak unit usaha untung, tata kelola profesional, pengurus bersertifikat. | 7 | 8 | 7 |
| 8 | Innovative / Inovatif | Technology adoption & innovative business models with internal controls. | Adopsi teknologi & model bisnis inovatif dengan pengendalian internal. | 8 | 8–9 | 8 |
| 9 | Transformational / Teladan | Exemplary coop, peak health score, national reference, sustainable. | Koperasi teladan, skor kesehatan puncak, rujukan nasional, berkelanjutan. | 9 | 9 | 9 |

### Overlay onto the 10 PAKDE tiers

The 10 XP tiers map onto the 9 ERL bands (tiers 9 & 10 both reach the top band;
tier 10 is the "with distinction" apex).

| PAKDE tier | Name | ERL |
|-----------|------|-----|
| 1 | Rintisan | 1 |
| 2 | Pemula | 2 |
| 3 | Bertumbuh | 3 |
| 4 | Produktif | 4 |
| 5 | Mapan | 5 |
| 6 | Tangguh | 6 |
| 7 | Maju | 7 |
| 8 | Inovatif | 8 |
| 9 | Modern | 9 |
| 10 | Teladan | 9 (Exemplary / "+") |

### ERL implementation

**New data module — `src/data/readiness.ts`** (mirrors `leveling-data.ts`: labels
kept in TS, not i18n files, so components read `nameEn`/`nameId` directly):

```ts
export interface ERLLevel {
  level: number;            // 1–9
  nameEn: string;
  nameId: string;
  descEn: string;
  descId: string;
  irl: string;              // anchor text, e.g. "IRL 5 — investment/financial model"
  trlMrl: string;
  cmm: string;
  pakdeTiers: number[];     // which XP tiers map here
}

export const ECONOMIC_READINESS_LEVELS: ERLLevel[] = [ /* 9 entries from table above */ ];

/** Resolve the ERL band for a PAKDE XP tier (1–10), clamped to 1–9. */
export function getErlForTier(tier: number): ERLLevel {
  return (
    ECONOMIC_READINESS_LEVELS.find((e) => e.pakdeTiers.includes(tier)) ??
    ECONOMIC_READINESS_LEVELS[ECONOMIC_READINESS_LEVELS.length - 1]
  );
}
```

**UI — surface the ERL band:**
- `src/features/Learn/Leveling/Leveling.tsx` (header): render
  `getErlForTier(currentLevel.tier)` as a pill next to the tier label, e.g.
  `ERL 5 · Mapan`. Add a tooltip/hover listing the three anchor strings
  (`irl`, `trlMrl`, `cmm`) so the international alignment is explicit.
- `src/features/Home/Dashboard/Dashboard.tsx` (coop status strip): show the ERL
  band alongside health/XP, e.g. `ERL 3 · Beroperasi`.
- Names switch en/id via the existing `isId` locale flag (same mechanism as
  `leveling-data.ts`).

**No i18n churn:** names/descriptors live in `readiness.ts` as
`nameEn/nameId/descEn/descId`, matching `leveling-data.ts`. The anchor labels
(IRL/TRL·MRL/CMM) are static framework abbreviations shown as-is.

---

## Part 2 — Wire Remaining XP Sources

### Scope decision (read this first)
We wire **`trade_completed`** and **`weekly_active`** only. **`member_verified`
is intentionally NOT wired in this pass.**

Rationale: the member-add flow (`useMembers.ts:195`) already requires a valid
NIK (`isValidNik`) before insert, so every successful add would emit *both*
`member_joined` (+5) and `member_verified` (+2) on the exact same action. The two
sources would be indistinguishable in the feed and the "+7 on add" looks like one
event arbitrarily split — confusing, not a clean demo of "multi-source". The
source row stays in `xp-core.ts` (harmless data, no test impact) for a future
real verification gate. The two genuinely distinct new triggers below already
make the feed multi-source (add → sale → button).

### 1. `trade_completed` (+3 XP) — POS sale
**Trigger:** a successful `processCheckout` in `src/hooks/useSales.ts`.
**Why correct placement:** `processCheckout` commits the sale (inventory,
journal, balances), then at line 244 calls `toast.success(...)`, clears the cart,
reloads lists, and `return true` at line 249 — *all inside the `try`*. Fire the
award **after** the DB commits but before `return true` (i.e. right after
`toast.success`, ~line 244). Do NOT put it before the commits or a failed sale
could still grant XP.

**Wiring (`src/hooks/useSales.ts`):**
- Add imports (currently absent):
  ```ts
  import { getActiveCoopId } from "@/db/active-coop";
  import { awardXp } from "@/data/xp";
  ```
- Insert, guarded, after `toast.success(t("sales.toast.checkoutSuccess"));`:
  ```ts
  try {
    await awardXp(getActiveCoopId(), "trade_completed", { txId });
  } catch (e) {
    console.error("trade_completed XP award failed:", e);
  }
  ```
  `txId` is already in scope (line 144). A guard failure must never break the
  sale or its return value, so the try/catch swallows it. `awardXp` is awaited so
  the new total is persisted before `processCheckout` resolves.

Demo: Sales → checkout a cart → XP +3; Leveling feed shows
"Cooperative completes a trade" / "Koperasi menyelesaikan transaksi".

### 2. `weekly_active` (+1 XP) — manual weekly check-in
**Trigger:** user clicks a "Claim Weekly Bonus" button on Beranda (Home).
**Why manual:** a real weekly timer can't be demoed on demand; a button is
on-demand, no background process, and still demonstrates the source.

**Helper (`src/data/xp.ts`)** — add `canClaimWeeklyXp`:
```ts
/** ISO week key, e.g. "2026-W28". Used to gate once-per-week claims. */
function getIsoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon = 0
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // Thursday of this week
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      (d.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7),
    ) / 7;
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** True when the co-op has no `weekly_active` event this ISO week. */
export async function canClaimWeeklyXp(coopId: string): Promise<boolean> {
  if (!coopId) return false;
  const events = await getXpEvents(coopId);
  const last = [...events].reverse().find((e) => e.action === "weekly_active");
  if (!last) return true;
  return getIsoWeek(new Date(last.createdAt)) !== getIsoWeek(new Date());
}
```
`getXpEvents` is already exported (`xp.ts:144`), so no new dependency.

**Dashboard button (`src/features/Home/Dashboard/Dashboard.tsx`):**
- Add imports (currently absent):
  ```ts
  import { getActiveCoopId } from "@/db/active-coop";
  import { awardXp, canClaimWeeklyXp } from "@/data/xp";
  ```
- Extend the props: `export default function Dashboard({ healthScore = 0, xp = 0, onXpChange }: { healthScore?: number; xp?: number; onXpChange?: () => void })`.
- Local state + effect:
  ```ts
  const [canClaimWeekly, setCanClaimWeekly] = useState(false);
  const [claimingWeekly, setClaimingWeekly] = useState(false);
  useEffect(() => {
    const id = getActiveCoopId();
    canClaimWeeklyXp(id).then(setCanClaimWeekly).catch(() => setCanClaimWeekly(false));
  }, [xp]); // xp changes when App refreshes the profile after a claim
  ```
- Handler:
  ```ts
  const claimWeeklyXp = async () => {
    const id = getActiveCoopId();
    if (!id || claimingWeekly || !canClaimWeekly) return;
    setClaimingWeekly(true);
    try {
      await awardXp(id, "weekly_active");
      toast.success(t("beranda.weeklyXpToast"));
      setCanClaimWeekly(false);   // optimistic lock until next week
      onXpChange?.();              // refresh App's coopProfile.xp
    } catch (e) {
      console.error("weekly_active XP award failed:", e);
    } finally {
      setClaimingWeekly(false);
    }
  };
  ```
- Place the button in a dedicated card (see Files touched). Use
  `t("beranda.weeklyXp")` for the label; disable it when `!canClaimWeekly ||
  claimingWeekly` and show `t("beranda.weeklyXpClaimed")` as its disabled label.

**Refresh story (critical):** The Leveling tab reads XP from `coopProfile.xp`
via `App.tsx` (`<Leveling xp={coopProfile?.xp ?? 0} />`), and `XpFeed`
re-fetches whenever that `xp` value changes (`Leveling.tsx` `refreshKey={xp}`).
So after a claim, `Dashboard` must push a refresh up to `App`. Wire it in
`App.tsx`: `<Dashboard ... xp={coopProfile?.xp ?? 0} onXpChange={refreshMemberCount} />`.
`refreshMemberCount` already re-reads `cooperatives.xp` from the
registry and updates `coopProfile`, so the Leveling strip + feed update with no
new code in `App` beyond the prop pass.

Demo: click once → XP +1, button greys out until next ISO week; open Leveling →
feed shows "Weekly active member" / "Anggota aktif mingguan".

### Files touched

| File | Exact change |
|------|--------------|
| `src/data/readiness.ts` | **NEW.** `ERLLevel` interface, `ECONOMIC_READINESS_LEVELS` (9 entries), `getErlForTier(tier)`. |
| `src/data/xp.ts` | Add `getIsoWeek` + `canClaimWeeklyXp(coopId)` (exported). No change to `awardXp`/`XP_SOURCES`. |
| `src/hooks/useSales.ts` | Add `getActiveCoopId` + `awardXp` imports; guarded `awardXp(getActiveCoopId(), "trade_completed", { txId })` after `toast.success` (~line 244). |
| `src/features/Home/Dashboard/Dashboard.tsx` | Add `getActiveCoopId` + `awardXp`/`canClaimWeeklyXp` imports; `onXpChange?` prop; `canClaimWeekly`/`claimingWeekly` state + effect; `claimWeeklyXp` handler; ERL band in status strip; new `weeklyxp` card with the button. |
| `src/features/Home/Dashboard/Dashboard.tsx` (`DEFAULT_CARDS`) | Add `"weeklyxp"` to `DEFAULT_CARDS` so the new card appears by default and survives the drag-order merge. |
| `src/features/Learn/Leveling/Leveling.tsx` | Render `getErlForTier(currentLevel.tier)` pill + hover anchors in header. |
| `src/App.tsx` | Pass `onXpChange={refreshMemberCount}` to `<Dashboard>`. |
| `src/i18n/locales/en.json` (`beranda`) | Add `weeklyXp`, `weeklyXpClaimed`, `weeklyXpToast`. |
| `src/i18n/locales/id.json` (`beranda`) | Add the same three keys in Indonesian. |

**Already handled (no work):**
- `XpFeed.tsx` renders any `XP_SOURCES` row via `labelEn`/`labelId`, with a
  fallback for the two internal actions. `trade_completed` and `weekly_active`
  labels already exist in `xp-core.ts` — no feed/i18n code needed for the feed.
- `removeMemberXp` (`xp.ts:132`) only reverts `member_joined`
  (`reversible: true`); `trade_completed`/`weekly_active` are `reversible: false`,
  so no revert logic is needed. Removing a member still subtracts exactly 5 XP.

### Edge cases handled
- **Empty `coopId`:** `getActiveCoopId()` returns `""` on the title screen.
  `canClaimWeeklyXp("")` returns `false` (button hidden); `claimWeeklyXp` bails
  early; `awardXp` for the sale bails via the same guard. No DB call with `""`.
- **Concurrent weekly claims:** the button is disabled (`claimingWeekly`) the
  instant it's clicked and re-checked against the ledger after `await`, so a
  double-click cannot grant two `weekly_active` events in the same week.
- **Demo re-seed:** the ledger lives in the per-coop DB, so a re-seed resets it.
  The first award after re-seed writes a one-off `xp_baseline` from registry XP
  (`xp.ts`) — identical to how `member_joined` already behaves. No special
  handling needed.
- **Baseline reconciliation vs. new awards:** `appendXp` writes the baseline only
  when the ledger has **zero rows**, not when the sum nets to 0. New awards
  merely append after the baseline, so totals stay correct even if the co-op
  already had `member_joined` events.
- **Profile switch mid-session:** the Dashboard effect re-checks
  `canClaimWeeklyXp` whenever the `xp` prop changes; an `onXpChange` refresh also
  re-syncs `coopProfile.xp` for the now-active co-op.

### Tests & i18n
- **`xp.test.ts` is unaffected.** It asserts exactly
  `Object.keys(XP_SOURCES) === ["member_joined","member_verified","weekly_active","trade_completed"]`.
  We add **no** keys and change **no** values in `xp-core.ts`, so the contract
  holds and `pnpm test` stays green. (`member_verified` stays in the table as
  defined data — we simply don't wire a trigger to it.)
- **i18n is complete.** Feed labels are data-driven from `xp-core.ts` (already
  translated). Only the new Beranda button needs keys — add to both locale files
  under `beranda`:
  - `weeklyXp` — "Claim Weekly Bonus" / "Klaim Bonus Mingguan"
  - `weeklyXpClaimed` — "Weekly bonus claimed — come back next week" / "Bonus mingguan diklaim — kembali minggu depan"
  - `weeklyXpToast` — "Weekly activity bonus: +1 XP" / "Bonus aktivitas mingguan: +1 XP"
- **ERL names/descriptors** live in `readiness.ts` (en/id fields), matching the
  `leveling-data.ts` pattern — no separate i18n keys required.

---

## Verification (concrete & runnable)

1. `pnpm check` — tsc + lint + Prettier pass (new imports/types in `readiness.ts`,
   `useSales.ts`, `Dashboard.tsx`).
2. `pnpm test` — `xp.test.ts` still green (no `XP_SOURCES` change).
3. `pnpm dev`, open the demo co-op:
   - **Tier 1** → Leveling/Dashboard badge reads `ERL 1 · Embrio`; hover shows
     `IRL 1 / TRL·MRL 1–2 / CMM 1` anchors.
   - **Add member** → Leveling feed shows "Member registers" (+5).
   - **Sales → checkout** a cart → feed shows "Cooperative completes a trade" (+3);
     the sale itself still succeeds and clears the cart.
   - **Beranda** → "Claim Weekly Bonus" is enabled; click it → toast "+1 XP",
     button greys out ("claimed — come back next week"); switch to **Leveling** →
     feed shows "Weekly active member" (+1).
   - **Re-click weekly** while greyed out → no second event, total unchanged.
   - Earn enough XP to advance tiers → badge updates (e.g. tier 5 → `ERL 5 · Mapan`).
   - Toggle language → all names/descriptors switch en↔id.
4. **Sanity:** `getErlForTier(10)` returns the ERL 9 (Teladan) entry.
5. **Reversible check:** delete a member → XP drops by exactly 5 (only
   `member_joined` reverted); `trade_completed`/`weekly_active` totals persist.

## Out of scope (future)
- Real `member_verified` trigger (a genuine identity-verification step), not the
  redundant co-fire on add.
- `REQUIRE_VERIFICATION` / `DAILY_XP_CAP` gating for production.
- Automated weekly cron; server-side XP sync.
- Computing a *separate* ERL score from real metrics (this plan only labels the
  existing XP tiers). A future phase can derive an independent ERL score from
  financial/governance data and show delta-vs-XP-tier.
- Server-side / national benchmarking against real IRL/TRL datasets.
