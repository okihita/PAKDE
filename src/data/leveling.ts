// ── Gamification: Koperasi Leveling System ─────────────────────────
//
// 10 levels × 6 aspects. Each level has quests (subgoals) across aspects.
// XP progress is derived from the cooperative's health score.

import { LEVELS } from "./leveling-data";
export { LEVELS } from "./leveling-data";

export type LevelId =
  "rintisan" | "pemula" | "bertumbuh" | "produktif" | "mapan" | "tangguh" | "maju" | "inovatif" | "modern" | "teladan";

export interface Quest {
  id: string;
  en: string;
}

export interface AspectQuests {
  aspectId: string;
  icon: string;
  labelEn: string;
  labelId: string;
  quests: Quest[];
}

export interface LevelDef {
  id: LevelId;
  tier: number;
  labelEn: string;
  labelId: string;
  descEn: string;
  descId: string;
  color: string;
  bgClass: string;
  textClass: string;
  /** Minimum health score to unlock this level */
  minScore: number;
  /** Maximum health score for this level (next level min - 1) */
  maxScore: number;
  aspects: AspectQuests[];
}

/** Derive XP progress for a level given the current health score */
export function getLevelProgress(level: LevelDef, healthScore: number): { xp: number; maxXp: number; percent: number } {
  const xp = Math.max(0, healthScore - level.minScore);
  const maxXp = level.maxScore - level.minScore;
  const percent = maxXp > 0 ? Math.min(100, Math.round((xp / maxXp) * 100)) : 100;
  return { xp, maxXp, percent };
}

/** Determine which level the cooperative is currently at */
export function getCurrentLevel(healthScore: number): LevelDef {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (healthScore >= level.minScore) current = level;
  }
  return current;
}

export function getLevelById(id: LevelId): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getLevelByTier(tier: number): LevelDef | undefined {
  return LEVELS.find((l) => l.tier === tier);
}
