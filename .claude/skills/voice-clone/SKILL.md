---
name: voice-clone
description: Clone a voice from a short sample with OmniVoice (~/voice-studio/vc.py) and use it as narration for an OpenMontage video. Use whenever the user sends or points to a voice sample / recording ("giọng mẫu", "voice mẫu", "clone giọng", "dùng giọng này đọc video"), asks to list or reuse saved voices, or wants a video re-voiced with a saved voice.
---

# Voice clone for video narration

Tool: `~/voice-studio/vc.py`, run with the Voice Studio venv `~/voice-studio/.venv` (OmniVoice on MPS). `~/voice-studio` is a symlink to `~/video-flow/voice-studio`. Full usage in `~/voice-studio/README.md`. Never install into OpenMontage's venv. OpenMontage still calls the older copy `~/voice-clone/vc.py`; leave `~/voice-clone` in place.

**Windows (máy RTX 3060, cài ngày 2026-11-08):** không có symlink `~/voice-studio`. Gọi thẳng `D:\Github\video-flow\voice-studio`, python là `.venv/Scripts/python.exe` (không phải `.venv/bin/python`). Torch 2.8.0 bản CUDA cu128, model chạy `cuda` float16: nạp 4,5 s, đọc 3,1 s âm thanh mất 2,2 s. Model OmniVoice lưu ở `HF_HOME=D:\hf-cache` (biến môi trường người dùng). Mở website bằng `voice-studio\start.cmd`. Ví dụ:
`cd /d/Github/video-flow/voice-studio && .venv/Scripts/python.exe vc.py say --voice <tên> --text "..." --out out.wav`

Voice library: `~/voice-clone/voices/<voice-id>/` (override with `VOICES_DIR`), shared with the Voice Studio website in the same folder (http://localhost:8765, start with `Mo Voice Studio.command`). Voices the user added on the website are ready to use: the voice id is the folder name, a slug of the display name (shown as "Mã" under "Chi tiết" on the site; `vc.py list` also prints it).

## When the user gives a voice sample

1. Pick a short kebab-case name with the user's description (e.g. `nam-mien-nam`). Check `vc.py list` for clashes.
2. Add it:
   `~/voice-studio/.venv/bin/python ~/voice-studio/vc.py add <name> <file> [--text "..."] --note "<who/what>"`
   - With a transcript from the user, pass `--text` (clip must be ≤ 15 s, whole clip is used).
   - Without one, omit it: the script cuts 3-10 s at a pause and Whisper transcribes (first run downloads whisper-large-v3-turbo, ~1.6 GB).
   - Runs 1-3 min; run it in the background.
3. Read the printed `ref_text`. Wrong transcript gives a worse clone: show it to the user if it looks off, re-run with `--text` and `--force`.
4. Let the user hear `~/voice-clone/voices/<name>/preview.wav` (`open` it) before voicing a whole video.

## Voicing an OpenMontage project

In the project's `build_audio.py` set `PROVIDER = "clone"` and `CLONE_VOICE = "<name>"`, then run it with `PYTHONPATH=<repo root>`. Takes are cached per voice as `<scene>.<tag>.take.wav`, so switching back to `PROVIDER = "google"` costs nothing. Pass scene ids to redo only those scenes.

After new audio: rebuild the storyboard audio if one exists, and follow the user's rule to present the script before rendering (see memory `feedback-duyet-kich-ban-truoc-khi-dung-video`). Rendering = `build_artifacts.py` then `render.py`.

## Rules

- Only clone a voice the user supplies and says they may use (their own, or a staff member who agreed). Do not clone public figures.
- Keep every voice folder; the user wants samples reused later. Do not delete `voices/*`.
- Disk is tight (~15 GB free on 2026-09-23); check `df -h ~` before pulling other models.
