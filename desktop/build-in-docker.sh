#!/bin/sh
# Build the Windows (.exe) and Linux (.AppImage) installers inside Docker.
# Needed on Apple Silicon Macs without Rosetta: electron-builder's NSIS and AppImage tools are x86-64 only.
#   ./build-in-docker.sh            -> Windows + Linux
#   ./build-in-docker.sh --win      -> only Windows (any electron-builder flags work)
set -e
cd "$(dirname "$0")/.."

TARGETS=${*:---win --linux}

# Repo root is mounted because the build copies ../markdownReader.html and ../lib.
# node_modules lives in a volume so the container's Linux packages never mix with the Mac ones.
docker run --rm --platform linux/amd64 \
  -v "$PWD":/project \
  -v mdr-desktop-node-modules:/project/desktop/node_modules \
  -v mdr-electron-cache:/root/.cache/electron \
  -v mdr-electron-builder-cache:/root/.cache/electron-builder \
  -w /project/desktop \
  electronuserland/builder:wine \
  /bin/bash -c "npm ci --no-audit --no-fund && npx electron-builder $TARGETS"
