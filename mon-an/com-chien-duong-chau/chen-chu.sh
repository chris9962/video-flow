#!/bin/bash
# Chèn chữ lên từng clip Muse 720x1280: clips/<id>-01.mp4 -> out/<stt>-<id>.mp4. Dùng: bash chen-chu.sh [id...]
cd "$(dirname "$0")"
D="fontfile=timesbd.ttf:fontcolor=white:borderw=3:bordercolor=black@0.6:shadowcolor=black@0.7:shadowx=2:shadowy=2:x=(w-text_w)/2"
dt() { echo "drawtext=$D:textfile=chu/$1.txt:fontsize=$2:y=h*$3:enable='between(t,$4,$5)'"; }
ORDER="P Q A B C D E F"
ids="${*:-$ORDER}"
for id in $ids; do
  in="clips/$id-01.mp4"; [ -f "$in" ] || { echo "thiếu $in"; continue; }
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in"); end=$(python -c "print(round($dur-0.15,2))")
  n=1; for o in $ORDER; do [ "$o" = "$id" ] && break; n=$((n+1)); done
  case $id in
    P) f="$(dt p1 64 0.26 0.3 $end),$(dt p2 64 0.33 0.3 $end)";;
    E) f="$(dt e1 48 0.10 0.2 $end),$(dt e2 48 0.15 0.2 $end)";;
    F) f="$(dt f1 44 0.08 0.2 $end),$(dt f2 44 0.125 0.2 $end),$(dt f3 44 0.17 0.2 $end)";;
    *) l=$(echo $id | tr A-Z a-z); f="$(dt ${l}1 48 0.10 0.2 $end),$(dt ${l}2 48 0.15 0.2 $end)";;
  esac
  out=$(printf 'out/%02d-%s.mp4' $n $id)
  ffmpeg -v error -y -i "$in" -vf "$f" -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 160k -movflags +faststart "$out" && echo "✓ $out"
done
