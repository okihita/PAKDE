// ── Economic Readiness Level (ERL) 1–9 ────────────────────────────
//
// PAKDE-native maturity band that anchors each cooperative level to
// internationally recognized frameworks (see docs/xp-wiring-plan.md).
// Kept in TS (not i18n) like leveling-data.ts: components read
// nameEn/nameId/descEn/descId directly and switch via the isId locale flag.

export interface ERLLevel {
  /** ERL band, 1–9. */
  level: number;
  nameEn: string;
  nameId: string;
  descEn: string;
  descId: string;
  /** Investment Readiness Level equivalence (numeric, e.g. "5"). */
  irl: string;
  /** Technology / Market Readiness Level equivalence (e.g. "6–7"). */
  trlMrl: string;
  /** Cooperative Maturity Model equivalence (e.g. "5"). */
  cmm: string;
  /** PAKDE XP tiers (1–10) that map onto this band. */
  pakdeTiers: number[];
}

export const ECONOMIC_READINESS_LEVELS: ERLLevel[] = [
  {
    level: 1,
    nameEn: "Nascent",
    nameId: "Embrio",
    descEn: "Idea stage; members gather and save informally, no legal entity.",
    descId: "Gagasan; anggota berkumpul dan menabung secara informal, belum berbadan hukum.",
    irl: "1",
    trlMrl: "1–2",
    cmm: "1",
    pakdeTiers: [1],
  },
  {
    level: 2,
    nameEn: "Founded",
    nameId: "Berbadan Hukum",
    descEn: "Legally established with AD/ART and first members; no core services yet.",
    descId: "Berdiri resmi dengan AD/ART dan anggota pertama; layanan inti belum ada.",
    irl: "2",
    trlMrl: "3",
    cmm: "2",
    pakdeTiers: [2],
  },
  {
    level: 3,
    nameEn: "Operational",
    nameId: "Beroperasi",
    descEn: "Basic services running (savings & loan) with simple bookkeeping; daily ops active.",
    descId: "Layanan dasar berjalan (simpan pinjam) dengan pembukuan sederhana; operasi harian aktif.",
    irl: "3",
    trlMrl: "4–5",
    cmm: "3",
    pakdeTiers: [3],
  },
  {
    level: 4,
    nameEn: "Productive",
    nameId: "Produktif",
    descEn: "Business units generate income; regular savings & loan; healthy liquidity.",
    descId: "Unit usaha menghasilkan pendapatan; simpan pinjam teratur; likuiditas sehat.",
    irl: "4",
    trlMrl: "5–6",
    cmm: "4",
    pakdeTiers: [4],
  },
  {
    level: 5,
    nameEn: "Established",
    nameId: "Mapan",
    descEn: "Stable ops, healthy financial ratios, multiple services, on-time reporting.",
    descId: "Operasi stabil, rasio keuangan sehat, multi-layanan, laporan tepat waktu.",
    irl: "5",
    trlMrl: "6–7",
    cmm: "5",
    pakdeTiers: [5],
  },
  {
    level: 6,
    nameEn: "Resilient",
    nameId: "Tangguh",
    descEn: "Strong risk management, full compliance, no warnings, active supervision.",
    descId: "Manajemen risiko kuat, kepatuhan penuh tanpa teguran, pengawas aktif.",
    irl: "6",
    trlMrl: "7",
    cmm: "6",
    pakdeTiers: [6],
  },
  {
    level: 7,
    nameEn: "Advanced",
    nameId: "Maju",
    descEn: "Multiple profitable units, professional governance, certified management.",
    descId: "Banyak unit usaha untung, tata kelola profesional, pengurus bersertifikat.",
    irl: "7",
    trlMrl: "8",
    cmm: "7",
    pakdeTiers: [7],
  },
  {
    level: 8,
    nameEn: "Innovative",
    nameId: "Inovatif",
    descEn: "Technology adoption & innovative business models with internal controls.",
    descId: "Adopsi teknologi & model bisnis inovatif dengan pengendalian internal.",
    irl: "8",
    trlMrl: "8–9",
    cmm: "8",
    pakdeTiers: [8],
  },
  {
    level: 9,
    nameEn: "Transformational",
    nameId: "Teladan",
    descEn: "Exemplary coop, peak health score, national reference, sustainable.",
    descId: "Koperasi teladan, skor kesehatan puncak, rujukan nasional, berkelanjutan.",
    irl: "9",
    trlMrl: "9",
    cmm: "9",
    pakdeTiers: [9, 10],
  },
];

/** Resolve the ERL band for a PAKDE XP tier (1–10), clamped to 1–9. */
export function getErlForTier(tier: number): ERLLevel {
  return (
    ECONOMIC_READINESS_LEVELS.find((e) => e.pakdeTiers.includes(tier)) ??
    ECONOMIC_READINESS_LEVELS[ECONOMIC_READINESS_LEVELS.length - 1]
  );
}
