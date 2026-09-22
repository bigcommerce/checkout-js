#!/usr/bin/env bash
#
# Start checkout-js dev against a locally linked @bigcommerce/checkout-sdk.
#
# Enforces the ordering that makes symlinked SDK watching reliable:
#   1. a cold SDK build, so dist/esm + dist/types match src before anything watches
#   2. the SDK watcher, started and given time to produce its first artifact
#   3. the app build, cold-started only once the artifact it resolves exists
#
# Usage:
#   ./scripts/dev-linked-sdk.sh              # full cold SDK rebuild (safe default)
#   SKIP_SDK_BUILD=1 ./scripts/dev-linked-sdk.sh   # dist already fresh, just watch
#   SDK_PATH=../my-sdk ./scripts/dev-linked-sdk.sh

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SDK_PATH="${SDK_PATH:-../checkout-sdk-js}"
SDK_DIR="$(cd "$APP_DIR/$SDK_PATH" && pwd)"
ESM_BUNDLE="$SDK_DIR/dist/esm/checkout-sdk.js"
LINK="$APP_DIR/node_modules/@bigcommerce/checkout-sdk"

cd "$APP_DIR"

# --- 0. the link must actually point at the SDK we are about to build ----------
if [ ! -L "$LINK" ]; then
    echo "❌ $LINK is not a symlink."
    echo "   Link it first:  ln -sfn \"$SDK_DIR\" \"$LINK\""
    exit 1
fi

LINK_TARGET="$(cd "$(dirname "$LINK")" && cd "$(readlink "$LINK")" && pwd)"

if [ "$LINK_TARGET" != "$SDK_DIR" ]; then
    echo "❌ Link points at a different SDK than the one being built."
    echo "   link  -> $LINK_TARGET"
    echo "   build -> $SDK_DIR"
    exit 1
fi

echo "🔗 checkout-sdk -> $SDK_DIR"

# --- 1. cold SDK build: fresh dist/esm AND fresh dist/types -------------------
# bundle:watch only rebuilds the esm bundle, never the .d.ts files, so types
# must be generated up front or checkout-js typechecks against stale ones.
if [ "${SKIP_SDK_BUILD:-0}" = "1" ]; then
    if [ ! -f "$ESM_BUNDLE" ]; then
        echo "❌ SKIP_SDK_BUILD=1 but $ESM_BUNDLE does not exist. Run without it once."
        exit 1
    fi

    echo "⏩ Skipping SDK rebuild (SKIP_SDK_BUILD=1)"
else
    echo "🏗  Cold-building SDK (dist/esm + dist/types)..."
    (cd "$SDK_DIR" && npm run build:link)
fi

# --- 2. SDK watcher ----------------------------------------------------------
# set -m puts the watcher in its own process group so we can kill nx + webpack
# together when this script exits.
set -m

echo "👀 Starting SDK watcher..."
(cd "$SDK_DIR" && npm run bundle:watch) &
SDK_PGID=$!

cleanup() {
    echo
    echo "🛑 Stopping SDK watcher..."
    kill -- -"$SDK_PGID" 2>/dev/null || kill "$SDK_PGID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# --- 3. wait for the artifact the app resolves via package.json "module" ------
echo "⏳ Waiting for $ESM_BUNDLE..."

for _ in $(seq 1 600); do
    [ -f "$ESM_BUNDLE" ] && break
    sleep 0.5

    if ! kill -0 "$SDK_PGID" 2>/dev/null; then
        echo "❌ SDK watcher exited before producing a bundle."
        exit 1
    fi
done

if [ ! -f "$ESM_BUNDLE" ]; then
    echo "❌ Timed out waiting for the SDK bundle."
    exit 1
fi

echo "✅ SDK bundle present"

# --- 4. webpack cache --------------------------------------------------------
# Left warm deliberately. Clearing it was never implicated in missed SDK edits —
# managedPaths excludes the SDK, so it re-snapshots normally. Config staleness is
# now handled by webpack itself via cache.buildDependencies in webpack.config.js,
# so this script does not second-guess it. CLEAN_CACHE=1 is the manual override.
CACHE_DIR="$APP_DIR/node_modules/.cache"

if [ "${CLEAN_CACHE:-0}" = "1" ]; then
    echo "🧹 Clearing webpack cache (CLEAN_CACHE=1)..."
    rm -rf "$CACHE_DIR"
elif [ -d "$CACHE_DIR" ]; then
    echo "🔥 Keeping webpack cache warm ($(du -sh "$CACHE_DIR" | cut -f1))."
else
    echo "🧊 No webpack cache yet — first compile will be cold."
fi

# --- 5. start the app build --------------------------------------------------
# watchOptions.followSymlinks is bound when the watcher builds its watch list,
# so the app build must start after the link and artifact are in place.
echo "🚀 Starting checkout-js dev..."
npm run dev
