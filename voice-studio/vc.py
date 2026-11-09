"""Voice cloning with OmniVoice (k2-fsa/OmniVoice), for video narration.

Each voice lives in $VOICES_DIR/<name>/ (default ~/voice-clone/voices, the same library as the website)
and is prepared once by `add`:
  source.*    the recording as supplied
  ref.wav     3-10 s cut used as the reference (24 kHz mono)
  ref.txt     transcript of ref.wav (given, or Whisper's)
  prompt.pt   OmniVoice VoiceClonePrompt; later runs load this, no re-encoding
  preview.wav a fixed test sentence in the cloned voice
  meta.json   source, duration, note, date added

Usage (always with this folder's .venv):
  .venv/bin/python vc.py add <name> <audio> [--text "..."] [--start S --end S] [--note "..."]
  .venv/bin/python vc.py list
  .venv/bin/python vc.py say --voice <name> --text "..." --out out.wav [--speed 1.0] [--steps 32]
  .venv/bin/python vc.py batch --voice <name> --jobs jobs.json [--speed 1.0] [--steps 32]
      jobs.json: [{"text": "...", "out": "/abs/path.wav"}, ...]
"""
import argparse
import datetime as dt
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

# Same default as app/main.py; OpenMontage still reads voices from ~/voice-clone/voices.
VOICES = Path(os.environ.get("VOICES_DIR", Path.home() / "voice-clone" / "voices")).expanduser()
MODEL_ID = "k2-fsa/OmniVoice"
SR = 24000
MIN_REF, MAX_REF = 3.0, 10.0
PREVIEW_TEXT = "Xin chào bà con. Đây là giọng đọc mẫu cho các video hướng dẫn của Minh Group."


def load_model():
    import torch
    from omnivoice import OmniVoice

    # cuda: máy Windows có RTX 3060 (2026-11-08). mps: máy Mac M1. cpu: dự phòng, chậm.
    if torch.cuda.is_available():
        device = "cuda"
    elif torch.backends.mps.is_available():
        device = "mps"
    else:
        device = "cpu"
    t0 = time.time()
    # float16 on MPS: 26 s vs 32 s for a 6.3 s line on the M1, no NaNs (2026-09-23). CPU không chạy tốt float16.
    dtype = torch.float32 if device == "cpu" else torch.float16
    model = OmniVoice.from_pretrained(MODEL_ID, device_map=device, dtype=dtype)
    print(f"model loaded on {device} in {time.time() - t0:.1f}s", file=sys.stderr)
    return model


def ffmpeg(*args: str) -> None:
    subprocess.run(["ffmpeg", "-y", "-v", "error", *args], check=True)


def duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def silences(path: Path) -> list[tuple[float, float]]:
    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(path), "-af", "silencedetect=noise=-35dB:d=0.25",
         "-f", "null", "-"], capture_output=True, text=True, check=True)
    spans, start = [], None
    for line in proc.stderr.splitlines():
        if "silence_start:" in line:
            start = float(line.split("silence_start:")[1].strip())
        elif "silence_end:" in line and start is not None:
            spans.append((start, float(line.split("silence_end:")[1].split("|")[0].strip())))
            start = None
    return spans


def pick_window(path: Path) -> tuple[float, float]:
    """Skip leading silence, then end the cut in a pause so no word is chopped."""
    total = duration(path)
    gaps = silences(path)
    begin = gaps[0][1] if gaps and gaps[0][0] <= 0.05 else 0.0
    pauses = [s for s, _ in gaps if MIN_REF <= s - begin <= MAX_REF]
    end = max(pauses) if pauses else min(total, begin + MAX_REF)
    return begin, end


def cmd_add(a) -> None:
    src = Path(a.audio).expanduser().resolve()
    vdir = VOICES / a.name
    if vdir.exists() and not a.force:
        sys.exit(f"voice '{a.name}' already exists; pass --force to replace it")
    vdir.mkdir(parents=True, exist_ok=True)
    kept = vdir / f"source{src.suffix.lower()}"
    shutil.copy2(src, kept)

    full = vdir / "full.wav"
    ffmpeg("-i", str(kept), "-vn", "-ac", "1", "-ar", str(SR), str(full))
    if a.start is not None or a.end is not None:
        begin, end = a.start or 0.0, a.end or duration(full)
    elif a.text:
        # A given transcript covers the whole clip, so auto-trimming would desync it.
        begin, end = 0.0, duration(full)
        if end > 15.0:
            sys.exit("with --text the clip must be at most 15 s; cut it or pass --start/--end")
    else:
        begin, end = pick_window(full)
    ref = vdir / "ref.wav"
    ffmpeg("-ss", f"{begin:.3f}", "-to", f"{end:.3f}", "-i", str(full), str(ref))
    full.unlink()
    ref_len = duration(ref)
    if ref_len < MIN_REF:
        sys.exit(f"reference is only {ref_len:.1f}s; OmniVoice needs 3-10 s of clear speech")

    model = load_model()
    prompt = model.create_voice_clone_prompt(ref_audio=str(ref), ref_text=a.text)
    prompt.save(str(vdir / "prompt.pt"))
    (vdir / "ref.txt").write_text(prompt.ref_text.strip() + "\n", encoding="utf-8")

    import soundfile as sf
    audio = model.generate(text=PREVIEW_TEXT, voice_clone_prompt=prompt)
    sf.write(str(vdir / "preview.wav"), audio[0], SR)

    meta = {
        "name": a.name, "added": dt.date.today().isoformat(), "source": src.name,
        "ref_window_s": [round(begin, 2), round(end, 2)], "ref_seconds": round(ref_len, 2),
        "ref_text_from": "user" if a.text else "whisper", "note": a.note or "",
    }
    (vdir / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({**meta, "ref_text": prompt.ref_text.strip(), "dir": str(vdir)}, ensure_ascii=False, indent=2))


def cmd_list(_a) -> None:
    for vdir in sorted(p for p in VOICES.iterdir() if (p / "prompt.pt").exists()):
        meta = json.loads((vdir / "meta.json").read_text(encoding="utf-8"))
        text = (vdir / "ref.txt").read_text(encoding="utf-8").strip()
        print(f"{vdir.name:20s} {meta['ref_seconds']:5.1f}s  added {meta['added']}  {meta['note']}  | {text[:60]}")


def load_prompt(name: str):
    from omnivoice.models.omnivoice import VoiceClonePrompt

    path = VOICES / name / "prompt.pt"
    if not path.exists():
        sys.exit(f"no voice '{name}'; run: vc.py list")
    return VoiceClonePrompt.load(str(path))


def synthesize(voice: str, jobs: list[dict], speed: float | None, steps: int) -> None:
    import soundfile as sf

    model = load_model()
    prompt = load_prompt(voice)
    for job in jobs:
        t0 = time.time()
        audio = model.generate(text=job["text"], voice_clone_prompt=prompt, speed=speed, num_step=steps)
        out = Path(job["out"])
        out.parent.mkdir(parents=True, exist_ok=True)
        sf.write(str(out), audio[0], SR)
        print(f"{out.name}: {len(audio[0]) / SR:.2f}s audio in {time.time() - t0:.1f}s", file=sys.stderr)


def cmd_say(a) -> None:
    synthesize(a.voice, [{"text": a.text, "out": a.out}], a.speed, a.steps)


def cmd_batch(a) -> None:
    synthesize(a.voice, json.loads(Path(a.jobs).read_text(encoding="utf-8")), a.speed, a.steps)


def main() -> None:
    # Console Windows mặc định cp1252, in chữ tiếng Việt thì UnicodeEncodeError (đo 2026-11-08).
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("add")
    s.add_argument("name")
    s.add_argument("audio")
    s.add_argument("--text", help="transcript of the cut; omitted = Whisper transcribes it")
    s.add_argument("--start", type=float)
    s.add_argument("--end", type=float)
    s.add_argument("--note")
    s.add_argument("--force", action="store_true")
    s.set_defaults(fn=cmd_add)

    s = sub.add_parser("list")
    s.set_defaults(fn=cmd_list)

    s = sub.add_parser("say")
    s.add_argument("--voice", required=True)
    s.add_argument("--text", required=True)
    s.add_argument("--out", required=True)
    s.add_argument("--speed", type=float)
    s.add_argument("--steps", type=int, default=32, help="diffusion steps; 16 is twice as fast for drafts")
    s.set_defaults(fn=cmd_say)

    s = sub.add_parser("batch")
    s.add_argument("--voice", required=True)
    s.add_argument("--jobs", required=True)
    s.add_argument("--speed", type=float)
    s.add_argument("--steps", type=int, default=32, help="diffusion steps; 16 is twice as fast for drafts")
    s.set_defaults(fn=cmd_batch)

    a = p.parse_args()
    VOICES.mkdir(parents=True, exist_ok=True)
    a.fn(a)


if __name__ == "__main__":
    main()
