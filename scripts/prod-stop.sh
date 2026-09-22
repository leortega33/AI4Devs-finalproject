#!/usr/bin/env bash
# Stops the Cloudflare tunnel and the production stack. Data is KEPT (volumes
# survive). To also delete the data, pass --wipe.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PIDFILE="/tmp/gym-cloudflared.pid"

echo "Cerrando el túnel..."
[ -f "$PIDFILE" ] && kill "$(cat "$PIDFILE")" 2>/dev/null || true
pkill -f "cloudflared tunnel --url http://localhost:3000" 2>/dev/null || true
rm -f "$PIDFILE"

if [ "${1:-}" = "--wipe" ]; then
  echo "Bajando el stack y BORRANDO los datos (volúmenes)..."
  docker compose -f docker-compose.prod.yml --env-file .env.prod down -v
else
  echo "Bajando el stack (los datos se conservan)..."
  docker compose -f docker-compose.prod.yml --env-file .env.prod down
  echo "Tip: para borrar también los datos, corré: ./scripts/prod-stop.sh --wipe"
fi
