#!/bin/bash
# Mở clip khi Claude đã duyệt ảnh end của clip (file ok/Kxx). Hai lần mở cách nhau 45 giây để Flow cài xong giao diện.
cd "$(dirname "$0")"
S=~/.claude/skills/flow-chain-video/scripts/chain.mjs
clips=(M A B C D E F G)
for i in "${!clips[@]}"; do
  id=${clips[$i]}
  end=$(printf 'K%02d' $((i + 1)))
  until [ -f "ok/$end" ]; do sleep 5; done
  echo "$(date +%T) mở clip $id"
  node "$S" gen plan.json "$id" > "gen$id.log" 2>&1 &
  sleep 45
done
wait
echo "$(date +%T) xong"
