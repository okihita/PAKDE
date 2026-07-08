import "./Learn.css";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, CheckCircleIcon, LockIcon, StarIcon, TrophyIcon, ArrowRight, ArrowLeft } from "@phosphor-icons/react";

import { MODULES, CONNECTIONS, type ModuleDef } from "./curriculum";
import { loadProgress, saveProgress } from "./secureStorage";

const TEXT_START_LESSON = "Start";
const TEXT_LOCKED_MSG = "Prerequisites required:";
const TEXT_COMPLETED_STATUS = "COMPLETED";
const TEXT_SELECT_PROMPT = "Select a node to inspect";

// ── Component ─────────────────────────────────────────────────────

export default function Learn() {
  const { t } = useTranslation();
  const [selectedModuleId, setSelectedModuleId] = useState<string>("mod1");
  const [activeLesson, setActiveLesson] = useState<{ modIdx: number; lesIdx: number } | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [lessonDone, setLessonDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const loaded = await loadProgress();
      setLessonDone(new Set(loaded));
    })();
  }, []);

  const allDone = Array.from(lessonDone);
  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);

  const handleSelectLesson = (modIdx: number, lesIdx: number) => {
    setActiveLesson({ modIdx, lesIdx });
    setQuestionIdx(0);
    setSelected(null);
  };

  const handleAnswer = (idx: number) => {
    setSelected(idx);
  };

  const handleNext = () => {
    const lesson = activeLesson ? MODULES[activeLesson.modIdx].lessons[activeLesson.lesIdx] : null;
    if (!lesson) return;
    if (questionIdx < lesson.questions.length - 1) {
      setQuestionIdx((q) => q + 1);
      setSelected(null);
    } else if (activeLesson) {
      // Mark lesson done
      const key = `${activeLesson.modIdx}-${activeLesson.lesIdx}`;
      setLessonDone((prev) => {
        const next = new Set(prev).add(key);
        saveProgress(Array.from(next)).catch(console.error);
        return next;
      });
    }
  };

  const handlePrev = () => {
    if (questionIdx > 0) {
      setQuestionIdx((q) => q - 1);
      setSelected(null);
    }
  };

  // Helpers
  const isLessonCompleted = (modIdx: number, lesIdx: number) => {
    return lessonDone.has(`${modIdx}-${lesIdx}`);
  };

  const isModuleCompleted = (mod: ModuleDef, modIdx: number) => {
    return mod.lessons.every((_, lesIdx) => isLessonCompleted(modIdx, lesIdx));
  };

  const isModuleUnlocked = (mod: ModuleDef) => {
    if (!mod.prerequisites || mod.prerequisites.length === 0) return true;
    return mod.prerequisites.every((prereqId) => {
      const pIdx = MODULES.findIndex((m) => m.id === prereqId);
      if (pIdx === -1) return true;
      return isModuleCompleted(MODULES[pIdx], pIdx);
    });
  };

  const activeLessonDef = activeLesson ? MODULES[activeLesson.modIdx].lessons[activeLesson.lesIdx] : null;
  const currentQuestion = activeLessonDef?.questions[questionIdx] ?? null;
  const isCorrect = selected !== null && currentQuestion !== null && selected === currentQuestion.correctIndex;
  const isLessonComplete = activeLesson ? lessonDone.has(`${activeLesson.modIdx}-${activeLesson.lesIdx}`) : false;

  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <BookOpenIcon className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{t("sidebar.nav.learn")}</p>
              <p className="text-xxs text-muted-foreground">
                {t("learn.lessonsDone", { done: allDone.length, total: totalLessons })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <StarIcon className="h-4 w-4 text-warning fill-warning" />
            <span className="text-sm font-black text-foreground font-mono">{allDone.length * 10}</span>
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Interactive Tech Tree Map */}
        <div className="lg:col-span-8 flex flex-col bg-card border border-border rounded-lg overflow-hidden p-4 min-h-[400px]">
          <div className="tech-tree-container">
            <div className="tech-tree-canvas">
              {/* SVG connection lines */}
              <svg className="tech-tree-svg">
                {CONNECTIONS.map((c, idx) => {
                  const fromNode = MODULES.find((m) => m.id === c.from);
                  const toNode = MODULES.find((m) => m.id === c.to);
                  if (!fromNode || !toNode) return null;
                  const x1 = fromNode.x * 190 + 90;
                  const y1 = fromNode.y * 110 + 60;
                  const x2 = toNode.x * 190 + 90;
                  const y2 = toNode.y * 110 + 60;

                  const fromIdx = MODULES.findIndex((m) => m.id === c.from);
                  const fromCompleted = isModuleCompleted(fromNode, fromIdx);
                  const toUnlocked = isModuleUnlocked(toNode);

                  // Dynamic color string to support Tauri browsers safely
                  const strokeColor = fromCompleted
                    ? "#10b981" // completed
                    : toUnlocked
                      ? "#475569" // unlocked
                      : "#1e293b"; // locked

                  return (
                    <line
                      key={idx}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={strokeColor}
                      strokeWidth="2.5"
                      strokeDasharray={toUnlocked ? "0" : "4 4"}
                      className="transition-colors duration-300"
                    />
                  );
                })}
              </svg>

              {/* Node cards absolute positioning */}
              {MODULES.map((mod, i) => {
                const isCompleted = isModuleCompleted(mod, i);
                const isUnlocked = isModuleUnlocked(mod);
                const isSelected = selectedModuleId === mod.id;
                const x = mod.x * 190 + 90;
                const y = mod.y * 110 + 60;

                let bgBorder = "bg-slate-950 border-slate-800 text-slate-400";
                if (isCompleted) {
                  bgBorder = "bg-success/20 border-success/40 text-success font-bold";
                } else if (isUnlocked) {
                  bgBorder = "bg-slate-900 border-slate-700 text-slate-200 hover:border-success/30";
                }
                if (isSelected) {
                  bgBorder += " ring-2 ring-brand/50 border-success";
                }

                return (
                  <div
                    key={mod.id}
                    onClick={() => isUnlocked && setSelectedModuleId(mod.id)}
                    className={`tech-tree-node border transition-all duration-200 ${bgBorder} ${
                      !isUnlocked ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                    style={{ left: `${x}px`, top: `${y}px` }}
                  >
                    <div className="flex items-center gap-1 mb-1 font-mono text-xxxs uppercase tracking-wider font-bold">
                      {!isUnlocked ? (
                        <LockIcon className="h-3 w-3 text-slate-500" />
                      ) : isCompleted ? (
                        <TrophyIcon className="h-3 w-3 text-success" />
                      ) : (
                        <BookOpenIcon className="h-3 w-3 text-warning animate-pulse" />
                      )}
                      <span>{mod.id}</span>
                    </div>
                    <div className="font-sans font-bold leading-snug line-clamp-2 px-1 text-xxxs">{mod.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Quiz Drawer or Module Inspector */}
        <div className="lg:col-span-4">
          {activeLesson ? (
            isLessonComplete ? (
              /* Render Lesson Complete area */
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center space-y-3">
                  <CheckCircleIcon className="h-12 w-12 text-success mx-auto" />
                  <p className="text-sm font-bold text-foreground">{t("learn.lessonComplete")}</p>
                  <p className="text-xxs text-muted-foreground">
                    {t("learn.lessonCompleteDesc", { name: activeLessonDef?.name ?? "" })}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setActiveLesson(null)}
                    className="bg-brand hover:bg-brand text-brand-foreground text-xs animate-in fade-in duration-200"
                  >
                    {t("learn.backToModules")}
                  </Button>
                </CardContent>
              </Card>
            ) : !activeLessonDef || activeLessonDef.questions.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <p className="text-xs text-muted-foreground">{t("learn.questionsSoon")}</p>
                </CardContent>
              </Card>
            ) : (
              /* Render Quiz area */
              <Card className="bg-card border-border">
                <CardContent className="p-5 space-y-5">
                  {/* Progress */}
                  <div className="flex items-center justify-between">
                    <span className="text-xxs font-mono text-muted-foreground">
                      {t("learn.questionOf", {
                        name: activeLessonDef.name,
                        current: questionIdx + 1,
                        total: activeLessonDef.questions.length,
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      {activeLessonDef.questions.map((_, qi) => (
                        <div
                          key={qi}
                          className={`h-1.5 w-5 rounded-full ${qi <= questionIdx ? "bg-brand" : "bg-secondary"}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Question */}
                  <div>
                    <p className="text-sm font-bold text-foreground mb-4">{currentQuestion?.question}</p>
                    <div className="space-y-2">
                      {currentQuestion?.choices.map((c, ci) => {
                        const isSelected = selected === ci;
                        const isRight = selected !== null && ci === currentQuestion.correctIndex;
                        const isWrong = selected === ci && selected !== currentQuestion.correctIndex;
                        return (
                          <div
                            key={ci}
                            onClick={() => selected === null && handleAnswer(ci)}
                            className={`p-3 rounded-lg border cursor-pointer text-xs transition-colors ${
                              selected === null
                                ? "border-border hover:bg-secondary hover:border-muted-foreground"
                                : isRight
                                  ? "border-success bg-success/10 text-success font-bold"
                                  : isWrong
                                    ? "border-danger bg-danger/10 text-danger"
                                    : isSelected && selected === ci
                                      ? "border-warning bg-warning/10 text-warning"
                                      : "border-border text-muted-foreground"
                            }`}
                          >
                            <span className="text-xxxs font-mono text-muted-foreground mr-2">
                              {["A", "B", "C", "D"][ci]}.
                            </span>
                            {c}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation after answer */}
                  {selected !== null && (
                    <div
                      className={`p-3 rounded-lg text-xs border ${
                        isCorrect
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }`}
                    >
                      <p className="font-bold mb-0.5">{isCorrect ? t("learn.correct") : t("learn.tryAgain")}</p>
                      <p className="text-xxs opacity-80">{currentQuestion?.explanation}</p>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrev}
                      disabled={questionIdx === 0}
                      className="border-border text-muted-foreground hover:text-foreground text-xxs h-7"
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" /> {t("learn.previous")}
                    </Button>
                    {selected !== null && (
                      <Button
                        size="sm"
                        onClick={handleNext}
                        className="bg-brand hover:bg-brand text-brand-foreground font-bold text-xxs h-7"
                      >
                        {questionIdx < activeLessonDef.questions.length - 1 ? (
                          <>
                            {t("learn.next")} <ArrowRight className="h-3 w-3 ml-1" />
                          </>
                        ) : (
                          t("learn.finishLesson")
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            /* Render Module Inspector Details */
            (() => {
              const selectedModIdx = MODULES.findIndex((m) => m.id === selectedModuleId);
              const selectedMod = MODULES[selectedModIdx];
              if (!selectedMod) {
                return (
                  <Card className="bg-card border-border">
                    <CardContent className="p-12 text-center text-xs text-muted-foreground">
                      {TEXT_SELECT_PROMPT}
                    </CardContent>
                  </Card>
                );
              }

              const isCompleted = isModuleCompleted(selectedMod, selectedModIdx);
              const isUnlocked = isModuleUnlocked(selectedMod);

              return (
                <Card className="bg-card border-border animate-in fade-in duration-200">
                  <CardContent className="p-5 space-y-4">
                    <div className="border-b border-border pb-3.5 space-y-1">
                      <span className="text-xxxs font-mono font-bold text-success uppercase tracking-widest block font-bold">
                        {selectedMod.id}
                      </span>
                      <h2 className="text-sm font-bold text-foreground">{selectedMod.title}</h2>
                      <p className="text-xxs text-muted-foreground leading-relaxed">{selectedMod.desc}</p>
                    </div>

                    {!isUnlocked ? (
                      <div className="p-3.5 bg-danger/10 border border-danger/20 text-xxs font-mono text-danger rounded-lg space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          <LockIcon className="h-3.5 w-3.5 text-danger" />
                          <span>{TEXT_LOCKED_MSG}</span>
                        </p>
                        <p className="text-xxxs opacity-80 leading-normal">{selectedMod.prerequisites.join(", ")}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xxxs font-mono tracking-wider text-slate-400">
                          <span className="uppercase">{t("profileSelect.units")}</span>
                          {isCompleted && (
                            <span className="text-success font-bold tracking-widest">{TEXT_COMPLETED_STATUS}</span>
                          )}
                        </div>
                        <div className="space-y-2.5">
                          {selectedMod.lessons.map((ls, lesIdx) => {
                            const done = isLessonCompleted(selectedModIdx, lesIdx);
                            return (
                              <div
                                key={lesIdx}
                                className="p-3 bg-secondary/35 border border-border/60 hover:border-success/20 rounded-lg flex items-center justify-between hover:bg-secondary/60 transition-all select-none"
                              >
                                <div className="space-y-0.5">
                                  <span className="text-xxxs font-mono text-slate-500">
                                    {selectedMod.id}-{lesIdx + 1}
                                  </span>
                                  <p className="text-xs font-bold text-slate-200">{ls.name}</p>
                                </div>
                                {done ? (
                                  <CheckCircleIcon className="h-4 w-4 text-success shrink-0" />
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleSelectLesson(selectedModIdx, lesIdx)}
                                    className="bg-brand hover:bg-brand text-brand-foreground font-bold text-xxs h-7 px-3.5"
                                  >
                                    {TEXT_START_LESSON}
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                          {selectedMod.lessons.length === 0 && (
                            <div className="text-center py-6 text-xxs text-muted-foreground italic">
                              {t("learn.questionsSoon")}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
