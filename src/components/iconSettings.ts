export type IconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

export interface IconSettings {
  weight: IconWeight;
  color: string;
  size: number;
}

const DEFAULT_SETTINGS: IconSettings = {
  weight: "regular",
  color: "currentColor",
  size: 16,
};

const STORAGE_KEY = "pakde-icon-settings";

export function loadSettings(): IconSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: IconSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}
