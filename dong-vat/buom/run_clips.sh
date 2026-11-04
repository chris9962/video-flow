#!/bin/bash
cd "$(dirname "$0")"
for c in ${CLIPS:-A B C D E}; do
  node /Users/nguyentruong/.claude/skills/flow-chain-video/scripts/chain.mjs gen plan.json $c > gen$c.log 2>&1 || { echo "STOP $c lỗi"; exit 1; }
  grep -E "SSIM|viền đen|✓ Đã lưu" gen$c.log | sed "s/^/[$c] /"
  if grep -q "SAI ảnh start\|viền đen" gen$c.log; then echo "STOP $c"; exit 1; fi
done
echo "ALL DONE"
