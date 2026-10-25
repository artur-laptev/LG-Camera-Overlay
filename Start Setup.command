#!/bin/sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'Install Node.js LTS 22 or newer, then open this file again.'
  exit 1
fi
if [ ! -d node_modules/ssh2 ]; then npm ci --omit=dev --ignore-scripts; fi
printf '%s\n' 'Open the local address printed below in your browser. Leave this window open during setup.'
exec node setup/server.cjs
