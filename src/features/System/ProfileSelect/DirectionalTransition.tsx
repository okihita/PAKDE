import { Children, isValidElement, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";

export type SwapDir = "left" | "right" | "fade";

// Outgoing animation duration; the incoming pane swaps in once it finishes.
const DURATION = 220;

interface Props {
  active: string;
  dirMap: Record<string, SwapDir>;
  children: ReactNode;
}

/**
 * Swaps between keyed panes with an enter + exit animation. Each pane enters
 * from the edge declared in `dirMap` (and exits the same way), so a submenu
 * reads as belonging to the card that triggered it. Honors prefers-reduced-motion.
 */
export default function DirectionalTransition({ active, dirMap, children }: Props) {
  // Read keys from the raw children — Children.toArray() would prefix them
  // (e.g. ".$hero"), which would break lookups by the plain `active` key.
  const byKey = new Map<string, ReactElement>();
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.key != null) {
      byKey.set(String(child.key), child as ReactElement);
    }
  });

  const [frameKey, setFrameKey] = useState(active);
  const swapTimer = useRef<number | null>(null);
  const exitTimer = useRef<number | null>(null);

  useEffect(() => {
    if (active === frameKey) return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finish = () => setFrameKey(active);

    const clear = () => {
      if (swapTimer.current) window.clearTimeout(swapTimer.current);
      if (exitTimer.current) window.clearTimeout(exitTimer.current);
    };

    if (reduce) {
      swapTimer.current = window.setTimeout(finish, 0);
      return clear;
    }

    // Hold the outgoing pane for one tick, then start its exit + schedule swap.
    swapTimer.current = window.setTimeout(() => {
      exitTimer.current = window.setTimeout(finish, DURATION);
    }, 0);
    return clear;
  }, [active, frameKey]);

  const transitioning = active !== frameKey;
  const outDir = dirMap[frameKey] ?? "fade";
  const shown = byKey.get(transitioning ? frameKey : active) ?? null;

  const anim = transitioning
    ? outDir === "right"
      ? "ps-anim-out-right"
      : outDir === "left"
        ? "ps-anim-out-left"
        : "ps-anim-out-fade"
    : (dirMap[active] ?? "fade") === "right"
      ? "ps-anim-in-right"
      : (dirMap[active] ?? "fade") === "left"
        ? "ps-anim-in-left"
        : "ps-anim-in-fade";

  // Distinct key per phase so the CSS animation replays on each swap.
  return (
    <div className={`relative w-full ${anim}`} key={transitioning ? `out-${frameKey}` : `in-${active}`}>
      {shown}
    </div>
  );
}
