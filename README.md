# 💼 PAKDE (Pengelolaan dan Akselerasi Koperasi Desa Elektronik)

[![Live Website](https://img.shields.io/badge/Live_Demo-pakde.vercel.app-emerald?style=for-the-badge)](https://pakde.vercel.app)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?style=for-the-badge&logo=tauri)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Rust](https://img.shields.io/badge/Rust-2021-orange?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows_|_macOS_|_Ubuntu-purple?style=for-the-badge)](#)

---

## 🌐 English Version

> [!IMPORTANT]
> PAKDE is a gamified, offline-first cooperative productivity suite inspired by Duolingo, Habitica, and TickTick. It turns complex village cooperative management into a series of actionable daily quests, empowering rural managers to level up their operations and comply with national regulations effortlessly.

---

### 🔥 The Hackathon Counter-Thesis: Developer Comfort vs. Ground Reality

Most hackathon teams default to building online SaaS web portals or React Native mobile apps. Why? Because those are the easiest boilerplates to copy-paste during a 48-hour sprint. 

**But village reality does not care about developer convenience.**

*   **Cloud SaaS Portals Fail Instantly** under the intermittent 3G/4G connectivity typical of rural Indonesia. If editing a single inventory bin requires an active internet connection, the system is dead on arrival.
*   **Mobile Apps Fail** because rural phones are perpetually full, their memory bloated by family chat apps, images, and unoptimized software.
*   **Phone Screens Are Too Small** for high-fidelity auditing, inventory planning, and SAK EP compliant double-entry bookkeeping.

PAKDE rejects the lazy mainstream approach. We chose the harder engineering path: building a **desktop-native offline node** compiled in Rust and Tauri for **Windows**, **macOS**, and **Ubuntu (Linux)**. 

*   **Offline-First & Speed:** Runs on a local, encrypted SQLite database. Zero latency, zero loading spinners.
*   **Ultra-Lightweight (~10MB):** The entire installer is only 10MB, and data files are less than 1MB.
*   **Zero-Install Portability:** Can be loaded onto a USB flash drive and run directly on low-spec village PCs.
*   **Form-Factor Fit:** Designed for the *Pengurus* (manager) who works on a wide screen, not the casual member on a phone.

---

### 👥 Who Is This For?

The primary user is the **Ketua Koperasi Desa (Village Coop Manager)** — who acts as a **guild manager**. They are not professional accountants; they are farmers, shopkeepers, and community leaders. They have 15-minute windows between real-world chores and zero patience for software manuals. 

PAKDE treats them like a guild leader in an RPG: the app surfaces the next actionable quest, tracks coop XP across 6 aspects, and handles accounting and compliance in the background.

---

### 🎮 Gamified Quests & Built-in Compliance

> **Duolingo Streaks + Habitica Quests + TickTick Focus Timers — for Cooperatives.**

Rural managers don't need more complex settings; they need to know *what to do next, right now*. PAKDE translates complex cooperative management into a **Quest Hub**:

*   **Daily Quests:** Habit-forming micro-tasks ("Assign 3 inventory items to shelf bins").
*   **Weekly Quests:** Recurring operational tasks ("Log this week's POS sales journal").
*   **Main Quests:** Milestones that require structural planning ("Reach Level 3 by completing a financial feasibility study").

Every quest card is a **one-click link** that navigates directly to the page and focuses the input. Completing the quest *is* learning the software.

#### Hardcoded Indonesian Compliance (UU No. 25/1992)
All Indonesian cooperative governance requirements are directly hardcoded into the questlines and aspect levels:

| Regulation | What PAKDE Does | Gamified As |
| :--- | :--- | :--- |
| **UU No. 25 Tahun 1992** | Core cooperative law structure (capital, shares, membership) | "Found the Guild" beginner questline |
| **RAT (Rapat Anggota Tahunan)** | Annual Member Meeting — highest authority | Annual "Guild Summit" main quest |
| **SHU (Sisa Hasil Usaha)** | Mandated surplus distribution (members, reserve fund, education) | "Divide the Loot" financial quest |
| **SAK EP / SAK ETAP** | Double-entry accounting compliance (balance sheet, cash flow) | Aspect-based milestone unlocks |
| **Pembinaan & Pengawasan** | Government health checks & grading (RAG status) | Live RAG badge on guild profile |

---

### ⚙️ Key Technical Features

1.  **Member Management:** Track NIK/KTP registration, voluntary/mandatory savings, and active loan portfolios.
2.  **Point of Sale (POS):** Handles cashier transactions, inventory tracking, and yarnen (credit-based harvesting payments) ledger updates.
3.  **Store Layout Designer:** A 2D visual shelf planner built using `react-konva` for managing WASERDA retail space.
4.  **SAK EP Double-Entry Accounting:** Full Chart of Accounts (COA), general journal, ledger, and automated financial statements.
5.  **Financial Feasibility Calculator:** Evaluates expansion projects using ENPV, EIRR, and EBCR projections.

---

### 🏗️ Architecture & Security

*   **Local SQLite + SQLCipher:** All financial data is encrypted on disk at rest.
*   **HMAC-SHA256 Progress Signing:** Gamification progress, tier levels, and quiz answers are cryptographically signed. Local value tampering resets the stats.
*   **Federated Node Sync:** Sync is optional. If internet is found, nodes push anonymous aggregates to the central API server.
*   **Zero-Knowledge Backups:** Cloud backups are AES-256-GCM encrypted. The private decryption key never leaves the village PC.

---

## 🇮🇩 Bahasa Indonesia

> [!IMPORTANT]
> PAKDE adalah sistem produktivitas koperasi desa offline-first yang menggunakan elemen gamifikasi ala Duolingo dan Habitica. Aplikasi ini mengubah administrasi koperasi yang rumit menjadi "misi harian" terpandu, membantu Pengurus meningkatkan kelas usaha koperasi secara instan.

---

### 🔥 Tesis Kontra Hackathon: Kenyamanan Developer vs. Realita Lapangan

Sebagian besar tim hackathon secara instan membuat aplikasi web online (SaaS) atau aplikasi HP (React Native). Mengapa? Karena teknologi tersebut paling gampang di-copy-paste dari template internet dalam waktu 48 jam.

**Namun, realita desa tidak peduli dengan kenyamanan pengembang.**

*   **Aplikasi Web Cloud Pasti Gagal** di bawah jaringan 3G/4G desa yang tidak stabil. Jika mengedit stok barang saja harus menunggu loading internet, aplikasi tersebut tidak akan terpakai.
*   **Aplikasi HP Gagal** karena penyimpanan HP pengurus/anggota selalu penuh oleh file WhatsApp, gambar, dan aplikasi bawaan yang tidak bisa dihapus.
*   **Layar HP Terlalu Kecil** untuk melakukan audit inventaris, pembukuan akuntansi ganda SAK EP, dan tata letak rak toko.

PAKDE menolak cara malas tersebut. Kami menempuh jalur engineering yang lebih matang: membangun **aplikasi desktop native** menggunakan Rust dan Tauri untuk **Windows**, **macOS**, dan **Ubuntu (Linux)**.

*   **Offline-First:** Menggunakan SQLite lokal terenkripsi. Tanpa loading, tanpa internet.
*   **Sangat Ringan (~10MB):** Ukuran installer hanya 10MB dengan ukuran file data kurang dari 1MB.
*   **Portabilitas Tinggi (Tanpa Instalasi):** Bisa disalin ke Flashdisk dan langsung dijalankan di komputer desa yang berspesifikasi rendah.
*   **Desain Khusus Pengurus:** Dioptimalkan untuk laptop/layar lebar tempat Pengurus Koperasi bekerja secara profesional.

---

### 👥 Untuk Siapa Aplikasi Ini?

Pengguna utama PAKDE adalah **Ketua / Pengurus Koperasi Desa** yang bertindak sebagai **Guild Manager**. Mereka adalah tokoh masyarakat, petani, atau pemilik warung yang mengelola koperasi di sela-sela kesibukan harian mereka.

PAKDE memperlakukan Ketua seperti pemimpin kelompok dalam game RPG: dashboard menyajikan misi harian yang harus diselesaikan, memantau level kesehatan koperasi di 6 dimensi, dan mengurus laporan kepatuhan hukum di latar belakang.

---

### 🎮 Misi Gamifikasi & Kepatuhan Regulasi Terintegrasi

PAKDE menyederhanakan manajemen koperasi menjadi sebuah **Quest Hub**:

*   **Misi Harian (Daily Quests):** Tindakan kecil pembentuk kebiasaan ("Tautkan 3 barang ke dalam rak toko").
*   **Misi Mingguan (Weekly Quests):** Pekerjaan rutin mingguan ("Catat penjualan POS minggu ini ke jurnal").
*   **Misi Utama (Main Quests):** Pencapaian besar koperasi ("Mencapai Level 3 dengan membuat analisis kelayakan usaha").

#### Kepatuhan Hukum UU Koperasi No. 25/1992
Seluruh aturan hukum koperasi di Indonesia telah diintegrasikan langsung ke dalam sistem misi dan level:

*   **UU No. 25/1992 (Dasar Hukum):** Misi awal pendirian koperasi, pembagian simpanan pokok/wajib.
*   **Rapat Anggota Tahunan (RAT):** Misi utama tahunan "KTT Anggota".
*   **Sisa Hasil Usaha (SHU):** Pembagian SHU otomatis ke anggota dan dana cadangan.
*   **SAK EP / SAK ETAP:** Standar akuntansi keuangan ganda otomatis menghasilkan Neraca dan Laba Rugi.

---

### ⚙️ Fitur Teknis Utama

1.  **Fitur Anggota:** Pencatatan NIK, simpanan, dan riwayat pinjaman anggota.
2.  **Point of Sale (POS) & Toko:** Kasir toko kelontong (Waserda) desa dengan sistem pembayaran tunai maupun kredit panen (Yarnen).
3.  **Tata Letak Toko Visual:** Desain rak 2D interaktif (menggunakan `react-konva`) untuk mengelola inventaris secara visual.
4.  **Akuntansi SAK EP:** Chart of Accounts (COA) standar koperasi, jurnal umum, buku besar, neraca saldo, dan laporan keuangan.
5.  **Kelayakan Finansial:** Perhitungan kelayakan ekspansi unit usaha baru (proyeksi cash flow, NPV, IRR, dan BCR).

---

### 🏗️ Arsitektur & Keamanan

*   **SQLite + SQLCipher:** Enkripsi database lokal untuk melindungi data keuangan koperasi.
*   **HMAC-SHA256 Progression Sign:** Mencegah manipulasi level/XP secara ilegal di komputer lokal.
*   **Federated Node Sync:** Sinkronisasi opsional. Data yang dikirim ke cloud hanya berupa data agregat tanpa informasi pribadi (PII).
*   **Zero-Knowledge Backup:** Cadangan data di cloud dienkripsi menggunakan AES-256-GCM. Kunci dekripsi hanya dipegang oleh pengurus koperasi terkait.

---

## 🛠️ Technology Stack (All Languages)

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript 5.8, Tailwind CSS v4 |
| **State Management** | Zustand |
| **Canvas Engine** | Canvas / SVG / CSS |
| **Desktop Runtime** | Tauri v2 (Rust Backend) |
| **Database** | SQLite (SQLCipher binding) |
| **Icons & Font** | Lucide Icons, Space Grotesk, JetBrains Mono |

---

## 🚀 Quickstart & Setup

Please refer to [INSTALLATION.md](INSTALLATION.md) for pre-built desktop installer files (Windows, macOS, and Linux setup instructions) and guidance on running the development environment from source.
