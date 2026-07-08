# Manual Test: Profile Selection & Cooperative Lifecycle

> Test all paths through profile selection, coop creation, demo loading, switching, and settings.
> Start with a **fresh database** (delete `~/Library/Application Support/com.okihita.pakde-tauri/kdkmp.db`).

---

## 1. Clean-Launch Baseline

| # | Step | Expected |
|---|------|----------|
| 1.1 | Delete the DB, launch the app | Splash → Profile Select screen. No errors in console. |
| 1.2 | Click **"Koperasi Saya"** | Coop list is empty. "No profiles" empty state renders. |
| 1.3 | Press **Escape** | Quit confirmation dialog appears. Click "Batal" or Escape again. |

---

## 2. Demo Account — Enter & Load

| # | Step | Expected |
|---|------|----------|
| 2.1 | Click **"Coba Demo"** | Three tier cards appear (Pemula, Menengah, Lanjutan). |
| 2.2 | Click **Pemula** card | Campaign Briefing dialog appears. |
| 2.3 | Click **"Mulai"** | Briefing dialog closes. Spinner briefly, then app transitions to main dashboard. |
| 2.4 | Verify dashboard | Cooperative name "Koperasi Maju Bersama" is shown. Health score visible. No "database locked" or "no column" errors. |
| 2.5 | Navigate to **Unit Usaha** | Only "Unit Pupuk" appears (Pemula tier — no Simpan Pinjam, Apotek, or Pemasaran). |
| 2.6 | Navigate to **Settings** | The destructive-action section shows **"Reset Demo"** (not "Hapus Koperasi"). |

---

## 3. Demo Account — Switch Profile Back to Select

| # | Step | Expected |
|---|------|----------|
| 3.1 | In Settings, click **"Ganti Profil"** | Confirmation dialog → click "Keluar" → returns to Profile Select. |
| 3.2 | Verify **"Koperasi Saya"** | List is **empty**. The demo coop must NOT appear here. |
| 3.3 | Click **"Coba Demo"** | Tier cards render. |

---

## 4. Demo Account — Different Tier

| # | Step | Expected |
|---|------|----------|
| 4.1 | Click **Lanjutan** card → **"Mulai"** | Dashboard loads. |
| 4.2 | Navigate to **Unit Usaha** | All 3 units appear: Pupuk, Apotek, Pemasaran. |
| 4.3 | Navigate to **Settings** → note active tier | Confirm it's the full set. |

---

## 5. Demo Reset (Settings)

| # | Step | Expected |
|---|------|----------|
| 5.1 | While in demo, navigate to some pages, make some sales, create inventory, etc. | Data exists (dirty state). |
| 5.2 | Go to **Settings** → click **"Reset Demo"** | First click confirms → second click resets. Page reloads. |
| 5.3 | After reload, check inventory | Inventory is reset to the **saved tier** defaults (not hardcoded "lanjutan"). |
| 5.4 | Verify `localStorage` key | `pakde-demo-tier` should exist with the tier value from step 4.1. |

---

## 6. Real Cooperative — Create

| # | Step | Expected |
|---|------|----------|
| 6.1 | From Profile Select, click **"Daftar"** button (inside "Akun Asli" card) | Create Profile dialog opens. |
| 6.2 | Fill required fields (name, regency, province, officers, category, date). At minimum: | |
| | - Nama Koperasi: *"Koperasi Tani Sejahtera"* | |
| | - Ketua / Sekretaris / Bendahara / Pengawas: any names | |
| | - Kecamatan, Kabupaten, Provinsi: any values | |
| | - Tanggal Berdiri: any date | |
| | - Kategori: *"Simpan Pinjam"* | |
| | Check **Unit Simpan Pinjam** | |
| 6.3 | Click **"Simpan"** | Dialog closes. App transitions to user-create or PIN sign-in. |
| 6.4 | Follow user creation flow | Create an admin user (name, PIN). |
| 6.5 | Dashboard loads | Coop name is "Koperasi Tani Sejahtera". |

---

## 7. Real Cooperative — Koperasi Saya List

| # | Step | Expected |
|---|------|----------|
| 7.1 | Go to **Settings** → **"Ganti Profil"** → confirm | Profile Select screen. |
| 7.2 | Click **"Koperasi Saya"** | "Koperasi Tani Sejahtera" appears in the list. |
| 7.3 | The demo coop "Koperasi Maju Bersama" MUST NOT appear | List contains only real coops. |
| 7.4 | Click the card | Enters the coop. |

---

## 8. Multiple Real Coops

| # | Step | Expected |
|---|------|----------|
| 8.1 | While in a real coop, go to Settings → Switch Profile | Profile Select. |
| 8.2 | Create a **second** real coop: *"Koperasi Desa Makmur"* | Success. |
| 8.3 | Switch back to profile select | Click "Koperasi Saya" → both real coops appear. |
| 8.4 | Order | Most recently created is first (DESC created_at). |
| 8.5 | Demo still does NOT appear | List is demo-free. |

---

## 9. Real Coop — Delete

| # | Step | Expected |
|---|------|----------|
| 9.1 | Enter a real coop. Go to **Settings**. | Destructive section shows **"Hapus Koperasi"** (red). |
| 9.2 | Click **"Hapus Koperasi"** | Confirmation: "Klik lagi untuk hapus". |
| 9.3 | Click again | Processing → returns to Profile Select. |
| 9.4 | Verify "Koperasi Saya" | The deleted coop is gone. |

---

## 10. Auto-Resume Behavior

| # | Step | Expected |
|---|------|----------|
| 10.1 | While in a real coop, close the app (not just window — full quit). | App exits. |
| 10.2 | Relaunch the app. | Splash → resumes into the **same real coop** (no profile select). |
| 10.3 | Switch to demo, then **close and relaunch**. | If only the demo exists (no real coops): Profile Select screen. If a real coop also exists: resumes into the real coop. |

---

## 11. Demo Login Fast-Path (isDemoCooperative)

| # | Step | Expected |
|---|------|----------|
| 11.1 | Enter demo via any tier. | Goes directly to main (skips PIN entry). Current user is auto-set. |
| 11.2 | Verify `currentUser` | Should be "Slamet Riyadi" (admin). |

---

## 12. Real Coop — PIN Sign-In

| # | Step | Expected |
|---|------|----------|
| 12.1 | Create a real coop with an admin user. | App requires PIN sign-in. |
| 12.2 | Enter wrong PIN | Error feedback. |
| 12.3 | Enter correct PIN ("123456" by default) | Enters the dashboard. |

---

## 13. Data Isolation

| # | Step | Expected |
|---|------|----------|
| 13.1 | Enter demo, create some transactions or inventory items. | Demo data exists. |
| 13.2 | Switch to a real coop (via Settings → Ganti Profil). | Real coop has **no demo data** — clean slate. |
| 13.3 | Switch back to demo. | Demo data from step 13.1 is restored (unless Reset Demo was used). |

---

## 14. Settings — Factory Reset (Danger Zone)

| # | Step | Expected |
|---|------|----------|
| 14.1 | Go to Settings → scroll to bottom "Danger Zone". | Factory Reset card visible. |
| 14.2 | Click **"Factory Reset"** | Confirmation: "Klik lagi" or similar. |
| 14.3 | Click again | DB deleted, localStorage cleared, page reloads. Fresh profile select. |
| 14.4 | Verify | "Koperasi Saya" is empty. Demo can be re-seeded. |

---

## 15. Quit Flow

| # | Step | Expected |
|---|------|----------|
| 15.1 | From Profile Select, press **Escape** | Quit confirmation dialog appears. |
| 15.2 | Click **"QUIT"** | App closes (process exits). |
| 15.3 | Relaunch, enter a real coop, press **Escape** | Logout confirmation appears ("Keluar dari Koperasi"), NOT the quit dialog. |
| 15.4 | Click **"Keluar"** | Returns to Profile Select. |
| 15.5 | On Profile Select, press **Escape** again | Quit dialog appears. Click "Batal" → dialog closes, app stays open. |

---

## 16. Edge Cases

| # | Step | Expected |
|---|------|----------|
| 16.1 | DB deleted while app is running (via external `rm`) then try demo | Should error gracefully (db_error screen or console error). |
| 16.2 | Rapid double-click on demo tier card | Only one seed runs. No "database locked" error. |
| 16.3 | Create coop with all fields empty (minimal) | Form validation prevents submission. |
| 16.4 | Open "Koperasi Saya" with 10+ real coops | List scrolls. Each card renders correctly. |
| 16.5 | Toggle sound/music repeatedly | No stutter. State persists across re-renders. |
| 16.6 | Resize window to very small | Responsive layout stacks cards vertically. No overflow / cutoff. |
