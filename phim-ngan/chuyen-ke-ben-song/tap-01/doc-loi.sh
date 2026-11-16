#!/bin/bash
# Đọc lời kể 12 cảnh bằng giọng clone diem-my-mien-nam -> loi/NN.wav
cd "$(dirname "$0")"
V=../../../voice-studio
for n in 01 02 03 04 05 06 07 08 09 10 11 12; do
  [ -f "loi/$n.wav" ] && continue
  (cd $V && .venv/Scripts/python.exe vc.py say --voice diem-my-mien-nam --text "$(cat ../phim-ngan/chuyen-ke-ben-song/tap-01/loi/$n.txt)" --out ../phim-ngan/chuyen-ke-ben-song/tap-01/loi/$n.wav 2>&1 | grep "audio in")
done
for f in loi/??.wav; do printf '%s %s\n' "$f" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")"; done
