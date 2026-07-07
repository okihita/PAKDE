import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { IconContext as PhosphorContext } from "@phosphor-icons/react";
import { loadSettings, saveSettings, type IconSettings, type IconWeight } from "./iconSettings";

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
