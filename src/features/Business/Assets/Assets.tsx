import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { WarehouseIcon } from "@phosphor-icons/react";
import StoreLayout from "@/features/Business/StoreLayout/StoreLayout";
import Equipment from "@/features/Business/Equipment/Equipment";

type AssetTab = "gedung" | "peralatan";

export default function Assets() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<AssetTab>("gedung");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-6 pb-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <WarehouseIcon className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">{t("sidebar.nav.asetFisik")}</h1>
            <p className="text-xxs text-muted-foreground">{t("assets.description")}</p>
          </div>
        </div>
        <div className="flex gap-1 border-b border-border">
          <button
            type="button"
            onClick={() => setTab("gedung")}
            className={cn(
              "px-3 py-2 text-xs font-semibold border-b-2 transition-colors",
              tab === "gedung"
                ? "border-warning text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t("sidebar.nav.storeLayout")}
          </button>
          <button
            type="button"
            onClick={() => setTab("peralatan")}
            className={cn(
              "px-3 py-2 text-xs font-semibold border-b-2 transition-colors",
              tab === "peralatan"
                ? "border-warning text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t("sidebar.nav.equipment")}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">{tab === "gedung" ? <StoreLayout /> : <Equipment />}</div>
    </div>
  );
}
