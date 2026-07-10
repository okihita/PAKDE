#!/bin/bash
# Version consistency guard for pre-commit.
# The three sources of the app version MUST agree; if they drift, a release
# can be published under the wrong version/tag (see v0.6.0 incident).
set -euo pipefail

PKG=$(node -p "require('./package.json').version")
CARGO=$(grep -m1 '^version = ' src-tauri/Cargo.toml | sed -E 's/version = "(.*)"/\1/')
CONF=$(node -p "require('./src-tauri/tauri.conf.json').version")

echo "Version check -> package.json=$PKG  Cargo.toml=$CARGO  tauri.conf.json=$CONF"

if [ "$PKG" != "$CARGO" ] || [ "$PKG" != "$CONF" ]; then
  echo "ERROR: version files disagree. Keep package.json, src-tauri/Cargo.toml," \
       "and src-tauri/tauri.conf.json in sync before committing."
  exit 1
fi

echo "Versions are consistent."
