#!/usr/bin/env bash
set -euo pipefail

node scripts/validate.mjs

VERSION=$(node -p "require('./manifest.json').version")
ARTIFACTS_DIR="${ARTIFACTS_DIR:-dist}"
OUT="$ARTIFACTS_DIR/send_image_to_mockofun-${VERSION}.zip"

mkdir -p "$ARTIFACTS_DIR"
rm -f "$OUT"
zip -q "$OUT" \
  manifest.json \
  service-worker.js \
  site-overlay.js \
  content.css \
  mockofun-main.js \
  mockofun-bridge.js \
  icons/icon-16.png \
  icons/icon-32.png \
  icons/icon-48.png \
  icons/icon-128.png

echo "Built $OUT"
