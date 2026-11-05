#!/bin/bash
# Tải các clip báo ENOENT từ project Flow, rồi trích khung đầu và khung cuối. Tải lại không tốn tín dụng.
cd "$(dirname "$0")"
S=~/.claude/skills/flow-chain-video/scripts
mkdir -p clips
for id in A B C D E F G H I J; do
  if [ ! -f "clips/$id.mp4" ]; then
    url=$(sed -e 's/\x1b\[[0-9;]*m//g' "gen$id.log" | grep -o 'https://flow.google.com/project/[^ ]*' | tail -1)
    echo "$(date +%T) tải clip $id: $url"
    node "$S/flow.mjs" --project "$url" --out "clips/$id.mp4" --download 1080p 2>&1 | sed -e 's/\x1b\[[0-9;]*m//g' | tail -1 | cut -c1-110
  fi
  node "$S/chain.mjs" gen plan.json "$id" 2>&1 | sed -e 's/\x1b\[[0-9;]*m//g' | tail -1 | cut -c1-110
done
echo "$(date +%T) xong tải lại"
