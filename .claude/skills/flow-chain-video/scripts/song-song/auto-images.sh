#!/bin/bash
# Dùng: auto-images.sh <thư mục làm việc>
# Chạy chain.mjs images cho đủ ảnh K. Sau bước "Tải lại trang ChatGPT để cập nhật ảnh", script thường không nhận ra ảnh mới
# (video ngài vải 2026-11-02, đuông dừa 2026-11-03). Khi đó, lưu ảnh cuối qua CDP của tab, dừng script, rồi chạy lại cho ảnh sau.
# Ảnh chỉ được lưu khi khác ảnh trước và giống nhau ở 2 lần đọc liền nhau, để không lưu ảnh đang tạo dở.
DIR=$(cd "$(dirname "$0")" && pwd)
CHAIN="$DIR/../chain.mjs"
cd "$1" || exit 1
CAND=$(mktemp).png
files=($(python3 -c "import json; print(' '.join(k['file'] for k in json.load(open('plan.json'))['keyframes']))"))

run() {
  node "$CHAIN" images plan.json >> images.log 2>&1 &
  PID=$!
}
next_missing() {
  for i in "${!files[@]}"; do [ -f "${files[$i]}" ] || { echo "$i"; return; }; done
}
sum5() { command md5 -q "$1" 2>/dev/null; }

run
last=""
while true; do
  i=$(next_missing)
  if [ -z "$i" ]; then echo "$(date +%T) đủ ảnh"; wait "$PID"; exit 0; fi
  M=${files[$i]}
  if ! kill -0 "$PID" 2>/dev/null; then echo "$(date +%T) script ảnh dừng khi chưa có $M"; exit 1; fi
  if [ "$i" -gt 0 ] && sed -n "/Tạo $M/,\$p" images.log | grep -q "Tải lại trang"; then
    P=${files[$((i - 1))]}
    tab=$(curl -s http://127.0.0.1:9222/json/list | python3 -c "import json,sys; ids=[t['id'] for t in json.load(sys.stdin) if t['type']=='page' and 'chatgpt.com/c/' in t['url']]; print(ids[0] if ids else '')")
    busy=$(node "$DIR/cdp-eval.mjs" "$tab" "!!document.querySelector('[data-testid=stop-button]')" 2>/dev/null)
    if [ -n "$tab" ] && [ "$busy" = "false" ] && "$DIR/luu-anh-cuoi.sh" "$tab" "$CAND" "$P" > /dev/null 2>&1; then
      cur=$(sum5 "$CAND")
      if [ "$cur" != "$(sum5 "$P")" ] && [ "$cur" = "$last" ]; then
        kill "$PID" 2>/dev/null; sleep 1
        cp "$CAND" "$M"
        echo "[auto-images] Lưu $M qua CDP" >> images.log
        echo "$(date +%T) lưu $M qua CDP"
        last=""
        run
        continue
      fi
      last=$cur
    fi
  fi
  sleep 10
done
