#!/bin/bash
# gen1.sh <id>: tạo 1 clip; nếu tải lỗi ENOENT thì tải lại từ project, KHÔNG tạo lại.
id=$1; S=../../.claude/skills/flow-chain-video/scripts
if [ -f clips/$id.mp4 ]; then echo "đã có clips/$id.mp4"; node $S/chain.mjs gen plan.json $id | tail -3; exit 0; fi
node $S/chain.mjs gen plan.json $id > gen-$id.log 2>&1
if [ ! -f clips/$id.mp4 ]; then
  url=$(grep -m1 -o 'https://flow.google.com/[^ ]*project/[0-9a-f-]*' gen-$id.log)
  if [ -z "$url" ]; then echo "✗ không có link project"; tail -5 gen-$id.log; exit 1; fi
  if grep -q "Video xong" gen-$id.log; then
    node $S/flow.mjs --project "$url" --out clips/$id.mp4 --download 1080p >> gen-$id.log 2>&1
  fi
  if [ ! -f clips/$id.mp4 ]; then echo "✗ chưa có clip $id"; tail -5 gen-$id.log; exit 1; fi
  node $S/chain.mjs gen plan.json $id >> gen-$id.log 2>&1
fi
tail -4 gen-$id.log
