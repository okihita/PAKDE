import "./Statistics.css";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CooperativeProfile } from "@/types";

interface Props {
  coopProfile: CooperativeProfile | null;
}

export default function Statistics({ coopProfile }: Props) {
  const { t } = useTranslation();

  const ragScore = coopProfile?.health_score ?? 0;

  const pendItems = [
    { label: t("dashboard.simpanan"), value: 320 },
    { label: t("dashboard.pinjaman"), value: 580 },
    { label: t("dashboard.unitUsaha"), value: 210 },
    { label: t("dashboard.lainLain"), value: 165 },
  ];

  const bebanItems = [
    { label: t("dashboard.operasional"), value: 180 },
    { label: t("dashboard.bunga"), value: 95 },
    { label: t("dashboard.penyusutan"), value: 45 },
    { label: t("dashboard.lainLain"), value: 60 },
  ];

  const maxBar = Math.max(...pendItems.map((d) => d.value), ...bebanItems.map((d) => d.value));

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="space-y-6">
        {/* ── COLUMN 2 ──────────────────────────────────────────── */}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: t("dashboard.totalMembers"), value: "328", accent: "text-foreground" },
            { label: t("dashboard.totalAssets"), value: "Rp 1,275M", accent: "text-success" },
            { label: t("dashboard.shuAnnual"), value: "Rp 178M", accent: "text-success" },
            {
              label: t("dashboard.healthScore"),
              value: ragScore > 0 ? `${ragScore}%` : "--",
              accent: ragScore >= 70 ? "text-success" : "text-warning",
            },
          ].map(({ label, value, accent }) => (
            <Card key={label} className="bg-card border-border text-foreground">
              <CardContent className="p-4">
                <p className="text-xxs font-mono text-muted-foreground mb-1">{label}</p>
                <p className={`text-lg font-black font-mono ${accent}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border text-foreground hover-glow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
              {t("dashboard.incomeExpense")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-xxs font-mono text-success mb-2">{t("dashboard.income")}</p>
                <div className="space-y-1.5">
                  {pendItems.map((d) => (
                    <div key={d.label} className="flex items-center gap-2">
                      <span className="text-xxxs font-mono text-muted-foreground w-20 text-right">{d.label}</span>
                      <div className="flex-1 h-3 bg-muted rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-brand/70 rounded-sm"
                          style={{ width: `${(d.value / maxBar) * 100}%` }}
                        />
                      </div>
                      <span className="text-xxxs font-mono text-success w-12 text-right">{d.value}M</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xxs font-mono text-danger mb-2">{t("dashboard.expense")}</p>
                <div className="space-y-1.5">
                  {bebanItems.map((d) => (
                    <div key={d.label} className="flex items-center gap-2">
                      <span className="text-xxxs font-mono text-muted-foreground w-20 text-right">{d.label}</span>
                      <div className="flex-1 h-3 bg-muted rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-danger/70 rounded-sm"
                          style={{ width: `${(d.value / maxBar) * 100}%` }}
                        />
                      </div>
                      <span className="text-xxxs font-mono text-danger w-12 text-right">{d.value}M</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
