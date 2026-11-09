#!/bin/bash
# Đọc lời v3 (GPT kể chuyện) bằng giọng clone rồi ghép 2 bản.
R=/d/Github/video-flow/dong-vat/rua-bien
cd /d/Github/video-flow/voice-studio && export HF_HOME='D:\hf-cache'
doc() { # doc <file lời> <giọng> <thư mục ra>
  mkdir -p $R/$3; i=0
  while IFS= read -r line; do i=$((i+1)); .venv/Scripts/python.exe vc.py say --voice $2 --text "$line" --out $R/$3/$i.wav > /dev/null 2>&1 || echo "fail $3 $i"; echo "$3 $i $(ffprobe -v error -show_entries format=duration -of csv=p=0 $R/$3/$i.wav)"; done < $R/$1
}
doc loi-v3.txt giong-toi-eng voice-v3
doc loi-vi-v3.txt nu-tu-hat-den-mam voice-vi-v3
cd $R
LOI=loi-v3.txt VDIR=voice-v3 OUT=rua-bien-v3.mp4 node dung.mjs
LOI=loi-vi-v3.txt VDIR=voice-vi-v3 OUT=rua-bien-vi-v3.mp4 node dung.mjs
for n in rua-bien-v3 rua-bien-vi-v3; do ffmpeg -v error -y -i $n.mp4 -vf scale=720:-2 -c:v libx264 -preset fast -crf 26 -c:a aac -b:a 128k -movflags +faststart $n-tg.mp4; echo "$n $(ffprobe -v error -show_entries format=duration -of csv=p=0 $n.mp4)s tg $(du -m $n-tg.mp4|cut -f1)MB"; done
