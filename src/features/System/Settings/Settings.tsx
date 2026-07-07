import "./Settings.css";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUpdater } from "@/hooks/useUpdater";
import { useToast } from "@/hooks/useToast";
import { useIconSettings } from "@/components/IconContext";
import { getDb } from "@/db";
import type { CooperativeProfile } from "@/types";
import { Moon, Sun, Globe, TextAa, Palette, PaintBucket } from "@phosphor-icons/react";

interface Props {
  coopProfile: CooperativeProfile | null;
  setCoopProfile: (v: CooperativeProfile) => void;
  fontSizeSetting: "small" | "normal" | "large" | "xlarge";
  setFontSizeSetting: (v: "small" | "normal" | "large" | "xlarge") => void;
  appTheme: "dark" | "light";
  setAppTheme: (v: "dark" | "light") => void;
}

const FONT_LEVELS = [
  { value: "small", label: "settings.preferences.fontSmall" },
  { value: "normal", label: "settings.preferences.fontNormal" },
  { value: "large", label: "settings.preferences.fontLarge" },
  { value: "xlarge", label: "settings.preferences.fontXLarge" },
] as const;

const THEME_OPTIONS = [
  { value: "dark", icon: Moon, label: "settings.preferences.themeDark" },
  { value: "light", icon: Sun, label: "settings.preferences.themeLight" },
] as const;

const LANG_OPTIONS = [
  { value: "id", flag: "🇮🇩", label: "settings.preferences.languageId" },
  { value: "en", flag: "🇬🇧", label: "settings.preferences.languageEn" },
] as const;

const ICON_WEIGHTS = [
  { value: "thin", label: "Thin" },
  { value: "light", label: "Light" },
  { value: "regular", label: "Regular" },
  { value: "bold", label: "Bold" },
  { value: "fill", label: "Fill" },
  { value: "duotone", label: "Duotone" },
] as const;

const i18nFieldKeys: Record<string, string> = {
  name: "name",
  legal_id: "legalId",
  address: "address",
  village: "village",
  district: "district",
  regency: "regency",
  province: "province",
  postal_code: "postalCode",
  phone: "phone",
  email: "email",
};

export default function Settings({
  coopProfile,
  setCoopProfile,
  fontSizeSetting,
  setFontSizeSetting,
  appTheme,
  setAppTheme,
}: Props) {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);
  const u = useUpdater();
  const toast = useToast();
  const { settings: iconSettings, setWeight } = useIconSettings();

  if (!coopProfile) return <div className="text-muted-foreground text-xs">{t("common.loading")}</div>;

  const handleFieldChange = (key: string, value: string) => {
    setCoopProfile({ ...coopProfile, [key]: value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const db = await getDb();
      await db.execute(
        `UPDATE cooperatives SET name=?, legal_id=?, address=?, village=?, district=?, regency=?, province=?, postal_code=?, phone=?, email=?, business_units=?, officers=?, updated_at=datetime('now') WHERE id='kdp-001'`,
        [
          coopProfile.name,
          coopProfile.legal_id,
          coopProfile.address,
          coopProfile.village,
          coopProfile.district,
          coopProfile.regency,
          coopProfile.province,
          coopProfile.postal_code,
          coopProfile.phone,
          coopProfile.email,
          coopProfile.business_units,
          coopProfile.officers,
        ],
      );
      toast.success(t("toast.profileSaveSuccess"));
    } catch (err) {
      toast.error(t("toast.profileSaveFailed", { error: String(err) }));
    }
  };

  const bannerBase =
    "flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all text-center";
  const bannerActive = "border-emerald-500/50 bg-emerald-500/10";
  const bannerInactive = "border-slate-800 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-900/60";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Cooperative Profile ── */}
        <Card className="bg-card border-border md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t("settings.profileTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                { key: "name" },
                { key: "legal_id" },
                { key: "address" },
                { key: "village" },
                { key: "district" },
                { key: "regency" },
                { key: "province" },
                { key: "postal_code" },
                { key: "phone" },
                { key: "email" },
              ].map(({ key }) => (
                <div key={key} className="space-y-1">
                  <label className="text-muted-foreground font-mono text-xxxs uppercase">
                    {t(`settings.profileFields.${i18nFieldKeys[key]}`)}
                  </label>
                  <Input
                    value={String(coopProfile[key as keyof CooperativeProfile] ?? "")}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    className="bg-input border-border text-xs h-8"
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={handleSaveProfile}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-9 mt-6"
            >
              {t("settings.saveProfile")}
            </Button>
          </CardContent>
        </Card>

        {/* ── Interface Preferences ── */}
        <Card className="bg-card border-border md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Palette className="h-3.5 w-3.5 text-emerald-400" />
              {t("settings.preferences.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {/* Language */}
            <div className="space-y-2">
              <label className="text-xxs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-slate-500" />
                {t("settings.preferences.language")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {LANG_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      i18n.changeLanguage(opt.value);
                      setLang(opt.value);
                    }}
                    className={`${bannerBase} ${lang === opt.value ? bannerActive : bannerInactive}`}
                  >
                    <span className="text-2xl">{opt.flag}</span>
                    <span className="text-xxs font-bold text-foreground">{t(opt.label)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <label className="text-xxs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <PaintBucket className="h-3 w-3 text-slate-500" />
                {t("settings.preferences.theme")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {THEME_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setAppTheme(opt.value)}
                      className={`${bannerBase} ${appTheme === opt.value ? bannerActive : bannerInactive}`}
                    >
                      <Icon className="h-5 w-5" weight={appTheme === opt.value ? "fill" : "regular"} />
                      <span className="text-xxs font-bold text-foreground">{t(opt.label)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <label className="text-xxs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <TextAa className="h-3 w-3 text-slate-500" />
                {t("settings.preferences.fontSize")}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {FONT_LEVELS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFontSizeSetting(opt.value)}
                    className={`py-2 px-1 rounded-lg border-2 cursor-pointer transition-all text-center ${
                      fontSizeSetting === opt.value ? bannerActive : bannerInactive
                    }`}
                  >
                    <span className="text-xxs font-bold text-foreground">{t(opt.label)}</span>
                  </button>
                ))}
              </div>
              <p className="text-xxxs text-muted-foreground font-mono">{t("settings.preferences.fontHint")}</p>
            </div>

            {/* Icon Weight */}
            <div className="space-y-2">
              <label className="text-xxs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="h-3 w-3 text-slate-500" />
                {t("settings.preferences.iconWeight")}
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {ICON_WEIGHTS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setWeight(opt.value)}
                    className={`py-2 px-1 rounded-lg border-2 cursor-pointer transition-all text-center ${
                      iconSettings.weight === opt.value ? bannerActive : bannerInactive
                    }`}
                  >
                    <span className="text-xxxs font-bold text-foreground">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Updater ── */}
        <Card className="bg-card border-border md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t("settings.updater.title")}
            </CardTitle>
            <CardDescription className="text-xxs text-muted-foreground">
              {t("settings.updater.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2 text-xs">
            <Button
              onClick={u.checkUpdateCenter}
              disabled={u.isUpdateChecking}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-9"
            >
              {u.isUpdateChecking ? t("settings.updater.checking") : t("settings.updater.checkButton")}
            </Button>
            {u.updateStatusText && (
              <span className="text-emerald-400 text-xs font-mono font-semibold block text-center">
                {u.updateStatusText}
              </span>
            )}
            {u.downloadContentLength > 0 && (
              <div className="space-y-2 font-mono text-xxs">
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    {`${t("settings.updater.progress")}: ${(u.downloadedBytes / 1024 / 1024).toFixed(2)} MB / ${(u.downloadContentLength / 1024 / 1024).toFixed(2)} MB`}
                  </span>
                  <span className="font-bold text-emerald-400">{u.downloadProgress}%</span>
                </div>
                <div className="w-full bg-input rounded-full h-1.5 border border-border overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${u.downloadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
