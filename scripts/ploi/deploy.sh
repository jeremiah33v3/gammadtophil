#!/usr/bin/env bash

set -Eeuo pipefail

command -v npm >/dev/null 2>&1 || { printf 'npm is required\n' >&2; exit 1; }

npm ci --no-audit --no-fund
npm run build

if [[ ! -f "dist/index.html" ]]; then
    printf 'Frontend build did not produce dist/index.html\n' >&2
    exit 1
fi
