// Simple geometric koperasi desa building for the campaign scene.
// Strict shape budget: base = 7 shapes (roof, walls, signboard, 2 windows,
// door, ground line). At/after the goal tier a single "wing" is added (8 total).
// Flat fills via Tailwind classes — no gradients on shapes.

interface KopdesBuildingProps {
  /** Current coop tier (1–10). */
  tier: number;
  /** Tier at which the campaign goal is met (startTier + 2). */
  goalTier: number;
  className?: string;
}

const WALL = "fill-slate-700 stroke-slate-500";
const ROOF = "fill-emerald-800 stroke-emerald-600";
const DOOR = "fill-amber-900 stroke-amber-700";
const WIN = "fill-sky-400/70 stroke-sky-300";
const SIGN = "fill-slate-800 stroke-slate-600";
const WING = "fill-slate-600 stroke-slate-400";
const SIGN_LABEL = "KOPERASI";
const ARIA_LABEL = "Koperasi desa";

export default function KopdesBuilding({ tier, goalTier, className }: KopdesBuildingProps) {
  const won = tier >= goalTier;
  return (
    <svg viewBox="0 0 200 120" className={className ?? "h-28 w-44 drop-shadow"} role="img" aria-label={ARIA_LABEL}>
      {/* ground line */}
      <line x1="6" y1="112" x2="194" y2="112" className="stroke-slate-600" strokeWidth="2" />

      {/* wing (goal reached only) */}
      {won && (
        <g className={WING} strokeWidth="1.5">
          <rect x="150" y="70" width="38" height="42" />
          <polygon points="150,70 169,54 188,70" />
        </g>
      )}

      {/* walls */}
      <rect x="46" y="58" width="104" height="54" className={WALL} strokeWidth="1.5" />

      {/* roof */}
      <polygon points="40,58 98,26 156,58" className={ROOF} strokeWidth="1.5" />

      {/* signboard */}
      <rect x="70" y="40" width="56" height="14" className={SIGN} strokeWidth="1" />
      <text x="98" y="50" textAnchor="middle" className="fill-emerald-300 text-xxxs font-bold">
        {SIGN_LABEL}
      </text>

      {/* windows */}
      <rect x="58" y="72" width="18" height="18" className={WIN} strokeWidth="1" />
      <rect x="122" y="72" width="18" height="18" className={WIN} strokeWidth="1" />

      {/* door */}
      <rect x="88" y="84" width="22" height="28" className={DOOR} strokeWidth="1" />
    </svg>
  );
}
