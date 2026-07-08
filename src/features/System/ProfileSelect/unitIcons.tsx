import { Plant, CurrencyDollar, FirstAid, Storefront, type Icon } from "@phosphor-icons/react";

interface UnitConfig {
  icon: Icon;
  label: string;
  desc: string;
  boxClass: string;
  iconClass: string;
}

/** Map business unit category IDs to icon + color config. */
export const UNIT_CONFIG: Record<string, UnitConfig> = {
  unit_pupuk: {
    icon: Plant,
    label: "Unit Pupuk",
    desc: "Pupuk bersubsidi bagi anggota tani. Diatur dalam UU 25/1992 pasal 43 — koperasi menyalurkan sarana produksi pertanian.",
    boxClass: "bg-lime-950/60 border-lime-800/40",
    iconClass: "text-lime-500",
  },
  unit_simpan_pinjam: {
    icon: CurrencyDollar,
    label: "Unit Simpan Pinjam",
    desc: "Simpanan dan pinjaman dengan bunga ringan. UU 25/1992 pasal 44 — koperasi dapat menghimpun dana dan menyalurkan pinjaman kepada anggota.",
    boxClass: "bg-yellow-950/60 border-yellow-800/40",
    iconClass: "text-yellow-500",
  },
  unit_apotek: {
    icon: FirstAid,
    label: "Unit Apotek",
    desc: "Obat-obatan dan alat kesehatan terjangkau. Merujuk UU 25/1992 pasal 43(2) — koperasi dapat menyelenggarakan usaha di bidang jasa kesehatan.",
    boxClass: "bg-red-950/60 border-red-800/40",
    iconClass: "text-red-500",
  },
  unit_pemasaran: {
    icon: Storefront,
    label: "Unit Pemasaran",
    desc: "Pemasaran hasil tani secara kolektif. Sesuai UU 25/1992 pasal 4(e) — koperasi membangun kemampuan ekonomi melalui jaringan bersama.",
    boxClass: "bg-blue-950/60 border-blue-800/40",
    iconClass: "text-blue-500",
  },
};

/** Legacy: map unit IDs to outline icons (for backward compat). */
export const UNIT_ICONS: Record<string, Icon> = {
  unit_pupuk: Plant,
  unit_simpan_pinjam: CurrencyDollar,
  unit_apotek: FirstAid,
  unit_pemasaran: Storefront,
};

/** Phosphor icon name for a category ID (used in DB/storage). */
export const UNIT_ICON_NAMES: Record<string, string> = {
  unit_pupuk: "Plant",
  unit_simpan_pinjam: "CurrencyDollar",
  unit_apotek: "FirstAid",
  unit_pemasaran: "Storefront",
};
