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

