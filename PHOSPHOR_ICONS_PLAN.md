# Phosphor Icons Migration Plan

Replace `lucide-react` with `@phosphor-icons/react` across the entire PAKDE codebase. Icons are centrally managed through a Settings-driven context — users can globally switch between **Bold / Regular / Fill / Duotone** weights and set a universal accent color from the Settings page. No per-file hardcoded styles.

---

## Why Phosphor?

| Dimension | Lucide | Phosphor |
|-----------|--------|----------|
| Icon count | ~1,000 | **1,248+** |
| Weights | 1 (single stroke) | **6** (Thin, Light, Regular, Bold, Fill, Duotone) |
| Design size | 24×24 | **16×16** — reads better at our `h-3 w-3`/`h-3.5` sizes |
| Consistency | Variable stroke widths | Uniform 16px grid, all icons same optical weight |
| Tree-shaking | ✅ | ✅ |
| Bundle impact | Similar | Similar |
| License | ISC | MIT |

The **6-weight system** is the killer feature. With lucide we had one visual weight for everything. With Phosphor we can use `Bold` for navigation/section headers and `Regular` for inline content — creating visual hierarchy without changing icon sets.

---

## Weight Strategy

Weights are **globally controlled** from the Settings page via `IconContext`. The table below documents the **default recommended weight** for each icon context — these ship as the out-of-the-box experience. Users can override everything from Settings at any time.

| Context | Default Weight | Rationale |
|---------|---------------|-----------|
| Sidebar nav icons | **Bold** | Navigation needs visual weight to anchor the page |
| Feature page headers | **Bold** | Section titles need presence |
| Action buttons (primary) | **Bold** | Save, Create, Delete — need to pop |
| Toast icons | **Bold** | Error/warning/success need visibility |
| Inline form field icons | **Regular** | Subtle companions to input labels |
| Card content icons | **Regular** | Supporting visual, not primary |
| List item indicators | **Regular** | Small dots, checks, arrows |
| Toolbar tool icons | **Bold** | Store Layout canvas tools need clarity |
| Template picker icons | **Regular** | Cards already have visual weight |
| Table cell icons | **Regular** | Dense data, avoid visual noise |

**Override rules:** Any icon can receive `weight="fill"` or `weight="duotone"` as a per-instance prop. This bypasses the global setting for that specific icon. The global setting acts as the fallback for every icon that doesn't specify its own weight.

**Color strategy:** Icons inherit `currentColor` from CSS by default (same behavior as lucide today). When the user picks a custom accent color in Settings, all icons without an explicit Tailwind `text-*` class use that color. Explicit `text-*` classes always win (local beats global).

---

## Complete Migration Map

Each lucide icon mapped to its Phosphor equivalent with weight.

### Direct Matches (same name in both libraries)

| Lucide | Phosphor | Files |
|--------|----------|-------|
| `ArrowLeft` | ArrowLeft · Regular | StoreLayout, CreateEvent, Learn |
| `ArrowRight` | ArrowRight · Regular | Learn |
| `MapPin` | MapPin · Bold/Regular | Sidebar(B), StoreLayout(B), CreateEvent(R), DashboardCalendar(R), ProfileSelect(R) |
| `Calendar` | Calendar · Regular | Participation, AccountingJournal |
| `CalendarPlus` | CalendarPlus · Bold | Sidebar, CreateEvent |
| `CalendarDays` | CalendarDays · Regular | CreateEvent, DashboardCalendar, AccountingJournal |
| `Clock` | Clock · Regular | CreateEvent, DashboardCalendar, EventTemplatePicker |
| `Users` | Users · Bold/Regular | Sidebar(B), Leveling(B), CreateEvent(R), Participation(R), Impact(R) |
| `Plus` | Plus · Regular | Dashboard, Members, Units, SalesInventory, AccountingJournal, AccountingCoa, ProfileSelect, CreateProfileDialog (R for all) |
| `X` | X · Regular | ShelfPanel, Dialog, Toast (⚠️ Toast's XCircle stays as XCircle) |
| `Check` | Check · Regular | Select |
| `Trash2` → | Trash · Regular | Members, StoreLayout, ShelfPanel, Sales, SalesInventory, AccountingJournal |
| `FileText` | FileText · Regular | SalesHistory, Planners, CreateEvent, Development |
| `Sparkles` → | Sparkle · Regular | StoreLayout, SalesInventory, Accounting, Units, CreateEvent (⚠️ no plural form) |
| `Trophy` | Trophy · Bold | Sidebar, Leveling, Ranking, Learn |
| `Medal` | Medal · Bold | Sidebar, Ranking |
| `TrendingUp` → | TrendUp · Regular | Sidebar, Accounting, Leveling, CreateEvent, EventPredictionPanels, Impact |
| `TrendingDown` → | TrendDown · Regular | Ranking |
| `Wallet` | Wallet · Bold/Regular | Sidebar(B), Accounting(B), Participation(R) |
| `ShoppingCart` | ShoppingCart · Bold/Regular | Sales(B), EventTemplates(R) |
| `Building2` → | Buildings · Bold/Regular | Sidebar(B), Leveling(B), Units(B), ProfileSelect(B), Development(B), EventTemplates(R) |
| `Shield` | Shield · Bold/Regular | Sidebar(B), ProfileSelect(R) |
| `Lock` | Lock · Regular | Leveling, Learn |
| `Star` | Star · Regular | Leveling, Ranking, Learn |
| `BookOpen` | BookOpen · Bold/Regular | Sidebar(B), Learn(B) |
| `GraduationCap` | GraduationCap · Regular | EventTemplates |
| `Leaf` | Leaf · Regular | EventTemplates, Participation, Impact |
| `Bus` | Bus · Regular | EventTemplates |
| `Stethoscope` | Stethoscope · Regular | EventTemplates |
| `Footprints` | Footprints · Regular | EventTemplates |
| `Music` → | MusicNotes · Regular | EventTemplates |
| `Play` | Play · Regular | Accounting, Development, Impact |
| `Globe` | Globe · Regular | Development |
| `Database` | Database · Regular | Development |
| `Printer` | Printer · Regular | Planners |
| `Flame` → | Fire · Bold | Participation |
| `Sun` | Sun · Bold | Sidebar |
| `Moon` | Moon · Bold | Sidebar |
| `LogOut` → | SignOut · Bold | Sidebar |
| `Power` | Power · Regular | Units |
| `Wrench` | Wrench · Bold/Regular | Sidebar(B), Equipment(B) |
| `ShieldCheck` | ShieldCheck · Bold | Leveling |
| `ShieldAlert` → | ShieldWarning · Bold | Accounting |
| `AlertTriangle` → | Warning · Bold/Regular | Sidebar(B), Statistics(R), Development(B), DbError(B), Toast(B) |
| `Info` | Info · Regular | Statistics, SalesHistory, Feasibility |
| `Activity` | Activity · Regular | Units, Impact, Development |
| `CreditCard` | CreditCard · Regular | Sales |
| `Package` | Package · Regular | Sales, SalesInventory |
| `Minus` | Minus · Regular | ShelfPanel, Ranking |
| `MinusCircle` | MinusCircle · Regular | Sales |
| `PlusCircle` | PlusCircle · Regular | Sales |
| `Lightbulb` | Lightbulb · Regular | CreateEvent |
| `CheckSquare` | CheckSquare · Regular | Accounting, CreateEvent, Participation |
| `Square` | Square · Bold | LayoutCanvas |
| `Eraser` | Eraser · Bold | LayoutCanvas |
| `Coins` | Coins · Bold | EventPredictionPanels |
| `ListChecks` | ListChecks · Bold | EventPredictionPanels |
| `CheckCircle2` → | CheckCircle · Regular/Bold | Dashboard(R), Leveling(R), Impact(R), Learn(R), Development(R), Toast(B) |
| `Circle` | Circle · Regular | Dashboard |
| `XCircle` | XCircle · Bold | Toast |
| `Newspaper` | Newspaper · Regular | Dashboard |
| `Search` → | MagnifyingGlass · Regular | Members, Sales |
| `Bell` → | Bell · Bold | (future use — notification system) |
| `Download` → | DownloadSimple · Regular | Planners |
| `RefreshCw` → | ArrowsClockwise · Regular | Development |
| `History` → | ClockCounterClockwise · Regular | Sales, SalesHistory |
| `FileDown` → | FileArrowDown · Regular | Accounting |
| `Zap` → | Lightning · Regular | (not yet used, keep for future) |
| `Handshake` | Handshake · Regular | Sidebar (was `HeartHandshake`, simpler match) |
| `ShoppingBag` → | ShoppingBagOpen · Regular | EventTemplates |
| `Box` → | Cube · Regular | ShelfPanel, LayoutCanvas |
| `MousePointer2` → | Cursor · Bold | LayoutCanvas |
| `Edit2` → | PencilSimple · Regular | Members |
| `Volume2` → | SpeakerLow · Regular | ProfileSelect |
| `VolumeX` → | SpeakerX · Regular | ProfileSelect |
| `ZoomIn` → | MagnifyingGlassPlus · Bold | LayoutCanvas |
| `ZoomOut` → | MagnifyingGlassMinus · Bold | LayoutCanvas |
| `Maximize` → | ArrowsOut · Bold | LayoutCanvas |
| `ChevronDown` → | CaretDown · Bold/Regular | Sidebar(B), Leveling(R), Select(R) |
| `ChevronUp` → | CaretUp · Bold/Regular | Sidebar(B), Leveling(R), Select(R) |
| `ChevronLeft` → | CaretLeft · Regular | DashboardCalendar |
| `ChevronRight` → | CaretRight · Regular | Sidebar, DashboardCalendar |
| `BarChart3` → | ChartBar · Bold/Regular | Sidebar(B), Participation(B) |
| `LineChart` → | ChartLine · Bold | Sidebar |
| `Cog` → | Gear · Bold | Sidebar |
| `Settings2` → | GearSix · Regular | Accounting |
| `Grid` → | GridFour · Bold | SalesInventory |
| `List` → | List · Bold | SalesInventory |

### Near Matches / Renamed

| Lucide | Phosphor | Rationale | Files |
|--------|----------|-----------|-------|
| `LayoutDashboard` | **SquaresFour** · Bold | Closest 4-square grid layout for "dashboard" | Sidebar |
| `Receipt` | **Note** · Bold | No receipt icon; note/document is closest for accounting records | Sidebar |
| `LayoutGrid` | **GridFour** · Bold | Renamed, same concept | SalesInventory |
| `GripHorizontal` | **DotsSixVertical** · Regular | Standard drag handle pattern (rotated by parent CSS) | Dashboard |
| `UserCheck` | **UserCheck** · Bold | Same name, available in Phosphor | Sidebar |
| `CalendarCheck` | **CalendarCheck** · Regular | Same name, available in Phosphor | (future) |
| `ListTodo` → | **Checklist** · Regular | Closest match | (future) |
| `SlidersHorizontal` → | **Sliders** · Regular | Shorter name, same icon | (future) |

### Problematic — No Direct Phosphor Match

| Lucide | Best Approximation | Rationale | Files |
|--------|-------------------|-----------|-------|
| `FileSpreadsheet` | **Table** · Regular | No spreadsheet icon in Phosphor. `Table` is closest structural match for financial data grids. | EventTemplates |
| `Sprout` | **Plant** · Regular | Phosphor has no sprout/sapling. `Plant` is the closest botanical icon for growth/member activity. | Members |
| `HeartHandshake` | **Handshake** · Bold | Phosphor has `Handshake` and `Heart` as separate icons. `Handshake` alone captures the partnership/social meaning. | Sidebar, Participation, Impact |
| `Shovel` | **Hammer** · Regular | No shovel in Phosphor. `Hammer` conveys manual work/tools for gotong royong context. | EventTemplates |
| `MessageSquare` | **Chat** · Regular | Slightly different name, same concept | Impact |
| `GripVertical` | **DotsSixVertical** · Regular | Same as GripHorizontal solution | (not currently used) |

---

## Files to Migrate (32 files)

### Batch 1 — Sidebar + App Shell (4 files)
- `src/App.tsx` — no icons directly (just renders components)
- `src/features/Sidebar.tsx` — 28 icons, all Bold weight
- `src/components/ui/select.tsx` — Chevrondown, ChevronUp, Check → Regular
- `src/components/ui/dialog.tsx` — X → Regular

### Batch 2 — Dashboard + Home (2 files)
- `src/features/Home/Dashboard/Dashboard.tsx` — 5 icons, Regular
- `src/features/Home/Dashboard/DashboardCalendar.tsx` — 5 icons, Regular

### Batch 3 — Members + Community (5 files)
- `src/features/Community/Members/Members.tsx` — 5 icons, Regular
- `src/features/Community/Participation/Participation.tsx` — 8 icons, Bold + Regular
- `src/features/Community/Impact/Impact.tsx` — 8 icons, Regular
- `src/features/Community/CreateEvent/CreateEvent.tsx` — 11 icons, Bold + Regular
- `src/features/Community/CreateEvent/EventTemplatePicker.tsx` — 3 icons, Regular
- `src/features/Community/CreateEvent/EventPredictionPanels.tsx` — 4 icons, Bold

### Batch 4 — Business (6 files)
- `src/features/Business/StoreLayout/StoreLayout.tsx` — 5 icons, Regular
- `src/features/Business/StoreLayout/ShelfPanel.tsx` — 4 icons, Regular
- `src/features/Business/StoreLayout/LayoutCanvas.tsx` — 7 icons, Bold
- `src/features/Business/Sales/Sales.tsx` — 8 icons, Bold + Regular
- `src/features/Business/Sales/SalesInventory.tsx` — 6 icons, Regular
- `src/features/Business/Sales/SalesHistory.tsx` — 3 icons, Regular
- `src/features/Business/Units/Units.tsx` — 5 icons, Bold + Regular
- `src/features/Business/Equipment/Equipment.tsx` — 1 icon, Bold
- `src/features/Business/Development/Development.tsx` — 9 icons, Regular

### Batch 5 — Analytics (3 files)
- `src/features/Analytics/Leveling/Leveling.tsx` — 6 icons, Bold + Regular
- `src/features/Analytics/Ranking/Ranking.tsx` — 6 icons, Regular
- `src/features/Analytics/Statistics/Statistics.tsx` — 2 icons, Regular

### Batch 6 — Finance (4 files)
- `src/features/Finance/Accounting/index.tsx` — 8 icons, Bold + Regular
- `src/features/Finance/Accounting/AccountingJournal.tsx` — 3 icons, Regular
- `src/features/Finance/Accounting/AccountingCoa.tsx` — 1 icon, Regular
- `src/features/Finance/Feasibility/Feasibility.tsx` — 1 icon, Regular

### Batch 7 — System (4 files)
- `src/features/System/ProfileSelect/ProfileSelect.tsx` — 5 icons, Bold + Regular
- `src/features/System/ProfileSelect/CreateProfileDialog.tsx` — 1 icon, Regular
- `src/features/System/Settings/Settings.tsx` — no icons (text-only)
- `src/features/System/DbErrorScreen/DbErrorScreen.tsx` — 1 icon, Bold
- `src/hooks/useToast.tsx` — 3 icons, Bold

### Batch 8 — Education (2 files)
- `src/features/Education/Learn/Learn.tsx` — 7 icons, Regular
- `src/features/Education/Planners/Planners.tsx` — 3 icons, Regular

### Batch 9 — Data (1 file)
- `src/data/eventTemplates.ts` — 14 icons (type references only), Regular

---

## Centralized Icon Management — Settings-Driven Architecture

### Goal

Every icon in PAKDE must be styleable from one place: the Settings page. Users can globally switch between **Bold**, **Regular (outline)**, **Fill**, and **Duotone** icon weights, as well as set a universal **icon accent color**. No per-file hardcoded weights. No scattered `className` overrides. One setting. Every icon obeys.

### Architecture

```
Settings Page ──(user picks)──► localStorage ──(boot read)──► IconContext.Provider
                                                                  │
                                            ┌─────────────────────┤
                                            ▼                     ▼
                                       <Sidebar />           <StoreLayout />
                                       icons auto-weight      icons auto-weight
                                       from context           from context
```

Three pieces:
1. **`src/components/IconContext.tsx`** — React Context + Provider wrapping Phosphor's built-in `IconContext`
2. **`src/components/PAKDEIcon.tsx`** — a thin wrapper component every feature imports instead of raw Phosphor icons
3. **Settings page integration** — weight selector + color picker in `src/features/System/Settings/Settings.tsx`

### 1. IconContext Provider (`src/components/IconContext.tsx`)

```tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { IconContext as PhosphorContext } from "@phosphor-icons/react";

type IconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

interface IconSettings {
  weight: IconWeight;
  color: string;
  size: number;
}

const DEFAULT_SETTINGS: IconSettings = {
  weight: "regular",
  color: "currentColor",   // inherits from parent text color
  size: 16,
};

const STORAGE_KEY = "pakde-icon-settings";

function loadSettings(): IconSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: IconSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// Internal context for the settings state (so Settings page can read/write)
const IconSettingsCtx = createContext<{
  settings: IconSettings;
  setWeight: (w: IconWeight) => void;
  setColor: (c: string) => void;
  setSize: (n: number) => void;
} | null>(null);

export function useIconSettings() {
  const ctx = useContext(IconSettingsCtx);
  if (!ctx) throw new Error("useIconSettings must be used within IconProvider");
  return ctx;
}

export function IconProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<IconSettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setWeight = (w: IconWeight) => setSettings((s) => ({ ...s, weight: w }));
  const setColor = (c: string) => setSettings((s) => ({ ...s, color: c }));
  const setSize = (n: number) => setSettings((s) => ({ ...s, size: n }));

  return (
    <IconSettingsCtx.Provider value={{ settings, setWeight, setColor, setSize }}>
      <PhosphorContext.Provider
        value={{
          weight: settings.weight,
          color: settings.color,
          size: settings.size,
          mirrored: false,
        }}
      >
        {children}
      </PhosphorContext.Provider>
    </IconSettingsCtx.Provider>
  );
}
```

### 2. PAKDEIcon Wrapper (`src/components/PAKDEIcon.tsx`)

Every feature file imports `<PAKDEIcon>` instead of raw Phosphor icons. It automatically respects the global context but allows per-instance overrides when needed (e.g., a red delete button icon always stays red).

```tsx
import { type IconWeight, type Icon as PhosphorBaseIcon } from "@phosphor-icons/react";
import { useIconSettings } from "./IconContext";

type PhosphorIconComponent = React.ForwardRefExoticComponent<
  Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
    weight?: IconWeight;
    color?: string;
    size?: number | string;
    mirrored?: boolean;
  } & React.RefAttributes<SVGSVGElement>
>;

interface PAKDEIconProps {
  component: PhosphorIconComponent;
  /** Override global weight for THIS icon only */
  weight?: IconWeight;
  /** Override global color for THIS icon only */
  color?: string;
  /** Override global size for THIS icon only */
  size?: number;
  className?: string;
}

export default function PAKDEIcon({ component: Icon, weight, color, size, className }: PAKDEIconProps) {
  const { settings } = useIconSettings();
  return (
    <Icon
      weight={weight ?? settings.weight}
      color={color ?? settings.color}
      size={size ?? settings.size}
      className={className}
    />
  );
}
```

**Usage pattern (replaces raw Phosphor import):**

Before (with lucide):
```tsx
import { MapPin, Plus, Trash2 } from "lucide-react";
// ...
<MapPin className="h-3.5 w-3.5 text-amber-400" />
```

After (with PAKDEIcon):
```tsx
import PAKDEIcon from "@/components/PAKDEIcon";
import { MapPin, Plus, Trash } from "@phosphor-icons/react";
// ...
<PAKDEIcon component={MapPin} className="h-3.5 w-3.5 text-amber-400" />
```

The `text-amber-400` Tailwind class still works because Phosphor's `color` defaults to `currentColor` — it inherits from the parent's text color. The global color setting only applies when no Tailwind text color class is present.

### 3. Settings Page Integration

Add a new section to `src/features/System/Settings/Settings.tsx`:

```
┌──────────────────────────────────────────────────┐
│  🎨  Icon Style                                   │
│                                                   │
│  Weight                                           │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┐      │
│  │ Thin │ Light│ Reg. │ Bold │ Fill │ Duo. │      │
│  └──────┴──────┴──────┴──────┴──────┴──────┘      │
│  (bold is selected — emerald border)              │
│                                                   │
│  Preview                                          │
│  ┌──────────────────────────────────────────┐     │
│  │  🏠 Home    👥 Members    📊 Accounting   │     │
│  │  ⚙ Settings   🛒 Sales   🗺️ Store Layout │     │
│  │  (all icons rendered in selected weight)  │     │
│  └──────────────────────────────────────────┘     │
│                                                   │
│  Accent Color                                     │
│  ┌────┬────┬────┬────┬────┬────┬────┬────┐       │
│  │ ██ │ ██ │ ██ │ ██ │ ██ │ ██ │ ██ │ +  │       │
│  └────┴────┴────┴────┴────┴────┴────┴────┘       │
│  Emerald (default)   Amber   Rose   Blue   Custom │
│                                                   │
│  Size                                             │
│  [ 12px ]  [ 14px ]  [ 16px ●]  [ 20px ]         │
└──────────────────────────────────────────────────┘
```

**Preset color palette:**
| Token | Hex | Use case |
|-------|-----|----------|
| Emerald | `#10b981` | Default (matches PAKDE brand) |
| Amber | `#f59e0b` | Warm high-contrast |
| Rose | `#f43f5e` | High visibility |
| Blue | `#60a5fa` | Professional/corporate |
| Slate | `#94a3b8` | Subtle/minimal |
| Custom | (color input) | User-selected |

The Settings page reads/writes via `useIconSettings()` hook. Changes are instant (localStorage + context update).

### 4. Mounting in App.tsx

```tsx
import { IconProvider } from "@/components/IconContext";

export default function App() {
  return (
    <ToastProvider>
      <IconProvider>
        <AppContent />
      </IconProvider>
    </ToastProvider>
  );
}
```

The `IconProvider` wraps the entire app below Toasts so that even error screens get consistent icons.

### 5. Color Inheritance Strategy

Phosphor icons use `color="currentColor"` by default (set by our `DEFAULT_SETTINGS`). This means:

- **Normal flow:** Icon inherits color from its parent's Tailwind `text-*` class → no conflict, works exactly like lucide today
- **Settings override:** User sets a custom color → every icon without an explicit `text-*` class uses that color → but any icon WITH a `text-*` class still wins (explicit beats global)
- **Per-icon override:** `<PAKDEIcon component={...} color="hotpink" />` → that specific icon is hotpink, everything else follows the global rule

**Priority chain:** Per-icon `color` prop > Tailwind `text-*` className > Global settings color > `currentColor` (CSS cascade)

### 6. Migration Impact on Existing Code

**What stays the same:**
- Tailwind `className` props (`h-3.5 w-3.5 text-amber-400`) → unchanged
- Icon sizes through Tailwind → unchanged  
- Conditional color logic → unchanged

**What changes:**
- Import source: `"lucide-react"` → `"@phosphor-icons/react"`
- Some icon names: `Trash2` → `Trash`, `TrendingUp` → `TrendUp`, etc.
- Every `<IconName />` becomes `<PAKDEIcon component={IconName} />`
- Problematic icons use their Phosphor native name (no aliases)

**File count impact:** Every file that imports icons gets +1 import line for `PAKDEIcon`, and changes the JSX for each icon instance. Average 2-3 changed lines per icon. Total ~79 icons × ~2.5 lines = ~200 lines changed across ~30 files.

---

## Implementation Steps (Revised)

1. **Install** `@phosphor-icons/react`:
   ```bash
   pnpm add @phosphor-icons/react
   ```

2. **Create infrastructure** (Batch 0 — foundation):
   - `src/components/IconContext.tsx` — Provider + settings hook + localStorage persistence
   - `src/components/PAKDEIcon.tsx` — wrapper component
   - Update `src/App.tsx` — mount `<IconProvider>`
   - Update `src/features/System/Settings/Settings.tsx` — add icon style section with weight selector, color palette, size slider, and live preview
   - Add i18n keys for the new settings section

3. **Migrate features in batches** (1-9, same order as documented above)
   - Each batch: replace `lucide-react` imports → `@phosphor-icons/react` imports
   - Wrap each icon instance in `<PAKDEIcon component={...} />`
   - Handle name changes (`Trash2` → `Trash`, etc.)
   - Run `tsc --noEmit` after each batch

4. **Remove** `lucide-react` from `package.json`

5. **Verify visual consistency** — test each weight at every feature page

---

## Estimated Effort (Revised)

- Install + infrastructure (IconContext, PAKDEIcon, App.tsx, Settings): **45 min**
- Settings page integration (UI + i18n): **30 min**
- Batch 1-9 migration: **~2 hours** (each batch ~10-15 min)
- Cleanup + final pass: **30 min**

**Total: ~3.5 hours**
