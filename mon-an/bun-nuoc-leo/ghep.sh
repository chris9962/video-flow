#!/bin/bash
# Ghép 8 clip có chữ out/NN-X.mp4 thành bun-nuoc-leo.mp4: cảnh P giữ 10 giây, các clip khác cắt còn $T giây (mặc định 7), nối thẳng, rồi nén bản đăng bun-nuoc-leo-dang.mp4.
cd "$(dirname "$0")"
T="${1:-7}"
mkdir -p ghep; : > ghep/list.txt
for f in out/*.mp4; do
  b=$(basename "$f")
  # Cảnh P (làm mắm) giữ nguyên 10 giây để thấy rõ khạp mắm chín (Diễm My 2026-11-15); cảnh khác $T giây
  case $b in 01-P*) T=10;; *) T="${1:-7}";; esac
  ffmpeg -v error -y -i "$f" -t "$T" -vf "fps=24,scale=720:1280,format=yuv420p" -af "afade=t=out:st=$(python -c "print($T-0.4)"):d=0.4" -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 160k -ar 48000 -ac 2 "ghep/$b" && echo "file '$b'" >> ghep/list.txt
done
ffmpeg -v error -y -f concat -safe 0 -i ghep/list.txt -c copy -movflags +faststart bun-nuoc-leo.mp4
ffmpeg -v error -y -i bun-nuoc-leo.mp4 -c:v libx264 -b:v 3200k -maxrate 3500k -bufsize 6000k -preset medium -c:a aac -b:a 128k -movflags +faststart bun-nuoc-leo-dang.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 bun-nuoc-leo-dang.mp4; du -h bun-nuoc-leo.mp4 bun-nuoc-leo-dang.mp4
