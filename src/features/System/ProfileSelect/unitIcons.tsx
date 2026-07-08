import { Plant, CurrencyDollar, FirstAid, Storefront, type Icon } from "@phosphor-icons/react";

/** Map business unit category IDs to Phosphor icons. */
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
