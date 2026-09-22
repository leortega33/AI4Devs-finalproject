#!/usr/bin/env bash
# Starts the production stack + Cloudflare quick tunnel and prints the public URL.
# Data persists in Docker volumes across restarts (no reseed needed).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE=(docker compose -f docker-compose.prod.yml --env-file .env.prod)
LOG="/tmp/gym-cloudflared.log"
PIDFILE="/tmp/gym-cloudflared.pid"

[ -f .env.prod ] || { echo "ERROR: falta .env.prod en $ROOT (ver docs/deployment.md)"; exit 1; }
command -v cloudflared >/dev/null 2>&1 || { echo "ERROR: cloudflared no instalado (brew install cloudflared)"; exit 1; }

# Free port 3000 if the dev backend is running.
if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Puerto 3000 en uso; frenando el backend dev (ts-node-dev)..."
  pkill -f "ts-node-dev" 2>/dev/null || true
  sleep 1
fi

echo "Levantando el stack de producción..."
"${COMPOSE[@]}" up -d

echo -n "Esperando a que la app responda"
for _ in $(seq 1 40); do
  if curl -sf http://localhost:3000/api/health >/dev/null 2>&1; then echo " OK"; break; fi
  echo -n "."; sleep 1
done

# Restart any previous tunnel, then open a fresh one.
[ -f "$PIDFILE" ] && kill "$(cat "$PIDFILE")" 2>/dev/null || true
pkill -f "cloudflared tunnel --url http://localhost:3000" 2>/dev/null || true
: > "$LOG"
nohup cloudflared tunnel --url http://localhost:3000 > "$LOG" 2>&1 &
echo $! > "$PIDFILE"

echo -n "Abriendo el túnel público"
URL=""
for _ in $(seq 1 40); do
  URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" | head -1 || true)"
  [ -n "$URL" ] && break
  echo -n "."; sleep 1
done
echo

if [ -n "$URL" ]; then
  echo "======================================================"
  echo "  App LIVE en:  $URL"
  echo "======================================================"
  echo "Log del túnel: $LOG    |    Para apagar: ./scripts/prod-stop.sh"
else
  echo "No se pudo obtener la URL pública; revisá $LOG"
  exit 1
fi
