/* eslint-disable local/max-lines-per-file */
export interface Question {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonDef {
  name: string;
  questions: Question[];
}

export interface ModuleDef {
  id: string;
  title: string;
  desc: string;
  lessons: LessonDef[];
  x: number;
  y: number;
  prerequisites: string[];
}

export interface Connection {
  from: string;
  to: string;
}

// Helper template to generate quick, valid dummy lessons/questions
function makeLesson(
  name: string,
  qText: string,
  correctAns: string,
  choices: string[],
  explanation: string,
): LessonDef[] {
  const correctIndex = choices.indexOf(correctAns);
  return [
    {
      name,
      questions: [
        {
          question: qText,
          choices,
          correctIndex: correctIndex !== -1 ? correctIndex : 0,
          explanation,
        },
      ],
    },
  ];
}

export const MODULES: ModuleDef[] = [
  // ── Track 1: Dasar Koperasi (Row 2) ───────────────────────────────
  {
    id: "mod_basic_1",
    title: "Sejarah & Lahirnya Koperasi",
    desc: "Memahami awal mula berdirinya gerakan koperasi di Rochdale dan Indonesia.",
    x: 0,
    y: 2,
    prerequisites: [],
    lessons: makeLesson(
      "Sejarah Rochdale",
      "Koperasi modern pertama didirikan di kota apa?",
      "Rochdale",
      ["Rochdale", "London", "Manchester", "Glasgow"],
      "Koperasi modern pertama didirikan oleh para penenun di Rochdale, Inggris pada tahun 1844.",
    ),
  },
  {
    id: "mod_basic_2",
    title: "Koperasi dalam UUD 1945",
    desc: "Mempelajari landasan konstitusional koperasi di Indonesia.",
    x: 1,
    y: 2,
    prerequisites: ["mod_basic_1"],
    lessons: makeLesson(
      "Landasan Hukum",
      "Pasal berapa di UUD 1945 yang mengatur asas kekeluargaan ekonomi?",
      "Pasal 33",
      ["Pasal 33", "Pasal 27", "Pasal 29", "Pasal 30"],
      "Pasal 33 UUD 1945 menyatakan perekonomian disusun sebagai usaha bersama berdasarkan asas kekeluargaan.",
    ),
  },
  {
    id: "mod_basic_3",
    title: "Lambang & Identitas",
    desc: "Mengenal simbol-simbol dan identitas visual koperasi Indonesia.",
    x: 2,
    y: 2,
    prerequisites: ["mod_basic_2"],
    lessons: makeLesson(
      "Lambang Koperasi",
      "Pohon beringin dalam lambang koperasi melambangkan apa?",
      "Kemasyarakatan",
      ["Kemasyarakatan", "Keberanian", "Keadilan", "Kemakmuran"],
      "Pohon beringin melambangkan sifat kemasyarakatan dan kepribadian Indonesia yang kokoh berakar.",
    ),
  },
  {
    id: "mod_basic_4",
    title: "7 Prinsip Dasar ICA",
    desc: "Menghayati tujuh prinsip utama International Cooperative Alliance.",
    x: 3,
    y: 2,
    prerequisites: ["mod_basic_3"],
    lessons: makeLesson(
      "Prinsip ICA",
      "Manakah yang merupakan salah satu prinsip dasar ICA?",
      "Otonomi & Kemandirian",
      ["Otonomi & Kemandirian", "Mencari laba sebesar-besarnya", "Keanggotaan tertutup", "Sentralisasi kekuasaan"],
      "Otonomi dan kemandirian adalah salah satu dari 7 prinsip dasar yang menjaga koperasi tetap independen.",
    ),
  },

  // ── Track 2: Manajemen Keuangan (Row 0) ────────────────────────────
  {
    id: "mod_fin_1",
    title: "Pengantar Akuntansi Koperasi",
    desc: "Dasar persamaan akuntansi khusus entitas koperasi.",
    x: 1,
    y: 0,
    prerequisites: ["mod_basic_1"],
    lessons: makeLesson(
      "Dasar Akuntansi",
      "Apakah persamaan dasar akuntansi yang benar?",
      "Aset = Kewajiban + Ekuitas",
      ["Aset = Kewajiban + Ekuitas", "Aset = Kewajiban - Ekuitas", "Modal = Aset + Kewajiban", "SHU = Aset"],
      "Aset (kekayaan) selalu didanai dari dua sumber: Kewajiban (hutang) dan Ekuitas (modal).",
    ),
  },
  {
    id: "mod_fin_2",
    title: "Pencatatan Jurnal Umum",
    desc: "Cara mencatat transaksi harian ke dalam debet dan kredit.",
    x: 2,
    y: 0,
    prerequisites: ["mod_fin_1"],
    lessons: makeLesson(
      "Jurnal Umum",
      "Buku untuk mencatat transaksi secara kronologis disebut?",
      "Jurnal Umum",
      ["Jurnal Umum", "Buku Besar", "Neraca Lajur", "Kwitansi"],
      "Jurnal umum mencatat seluruh transaksi keuangan harian berurutan berdasarkan tanggal.",
    ),
  },
  {
    id: "mod_fin_3",
    title: "Buku Besar & Posting",
    desc: "Mengelompokkan transaksi dari jurnal ke dalam akun buku besar.",
    x: 3,
    y: 0,
    prerequisites: ["mod_fin_2"],
    lessons: makeLesson(
      "Posting Buku Besar",
      "Proses memindahkan catatan dari jurnal ke buku besar disebut?",
      "Posting",
      ["Posting", "Rekonsiliasi", "Auditing", "Klasifikasi"],
      "Posting adalah pemindahan angka debet/kredit secara berkala ke akun masing-masing di buku besar.",
    ),
  },
  {
    id: "mod_fin_4",
    title: "Penyusunan Laba Rugi",
    desc: "Mengevaluasi pendapatan dan beban operasional koperasi.",
    x: 4,
    y: 0,
    prerequisites: ["mod_fin_3"],
    lessons: makeLesson(
      "Laporan Laba Rugi",
      "Laporan Laba Rugi menyajikan informasi tentang apa?",
      "Pendapatan & Beban",
      ["Pendapatan & Beban", "Aset & Hutang", "Arus kas masuk", "Modal awal"],
      "Laporan Laba Rugi memuat perbandingan antara seluruh pendapatan dan beban usaha untuk menghitung SHU bersih.",
    ),
  },
  {
    id: "mod_fin_5",
    title: "Laporan Neraca Tahunan",
    desc: "Menyusun neraca aset, kewajiban, dan ekuitas koperasi.",
    x: 5,
    y: 0,
    prerequisites: ["mod_fin_4"],
    lessons: makeLesson(
      "Neraca Tahunan",
      "Akun manakah yang dilaporkan dalam Neraca?",
      "Kas dan Inventaris",
      ["Kas dan Inventaris", "Beban Sewa", "Pendapatan Jasa", "Biaya Gaji"],
      "Neraca menyajikan akun riil yaitu Aset (kas, piutang, inventaris), Kewajiban, dan Ekuitas.",
    ),
  },
  {
    id: "mod_fin_6",
    title: "Analisis Likuiditas",
    desc: "Mengukur kemampuan bayar kewajiban jangka pendek.",
    x: 6,
    y: 0,
    prerequisites: ["mod_fin_5"],
    lessons: makeLesson(
      "Likuiditas",
      "Rasio likuiditas dihitung dengan membandingkan apa?",
      "Aset Lancar / Kewajiban Lancar",
      ["Aset Lancar / Kewajiban Lancar", "Total Aset / Total Modal", "Pendapatan / Beban", "Kas / SHU"],
      "Likuiditas mengukur seberapa cepat aset lancar dapat melunasi kewajiban jangka pendek.",
    ),
  },
  {
    id: "mod_fin_7",
    title: "Analisis Solvabilitas",
    desc: "Mengukur kemampuan bayar seluruh hutang jangka panjang.",
    x: 7,
    y: 0,
    prerequisites: ["mod_fin_6"],
    lessons: makeLesson(
      "Solvabilitas",
      "Solvabilitas mengukur kemampuan koperasi untuk melunasi?",
      "Seluruh Hutang",
      ["Seluruh Hutang", "Hutang dagang saja", "Gaji pegawai", "Bunga pinjaman"],
      "Solvabilitas menguji kecukupan aset total koperasi jika harus dilikuidasi untuk membayar semua kewajiban.",
    ),
  },
  {
    id: "mod_fin_8",
    title: "Pengelolaan SHU Anggota",
    desc: "Mekanisme alokasi sisa hasil usaha secara adil.",
    x: 8,
    y: 0,
    prerequisites: ["mod_fin_7"],
    lessons: makeLesson(
      "Alokasi SHU",
      "Pembagian SHU kepada anggota dilakukan berdasarkan?",
      "Partisipasi Transaksi",
      ["Partisipasi Transaksi", "Besar Modal Saham", "Senioritas Keanggotaan", "Undian"],
      "SHU koperasi dibagi proporsional terhadap transaksi anggota dengan koperasinya, sesuai asas keadilan.",
    ),
  },

  // ── Track 3: Kepatuhan & Hukum (Row 1) ──────────────────────────────
  {
    id: "mod_gov_1",
    title: "Legalitas & Akta Pendirian",
    desc: "Syarat administratif dan notaris pendirian badan hukum.",
    x: 1,
    y: 1,
    prerequisites: ["mod_basic_1"],
    lessons: makeLesson(
      "Status Hukum",
      "Instansi mana yang mengesahkan badan hukum koperasi Indonesia?",
      "Kemenkumham",
      ["Kemenkumham", "Dinas Koperasi", "Kementerian Keuangan", "Kantor Pajak"],
      "Akta pendirian koperasi disahkan secara resmi oleh Kementerian Hukum dan HAM RI.",
    ),
  },
  {
    id: "mod_gov_2",
    title: "Penyusunan AD/ART",
    desc: "Merumuskan Anggaran Dasar dan Anggaran Rumah Tangga.",
    x: 2,
    y: 1,
    prerequisites: ["mod_gov_1"],
    lessons: makeLesson(
      "AD/ART",
      "Siapa yang berwenang menetapkan perubahan AD/ART?",
      "Rapat Anggota",
      ["Rapat Anggota", "Pengurus", "Dinas Koperasi", "Pengawas"],
      "Rapat Anggota adalah kekuasaan tertinggi yang berhak mengubah isi anggaran dasar koperasi.",
    ),
  },
  {
    id: "mod_gov_3",
    title: "Rapat Anggota Tahunan (RAT)",
    desc: "Tata cara menyelenggarakan forum pengambilan keputusan tertinggi.",
    x: 3,
    y: 1,
    prerequisites: ["mod_gov_2"],
    lessons: makeLesson(
      "Forum RAT",
      "Paling lambat kapan RAT wajib dilaksanakan setelah tutup buku?",
      "6 Bulan",
      ["6 Bulan", "1 Bulan", "3 Bulan", "12 Bulan"],
      "RAT tahunan wajib diselenggarakan pengurus paling lambat 6 bulan setelah akhir tahun buku.",
    ),
  },
  {
    id: "mod_gov_4",
    title: "Peran & Fungsi Pengurus",
    desc: "Tanggung jawab harian dan eksekusi operasional koperasi.",
    x: 4,
    y: 1,
    prerequisites: ["mod_gov_3"],
    lessons: makeLesson(
      "Pengurus",
      "Siapakah yang memilih dan mengangkat pengurus koperasi?",
      "Rapat Anggota",
      ["Rapat Anggota", "Dewan Penasihat", "Pemerintah Daerah", "Manager"],
      "Pengurus dipilih langsung dari dan oleh anggota melalui Rapat Anggota.",
    ),
  },
  {
    id: "mod_gov_5",
    title: "Peran & Fungsi Pengawas",
    desc: "Mengawasi kebijakan pengurus dan kepatuhan AD/ART.",
    x: 5,
    y: 1,
    prerequisites: ["mod_gov_4"],
    lessons: makeLesson(
      "Pengawas",
      "Apakah pengawas boleh merangkap menjadi pengurus?",
      "Tidak Boleh",
      ["Tidak Boleh", "Boleh jika disetujui ketua", "Boleh saat darurat", "Boleh rangkap jabatan"],
      "Untuk menjaga independensi pengawasan, pengawas dilarang merangkap sebagai pengurus.",
    ),
  },
  {
    id: "mod_gov_6",
    title: "Pajak Penghasilan Koperasi",
    desc: "Kewajiban pelaporan SPT dan PPh Badan Koperasi.",
    x: 6,
    y: 1,
    prerequisites: ["mod_gov_5"],
    lessons: makeLesson(
      "PPh Badan",
      "Apakah koperasi merupakan subjek Pajak Penghasilan Badan?",
      "Ya, wajib lapor PPh Badan",
      ["Ya, wajib lapor PPh Badan", "Bebas pajak selamanya", "Hanya jika ditagih dinas", "Hanya jika omset triliunan"],
      "Koperasi adalah badan usaha yang merupakan subjek pajak dalam negeri dan wajib melaporkan SPT Tahunan.",
    ),
  },
  {
    id: "mod_gov_7",
    title: "Audit Eksternal & NIK",
    desc: "Nomor Induk Koperasi dan penjaminan mutu tata kelola.",
    x: 7,
    y: 1,
    prerequisites: ["mod_gov_6"],
    lessons: makeLesson(
      "Sertifikat NIK",
      "Kepanjangan dari NIK koperasi adalah?",
      "Nomor Induk Koperasi",
      ["Nomor Induk Koperasi", "Nomor Identitas Kerja", "Nilai Indeks Keuangan", "Nomor Izin Koperasi"],
      "NIK (Nomor Induk Koperasi) diterbitkan oleh Kementerian Koperasi dan UKM untuk mendata status aktif koperasi.",
    ),
  },
  {
    id: "mod_gov_8",
    title: "Mitigasi Risiko Hukum",
    desc: "Mencegah fraud, sengketa, dan tuntutan hukum pidana.",
    x: 8,
    y: 1,
    prerequisites: ["mod_gov_7"],
    lessons: makeLesson(
      "Mitigasi Risiko",
      "Manakah langkah preventif terbaik menghindari sengketa keuangan?",
      "Audit internal berkala",
      ["Audit internal berkala", "Membuat pembukuan ganda", "Menyembunyikan nota kas", "Menolak rapat anggota"],
      "Transparansi melalui audit berkala yang dilaporkan ke rapat anggota mencegah sengketa dan penyimpangan.",
    ),
  },

  // ── Track 4: Pengembangan Usaha (Row 3) ─────────────────────────────
  {
    id: "mod_biz_1",
    title: "Riset Kebutuhan Anggota",
    desc: "Menyelaraskan unit usaha baru dengan kebutuhan pasar anggota.",
    x: 1,
    y: 3,
    prerequisites: ["mod_basic_1"],
    lessons: makeLesson(
      "Riset Pasar",
      "Unit usaha koperasi idealnya didirikan berdasarkan?",
      "Kebutuhan nyata anggota",
      ["Kebutuhan nyata anggota", "Modal yang melimpah saja", "Hobi pengurus", "Saran pihak ketiga saja"],
      "Prinsip dasar usaha koperasi adalah dari, oleh, dan untuk anggota demi kesejahteraan bersama.",
    ),
  },
  {
    id: "mod_biz_2",
    title: "Studi Kelayakan Usaha",
    desc: "Menganalisis kelayakan pasar, teknis, dan finansial unit usaha.",
    x: 2,
    y: 3,
    prerequisites: ["mod_biz_1"],
    lessons: makeLesson(
      "Analisis Kelayakan",
      "Apa tujuan utama membuat Studi Kelayakan Usaha?",
      "Mengurangi risiko kegagalan",
      ["Mengurangi risiko kegagalan", "Mendapatkan izin instan", "Menghindari pembayaran pajak", "Melaporkan pengurus"],
      "Studi kelayakan menganalisis apakah rencana usaha layak secara ekonomi dan finansial sebelum modal ditanam.",
    ),
  },
  {
    id: "mod_biz_3",
    title: "Pemasaran Produk Lokal",
    desc: "Strategi distribusi dan promosi produk hasil tani/produksi anggota.",
    x: 3,
    y: 3,
    prerequisites: ["mod_biz_2"],
    lessons: makeLesson(
      "Pemasaran",
      "Kelebihan utama memasarkan produk anggota secara kolektif adalah?",
      "Meningkatkan posisi tawar",
      [
        "Meningkatkan posisi tawar",
        "Menghilangkan pesaing total",
        "Harga jual pasti paling mahal",
        "Bebas dari promosi",
      ],
      "Pemasaran bersama (cooperative marketing) meningkatkan volume penawaran dan posisi tawar koperasi di pasar.",
    ),
  },
  {
    id: "mod_biz_4",
    title: "Negosiasi & Kemitraan",
    desc: "Menjalin kerja sama bisnis dengan korporasi/pihak ketiga.",
    x: 4,
    y: 3,
    prerequisites: ["mod_biz_3"],
    lessons: makeLesson(
      "Kemitraan Strategis",
      "Prinsip utama kemitraan bisnis koperasi yang baik adalah?",
      "Saling menguntungkan",
      ["Saling menguntungkan", "Koperasi mendominasi mutlak", "Kemitraan tanpa kontrak", "Mencari celah hukum"],
      "Kemitraan yang berkelanjutan dilandasi prinsip kesetaraan dan keuntungan bersama (win-win).",
    ),
  },
  {
    id: "mod_biz_5",
    title: "Supply Chain Manajemen",
    desc: "Manajemen rantai pasok untuk menekan biaya operasional.",
    x: 5,
    y: 3,
    prerequisites: ["mod_biz_4"],
    lessons: makeLesson(
      "Rantai Pasok",
      "Menghubungkan produsen bahan baku langsung ke gudang koperasi bertujuan untuk?",
      "Memotong biaya perantara",
      ["Memotong biaya perantara", "Memperlambat distribusi", "Menimbun stok berlebih", "Mengurangi omset"],
      "Efisiensi rantai pasok meminimalkan biaya logistik sehingga harga jual produk di toko koperasi lebih bersaing.",
    ),
  },
  {
    id: "mod_biz_6",
    title: "Distribsi Usaha Toko",
    desc: "Manajemen stok retail dan display barang di Toko Desa.",
    x: 6,
    y: 3,
    prerequisites: ["mod_biz_5"],
    lessons: makeLesson(
      "Manajemen Toko",
      "Sistem perputaran stok FIFO artinya barang yang...",
      "Masuk pertama keluar pertama",
      [
        "Masuk pertama keluar pertama",
        "Masuk terakhir keluar pertama",
        "Paling mahal keluar pertama",
        "Paling murah keluar pertama",
      ],
      "FIFO (First In First Out) penting untuk menjaga stok makanan/barang konsumsi agar tidak kedaluwarsa.",
    ),
  },
  {
    id: "mod_biz_7",
    title: "Pemasaran Digital",
    desc: "Memanfaatkan e-commerce dan sosial media untuk produk koperasi.",
    x: 7,
    y: 3,
    prerequisites: ["mod_biz_6"],
    lessons: makeLesson(
      "Digital Marketing",
      "Platform digital manakah yang efektif untuk mempromosikan produk lokal?",
      "Sosial media & E-commerce",
      ["Sosial media & E-commerce", "Koran cetak harian", "Siaran radio lokal", "Papan baliho fisik"],
      "Sosial media dan pasar digital melipatgandakan jangkauan pemasaran hingga ke luar daerah.",
    ),
  },
  {
    id: "mod_biz_8",
    title: "Diversifikasi Usaha",
    desc: "Membuka unit usaha sekunder untuk memperkuat arus kas.",
    x: 8,
    y: 3,
    prerequisites: ["mod_biz_7"],
    lessons: makeLesson(
      "Diversifikasi",
      "Apa risiko terbesar jika koperasi hanya bergantung pada satu jenis usaha?",
      "Kerentanan jika pasar lesu",
      ["Kerentanan jika pasar lesu", "Beban administrasi berkurang", "Modal terbagi merata", "Anggota terlalu aktif"],
      "Diversifikasi membagi risiko operasional ke berbagai portofolio sehingga arus kas lebih tangguh.",
    ),
  },

  // ── Track 5: Kepemimpinan & SDM (Row 2 / Row 4) ────────────────────
  {
    id: "mod_ldr_1",
    title: "Gaya Kepemimpinan Koperasi",
    desc: "Penerapan kepemimpinan partisipatif dalam koperasi.",
    x: 4,
    y: 2,
    prerequisites: ["mod_basic_4"],
    lessons: makeLesson(
      "Gaya Memimpin",
      "Gaya kepemimpinan yang paling sesuai dengan asas kekeluargaan adalah?",
      "Partisipatif/Demokratis",
      ["Partisipatif/Demokratis", "Otoriter", "Militeristik", "Individualistis"],
      "Kepemimpinan demokratis menghargai suara anggota dan mengedepankan musyawarah mufakat.",
    ),
  },
  {
    id: "mod_ldr_2",
    title: "Manajemen Konflik Internal",
    desc: "Strategi menyelesaikan perselisihan antar pengurus dan anggota.",
    x: 5,
    y: 2,
    prerequisites: ["mod_ldr_1"],
    lessons: makeLesson(
      "Mediasi Konflik",
      "Langkah pertama yang paling bijak menyelesaikan konflik di koperasi adalah?",
      "Musyawarah mufakat",
      ["Musyawarah mufakat", "Melaporkan ke polisi langsung", "Mengabaikan masalah", "Memecat anggota secara sepihak"],
      "Musyawarah mufakat adalah prinsip dasar penyelesaian sengketa koperasi sesuai asas kekeluargaan.",
    ),
  },
  {
    id: "mod_ldr_3",
    title: "Rekrutmen Pengurus Baru",
    desc: "Regenerasi kepemimpinan secara periodik dan transparan.",
    x: 6,
    y: 2,
    prerequisites: ["mod_ldr_2"],
    lessons: makeLesson(
      "Regenerasi",
      "Regenerasi pengurus penting dilakukan untuk?",
      "Penyegaran ide & inovasi",
      ["Penyegaran ide & inovasi", "Mengurangi kas koperasi", "Membuat struktur tidak stabil", "Menghindari dinas"],
      "Regenerasi berkala menyuntikkan ide-ide inovatif dan mencegah monopoli kepemimpinan.",
    ),
  },
  {
    id: "mod_ldr_4",
    title: "Budaya Kerja Gotong Royong",
    desc: "Menanamkan nilai tolong menolong (solidaritas) dalam operasional.",
    x: 7,
    y: 2,
    prerequisites: ["mod_ldr_3"],
    lessons: makeLesson(
      "Solidaritas Kerja",
      "Esensi nilai gotong royong dalam tim kerja koperasi adalah?",
      "Bahu-membahu mencapai tujuan",
      [
        "Bahu-membahu mencapai tujuan",
        "Saling melempar tugas",
        "Bekerja jika diawasi pengawas",
        "Mencari keuntungan pribadi",
      ],
      "Gotong royong menumbuhkan sinergi kelompok untuk memecahkan hambatan operasional bersama.",
    ),
  },
  {
    id: "mod_ldr_5",
    title: "Kesejahteraan Anggota",
    desc: "Mendesain program benefit non-finansial bagi anggota aktif.",
    x: 8,
    y: 2,
    prerequisites: ["mod_ldr_4"],
    lessons: makeLesson(
      "Benefit Anggota",
      "Program manakah yang berkontribusi meningkatkan kesejahteraan anggota?",
      "Pelatihan keterampilan gratis",
      ["Pelatihan keterampilan gratis", "Menumpuk laba tanpa dibagi", "Menolak pemberian SHU", "Membatasi pendaftaran"],
      "Pemberdayaan anggota melalui pelatihan keahlian meningkatkan taraf ekonomi mereka secara jangka panjang.",
    ),
  },

  // ── Track 6: Convergence Mastery (Row 2, Column 9) ─────────────────
  {
    id: "mod_mastery",
    title: "Koperasi Paripurna / Global",
    desc: "Integrasi menyeluruh seluruh unit bisnis menuju koperasi tingkat dunia.",
    x: 9,
    y: 2,
    prerequisites: ["mod_fin_8", "mod_gov_8", "mod_biz_8", "mod_ldr_5"],
    lessons: makeLesson(
      "Koperasi Global",
      "Apa syarat utama koperasi dapat berdaya saing di pasar global?",
      "Profesionalisme & Digitalisasi",
      [
        "Profesionalisme & Digitalisasi",
        "Menutup keanggotaan asing",
        "Mengandalkan subsidi total",
        "Mengurangi transparansi keuangan",
      ],
      "Tata kelola yang profesional, transparan, dan terdigitalisasi adalah pilar utama koperasi modern berkelas dunia.",
    ),
  },
];

export const CONNECTIONS: Connection[] = [
  // Core Basics Track
  { from: "mod_basic_1", to: "mod_basic_2" },
  { from: "mod_basic_2", to: "mod_basic_3" },
  { from: "mod_basic_3", to: "mod_basic_4" },

  // Core Splits to Branches
  { from: "mod_basic_1", to: "mod_fin_1" },
  { from: "mod_basic_1", to: "mod_gov_1" },
  { from: "mod_basic_1", to: "mod_biz_1" },

  // Finance Track Branching
  { from: "mod_fin_1", to: "mod_fin_2" },
  { from: "mod_fin_2", to: "mod_fin_3" },
  { from: "mod_fin_3", to: "mod_fin_4" },
  { from: "mod_fin_4", to: "mod_fin_5" },
  { from: "mod_fin_5", to: "mod_fin_6" },
  { from: "mod_fin_6", to: "mod_fin_7" },
  { from: "mod_fin_7", to: "mod_fin_8" },

  // Governance Track Branching
  { from: "mod_gov_1", to: "mod_gov_2" },
  { from: "mod_gov_2", to: "mod_gov_3" },
  { from: "mod_gov_3", to: "mod_gov_4" },
  { from: "mod_gov_4", to: "mod_gov_5" },
  { from: "mod_gov_5", to: "mod_gov_6" },
  { from: "mod_gov_6", to: "mod_gov_7" },
  { from: "mod_gov_7", to: "mod_gov_8" },

  // Business Track Branching
  { from: "mod_biz_1", to: "mod_biz_2" },
  { from: "mod_biz_2", to: "mod_biz_3" },
  { from: "mod_biz_3", to: "mod_biz_4" },
  { from: "mod_biz_4", to: "mod_biz_5" },
  { from: "mod_biz_5", to: "mod_biz_6" },
  { from: "mod_biz_6", to: "mod_biz_7" },
  { from: "mod_biz_7", to: "mod_biz_8" },

  // Leadership Track Branching
  { from: "mod_basic_4", to: "mod_ldr_1" },
  { from: "mod_ldr_1", to: "mod_ldr_2" },
  { from: "mod_ldr_2", to: "mod_ldr_3" },
  { from: "mod_ldr_3", to: "mod_ldr_4" },
  { from: "mod_ldr_4", to: "mod_ldr_5" },

  // Convergence to Endgame Mastery
  { from: "mod_fin_8", to: "mod_mastery" },
  { from: "mod_gov_8", to: "mod_mastery" },
  { from: "mod_biz_8", to: "mod_mastery" },
  { from: "mod_ldr_5", to: "mod_mastery" },
];
