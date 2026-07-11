import { useTranslation } from "react-i18next";
import { Gear, SunIcon, MoonIcon, UserCheck, SignOut, XCircle, CloudCheck } from "@phosphor-icons/react";
import type { TabId } from "@/features/System/moduleUnlock";

interface TopBarProps {
  activeTab: TabId;
  onNavigate: (tab: TabId) => void;
  currentUser: { name: string; role: string } | null;
  appTheme: "dark" | "light";
  onThemeToggle: () => void;
  onSwitchProfile: () => void;
  onQuit: () => void;
}

export default function TopBar({
  activeTab,
  onNavigate,
  currentUser,
  appTheme,
  onThemeToggle,
  onSwitchProfile,
  onQuit,
}: TopBarProps) {
  const { t } = useTranslation();

  const ctrlBtn = "p-2 rounded-lg hover:bg-sidebar-ring transition-colors shrink-0 text-muted-foreground";

  return (
    <div className="bg-sidebar border-b border-border flex items-center justify-end gap-1 px-6 h-12 shrink-0 select-none print:hidden z-40 relative">
      {/* ── Preferences ── */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onNavigate("settings")}
          aria-label={t("sidebar.nav.settings")}
          title={t("sidebar.nav.settings")}
          className={`${ctrlBtn} ${activeTab === "settings" ? "text-foreground bg-sidebar-ring" : ""}`}
        >
          <Gear className="h-4 w-4" />
        </button>
        <button
          onClick={onThemeToggle}
          aria-label={appTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={appTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className={ctrlBtn}
        >
          {appTheme === "dark" ? (
            <SunIcon className="h-4 w-4 hover:text-warning transition-colors" />
          ) : (
            <MoonIcon className="h-4 w-4 hover:text-info transition-colors" />
          )}
        </button>
      </div>

      <span className="h-6 w-px bg-border mx-2 shrink-0" />

      {/* ── Primary action + identity anchor ── */}
      <button
        onClick={() => onNavigate("sync")}
        aria-label={t("sidebar.nav.sync")}
        title={t("sidebar.nav.sync")}
        className={`${ctrlBtn} hover:text-info ${activeTab === "sync" ? "text-foreground bg-sidebar-ring" : ""}`}
      >
        <CloudCheck className="h-4 w-4" />
      </button>

      {/* ── User profile (near-right anchor) ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center ring-1 ring-brand/30">
          <UserCheck className="h-3.5 w-3.5 text-success" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="text-xs font-bold text-foreground truncate max-w-[140px]">{currentUser?.name}</p>
          <p className="text-xxs text-muted-foreground truncate max-w-[140px]">{currentUser?.role}</p>
        </div>
      </div>

      <span className="h-6 w-px bg-border mx-2 shrink-0" />

      {/* ── Session exit ── */}
      <div className="flex items-center gap-1">
        <button
          onClick={onSwitchProfile}
          aria-label={t("profileSelect.switchProfile")}
          title={t("profileSelect.switchProfile")}
          className={`${ctrlBtn} hover:text-danger`}
        >
          <SignOut className="h-4 w-4" />
        </button>
        <button
          onClick={onQuit}
          aria-label={LBL_QUIT}
          title={LBL_QUIT}
          className="p-2 rounded-lg hover:bg-danger/10 transition-colors shrink-0 text-muted-foreground hover:text-danger"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const LBL_QUIT = "Tutup Aplikasi";
