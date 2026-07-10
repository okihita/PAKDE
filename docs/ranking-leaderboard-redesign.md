# Ranking Leaderboard Redesign — Implementation Plan

**Status:** Planned (not yet implemented)
**Target file:** `src/features/Finance/Ranking/Ranking.tsx`
**Goal:** Convert the current full-width spreadsheet-style leaderboard into a 10/10 gamified dashboard by introducing a left-side **Podium Hero Panel** and constraining the table into a balanced two-column layout.

---

## 1. Problem Statement

The current leaderboard (`src/features/Finance/Ranking/Ranking.tsx`) renders inside `<main class="flex-1 … p-6">` with **no max-width**. The result:

- The data table stretches to the full content width — rows feel sparse and the score column floats far from the name.
- The top 3 winning cooperatives are only distinguished by a 4px medal glyph in the `#` column. There is no podium, no avatar/profile, and no celebration of winners.
- No score visualization (bare `94%` text), no motion, and no tie-in to the broader gamification loop (XP / badges / Leveling).

**Current gamified-dashboard score: ~2.8/10.**

### Known bug to fix alongside this work
`rankMedal()` (`Ranking.tsx:45-50`) returns a **gold** icon for both rank 1 **and** rank 3 — bronze is missing. Third place incorrectly reads as champion.

---

## 2. Direction (validated)

Two-column split — **left = podium + winner profiles, right = ranked list**. This is the proven leaderboard pattern (Duolingo, Strava, sports apps) and directly resolves the width complaint by constraining the table. Refinements:

- **Podium = top 3 only.** Showing 10 full profiles on the left would recreate the table we are escaping. Use a compact "honorable mentions" strip for ranks 4–5.
- **Scope-reactive.** Podium must re-animate when the user switches `kabupaten` / `provinsi` / `nasional`.

---

## 3. Target Layout

```
<main>  (add max-w-[1120px] mx-auto to the ranking view wrapper)
  ├─ Status / connectivity banner        (unchanged)
  ├─ 3 scope summary cards               (unchanged)
  └─ grid lg:grid-cols-[minmax(0,42%)_minmax(0,58%)] gap-6
        ├─ LEFT  (42%)  → <Podium />  (NEW)
        └─ RIGHT (58%)  → Ranked list card (upgraded Table)
```

On `lg` and below, fall back to a single column (podium on top, list below).

### 3.1 — ASCII wireframe (target)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ● LIVE · updated 2m ago            [↻ Refresh]        [⤒ Submit Stats]         │  status banner
├──────────────────────────────────────────────────────────────────────────────┤
│  KABUPATEN        PROVINSI         NASIONAL                                           │  3 scope cards
│   #3 / 20          #2 / 14          #5 / 20                                            │
├───────────────────────────────────┬──────────────────────────────────────────────┤
│  PODIUM HERO PANEL  (left 42%)      │  RANKED LIST  (right 58%)                       │
│                                      │                                                  │
│      ┌─────┐   ┌─────┐   ┌─────┐     │  #   COOPERATIVE              SCORE   RAG  ▲▼    │
│      │ 2nd │   │ 1st │   │ 3rd │     │ ─────────────────────────────────────────────  │
│      │ 🥈  │   │ 🥇  │   │ 🥉  │     │  1  KUD Sumber Makmur    ▓▓▓▓▓▓▓▓ 94  Hijau ▲   │  promotion
│      │ KSU │   │ KUD │   │ KOP │     │  2  KSU Guyub Rukun      ▓▓▓▓▓▓▓░ 91  Hijau ▲   │  zone tint
│      │G.Ruk│   │S.Mak│   │ Tani│     │  3  Koperasi Tani Jaya  ▓▓▓▓▓▓▓░ 88  Hijau ▼   │
│      │ 91  │   │ 94  │   │ 88  │     │ ─────────────────────────────────────────────  │
│      └─────┘   └─────┘   └─────┘     │  4  KSP Mitra Usaha     ▓▓▓▓▓▓▓░ 85  Hijau ▲   │
│        ╲ glow ╱  ★radial             │  5  KUD Tani Subur      ▓▓▓▓▓▓▓░ 82  Hijau ▼   │
│         ╲___╱  behind #1             │  6  KSU Bina Sej.       ▓▓▓▓▓▓░░ 79  Hijau ▲   │
│                                      │  7  KSU Mapan           ▓▓▓▓▓▓░░ 76  Kuning ▼  │
│   ┌──────────────────────────┐       │  ·  ·  (scroll, top 10)  ·  ·  ·  ·  ·  ·  ·   │
│   │ YOUR POSITION  #7 / 20    │       │  ⋯                                                  │
│   │ 12 pts from the podium ▮→ │       │  [ see all 20 ]                                     │
│   └──────────────────────────┘       │                                                  │
│   honorable: 4th ▮ KSP Mitra  5th ▮… │                                                  │
└───────────────────────────────────┴──────────────────────────────────────────────┘

  legend: ▓ = score bar fill (width = score%)   ▲▼ = trend   ★ = glow behind champion
```

Stacked (mobile / `< lg`) layout = podium block on top, then the ranked list below it.

---

## 4. Implementation Steps

### 4.1 — Width guard (root cause of "table too big")
In `Ranking.tsx`, wrap the page body (or change the root `<div className="flex-1 overflow-auto space-y-4">`) so the ranking view is constrained:
- Add `max-w-[1120px] mx-auto` to the ranking root container.
This keeps the table from stretching on wide screens and gives the two-column grid a stable reference width.

### 4.2 — New `Podium.tsx` component (left column)
Props: `items: RankedCoop[]`, `ourRank: number | null`, `scope`.
- Layout: classic **2-1-3** podium — rank 2 (left) / rank 1 (center, tallest) / rank 3 (right).
- Each podium card:
  - Gold / silver / bronze **gradient ring** (`bg-warning`, `slate-300`, bronze tone).
  - **Avatar / crest circle**: deterministic monogram derived from `name` (first 2 letters upper-cased), on a tinted circular badge. (No new image assets required.)
  - `name`, `village`, **animated count-up score** (CSS/keyframe or lightweight `requestAnimationFrame`), RAG chip, trend icon.
  - Subtle **radial glow** behind rank 1.
- **Micro-animation:** a 1-shot confetti / particle burst (CSS only, no new dependency) on mount and whenever `scope` changes.
- **"Your Position" card** (pinned beneath podium) when `ourRank` is outside top 3:
  - Shows `#ourRank`, `total`, and **"X pts from the podium"** gap (compute `podium[2].score - ourScore`) to create stakes/motivation.
- **Honorable mentions strip:** ranks 4–5 as two slim rows (avatar + name + score bar).

### 4.3 — Upgrade the ranked list (right column)
Keep `renderTable` but:
- Add an **inline score bar** inside the Score cell (`score%` rendered as a horizontal fill bar, e.g. `bg-success` width = `score%`) so gaps are scannable at a glance.
- Cap visible rows in a **fixed-height scroll area** (top 10 + "see all" expander) so the right column height stays balanced with the podium.
- Add **promotion / relegation bands**: tint the top-3 rows as "Promotion Zone" to add narrative.
- **Fix the bronze medal bug:** `rank === 3` → bronze tone (e.g. `text-amber-700 bg-amber-700/10`), distinct from gold.

### 4.4 — Scope-reactivity
`Podium` re-mounts / re-animates on `scope` change (key the component on `scope`, or trigger the confetti effect via a `useEffect` on `scope`). No service change needed — `boards[scope][metric].items` already drives everything.

### 4.5 — Gamification loop tie-in (optional, recommended)
- Surface a `ranking.badgeUnlock` flash: if `ourRank` improves vs. last cached value, flash a badge consistent with the existing Leveling/XP system. (Track previous `ourRank` per scope in `useRanking` or local component state.)
- This makes the leaderboard feed the gamification engine instead of standing alone.

---

## 5. Data Model (no changes required)

`RankedCoop` already provides everything needed:

```ts
interface RankedCoop {
  rank: number;
  name: string;
  village: string;
  score: number;
  ragStatus: string;
  trend: "up" | "down" | "stable";
  isOurs: boolean;
}
```

No backend / service edits. `MockRankingService` output is sufficient for the podium, avatar monogram, score bar, and gap calculation.

---

## 6. Files Touched

| File | Change |
|---|---|
| `src/features/Finance/Ranking/Ranking.tsx` | Add width guard; replace single-card block with two-column grid; fix bronze medal; add score bar + bands; mount `<Podium />` |
| `src/features/Finance/Ranking/Podium.tsx` | **NEW** — podium hero panel (left column) |
| `src/features/Finance/Ranking/Ranking.css` | Podio glow / confetti keyframes, count-up helper if needed |

No changes to `rankingService.ts`, `useRanking.ts`, i18n keys (reuse existing `ranking.*` namespaces; add `ranking.podium.*` + `ranking.gapFromPodium` if needed).

---

## 7. Acceptance Criteria

- [ ] Page width capped (no full-bleed table on wide screens).
- [ ] Top 3 winners shown in a dedicated podium with avatar, score, RAG, trend, and glow.
- [ ] "Our coop" shown with a clear gap-to-podium message when outside top 3.
- [ ] Right-column list has visible score bars and promotion-zone tint; capped/scrollable.
- [ ] Bronze medal renders correctly for rank 3.
- [ ] Podium re-animates on scope switch.
- [ ] No new runtime dependencies introduced.
- [ ] `pnpm lint` + `pnpm build` pass.

---

## 8. Out of Scope (this pass)

- Real cooperative logos / crests (monogram placeholder used).
- Federated ranking service swap (unchanged — `MockRankingService` stays).
- Participation-page leaderboard (`Participation.tsx`) — separate, smaller widget; not part of this redesign.
