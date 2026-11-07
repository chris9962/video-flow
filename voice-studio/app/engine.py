"""OmniVoice wrapper: voice library on disk, cloning from uploads, and synthesis.

The voice folder format matches ~/voice-clone/vc.py, so voices made here are
usable by the OpenMontage narration scripts and the other way round.
"""
import datetime as dt
import json
import re
import shutil
import subprocess
import time
import unicodedata
from pathlib import Path

SR = 24000
MODEL_ID = "k2-fsa/OmniVoice"
MIN_REF, MAX_REF, MAX_REF_WITH_TEXT = 3.0, 10.0, 15.0
PREVIEW_TEXT = "Xin chào. Đây là giọng đọc mẫu được tạo từ đoạn ghi âm của bạn."

# Exactly the tags OmniVoice's _resolve_instruct accepts; anything else raises.
DESIGN_OPTIONS = {
    "gender": ["male", "female"],
    "age": ["child", "teenager", "young adult", "middle-aged", "elderly"],
    "pitch": ["very low pitch", "low pitch", "moderate pitch", "high pitch", "very high pitch"],
    "style": ["whisper"],
    "accent": ["american accent", "british accent", "australian accent", "chinese accent",
               "canadian accent", "indian accent", "korean accent", "portuguese accent",
               "russian accent", "japanese accent"],
}

DESIGN_LABELS_VI = {
    "male": "nam", "female": "nữ", "child": "trẻ em", "teenager": "thiếu niên",
    "young adult": "thanh niên", "middle-aged": "trung niên", "elderly": "cao tuổi",
    "very low pitch": "rất trầm", "low pitch": "trầm", "moderate pitch": "cao độ vừa",
    "high pitch": "cao", "very high pitch": "rất cao", "whisper": "thì thầm",
}

GEN_CONFIG_KEYS = {
    "num_step": int, "guidance_scale": float, "t_shift": float, "layer_penalty_factor": float,
    "position_temperature": float, "class_temperature": float, "denoise": bool,
    "postprocess_output": bool, "audio_chunk_duration": float, "audio_chunk_threshold": float,
}


def ffmpeg(*args: str) -> None:
    proc = subprocess.run(["ffmpeg", "-y", "-v", "error", *args], capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg: {proc.stderr.strip()[:300]}")


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


def slugify(name: str) -> str:
    s = name.replace("đ", "d").replace("Đ", "D")
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or "giong"


class Engine:
    def __init__(self, voices_dir: Path, outputs_dir: Path):
        self.voices_dir = voices_dir
        self.outputs_dir = outputs_dir
        self.model = None
        self.device = None
        self.state = "idle"  # idle | loading | ready | error
        self.error = None
        voices_dir.mkdir(parents=True, exist_ok=True)
        outputs_dir.mkdir(parents=True, exist_ok=True)

    def load(self) -> None:
        import torch
        from omnivoice import OmniVoice

        self.state = "loading"
        try:
            self.device = "mps" if torch.backends.mps.is_available() else "cpu"
            # float16 on MPS: ~20% faster than float32 on the M1, no NaNs (tested 2026-09-23).
            dtype = torch.float16 if self.device == "mps" else torch.float32
            self.model = OmniVoice.from_pretrained(MODEL_ID, device_map=self.device, dtype=dtype)
            self.state = "ready"
        except Exception as exc:  # surfaced in the UI status
            self.state, self.error = "error", str(exc)
            raise

    # ---- voice library -------------------------------------------------------

    def list_voices(self) -> list[dict]:
        voices = []
        for vdir in sorted(self.voices_dir.iterdir()):
            if not (vdir / "prompt.pt").exists():
                continue
            meta = json.loads((vdir / "meta.json").read_text(encoding="utf-8"))
            ref_txt = vdir / "ref.txt"
            voices.append({
                "id": vdir.name,
                "display_name": meta.get("display_name") or meta.get("name") or vdir.name,
                "note": meta.get("note", ""),
                "added": meta.get("added", ""),
                "source": meta.get("source", ""),
                "ref_seconds": meta.get("ref_seconds"),
                "ref_text": ref_txt.read_text(encoding="utf-8").strip() if ref_txt.exists() else "",
                "ref_text_from": meta.get("ref_text_from", ""),
                "has_preview": (vdir / "preview.wav").exists(),
            })
        return sorted(voices, key=lambda v: v["added"], reverse=True)

    def voice_dir(self, voice_id: str) -> Path:
        vdir = (self.voices_dir / voice_id).resolve()
        if vdir.parent != self.voices_dir.resolve() or not (vdir / "prompt.pt").exists():
            raise KeyError(voice_id)
        return vdir

    def update_voice(self, voice_id: str, display_name: str | None, note: str | None) -> None:
        path = self.voice_dir(voice_id) / "meta.json"
        meta = json.loads(path.read_text(encoding="utf-8"))
        if display_name is not None:
            meta["display_name"] = display_name.strip()
        if note is not None:
            meta["note"] = note.strip()
        path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    def delete_voice(self, voice_id: str) -> None:
        shutil.rmtree(self.voice_dir(voice_id))

    def new_voice_id(self, display_name: str) -> str:
        base = slugify(display_name)
        vid, n = base, 2
        while (self.voices_dir / vid).exists():
            vid, n = f"{base}-{n}", n + 1
        return vid

    def clone(self, voice_id: str, display_name: str, upload: Path, original_name: str,
              text: str | None, start: float | None, end: float | None, note: str,
              progress) -> dict:
        vdir = self.voices_dir / voice_id
        vdir.mkdir(parents=True)
        try:
            progress("Đang tách âm thanh")
            kept = vdir / f"source{Path(original_name).suffix.lower() or '.bin'}"
            shutil.move(str(upload), kept)
            full = vdir / "full.wav"
            ffmpeg("-i", str(kept), "-vn", "-ac", "1", "-ar", str(SR), str(full))

            if start is not None or end is not None:
                begin, stop = start or 0.0, end or duration(full)
            elif text:
                # A given transcript covers the whole clip; auto-trimming would desync it.
                begin, stop = 0.0, duration(full)
                if stop > MAX_REF_WITH_TEXT:
                    raise ValueError(f"Có lời kèm theo thì file tối đa {MAX_REF_WITH_TEXT:.0f} giây. "
                                     "Hãy cắt ngắn file, hoặc nhập giây bắt đầu và kết thúc.")
            else:
                begin, stop = pick_window(full)
            ref = vdir / "ref.wav"
            ffmpeg("-ss", f"{begin:.3f}", "-to", f"{stop:.3f}", "-i", str(full), str(ref))
            full.unlink()
            ref_len = duration(ref)
            if ref_len < MIN_REF:
                raise ValueError(f"Đoạn mẫu chỉ dài {ref_len:.1f} giây. Cần 3 đến 10 giây giọng nói rõ.")

            progress("Đang nghe lời" if not text else "Đang xử lý giọng mẫu")
            prompt = self.model.create_voice_clone_prompt(ref_audio=str(ref), ref_text=text or None)
            prompt.save(str(vdir / "prompt.pt"))
            (vdir / "ref.txt").write_text(prompt.ref_text.strip() + "\n", encoding="utf-8")

            progress("Đang đọc câu thử")
            import soundfile as sf
            audio = self.model.generate(text=PREVIEW_TEXT, voice_clone_prompt=prompt, language="vi")
            sf.write(str(vdir / "preview.wav"), audio[0], SR)

            meta = {
                "name": voice_id, "display_name": display_name.strip(),
                "added": dt.datetime.now().isoformat(timespec="seconds"),
                "source": original_name, "ref_window_s": [round(begin, 2), round(stop, 2)],
                "ref_seconds": round(ref_len, 2), "ref_text_from": "user" if text else "whisper",
                "note": note.strip(),
            }
            (vdir / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
            return {"voice_id": voice_id, "ref_text": prompt.ref_text.strip()}
        except Exception:
            shutil.rmtree(vdir, ignore_errors=True)
            raise

    # ---- synthesis -----------------------------------------------------------

    def synthesize(self, params: dict, progress) -> dict:
        import soundfile as sf
        from omnivoice.models.omnivoice import VoiceClonePrompt

        text = (params.get("text") or "").strip()
        if not text:
            raise ValueError("Chưa có văn bản để đọc.")
        mode = params.get("mode", "clone")
        kwargs: dict = {"text": text}
        voice_label = "Tự động"

        if mode == "clone":
            vdir = self.voice_dir(params.get("voice_id") or "")
            kwargs["voice_clone_prompt"] = VoiceClonePrompt.load(str(vdir / "prompt.pt"))
            meta = json.loads((vdir / "meta.json").read_text(encoding="utf-8"))
            voice_label = meta.get("display_name") or vdir.name
        elif mode == "design":
            tags = [params[k] for k in DESIGN_OPTIONS if params.get(k)]
            for k in DESIGN_OPTIONS:
                if params.get(k) and params[k] not in DESIGN_OPTIONS[k]:
                    raise ValueError(f"Giá trị không hợp lệ cho {k}: {params[k]}")
            if not tags:
                raise ValueError("Chọn ít nhất một đặc điểm giọng.")
            kwargs["instruct"] = ", ".join(tags)
            voice_label = "Thiết kế: " + ", ".join(DESIGN_LABELS_VI.get(t, t) for t in tags)

        if params.get("language"):
            kwargs["language"] = params["language"]
        if params.get("duration"):
            kwargs["duration"] = float(params["duration"])
        elif params.get("speed"):
            kwargs["speed"] = float(params["speed"])
        if params.get("normalize_text"):
            kwargs["normalize_text"] = True
        for key, cast in GEN_CONFIG_KEYS.items():
            if params.get(key) not in (None, ""):
                kwargs[key] = cast(params[key])

        progress("Đang đọc")
        t0 = time.time()
        audio = self.model.generate(**kwargs)[0]
        elapsed = time.time() - t0

        stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
        base = f"{stamp}-{slugify(voice_label)[:30]}"
        wav = self.outputs_dir / f"{base}.wav"
        sf.write(str(wav), audio, SR)
        record = {
            "id": base, "file": wav.name, "text": text, "voice": voice_label, "mode": mode,
            "seconds": round(len(audio) / SR, 2), "elapsed": round(elapsed, 1),
            "created": dt.datetime.now().isoformat(timespec="seconds"),
            "params": {k: v for k, v in kwargs.items() if k not in ("text", "voice_clone_prompt")},
        }
        (self.outputs_dir / f"{base}.json").write_text(json.dumps(record, ensure_ascii=False, indent=2),
                                                      encoding="utf-8")
        return record

    def list_outputs(self, limit: int = 50) -> list[dict]:
        records = []
        for js in sorted(self.outputs_dir.glob("*.json"), reverse=True)[:limit]:
            try:
                records.append(json.loads(js.read_text(encoding="utf-8")))
            except json.JSONDecodeError:
                continue
        return records

    def delete_output(self, output_id: str) -> None:
        for ext in (".wav", ".json"):
            path = (self.outputs_dir / f"{output_id}{ext}").resolve()
            if path.parent == self.outputs_dir.resolve():
                path.unlink(missing_ok=True)
