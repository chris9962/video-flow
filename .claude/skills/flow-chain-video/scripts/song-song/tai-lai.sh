#!/bin/bash
# Dùng: tai-lai.sh <thư mục làm việc>
# Chạy sau khi gen-all.sh in "xong". Tải các clip báo ENOENT từ project Flow, rồi trích khung đầu và khung cuối. Tải lại không tốn tín dụng.
DIR=$(cd "$(dirname "$0")" && pwd)
cd "$1" || exit 1
mkdir -p clips
for id in $(python3 -c "import json; print(' '.join(c['id'] for c in json.load(open('plan.json'))['clips']))"); do
  if [ ! -f "clips/$id.mp4" ]; then
    url=$(sed -e 's/\x1b\[[0-9;]*m//g' "gen$id.log" | grep -o 'https://flow.google.com/project/[^ ]*' | tail -1)
    echo "$(date +%T) tải clip $id: $url"
    node "$DIR/../flow.mjs" --project "$url" --out "clips/$id.mp4" --download 1080p 2>&1 | sed -e 's/\x1b\[[0-9;]*m//g' | tail -1 | cut -c1-110
  fi
  # Không có file thì gen sẽ tạo clip mới trên Flow và tốn tín dụng.
  [ -f "clips/$id.mp4" ] || { echo "$(date +%T) clip $id chưa tải được, bỏ qua"; continue; }
  node "$DIR/../chain.mjs" gen plan.json "$id" 2>&1 | sed -e 's/\x1b\[[0-9;]*m//g' | tail -1 | cut -c1-110
done
echo "$(date +%T) xong tải lại"
