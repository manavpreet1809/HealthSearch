#!/bin/sh
# Publish the committed code, plus the evaluated local corpus, to a Hugging Face Docker Space.
# Usage: deploy/publish_space.sh <hf-username>/<space-name>   (run `hf auth login` first)
set -eu
SPACE=${1:?usage: deploy/publish_space.sh <hf-username>/<space-name>}
HF=${HF:-.venv/bin/hf}
[ -f data/processed/wellquery.sqlite3 ] || { echo "Run make ingest first" >&2; exit 1; }
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT
git archive HEAD | tar -x -C "$STAGE"
cp deploy/huggingface/README.md "$STAGE/README.md"
mkdir -p "$STAGE/data/processed"
cp data/processed/wellquery.sqlite3 "$STAGE/data/processed/"
"$HF" repos create "$SPACE" --type space --sdk docker --public --exist-ok
# --delete keeps the Space in sync, removing files no longer in the repository.
"$HF" upload "$SPACE" "$STAGE" . --type space --delete "*" \
    --commit-message "Deploy $(git rev-parse --short HEAD)"
echo "Building at https://huggingface.co/spaces/$SPACE (first build takes about 10 minutes)"
