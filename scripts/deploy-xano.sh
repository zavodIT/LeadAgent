#!/usr/bin/env bash
set -euo pipefail

# LeadAgent Xano deployment configuration.
WORKSPACE_ID="168182"
XANO_DIRECTORY="xano"
NODE20_BIN="/opt/homebrew/opt/node@20/bin"

cd "$(dirname "$0")/.."

# Xano CLI 1.2.0 currently fails under Node 26, so prefer the installed Node 20.
if [[ -x "$NODE20_BIN/node" ]]; then
  export PATH="$NODE20_BIN:$PATH"
fi

command -v xano >/dev/null 2>&1 || {
  echo "Error: Xano CLI is not installed." >&2
  exit 1
}

node_major="$(node -p 'process.versions.node.split(`.`)[0]')"
if (( node_major > 22 )); then
  echo "Error: Xano CLI requires Node 20/22; current version is $(node --version)." >&2
  exit 1
fi

include_args=()
if [[ $# -gt 0 ]]; then
  # Optional paths are relative to xano/, for example:
  # scripts/deploy-xano.sh api/leadagent/research/create_POST.xs
  for path in "$@"; do
    include_args+=(--include "$path")
  done
fi

base=(xano workspace push --workspace "$WORKSPACE_ID" --directory "$XANO_DIRECTORY")

echo "==> Validating frontend before Xano deployment"
npm run typecheck

echo "==> Xano dry-run: workspace $WORKSPACE_ID"
"${base[@]}" "${include_args[@]}" --dry-run

echo "==> Deploying to Xano workspace $WORKSPACE_ID"
# The CLI shows the same change preview and requires an explicit y/N confirmation.
"${base[@]}" "${include_args[@]}"
