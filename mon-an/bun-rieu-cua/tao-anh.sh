#!/bin/bash
# Tạo ảnh K còn thiếu (cuộc chat bàn gỗ), rồi 2 ảnh vuông tôm P01, P02 (cuộc chat riêng).
S=../../.claude/skills/flow-chain-video/scripts
export GPT_PROFILE=my
node $S/chain.mjs images plan.json >> images.log 2>&1
P1=$(node -e 'console.log(require("./plan.json").pondKeyframes[0].prompt)')
P2=$(node -e 'console.log(require("./plan.json").pondKeyframes[1].prompt)')
[ -f P01.png ] || node $S/gpt-image.mjs --prompt "$P1" --out P01.png > pond.log 2>&1
url=$(grep -m1 -o 'https://chatgpt.com/c/[0-9a-f-]*' pond.log)
[ -f P02.png ] || node $S/gpt-image.mjs --prompt "$P2" --out P02.png --chat "$url" >> pond.log 2>&1
tail -2 images.log; tail -2 pond.log
