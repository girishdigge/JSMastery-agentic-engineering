#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="$HOME/.config/jsm/003-mcp-postgres.env"

if [[ ! -r "$ENV_FILE" ]]; then
    echo "PostgreSQL MCP credentials file not found" >&2
    exit 1
fi

ASDF_BIN="/usr/local/bin/asdf"
NODE_HOME="$("$ASDF_BIN" where nodejs 26.13.1)"
NPX="$NODE_HOME/bin/npx"

if [[ ! -x "$NPX" ]]; then
    echo "npx not found at $NPX" >&2
    exit 1
fi

set -a
source "$ENV_FILE"
set +a

: "${DATABASE_URL:?DATABASE_URL is missing}"

export PG_ALLOW_WRITE=false
export PG_ENABLE_RUNTIME_CONNECT=false
export PG_STATEMENT_TIMEOUT=30000
export PG_CONNECT_TIMEOUT=10000

exec "$NPX" --yes mcp-postgres-server@0.3.1
