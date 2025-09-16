#!/usr/bin/env bash
# Déploiement rapide: reset -> pull -> build -> restart (avec fuser & PM2)
# Usage:
#   BRANCH=main PORT=3001 PM2_NAME=voyance-site ./scripts/deploy.sh
# Variables:
#   BRANCH   = branche git à déployer (défaut: branche courante)
#   PORT     = port backend à libérer (défaut: 3001)
#   PM2_NAME = nom du process PM2 (défaut: voyance-site)

set -euo pipefail

# ---------- Configs ----------
PORT="${PORT:-3001}"
PM2_NAME="${PM2_NAME:-voyance-site}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_DIR="$REPO_DIR"

cd "$REPO_DIR"
echo "📁 Repo: $REPO_DIR"

# ---------- Git sync ----------
echo "\n==> Récupération des changements distants"
git fetch --all --prune
CURRENT_BRANCH="${BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"
echo "📌 Branche: $CURRENT_BRANCH"

echo "\n==> Reset dur sur origin/$CURRENT_BRANCH"
git checkout "$CURRENT_BRANCH"
git reset --hard "origin/$CURRENT_BRANCH"
git clean -fd

# (facultatif, généralement inutile après reset)
(git pull --ff-only origin "$CURRENT_BRANCH" || true) >/dev/null 2>&1 || true

# ---------- Frontend ----------
echo "\n==> Installation des dépendances frontend"
cd "$FRONTEND_DIR"
if [ -f package-lock.json ]; then
  npm ci --omit=dev=false
else
  npm install
fi

echo "\n==> Build frontend"
npm run build

# ---------- Backend ----------
echo "\n==> Installation des dépendances backend"
cd "$BACKEND_DIR"
if [ -f package-lock.json ]; then
  npm ci --omit=dev
else
  npm install --production
fi

# ---------- Network / Ports ----------
echo "\n==> Libération du port $PORT (si occupé)"
if command -v fuser >/dev/null 2>&1; then
  sudo fuser -k "${PORT}/tcp" || true
else
  echo "⚠️  fuser non trouvé, étape ignorée"
fi

# ---------- PM2 ----------
echo "\n==> Redémarrage du backend avec PM2"
if command -v pm2 >/dev/null 2>&1; then
  if pm2 list | grep -q "${PM2_NAME}"; then
    pm2 restart "${PM2_NAME}" --update-env
  else
    pm2 start "$BACKEND_DIR/src/app.js" --name "${PM2_NAME}"
  fi
  pm2 save || true
else
  echo "⚠️  PM2 non trouvé. Lancement fallback: node $BACKEND_DIR/src/app.js &"
  (node "$BACKEND_DIR/src/app.js" >/var/log/voyance-site.log 2>&1 &)
fi

# ---------- Nginx (optionnel) ----------
if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet nginx 2>/dev/null; then
  echo "\n==> Reload Nginx"
  sudo systemctl reload nginx || true
fi

echo "\n✅ Déploiement terminé."
