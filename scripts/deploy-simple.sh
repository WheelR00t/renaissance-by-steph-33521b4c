#!/usr/bin/env bash
# Déploiement simple sans PM2: reset -> pull -> build -> restart
# Usage: PORT=3001 ./scripts/deploy-simple.sh

set -euo pipefail

# ---------- Configs ----------
PORT="${PORT:-3001}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_DIR="$REPO_DIR"

cd "$REPO_DIR"
echo "📁 Repo: $REPO_DIR"

# ---------- Git sync ----------
echo "==> Récupération des changements distants"
git fetch --all --prune
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "📌 Branche: $CURRENT_BRANCH"

echo "==> Reset dur sur origin/$CURRENT_BRANCH"
git checkout "$CURRENT_BRANCH"
git reset --hard "origin/$CURRENT_BRANCH"
# Préserver les données persistantes
if command -v git >/dev/null 2>&1; then
  git clean -fd -e backend/data -e backend/data/** -e logs -e logs/**
fi
git pull --ff-only origin "$CURRENT_BRANCH" || true

# ---------- Frontend ----------
echo "==> Installation des dépendances frontend"
cd "$FRONTEND_DIR"
npm install --include=dev

echo "==> Build frontend"
npm run build

# ---------- Backend ----------
echo "==> Installation des dépendances backend"
cd "$BACKEND_DIR"
npm install

# ---------- Kill processus existants ----------
echo "==> Arrêt des processus existants sur port $PORT"
if command -v fuser >/dev/null 2>&1; then
  sudo fuser -k "${PORT}/tcp" || true
  sleep 2
else
  # Alternative avec lsof si fuser n'existe pas
  if command -v lsof >/dev/null 2>&1; then
    PID=$(lsof -ti :$PORT || true)
    if [ -n "$PID" ]; then
      echo "Arrêt du processus $PID sur port $PORT"
      kill "$PID" || sudo kill "$PID" || true
      sleep 2
    fi
  fi
fi

# Chercher et tuer les processus node/voyance existants
pkill -f "node.*app.js" || true
pkill -f "voyance" || true
sleep 1

# ---------- Démarrage ----------
echo "==> Démarrage du backend"
cd "$BACKEND_DIR"
# Démarrage en arrière-plan avec nohup
nohup node src/app.js > ../logs/backend.log 2>&1 &
echo $! > ../backend.pid

echo "==> PID backend: $(cat ../backend.pid)"

# ---------- Nginx reload (optionnel) ----------
if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet nginx 2>/dev/null; then
  echo "==> Reload Nginx"
  sudo systemctl reload nginx || true
fi

echo ""
echo "✅ Déploiement terminé!"
echo "🚀 Backend démarré sur port $PORT"
echo "📝 Logs: tail -f $REPO_DIR/logs/backend.log"
echo "🛑 Stop: kill \$(cat $REPO_DIR/backend.pid)"