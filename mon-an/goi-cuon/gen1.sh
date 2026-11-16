#!/bin/bash
# gen1.sh <id>: tạo 1 clip; nếu tải lỗi ENOENT thì tải lại từ project, KHÔNG tạo lại.
id=$1; S=../../.claude/skills/flow-chain-video/scripts
if [ -f clips/$id.mp4 ]; then echo "đã có clips/$id.mp4"; node $S/chain.mjs gen plan.json $id | tail -3; exit 0; fi
node $S/chain.mjs gen plan.json $id > gen-$id.log 2>&1
if [ ! -f clips/$id.mp4 ]; then
  url=$(grep -m1 -o 'https://flow.google.com/[^ ]*project/[0-9a-f-]*' gen-$id.log)
  if [ -z "$url" ]; then echo "✗ không có link project"; tail -5 gen-$id.log; exit 1; fi
  # Flow có thể đã trừ credit và vẫn đang tạo video dù script báo hết giờ chờ: thử tải từ project, không tạo lại.
  # Chỉ tải khi Flow đã trừ credit (số sau nhỏ hơn số trước) hoặc video đã xong.
  charged=$(grep -o 'Credit [^:]*: [0-9.]* → [0-9.]*' gen-$id.log | tail -1 | awk '{a=$(NF-2); b=$NF; gsub(/\./,"",a); gsub(/\./,"",b); if (b+0 < a+0) print "y"}')
  if grep -q "Video xong" gen-$id.log || [ "$charged" = y ]; then
    for n in 1 2 3 4; do
      node $S/flow.mjs --project "$url" --out clips/$id.mp4 --download 1080p >> gen-$id.log 2>&1
      [ -f clips/$id.mp4 ] && break
      sleep 60
    done
  fi
  if [ ! -f clips/$id.mp4 ]; then echo "✗ chưa có clip $id"; tail -5 gen-$id.log; exit 1; fi
  node $S/chain.mjs gen plan.json $id >> gen-$id.log 2>&1
fi
tail -4 gen-$id.log
