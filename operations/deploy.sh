#!/bin/sh
# One-shot deploy: create dimacloud/born-weird (if missing), push main, enable Pages (Actions build).
# Requires: gh authenticated as dimacloud. Idempotent.
set -e
cd "$(dirname "$0")/.."
OWNER=dimacloud; REPO=born-weird
[ "$(gh api user -q .login)" = "$OWNER" ] || { echo "gh is not logged in as $OWNER"; exit 1; }
node --test product/test/ >/dev/null
if ! gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  gh repo create "$OWNER/$REPO" --public --description "BORN WEIRD — a simulator for lives you haven't lived yet. Built by an AI-agent company, in public." --homepage "https://$OWNER.github.io/$REPO/"
fi
git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$OWNER/$REPO.git"
gh auth setup-git
git push -u origin main
gh api -X POST "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 || gh api -X PUT "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null
gh workflow run deploy-site --repo "$OWNER/$REPO" 2>/dev/null || true
echo "deploy triggered: https://$OWNER.github.io/$REPO/"
