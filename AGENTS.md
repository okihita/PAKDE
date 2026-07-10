# AGENTS.md

Project memory for AI coding agents (opencode / Codex / Cursor / Copilot).
Read this before working in the repo.

## Release / Versioning (CRITICAL)

This is a Tauri v2 app. The **git tag is the source of truth for a release**
(e.g. `v0.7.0`). The release workflow (`.github/workflows/release.yml`) publishes
to a release named after `package.json` version, so **all version files must
equal the git tag** — otherwise binaries leak into the wrong release.

To cut a release:
1. Bump **all three** to the same version:
   - `package.json` → `version`
   - `src-tauri/Cargo.toml` → `[package] version`
   - `src-tauri/tauri.conf.json` → `version`
2. Commit, then `git push origin main`.
3. Tag and push: `git tag vX.Y.Z && git push origin vX.Y.Z`.

Safeguards already in place (do not remove):
- `scripts/version-check.sh` runs in the husky pre-commit hook and blocks commits
  where the three version files disagree.
- `release.yml` has a `verify-version` job that fails the build if
  `package.json` version ≠ the git tag.

Never tag a release without first syncing the version files.

## Project Layout
- Frontend: React 19 + Vite + TypeScript, Tailwind, Zustand, i18next (en/id).
- Backend: Rust/Tauri v2; SQLite via `tauri-plugin-sql` (`resources/wilayah.sqlite`).
- Windows installer (NSIS `.exe` + MSI) and macOS universal `.dmg` are produced by
  CI on tag push. Auto-updater artifacts (`latest.json`, `.sig`) are signed with
  `TAURI_SIGNING_PRIVATE_KEY` (repo secret).

## Quality Gates
- `pnpm build` — frontend build.
- `pnpm check` — lint + `tsc` + Prettier + `scripts/prebuild-check.sh`
  (verifies platform icons exist, incl. `src-tauri/icons/icon.ico` for Windows).
- Pre-commit hook runs `lint-staged` then `version-check.sh`.
