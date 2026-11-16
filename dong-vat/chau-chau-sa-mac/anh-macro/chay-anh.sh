#!/bin/bash
# Tạo 4 ảnh macro châu chấu sa mạc trong cùng 1 cuộc chat ChatGPT, profile Oliver.
cd "$(dirname "$0")"
export GPT_PROFILE=oliver
S=~/../../d/Github/video-flow/.claude/skills/flow-chain-video/scripts/gpt-image.mjs
S=/d/Github/video-flow/.claude/skills/flow-chain-video/scripts/gpt-image.mjs
if [ ! -s gpt-chat.txt ]; then
  node "$S" --prompt "$(cat prompt-01.txt)" --out 01.png 2>&1 | tee log-01.txt
  grep -o 'Cuộc chat: .*' log-01.txt | sed 's/Cuộc chat: //' | tr -d '\r' > gpt-chat.txt
fi
CHAT=$(cat gpt-chat.txt)
for i in 02 03 04; do
  [ -s $i.png ] && continue
  node "$S" --prompt "$(cat prompt-$i.txt)" --out $i.png --chat "$CHAT" 2>&1 | tee log-$i.txt
done
echo XONG
