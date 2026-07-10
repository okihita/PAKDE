import { useTranslation } from "react-i18next";
import { ArrowLeft, ClockIcon, SparkleIcon } from "@phosphor-icons/react";
import { EVENT_TEMPLATES, computePredictions, formatIdr, type EventTemplate, importanceStars } from "./eventTemplates";

interface Props {
  onSelect: (template: EventTemplate) => void;
  onBack: () => void;
}

const CATEGORY_STYLE: Record<string, { bg: string; text: string }> = {
  core: { bg: "from-warning/20 to-warning/5", text: "text-warning" },
  fun: { bg: "from-violet-500/20 to-violet-500/5", text: "text-violet-400" },
};

export default function EventTemplatePicker({ onSelect, onBack }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 overflow-auto p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xxs text-muted-foreground hover:text-foreground mb-5 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t("common.back")}
      </button>

      <h3 className="text-xxs font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-5">
        <SparkleIcon className="h-3.5 w-3.5 text-warning" />
        {t("event.template.heading")}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {EVENT_TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isCustom = tmpl.id === "custom";
          const stars = importanceStars(tmpl.importance);
          const cat = CATEGORY_STYLE[tmpl.category];
          const prepLabel =
            tmpl.prepDays > 0 ? t("event.template.prepDays", { days: tmpl.prepDays }) : t("event.template.prepCustom");

          if (isCustom) {
            return (
              <div
                key={tmpl.id}
                onClick={() => onSelect(tmpl)}
                className="aspect-[2/3] cursor-pointer transition-all group rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/30 hover:border-success/40 hover:scale-[1.03] hover:shadow-lg hover:shadow-success/5 flex flex-col items-center justify-center p-4 gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-success/10 group-hover:border-success/30 transition-all">
                  <Icon className="h-6 w-6 text-slate-500 group-hover:text-success transition-colors" />
                </div>
                <span className="text-xs font-bold text-slate-500 group-hover:text-success transition-colors text-center">
                  {t(tmpl.i18nKey)}
                </span>
              </div>
            );
          }

          return (
            <div
              key={tmpl.id}
              onClick={() => onSelect(tmpl)}
              className="aspect-[2/3] cursor-pointer transition-all group rounded-xl border-2 border-slate-800 bg-slate-950/60 hover:scale-[1.03] hover:shadow-lg hover:shadow-warning/5 hover:border-slate-700 flex flex-col overflow-hidden"
            >
              {/* ── Artwork zone ── */}
              <div className={`relative flex-1 flex items-center justify-center bg-gradient-to-b ${cat.bg}`}>
                <span className="absolute top-2 left-2 text-xxxs font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-white/70">
                  {t(`event.template.category.${tmpl.category}`)}
                </span>
                <span className="absolute top-2 right-2 text-xxxs font-mono tracking-wide text-warning/80">
                  {stars}
                </span>
                <div className="w-12 h-12 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Icon className={`h-6 w-6 ${cat.text}`} />
                </div>
              </div>

              {/* ── Info zone ── */}
              <div className="p-3 flex flex-col gap-1.5 bg-slate-950/80 border-t border-slate-800/50 flex-[0.55]">
                <h4 className="text-xxs font-bold text-foreground leading-snug line-clamp-2">{t(tmpl.i18nKey)}</h4>
                <div className="flex items-center gap-2 text-xxxs font-mono text-slate-500 mt-auto">
                  <span className="flex items-center gap-0.5">
                    <ClockIcon className="h-3 w-3 text-slate-600" />
                    {prepLabel}
                  </span>
                  <span className="ml-auto tabular-nums">
                    {formatIdr(computePredictions(tmpl, tmpl.defaultAttendees, "").totalCost)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
