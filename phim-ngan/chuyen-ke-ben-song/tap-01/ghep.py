# Ghép tập 1 (Diễm My 22:49-22:50: KHÔNG lời đọc, CÓ phụ đề nhỏ dưới giữa): clips/<id>-01.mp4 -> ghep/<id>.mp4 cắt 8,57 giây, giữ tiếng Muse, rồi nối thành ben-co-ba-tap-01.mp4 và bản đăng.
# Dùng: python ghep.py [id...]   (không tham số = tất cả + nối)
import subprocess, sys, os, textwrap, json
ORDER = ["i1","i2","i3","i4","01","02","03","04","05","06","07","08","09","10","11","12"]
FONT = "timesbd.ttf"
def dur(f): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f]).decode().strip())
ids = sys.argv[1:] or ORDER
os.makedirs("ghep", exist_ok=True); os.makedirs("chu", exist_ok=True)
T_EACH = round(115/len(ORDER), 2)
# Câu móc (Diễm My 22:52): 5 giây đầu lấy từ cảnh 05 (bàn tay nắm chân) + 06 (Út bị kéo), phụ đề riêng
HOOK = [("05", 0, 3.0, "Chiều hôm đó, giữa sông vắng..."), ("06", 0, 2.0, "...Út bị một bàn tay kéo chân.")]
def hook():
    parts = []
    for j, (cid, ss, t, cap) in enumerate(HOOK):
        clip = f"clips/{cid}-01.mp4"
        if not os.path.exists(clip): return False
        p = f"chu/hook-{j}.txt"; open(p, "w", encoding="utf-8").write(cap)
        vf = f"fps=24,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,format=yuv420p,drawtext=fontfile={FONT}:textfile={p}:fontsize=28:fontcolor=white:borderw=2:bordercolor=black@0.75:x=(w-text_w)/2:y=h*0.86"
        out = f"ghep/hook{j}.mp4"; parts.append(out)
        subprocess.run(["ffmpeg","-v","error","-y","-ss",str(ss),"-i",clip,"-t",str(t),"-vf",vf,"-af","aresample=48000","-c:v","libx264","-crf","18","-preset","fast","-c:a","aac","-b:a","160k","-ac","2",out], check=True)
    open("ghep/hook.txt","w").write("".join(f"file '{os.path.basename(p)}'" + chr(10) for p in parts))
    subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i","ghep/hook.txt","-c","copy","ghep/hook.mp4"], check=True)
    print("✓ ghep/hook.mp4"); return True
for i in ids:
    clip = f"clips/{i}-01.mp4"
    if not os.path.exists(clip): print("thiếu", i); continue
    T = min(dur(clip), T_EACH); fo = max(T - 0.4, 0)
    text = open(f"loi/{i}.txt", encoding="utf-8").read().strip()
    lines = textwrap.wrap(text, 34)
    draws = []
    for k, ln in enumerate(lines):
        p = f"chu/{i}-{k}.txt"; open(p, "w", encoding="utf-8").write(ln)
        y = 0.86 + k * 0.034 - (len(lines)-1) * 0.017
        draws.append(f"drawtext=fontfile={FONT}:textfile={p}:fontsize=28:fontcolor=white:borderw=2:bordercolor=black@0.75:x=(w-text_w)/2:y=h*{y:.3f}:enable='between(t,0.2,{T-0.1:.2f})'")
    vf = "fps=24,scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,format=yuv420p," + ",".join(draws)
    af = f"afade=t=in:d=0.3,afade=t=out:st={fo:.2f}:d=0.4,aresample=48000"
    out = f"ghep/{i}.mp4"
    subprocess.run(["ffmpeg","-v","error","-y","-i",clip,"-t",str(T),"-vf",vf,"-af",af,"-c:v","libx264","-crf","18","-preset","fast","-c:a","aac","-b:a","160k","-ac","2",out], check=True)
    print(f"✓ {out} T={T}s")
if not sys.argv[1:]:
    open("ghep/list.txt","w").write("".join(f"file '{i}.mp4'\n" for i in ORDER if os.path.exists(f"ghep/{i}.mp4")))
    subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i","ghep/list.txt","-c","copy","-movflags","+faststart","ben-co-ba-tap-01.mp4"], check=True)
    subprocess.run(["ffmpeg","-v","error","-y","-i","ben-co-ba-tap-01.mp4","-c:v","libx264","-b:v","3200k","-maxrate","3500k","-bufsize","6000k","-preset","medium","-c:a","aac","-b:a","128k","-movflags","+faststart","ben-co-ba-tap-01-dang.mp4"], check=True)
    print("tổng", round(dur("ben-co-ba-tap-01.mp4"),1), "giây")
