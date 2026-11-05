#!/bin/bash
# Dùng: gen-all.sh <thư mục làm việc> [--dry-run]
# Mở clip khi Claude đã duyệt ảnh end của clip: file ok/<tên ảnh end bỏ đuôi>, ví dụ ok/K02. Clip lấy theo thứ tự trong plan.json.
# Hai lần mở cách nhau 45 giây để Flow cài xong giao diện.
CHAIN="$(cd "$(dirname "$0")" && pwd)/../chain.mjs"
cd "$1" || exit 1
mkdir -p ok
while read -r id end; do
  until [ -f "ok/$end" ]; do sleep 5; done
  if [ "$2" = "--dry-run" ]; then echo "$(date +%T) sẽ mở clip $id"; continue; fi
  echo "$(date +%T) mở clip $id"
  node "$CHAIN" gen plan.json "$id" > "gen$id.log" 2>&1 &
  sleep 45
done < <(python3 -c "import json,os; [print(c['id'], os.path.splitext(c['end'])[0]) for c in json.load(open('plan.json'))['clips']]")
wait
echo "$(date +%T) xong"
