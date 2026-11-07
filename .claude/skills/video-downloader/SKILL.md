---
name: video-downloader
description: Download videos from TikTok, Facebook/Instagram Reels, YouTube and similar social sites reliably, with proven fallbacks for TikTok's flaky API and photo/slideshow posts. Use this skill WHENEVER the user asks to download a video/clip/reel or pastes a social-media video URL and wants it saved — including Vietnamese phrasing like "tải video này", "tai video", "tải giúp tôi", "lưu video này về", even with typos. Do NOT use for images-only requests or for editing existing local videos.
---

# Video Downloader

Download social-media videos with `yt-dlp` (installed at `/opt/homebrew/bin/yt-dlp`, with `curl_cffi` impersonation already installed in its venv), falling back to the tikwm API for TikTok posts that yt-dlp can't fully extract.

## Save location

- If the user names a folder, use it. Their folders are under `~/Desktop/Mẫu/` (note: `Videos` and `Clip mẫu` exist; "videos mẫu" usually means `~/Desktop/Mẫu/Videos`).
- Otherwise default to `~/Downloads`.
- Filename template: `%(extractor)s_%(uploader)s_%(id)s.%(ext)s`. Note `%(extractor)s` is case-sensitive (yields `TikTok_...`); when naming fallback downloads yourself, lowercase it (`tiktok_ninhnhung01_7658648....mp4`) so filenames stay consistent.

## Step 1 — Try yt-dlp first

```bash
cd "<dest>" && yt-dlp --no-playlist -o "%(extractor)s_%(uploader)s_%(id)s.%(ext)s" "<URL>"
```

This succeeds for most videos and gives the highest available quality without watermark.

## Step 2 — TikTok fallback: tikwm API

TikTok's extractor is flaky: sometimes `yt-dlp -F` shows **only an `audio` (mp3) format** even for a real video, and slideshow/photo posts always extract as audio-only. If that happens (you downloaded an .mp3, or formats list has no video), don't keep retrying yt-dlp — use tikwm:

```bash
curl -s "https://www.tikwm.com/api/?url=<TIKTOK_URL>&hd=1" -o <a-temp-file>.json
```

Always pass `hd=1`. Without it, `hdplay` comes back empty and `play` is only 576×1024. Verified 2026-11-05: with `hd=1`, `hdplay` gave 1080×1920 HEVC for a post where `play` was 576×1024.

(Write the temp JSON to the session scratchpad directory, not `/tmp`.)

Read the JSON (`code` 0 = success). In `data`:
- `hdplay` — HD video URL, prefer if non-empty
- `play` — standard no-watermark video URL
- `images` — array of image URLs; non-empty means the post is a **photo slideshow**: download each image (`curl -L -o`), and also grab `data.music` if the user wants the audio
- `title` — useful to confirm it's the right post

Download the chosen URL with `curl -sL -A "Mozilla/5.0" -o "<dest>/tiktok_<uploader>_<id>.mp4"`.

Clean up any stray .mp3 that yt-dlp produced by mistake (tell the user, or remove it if you just created it in this same task).

## Step 3 — Verify and report

Always verify the file is a real playable video before reporting success:

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -show_entries format=duration -of default=noprint_wrappers=1 "<file>"
```

Report to the user: full saved path, resolution, duration, and whether it's watermark-free. If only a low resolution (e.g. 540p) was available, say so — TikTok's offered quality varies per request, and retrying a few minutes later sometimes yields 1080p.

## Known pitfalls

- **Don't scrape tiktok.com with plain curl** — a JS challenge returns a ~1.4KB stub page. yt-dlp solves the challenge natively; tikwm bypasses it entirely.
- **gallery-dl currently extracts nothing from TikTok photo posts** — go straight to tikwm `images` for slideshows.
- One URL = one post; never pass playlist/profile URLs without `--no-playlist` unless the user asked for the whole profile.
