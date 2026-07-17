# Campaign Visualization Strip (Beranda)

Status: planned — not implemented.
Branch: `feat/campaign-strip`

## Goal

Add a wide, container-width **campaign visualization strip** to the Beranda (home)
screen, directly below the sticky `TopBar`. The strip frames the app as an RPG and
visualizes the active campaign goal: **move the cooperative two tiers ahead**
(`currentTier → currentTier + 2`), driven by real `xp`.

The strip hosts a simple, hardcoded RPG dialogue (typewriter + "next"). Once the
script finishes, the same box becomes a **persistent living scene** of the koperasi
desa — a simply-drawn building with a crowd that grows as members join — reflecting
real coop state instead of going idle.

## Context

- Tier is purely XP-driven: `getCurrentLevel(coop.xp).tier` (`src/data/leveling.ts`),
  with the tier↔XP curve in `src/data/leveling-data.ts` (`LEVELS`, `minXp`/`maxXp`).
- `Dashboard` already receives `xp` as a prop (`Dashboard.tsx` line 204) and renders
  inside `main` (scrollable area, `App.tsx` line 556). TopBar is the sticky bar above it.
- No custom Rust backend; no asset pipeline for game art. Keep everything CSS/SVG.
- Inline SVG is already repo-standard (`LaurelWreath.tsx`, `Leveling.tsx` chevrons,
  `Statistics.tsx` gauge) — no new dependency.
- This is a dogfooding/LARP aid for an "easy" exploration campaign. It deliberately
  ignores the fake features (Ranking, Sync, Impact, Development, Hibah).

## Placement

- **Scrolls with Beranda** — lives at the top of `Dashboard.tsx`, above the
  drag-and-drop card grid. NOT pinned app-wide.
- Full container width. Bleed to the content edges (negative margin or a non-padded
  wrapper) so it reads as a banner, not a card.

## Components

1. `src/features/Home/Dashboard/CampaignStrip.tsx` — owns layout, mode state
   machine, and the tier track. Imports `KopdesBuilding` and the crowd.
2. `src/features/Home/Dashboard/KopdesBuilding.tsx` — inline SVG building,
   `tier` prop drives its form.
3. `src/lib/memberEvents.ts` — new live signal (see Data source).

## Design

### Region 1 — Tier track (CSS/SVG only)
- Horizontal track of pips: `currentTier`, `currentTier+1`, `currentTier+2`.
- Progress fill width = `(xp - startMinXp) / (goalMinXp - startMinXp)`, clamped 0–1.
  `startMinXp` = `LEVELS[currentTier-1].minXp`, `goalMinXp` = `LEVELS[currentTier+1].minXp`.
- Current tier pip: glow/pulse (ONE CSS `animation`, transform+opacity only).
- Rough icons/drawings via inline SVG or unicode — no binary assets.
- Label: `Tier {current} → {current+2}` plus `X / Y XP` sub-label.

### Region 2 — RPG box (dialogue ⇄ scene state machine)
- `type SceneMode = "dialogue" | "scene"`.
- **dialogue mode:**
  - Hardcoded `string[]` script (rough Indonesian narration for the easy campaign).
  - Typewriter: reveal characters on an interval; click completes the current line instantly.
  - "Next" button advances to the next line; hidden on the last line.
  - On advancing past the final line → switch to `scene` mode and set
    `localStorage["pakde-campaign-seen"] = "1"`.
- **scene mode (persistent living vignette):**
  - Renders `KopdesBuilding` (tier-driven form) with the crowd + leader arranged
    on a shared ground line in front of it.
  - On mount: if `localStorage["pakde-campaign-seen"] === "1"`, start directly in
    `scene` mode (NO dialogue replay).
- Both modes live in the SAME box — not a separate modal.

### Region 3 — KopdesBuilding (inline SVG, strict simplicity cap)
- **Shape budget (HARD CAP): roof, walls, door, signboard, 2 windows, ground line
  = 7 SVG shapes max.** No perspective. Flat fills via `currentColor` / Tailwind
  classes. **Zero gradients on shapes** (backdrop gradient only).
- `tier` prop binds building form:
  - tier 1–2: base building (7 shapes).
  - tier ≥ 3 (goal reached): add ONE wing shape (8 total) + a `🎉`/"kampanye selesai"
    banner → this is the visual win state, felt in the scene not just the track.
  - Backdrop tint = `getTierBand(tier)` (Bronze→Gold) already in `src/data/xp-core.ts`.

### Region 4 — Crowd + leader (the 3 frozen bindings)
Exactly THREE state bindings, no more:
1. `tier` → building form + backdrop tint (above).
2. `members` (total count) → number of crowd figures.
   - Render ≤ **10** figures; overflow shown as `+N lainnya` text.
   - ONE shared float keyframe, staggered via `animation-delay` — NO per-figure loops.
3. `activePengurus >= 3` → a "leader" figure appears beside the door
   (reuse existing `onPengurusChanged` signal already subscribed in Dashboard).

### Animation constraints
- Max 2 CSS loops total (current-tier pip pulse, crowd float). Transform/opacity only.
- No layout-animating keyframes (avoids Tauri webview jank).

## Data source

- `xp`: passed from `Dashboard` (`coopProfile?.xp ?? 0`) — no new store/DB.
- Tier math: reuse `getCurrentLevel` + `LEVELS` from `src/data/leveling*`.
- `members` total: `useMembers` exposes `insights.totalMembers` (already computed).
- **NEW signal** `src/lib/memberEvents.ts` — exact mirror of `pengurusEvents.ts`
  (20 lines): `onMembersChanged(cb)` / `emitMembersChanged()`. `Members.tsx` calls
  `emitMembersChanged()` when the member list mutates. `CampaignStrip` subscribes so
  the crowd updates live. No polling.
- `activePengurus >= 3`: via existing `onPengurusChanged` (no new signal).
- No schema changes, no new Rust commands, no router changes.

## Out of scope (explicit)

- Real illustrated artwork / binary assets (later polish pass).
- Bindings for savings, sales, loans, units, feasibility — v1 freezes to the 3 above.
- Step engine, narration table, Zustand store, profit/member targets.
- Server/ML features (Ranking, Sync, Impact, Development, Hibah).

## i18n (temporary debt, scheduled)

- Dialogue strings + scene labels are **hardcoded Indonesian for v1** (acceptable for
  a rough LARP aid).
- **Scheduled before MVP tag:** extract to a `campaign.*` namespace in
  `src/i18n/locales/{en,id}.json` (per AGENTS.md en/id requirement). Listed in
  Follow-ups as a blocking pre-tag task, not an afterthought.

## ASCII visualization

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOPBAR (sticky)  coop · xp · alerts · settings                        │
├──────────────────────────────────────────────────────────────────────┤
│  CAMPAIGN STRIP  (full-width, scrolls with Beranda)                    │
│                                                                        │
│   ── Tier track ──────────────────────────────────────────────────    │
│    ◉ Rintisan ───────●──────────────○───────○                          │
│    T1 (you)          T2 (pulse)      T3 (goal)                          │
│    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░  XP 12 / 45                      │
│                                                                        │
│   ── RPG box: dialogue mode (first visits) ─────────────────────────   │
│    ┌────────────────────────────────────────────────────────────┐    │
│    │ ⚔ Penatua Desa: "Selamat datang, Pengurus. Koperasi ini      │    │
│    │   baru berdiri. Bawa ke tingkat Rintisan + 2..."  ▌          │    │
│    └────────────────────────────────────────────────────────────┘    │
│                                    [ ▸ Lanjut ]                        │
│                                                                        │
│   ── RPG box: scene mode (after dialogue / returning users) ──────     │
│    backdrop: Bronze tint (tier 1)        ☀️                            │
│              ___________                                               │
│             |  KOPERASI |  <- signboard (level label)                 │
│             |   DESA    |                                              │
│             | []  []    |  <- windows (light w/ tier)                 │
│             |   ____    |                                              │
│             |  |_🚪_|   |  <- door (leader stands here)               │
│         👤👤👤👤👤👤👤   <- crowd = members (≤10, +N overflow)        │
│        [Pak Lurah 👑]    <- appears when pengurus ≥ 3                 │
│   ─────────────────────────  ground line                              │
│   Tier 1 → 3 · XP 12/45 · Warga: 6                                    │
│                                                                        │
│   (tier ≥ 3 win state: +wing on building, 🎉 banner)                  │
├──────────────────────────────────────────────────────────────────────┤
│  DASHBOARD cards (drag-and-drop grid: mainquest / tugas / calendar /  │
│  news)                                                                 │
└──────────────────────────────────────────────────────────────────────┘
```

Legend: `◉` current tier (pulsing) · `●` in-progress · `○` goal · `▓` earned XP ·
`░` remaining · `▌` typewriter cursor.

## Acceptance

- [ ] `CampaignStrip` renders at top of Beranda, full width, below TopBar.
- [ ] Tier track reflects real `xp`; fill + current pip update as XP changes.
- [ ] `KopdesBuilding` ≤ 8 SVG shapes; flat fills; no gradients on shapes; tier drives form.
- [ ] Dialogue types out, "Next" advances; after last line → `scene` mode; `seen` flag
      persists so returning users land directly in `scene` (no replay).
- [ ] Scene: crowd count tracks `members` live via `memberEvents.ts`; leader appears
      at `pengurus >= 3`; exactly 3 bindings, no others.
- [ ] Win state (tier ≥ startTier+2): building gains wing + banner.
- [ ] Only CSS/SVG animation (≤2 loops); no perf jank; no new DB/store/router changes.
- [ ] `pnpm check` passes.

## Follow-ups

- **BEFORE MVP TAG (blocking):** extract dialogue + scene labels to `campaign.*` i18n
  namespace in `src/i18n/locales/{en,id}.json`.
- Wire XP sources for sales/accounting/learn so the 2-tier goal is reachable through
  real feature use (currently only `member_joined` awards XP).
- Optional illustrated artwork pass (replace geometric building with real art).
