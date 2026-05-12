#!/usr/bin/env bash
# Replace https://github.com/splurgetech/stake-engine with a fresh snapshot of
# your local web-sdk + math-sdk (filesystem copy, including untracked work).
#
# This removes the cloned .git and re-inits so the remote branch has ONE new
# commit and no prior history (good when the old repo was junk).
#
# Prerequisite: gh auth login   (or working git credentials for HTTPS/SSH push)
#
# Optional:
#   WEB_SRC=/path/to/web-sdk MATH_SRC=/path/to/math-sdk ./push-splurgetech-stake-engine.sh
#   REMOTE_BRANCH=master ./push-splurgetech-stake-engine.sh   # if GitHub default is master
#
set -euo pipefail

GITHUB_USER="splurgetech"
GITHUB_REPO="stake-engine"
REMOTE_URL="https://github.com/${GITHUB_USER}/${GITHUB_REPO}.git"
REMOTE_BRANCH="${REMOTE_BRANCH:-main}"

WEB_SRC="${WEB_SRC:-/Users/evanlegator/web-sdk}"
MATH_SRC="${MATH_SRC:-/Users/evanlegator/math-sdk}"

if [[ ! -d "$WEB_SRC/.git" ]]; then
	echo "error: WEB_SRC is not a git repo: $WEB_SRC" >&2
	exit 1
fi
if [[ ! -d "$MATH_SRC/.git" ]]; then
	echo "error: MATH_SRC is not a git repo: $MATH_SRC" >&2
	exit 1
fi

WORKDIR="$(mktemp -d)"
cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

echo "==> Shallow clone (only to confirm remote + default branch)"
git clone --depth 1 "$REMOTE_URL" "$WORKDIR/repo"
cd "$WORKDIR/repo"

# Wipe old tree + history locally; we'll re-init and force-push one commit.
cd ..
rm -rf repo
mkdir -p "$WORKDIR/repo"
cd "$WORKDIR/repo"

mkdir -p web-sdk math-sdk

echo "==> Syncing web-sdk from $WEB_SRC"
rsync -a \
	--exclude '.git/' \
	--exclude 'node_modules/' \
	--exclude '.svelte-kit/' \
	--exclude 'dist/' \
	--exclude '.turbo/' \
	--exclude 'coverage/' \
	--exclude 'storybook-static/' \
	--exclude '.vercel/' \
	--exclude 'test-results/' \
	"$WEB_SRC/" web-sdk/

echo "==> Syncing math-sdk from $MATH_SRC"
rsync -a \
	--exclude '.git/' \
	--exclude '__pycache__/' \
	--exclude '.venv/' \
	--exclude 'venv/' \
	"$MATH_SRC/" math-sdk/

cat > README.md <<EOF
# stake-engine

Personal monorepo snapshot: **web-sdk** and **math-sdk** copied from a local machine.

| Directory    | Contents                                              |
|-------------|--------------------------------------------------------|
| \`web-sdk/\`  | Frontend / Storybook apps (e.g. clash-kronos-cluster) |
| \`math-sdk/\` | Math / simulation games                               |

Synced with \`web-sdk/tools/push-splurgetech-stake-engine.sh\`.  
Heavy / regenerable dirs are excluded (e.g. \`node_modules\`, \`.svelte-kit\`, \`__pycache__\`).

After cloning this repo elsewhere, run \`pnpm install\` inside \`web-sdk/\` and set up Python deps for \`math-sdk/\` as needed.
EOF

git init
git branch -M "$REMOTE_BRANCH"
git remote add origin "$REMOTE_URL"

git add -A
if git diff --cached --quiet; then
	echo "error: nothing to commit (unexpected)" >&2
	exit 1
fi

git commit -m "Initial snapshot: web-sdk + math-sdk ($(date -u +%Y-%m-%dT%H:%MZ))"

echo "==> Force-pushing to origin $REMOTE_BRANCH (replaces that branch on GitHub)"
git push -u origin "$REMOTE_BRANCH" --force

echo "==> Done: $REMOTE_URL (branch $REMOTE_BRANCH)"
