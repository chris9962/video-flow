#!/bin/bash
# Chèn chữ lên từng clip Muse 720x1280: clips/<id>-01.mp4 -> out/<stt>-<id>.mp4. Dùng: bash chen-chu.sh [id...]
cd "$(dirname "$0")"
D="fontfile=timesbd.ttf:fontcolor=white:borderw=3:bordercolor=black@0.6:shadowcolor=black@0.7:shadowx=2:shadowy=2:x=(w-text_w)/2"
dt() { echo "drawtext=$D:textfile=chu/$1.txt:fontsize=$2:y=h*$3:enable='between(t,$4,$5)'"; }
ORDER="P Q A B C D E F G I J K L"
ids="${*:-$ORDER}"
for id in $ids; do
  in="clips/$id-01.mp4"; [ -f "$in" ] || { echo "thiếu $in"; continue; }
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in"); end=$(python -c "print(round($dur-0.15,2))")
  n=1; for o in $ORDER; do [ "$o" = "$id" ] && break; n=$((n+1)); done
  case $id in
    P) f="$(dt p1 64 0.26 0.3 $end),$(dt p2 64 0.33 0.3 $end)";;
    K) f="$(dt k1 48 0.10 0.2 $end),$(dt k2 48 0.15 0.2 $end)";;
    L) f="$(dt l 56 0.13 0.2 1.5),$(dt m1 48 0.08 1.5 $end),$(dt m2 48 0.13 1.5 $end),$(dt m3 42 0.18 1.5 $end)";;
    *) l=$(echo $id | tr A-Z a-z); f="$(dt $l 48 0.13 0.2 $end)";;
  esac
  out=$(printf 'out/%02d-%s.mp4' $n $id)
  ffmpeg -v error -y -i "$in" -vf "$f" -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 160k -movflags +faststart "$out" && echo "✓ $out"
done
