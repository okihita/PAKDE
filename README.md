# 💼 PAKDE (Platform Aplikasi & Keuangan Koperasi Desa)

> A modern, offline-first, compliant desktop application designed to digitize and empower Indonesian Village Cooperatives (*Koperasi Desa*).

[![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?style=flat-square&logo=tauri)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-2021-orange?style=flat-square&logo=rust)](https://www.rust-lang.org/)
[![SAK EP Compliant](https://img.shields.io/badge/SAK_EP-Compliant-success?style=flat-square)](#)

---

## 💡 The Idea

In Indonesia, village cooperatives (*Koperasi Desa*) play a critical role in local economies but often suffer from manual, paper-based bookkeeping, lack of financial transparency, and poor network connectivity. 

**PAKDE** is a desktop application that acts as an **offline-first local node** for individual cooperatives. Written in React, TypeScript, and Rust (via Tauri) and backed by a local SQLite database, PAKDE allows cooperatives in remote regions with unstable internet to record membership, manage business units, and automatically generate standard-compliant financial statements without dependency on the cloud.

---

## ⭐ The North Star: Federated Node Network

The long-term vision of PAKDE is a **Federated Node Network** that bridges individual local operations with regional and national oversight.

```
┌───────────────────────────────────────────────────────────────┐
│                    NATIONAL DASHBOARD                         │
│       (Web app: aggregate analytics across all nodes)         │
│             Hosted on a central API server                    │
└───────────────────────┬───────────────────────────────────────┘
                        │ HTTPS (REST API)
                        ▼
┌───────────────────────────────────────────────────────────────┐
│                 CENTRAL API SERVER                            │
│  • Cooperative registration & auth                            │
│  • Accepts periodic sync payloads from each node              │
│  • Computes national aggregates & leaderboards                │
└──────┬──────────┬──────────┬──────────┬──────────┬────────────┘
       │          │          │          │          │
       ▼          ▼          ▼          ▼          ▼
   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
   │Kop 1 │  │Kop 2 │  │Kop 3 │  │Kop 4 │  │Kop N │
   │Desa A│  │Desa B│  │Desa C│  │Desa D│  │...   │
   └──────┘  └──────┘  └──────┘  └──────┘  └──────┘
    SQLite     SQLite     SQLite     SQLite     SQLite
   (Local)    (Local)    (Local)    (Local)    (Local)
```

### Key Pillars of the Federated Network
* **Zero PII Cloud Exposure:** Cooperatives only sync anonymous, high-level aggregates (RAG health scores, total member count, asset volume) to the central server. Personally Identifiable Information (PII) never leaves the local machine in plaintext.
* **Dual-Payload Syncing:**
  1. *Public Aggregates:* Derived statistics sent in plaintext to update the public National Dashboard and ranking leaderboards.
  2. *Zero-Knowledge Backups:* A client-side encrypted (AES-256-GCM) backup of the full SQLite database is sent to the cloud for disaster recovery. Only the cooperative holds the decryption passphrase.
* **National Analytics & Rankings:** A central web dashboard aggregates regional performance, enabling governments and financial institutions to monitor cooperative health (Red-Amber-Green status) in real-time.

---

## ✨ Key Features

### 📦 1. Offline-First SQLite Local Node
* Runs entirely locally on desktop (Windows, macOS) using Tauri.
* Decrypts and queries the local SQLite database using device-bound hardware keys via SQLCipher.
* Operates seamlessly in zero-connectivity areas, caching sync logs for when network access becomes available.

### 📊 2. SAK EP Compliant Accounting
* Full double-entry bookkeeping journal.
* Automated generation of compliant financial reports (Balance Sheet, Income Statements, and Annual Profit/SHU distribution).
* Designed for compliance with the Indonesian *Standar Akuntansi Keuangan Entitas Privat* (SAK EP) framework.

### 🏆 3. Aspect-Based Gamified Leveling
* Interactive leveling system guiding cooperatives through 5 developmental tiers: **Pioneer** (*Rintisan*), **Beginner** (*Pemula*), **Growing** (*Bertumbuh*), **Productive** (*Produktif*), and **Established** (*Mapan*).
* Quests split into six key operational aspects:
  * **Membership** (*Keanggotaan*)
  * **Financial** (*Keuangan*)
  * **Governance** (*Tata Kelola*)
  * **Compliance** (*Kepatuhan*)
  * **Business Units** (*Unit Usaha*)
  * **Technology** (*Teknologi*)

### 🛒 4. Business Units & Store Layout Planner
* Manage cooperative stores (*Waserda*), equipment inventory, vendors, and sales logs.
* Visual **Store Layout Planner** powered by Konva.js to design and optimize store shelf arrangements.

### 🤝 5. Community & Social Impact Tracking
* Manage the cooperative's member directory, track attendance/participation in meetings, and monitor social impact programs (environmental, educational, and charity events).

### 🔒 6. Cryptographic Integrity & Anti-Tampering
* **HMAC-SHA256 Verification:** Local progress and curriculum advancement are signed cryptographically using the Web Crypto API to prevent local file-based level hacking.
* **Deterministic Replay Log Validation:** Server-side synchronization replays chronological action logs to verify that achievements and XP gains are legitimate before publishing to the national leaderboard.

---

## 🚀 Hackathon Quickstart

Please refer to [INSTALLATION.md](file:///Users/okihita/ArcaneSanctum/PAKDE/PAKDE-tauri/INSTALLATION.md) for pre-built installers (macOS Gatekeeper workarounds, Windows SmartScreen bypasses) and instructions on running the development environment from source.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, TypeScript 5.8, Tailwind CSS v4, Zustand (state management)
* **Visual Components:** Radix UI primitives, Lucide Icons, Konva.js (for store layout Canvas)
* **Desktop Runtime:** Tauri v2 (Rust backend)
* **Local Database:** SQLite (SQLCipher binding)
* **Styling & Fonts:** JetBrains Mono, Space Grotesk (typography)

---

## 💻 Recommended IDE Setup

* **IDE:** [VS Code](https://code.visualstudio.com/)
* **Recommended Extensions:**
  * [Tauri VS Code Extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
  * [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
  * [Prettier - Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
