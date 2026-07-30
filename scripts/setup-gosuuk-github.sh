#!/usr/bin/env bash
set -euo pipefail

REMOTE_URL="${REMOTE_URL:-https://gosuuk@github.com/gosuuk/busan.git}"
BRANCH="${BRANCH:-main}"
GIT_USER_NAME="${GIT_USER_NAME:-gosuuk}"
GIT_USER_EMAIL="${GIT_USER_EMAIL:-gosuuk@users.noreply.github.com}"
COMMIT_MESSAGE="${COMMIT_MESSAGE:-Initial Busan IT community setup}"

if ! command -v git >/dev/null 2>&1; then
  echo "git command is required."
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git init
fi

git branch -M "$BRANCH"

# Repository-local identity. This does not change the Mac's global git config.
git config user.name "$GIT_USER_NAME"
git config user.email "$GIT_USER_EMAIL"

if [[ "$REMOTE_URL" == https://* ]]; then
  git config credential.useHttpPath true
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

echo "Using repository-local git identity:"
echo "  user.name=$(git config user.name)"
echo "  user.email=$(git config user.email)"
echo "Using origin: $(git remote get-url origin)"

if [ -n "$(git status --porcelain)" ]; then
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "$COMMIT_MESSAGE"
  fi
elif ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "No files are staged and there is no commit yet."
  exit 1
fi

git push -u origin "$BRANCH"
