import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ChevronRight, CheckCircle2, Circle, Lock, Star, Trophy } from "lucide-react";

interface Module {
  id: string;
  title: string;
  desc: string;
  lessons: { name: string; done: boolean }[];
}

const MODULES: Module[] = [
  {
    id: "mod1",
    title: "Dasar-Dasar Koperasi",
    desc: "Pahami prinsip, sejarah, dan struktur organisasi koperasi.",
    lessons: [
      { name: "Apa itu Koperasi", done: true },
      { name: "Prinsip-Prinsip Koperasi", done: true },
      { name: "Struktur Organisasi", done: true },
      { name: "Hak dan Kewajiban Anggota", done: false },
    ],
  },
  {
    id: "mod2",
    title: "Manajemen Keuangan",
    desc: "Kelola keuangan koperasi dengan baik dan benar.",
    lessons: [
      { name: "Pembukuan Dasar", done: true },
      { name: "Neraca dan Laba Rugi", done: false },
      { name: "Analisis Rasio Keuangan", done: false },
      { name: "Pengelolaan SHU", done: false },
    ],
  },
  {
    id: "mod3",
    title: "Tata Kelola & Kepatuhan",
    desc: "Pastikan koperasi berjalan sesuai regulasi yang berlaku.",
    lessons: [
      { name: "AD/ART & Legalitas", done: false },
      { name: "RAT dan Pelaporan", done: false },
      { name: "Kepatuhan Pajak", done: false },
      { name: "Sanksi dan Risiko", done: false },
    ],
  },
  {
    id: "mod4",
    title: "Pengembangan Usaha",
    desc: "Ekspansi dan inovasi unit usaha koperasi.",
    lessons: [
      { name: "Identifikasi Peluang Usaha", done: false },
      { name: "Business Plan Koperasi", done: false },
      { name: "Strategi Pemasaran", done: false },
      { name: "Digitalisasi Layanan", done: false },
    ],
  },
  {
    id: "mod5",
    title: "Kepemimpinan & Organisasi",
    desc: "Jadilah pemimpin koperasi yang efektif dan inspiratif.",
    lessons: [
      { name: "Gaya Kepemimpinan", done: false },
      { name: "Manajemen Konflik", done: false },
      { name: "Pengambilan Keputusan", done: false },
      { name: "Membangun Tim Solid", done: false },
    ],
  },
];

export default function Learn() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>("mod1");

  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
  const doneLessons = MODULES.reduce((sum, m) => sum + m.lessons.filter((l) => l.done).length, 0);

  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      {/* Header */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{t("sidebar.nav.learn")}</p>
              <p className="text-xxs text-muted-foreground">
                {t("learn.lessonsDone", { done: doneLessons, total: totalLessons })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-black text-foreground font-mono">{doneLessons * 10}</span>
          </div>
        </CardContent>
      </Card>

      {/* Modules */}
      <div className="space-y-3">
        {MODULES.map((mod, i) => {
          const isOpen = expanded === mod.id;
          const modDone = mod.lessons.filter((l) => l.done).length;
          const unlocked = i === 0 || MODULES[i - 1].lessons.every((l) => l.done);
          return (
            <Card key={mod.id} className={`bg-card border-border overflow-hidden ${!unlocked ? "opacity-50" : ""}`}>
              <div
                className="p-4 flex items-center gap-3 cursor-pointer hover:bg-secondary transition-colors"
                onClick={() => unlocked && setExpanded(isOpen ? null : mod.id)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    unlocked ? "bg-emerald-500/20" : "bg-secondary"
                  }`}
                >
                  {!unlocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : modDone === mod.lessons.length ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Trophy className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{mod.title}</p>
                  <p className="text-xxxs text-muted-foreground">{mod.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xxs font-mono text-muted-foreground">
                    {modDone}/{mod.lessons.length}
                  </p>
                  <ChevronRight
                    className={`h-3 w-3 text-muted-foreground ml-auto transition-transform ${isOpen ? "rotate-90" : ""}`}
                  />
                </div>
              </div>
              {isOpen && (
                <div className="border-t border-border px-4 py-2 space-y-0.5">
                  {mod.lessons.map((ls, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-secondary cursor-pointer"
                    >
                      {ls.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className={`text-xs ${ls.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {ls.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
