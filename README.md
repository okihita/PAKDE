# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## 🚀 Hackathon Release & Installation Guide

To install and run the application, download the installer for your operating system from the [Releases](https://github.com/okihita/PAKDE-tauri/releases) tab.

---

### 💻 macOS Installation & Gatekeeper Workaround

Since this is a hackathon development build and does not have an Apple Developer signature, macOS Gatekeeper will block it by default with the message: *\"Apple could not verify 'pakde-tauri' is free of malware...\"*.

You can easily bypass this using one of the two methods below:

#### Method 1: Right-Click (UI Workaround)
1. Open the downloaded `.dmg` file and drag the app into your **Applications** folder.
2. In Finder, navigate to your **Applications** folder.
3. **Right-click (or Control-click)** the app icon and select **Open** from the context menu.
4. A warning dialog will appear, but it will now include an **Open** button. Click **Open** to run the app.
*(You only need to do this once. Future opens will work normally by double-clicking).*

#### Method 2: Command Line (Fastest)
If you prefer the terminal, remove the macOS quarantine attribute after dragging the app to Applications:
```bash
xattr -cr /Applications/pakde-tauri.app
```
Then, double-click the app to launch it normally.

---

### 🪟 Windows Installation

1. Download the `.msi` or `.exe` installer from the Releases page.
2. Run the installer. 
3. If Windows SmartScreen blocks execution (shows a blue banner saying *\"Windows protected your PC\"*):
   * Click **More info**.
   * Click **Run anyway**.

---

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

---

## 🔒 Security Architecture (Offline & Online Sync)

To support offline-capable learning features while preventing users from tampering with local files (modifying levels, XP, or achievements), the application implements a multi-tiered security model:

### 1. Cryptographic Local Storage Verification (HMAC-SHA256)
- Offline progress (completed curriculum lessons) is persisted in the local workspace.
- To prevent manual manipulation of LocalStorage parameters, each progression update is cryptographically signed using the standard Web Crypto API (`window.crypto.subtle`) with **HMAC-SHA256**.
- The signature is calculated using a secret salt. When loading progress on boot, the app recalculates the signature. If a user manually alters their progress values, the signatures mismatch, and the app resets the tampered values to default.

### 2. SQLCipher Database Encryption
- Production SQLite databases (`kdkmp.db`) will be compiled with **SQLCipher** bindings in the Tauri Rust backend.
- The raw database file is encrypted on disk. The decryption key is generated at runtime combining a compiled binary salt and a hardware-specific device identifier.
- Any attempt to open the SQLite file using external browsers without the key results in unreadable binary noise.

### 3. Server-Side Action-Log Validation (Deterministic Replay)
- When the manager goes online to sync achievements and rankings, the client does not send absolute levels or scores.
- Instead, the client uploads a chronological **Lesson Action Log** (lesson ID, timestamps, answer options selected, and time-taken metrics).
- The online server recalculates the score and unlocks deterministically. Any anomalous action metrics (e.g., finishing a 10-question quiz in 0.2 seconds) are automatically flagged as tampered.

