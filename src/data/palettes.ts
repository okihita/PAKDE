export interface Palette {
  id: string;
  i18nKey: string;
  /** Display color swatch (hex) */
  swatch: string;
  /** CSS custom property values (HSL space-separated: "H S% L%") */
  vars: Record<string, string>;
}

export const PALETTES: Palette[] = [
  {
    id: "emerald",
    i18nKey: "palette.emerald",
    swatch: "#10b981",
    vars: {
      "--brand": "160 84% 39%",
      "--success": "158 64% 52%",
      "--warning": "38 92% 50%",
      "--danger": "350 89% 60%",
      "--info": "217 91% 60%",
    },
  },
  {
    id: "ocean",
    i18nKey: "palette.ocean",
    swatch: "#3b82f6",
    vars: {
      "--brand": "217 91% 60%",
      "--success": "160 84% 39%",
      "--warning": "38 92% 50%",
      "--danger": "350 89% 60%",
      "--info": "245 58% 51%",
    },
  },
  {
    id: "amber",
    i18nKey: "palette.amber",
    swatch: "#f59e0b",
    vars: {
      "--brand": "38 92% 50%",
      "--success": "158 64% 52%",
      "--warning": "25 95% 53%",
      "--danger": "350 89% 60%",
      "--info": "217 91% 60%",
    },
  },
  {
    id: "rose",
    i18nKey: "palette.rose",
    swatch: "#f43f5e",
    vars: {
      "--brand": "350 89% 60%",
      "--success": "158 64% 52%",
      "--warning": "38 92% 50%",
      "--danger": "0 72% 51%",
      "--info": "217 91% 60%",
    },
  },
  {
    id: "slate",
    i18nKey: "palette.slate",
    swatch: "#64748b",
    vars: {
      "--brand": "215 25% 47%",
      "--success": "158 64% 52%",
      "--warning": "38 92% 50%",
      "--danger": "350 89% 60%",
      "--info": "217 91% 60%",
    },
  },
  {
    id: "forest",
    i18nKey: "palette.forest",
    swatch: "#22c55e",
    vars: {
      "--brand": "142 71% 45%",
      "--success": "158 64% 45%",
      "--warning": "38 92% 50%",
      "--danger": "350 89% 60%",
      "--info": "217 91% 60%",
    },
  },
  {
    id: "violet",
    i18nKey: "palette.violet",
    swatch: "#8b5cf6",
    vars: {
      "--brand": "262 83% 66%",
      "--success": "158 64% 52%",
      "--warning": "38 92% 50%",
      "--danger": "350 89% 60%",
      "--info": "245 58% 51%",
    },
  },
  {
    id: "highcontrast",
    i18nKey: "palette.highcontrast",
    swatch: "#ffffff",
    vars: {
      "--brand": "0 0% 90%",
      "--success": "120 100% 75%",
      "--warning": "50 100% 60%",
      "--danger": "0 100% 70%",
      "--info": "210 100% 75%",
    },
  },
];

export function getPalette(id: string): Palette | undefined {
  return PALETTES.find((p) => p.id === id);
}

export const DEFAULT_PALETTE_ID = "emerald";
