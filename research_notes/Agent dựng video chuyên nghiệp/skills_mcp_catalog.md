# Catalog of Claude Code skills, plugins and MCP servers for video editing and production (as of 2026-11-07)

Method notes for the report writer:
- I read star counts and last-commit dates on 2026-11-07 from shields.io GitHub badges (for example `https://img.shields.io/github/stars/<owner>/<repo>.json` and `.../github/last-commit/<owner>/<repo>.json`). The GitHub API was rate-limited. Relative badge values are converted here: "yesterday" = 2026-11-06, "last thursday" = 2026-11-05, "last wednesday" = 2026-11-04, "last tuesday" = 2026-11-03, "last monday" = 2026-11-02. A month with no year (e.g. "october") means that month in 2026.
- "STALE" = no commit in 12+ months (before 2025-11-07).
- Item descriptions come from each repo's README or from curated-list entries (linked). I treated READMEs as marketing claims unless noted.
- Baseline the user already has: OpenMontage, 78k stars, last commit 2026-11-03 — [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage). Not repeated below.

## Q1. Which video-related skills and plugins exist in Anthropic's repo, curated lists and marketplaces?

### Takeaway
Anthropic's own `anthropics/skills` repo has no video skill (closest is `slack-gif-creator`). Anthropic's official plugin marketplace does carry a few third-party video plugins, led by HeyGen's HyperFrames. The center of gravity is third-party: HyperFrames (HTML→MP4, 80k stars, ~16.6M skill installs on skills.sh), Remotion's official skills (764K installs for the main skill), browser-use's `video-use` (31k stars), and a long tail of FFmpeg, CapCut, Resolve and motion-graphics skills. Most are installable with `npx skills add <repo>` or `/plugin marketplace add` + `/plugin install`.

### Cited Findings

**Anthropic sources**
- `anthropics/skills` (188k stars, last commit 2026-11-06): its README names only docx/pdf/pptx/xlsx as document skills and contains zero occurrences of "video" — [anthropics/skills README](https://github.com/anthropics/skills/blob/main/README.md).
- The closest Anthropic skill is `slack-gif-creator`: "Knowledge and utilities for creating animated GIFs optimized for Slack… constraints, validation tools, and animation concepts" — [slack-gif-creator/SKILL.md](https://github.com/anthropics/skills/blob/main/skills/slack-gif-creator/SKILL.md).
- Anthropic's official marketplace `anthropics/claude-plugins-official` lists 317 plugins. The video and media ones are:
  - `hyperframes` ("HyperFrames by HeyGen. Write HTML, render video… captions, voiceovers, audio-reactive visuals").
  - `runway-api` (guidance for Runway video, image and audio generation APIs).
  - `cloudinary` (media asset transformations).
  - `togetherai-skills` (covers audio and video).
  - `postiz` (social scheduling across 28+ platforms).
  - Source: [claude-plugins-official marketplace.json](https://github.com/anthropics/claude-plugins-official/blob/main/.claude-plugin/marketplace.json).
- Install pattern for the official marketplace: `/plugin marketplace add anthropics/claude-plugins-official`, then `/plugin install <name>@claude-plugins-official` — [Claude Code skills docs](https://code.claude.com/docs/en/skills).
- VideoDB is also in the claude.ai plugin directory ("Add to Claude" one-click) — [video-db/skills README](https://github.com/video-db/skills).

**Tier 1: high-signal, actively maintained skills and plugins**

| Item | Author | Install | What it does | Popularity | Last commit | Concerns |
|---|---|---|---|---|---|---|
| [HyperFrames](https://github.com/heygen-com/hyperframes) | HeyGen | `npx hyperframes skills update`, `npx skills add heygen-com/hyperframes`, or the official plugin `hyperframes` | Open-source framework that turns HTML, CSS, media and seekable animations into deterministic MP4. Ships 54 skills: captions, motion graphics, product-launch-video, talking-head-recut, music-to-video, website-to-video, remotion-to-hyperframes. Free desktop Studio for Mac, Windows and Linux. | 80k stars. skills.sh shows "16.6M total installs" (e.g. hyperframes-cli 1.5M, embedded-captions 453.8K) | 2026-11-07 | Apache-2.0. The Studio "Pro plan" adds HeyGen's paid models (open-core funnel). No audit results shown on skills.sh. |
| [Remotion Agent Skills](https://github.com/remotion-dev/skills) | Remotion | `npx skills add remotion-dev/skills` or `gh skill install remotion-dev/skills`; also offered by `bun create video` | Best-practice skills for Remotion (React video): `/remotion-best-practices`, `/remotion-create`, `/remotion-license`, … | 6.5k stars (repo); `remotion-best-practices` shows "764.3K" installs on skills.sh. Core [remotion](https://github.com/remotion-dev/remotion) has 71k stars | 2026-11-05 | skills.sh audits: Gen Agent Trust Hub **"Fail"**, Socket "Pass", Snyk "Pass" ([skills.sh page](https://skills.sh/remotion-dev/skills/remotion-best-practices)). The failure reason was not shown. The repo ships a `/remotion-license` skill because Remotion has its own license terms. |
| [video-use](https://github.com/browser-use/video-use) | browser-use | Paste a setup prompt into Claude Code. The agent clones the repo, runs `brew install ffmpeg` and `uv sync`, registers the skill and asks for an ElevenLabs key | Raw footage folder → `final.mp4`. Cuts filler words and dead space, applies auto color grade and 30 ms audio fades, burns subtitles. Builds overlays with HyperFrames, Remotion, Manim or PIL in parallel sub-agents. Self-evaluates the render. | 31k stars (GitTrend: ~30.5k stars, ~3.5k forks, [gittrend](https://gittrend.io/repo/browser-use/video-use)) | 2026-10 | Requires an ElevenLabs API key. Setup is brew-centric, so Windows support is unverified. It targets speech-driven footage (transcript is "the surface"). License not checked. |
| [ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill) | kajisho5 | `npx ffmpeg-skill`; `/plugin install ffmpeg-skill --marketplace kajisho5/ffmpeg-skill` ("in Claude Code 2.1.275 or later") | 42 local FFmpeg tools with a machine-readable contract plus an MCP server. Covers cut, captions (incl. karaoke), reframe 16:9→9:16, silence removal, loudness, beat-synced cuts, platform exports. Verifies with probe + check + `look.py` contact sheet. | 4.7k stars; npm package `ffmpeg-skill` | 2026-11-06 | MIT. "No cloud · No API keys · Python standard library." The README has macOS and Windows install rows. |
| [claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit) | Digital Samba | `git clone` + `uv sync` + open `claude` in the folder (workspace, not a plugin) | Remotion-based production workspace: `/video` → script → assets → `/scene-review` → `/design` → audio → render; transitions library; AI voiceover, music, image gen | 2.5k stars | 2026-11-06 | MIT. Documents a Windows `uv` install. Built for the author's sprint-review videos. |
| [ChatCut agent-plugin](https://github.com/ChatCut-Inc/agent-plugin) | ChatCut Inc | Prompt "Read ChatCut.io/desktop to install ChatCut", or `curl -fsSL https://chatcut.io/install.sh \| sh` (macOS 13+) / `irm https://chatcut.io/install.ps1 \| iex` (Windows 10+) | Plugin + local `chatcut_desktop` MCP server: timeline edits, captions, silence and filler removal, motion graphics, beat-synced cuts, scene-cut detection, Seedance/Kling generation, "checks that each edit is visible in the editor" | 1k stars | 2026-11-06 | Apache-2.0 plugin, but a commercial service with pricing and sign-in. The install pipes a remote script into the shell. |
| [capcut-cli](https://github.com/renezander030/capcut-cli) | René Zander | `/plugin marketplace add renezander030/capcut-cli` → `/plugin install capcut-cli@capcut-cli`; or `pip install capcut` | Creates and edits real CapCut / JianYing drafts locally (JSON in/out, no upload or API). Silence-aware cuts + styled captions → editable CapCut draft. | 1.1k stars | 2026-11-06 | MIT, but open-core with paid tiers ("$100/mo · Team" includes "written commercial-use confirmation"). The README mentions "unverified builds" of CapCut. The opt-in `caption --cloud` uploads audio. |
| [motion-skills](https://github.com/iart-ai/motion-skills) | iart.ai | Per pack, e.g. `npx skills add iart-ai/tiktok-video-skills`, `npx skills add iart-ai/data-animation-skills`, `/plugin marketplace add iart-ai/web-animation-skills` | "56 open-source skills" in "19 packs": kinetic typography, data charts, explainers, TikTok/Reels, 3D/WebGL, lower thirds. Visual skills ship a "deliver-and-verify loop" (freeze a frame, tile a contact sheet, probe the MP4). | 1.3k stars | 2026-10 | MIT. Counts conflict: awesome-claude-code says "~50 … across 14 installable packs" ([awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)). It is a funnel for the iart.ai product. |
| [Vox Director](https://github.com/Alisa0808/vox-director) | Alisa Qian | `git clone https://github.com/Alisa0808/vox-director.git ~/.claude/skills/vox-director` | One-line topic → Vox-style paper-collage explainer: script, keyframes, motion, VO, music, captions | 2.7k stars | 2026-10 | MIT. Requires a paid Atlas Cloud API key plus local ffmpeg and Pillow. |
| [VideoDB skills](https://github.com/video-db/skills) | VideoDB | `/plugin marketplace add video-db/skills` → `/plugin install videodb@videodb-skills`; or `npx skills add video-db/skills`; MCP: `claude mcp add --transport http videodb https://mcp.videodb.io/mcp` | Server-side video work: upload, transcribe, index/search, clip, reframe, subtitles, compose, HLS, RTSP monitoring. MCP exposes 89 tools. | 141 stars (skills); [agent-toolkit](https://github.com/video-db/agent-toolkit) 50 stars, last commit 2026-03 | 2026-11-05 | Cloud: uploads, links and the API key go to `api.videodb.io`. Free account gets $20 credits. The README says "The plugin itself collects nothing… no hooks… no telemetry." |
| [claude-real-video](https://github.com/HUANGCHIHHUNGLeo/claude-real-video) | HUANGCHIHHUNGLeo | `pip install claude-real-video` then `cp -r skills/claude-real-video ~/.claude/skills/` | Lets an LLM "watch" a video: scene-change keyframes + dedup + transcript + `--grid` contact sheets (detail in Q3) | 2.3k stars; PyPI package | 2026-10 | macOS, Windows, Linux; Python 3.10+. Local processing. |

**Tier 2: smaller or niche skills and plugins, all with 2026 activity unless marked**

| Item | Install | What it does | Stars / last commit | Notes |
|---|---|---|---|---|
| [Timeline Studio / ai-video-editor](https://github.com/MartinDelophy/ai-video-editor) (MartinDelophy) | skills.sh ([skills.sh/MartinDelophy/ai-video-editor](https://skills.sh/MartinDelophy/ai-video-editor)); needs Node ≥22.20 | Browser multi-track editor + `edit-timeline-studio` skill "for Codex, Claude Code, Copilot and Gemini CLI". Headless runner with JSON plans, dry runs and export verification. | 948 / 2026-11-06 | MIT code; third-party ONNX models carry their own licenses. The "Anna" edition stores projects in cloud storage, and its desktop preview "plans from metadata, without analyzing video frames". |
| [OrkasVideoStudio](https://github.com/Orkas-AI/Orkas-VideoStudio) | `claude mcp add ovs -- npx -y @orkas/video-studio-mcp` | `plan.json`-driven composition, generation and editing. A delivery guard (`ovs plan promise-check`) measures duration, canvas, audio and loudness. | 344 / 2026-11-04 | MIT |
| [FableCut](https://github.com/ronak-create/FableCut) | `claude mcp add -s user fablecut -- npx -y fablecut mcp`, or `/plugin marketplace add ronak-create/FableCut` → `/plugin install fablecut@fablecut` | Premiere-style browser NLE whose whole timeline is one JSON doc; agent edits live. `&frames=12` returns a 4×3 contact sheet. | 781 / 2026-10 | MIT; "Zero npm dependencies" |
| [ButterCut](https://github.com/barefootford/buttercut) (Andrew Ford / TubeSalt) | `git clone` + `/setup` skill | Video editing agent that generates editor XML timelines (README mentions keeping "working XML across three different" editors). Needs Ruby, Python, FFmpeg, WhisperX. | 617 / 2026-09 | **PolyForm Noncommercial** with a commercial-output exception. Targets Apple Silicon; Windows "isn't a priority". |
| [video-editing-skill](https://github.com/6missedcalls/video-editing-skill) (6missedcalls) | copy skill | Trim, jump cut, captions (Hormozi/standard/minimal), text overlay, speed. "Pure Bash + FFmpeg + Whisper." | 50 / 2026-02 | Bash-only, so it does not run natively on Windows. |
| [Youtube-clipper-skill](https://github.com/op7418/Youtube-clipper-skill) (op7418) | copy skill | YouTube clip generation and editing | 2.3k / 2026-01 | ~10 months without commits, near stale |
| [social-auto-upload](https://github.com/dreammis/social-auto-upload) (dreammis) | per-skill folders, e.g. `skills/tiktok-upload`, `youtube-upload`, `facebook-upload`, `meta-upload` | Upload and schedule videos to TikTok, YouTube, Facebook, Douyin, Bilibili and others "with the repository's Chrome uploader" ([VoltAgent list](https://github.com/VoltAgent/awesome-agent-skills)) | 16k / 2026-10 | Browser automation of personal accounts carries account-ban/ToS risk (inference). |
| [ecommerce-video-skills](https://github.com/xianyu110/ecommerce-video-skills) | copy | "12 skills for ecommerce short videos with local ffmpeg rendering" ([heilcheng list](https://github.com/heilcheng/awesome-agent-skills)) | 119 / 2026-10 | — |
| [Flue](https://github.com/SFKislev/Flue) (S.F. Kislev) | — | Bridge so Claude Code drives desktop software "Photoshop, Premiere, Blender, Unity… 13 apps" ([awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)) | 104 / 2026-10 | — |
| [fal-ai-community/skills](https://github.com/fal-ai-community/skills) | `npx skills add` | `fal-generate`, `fal-kling-o3`, `fal-lip-sync`, `fal-upscale`, `fal-video-edit` (remix, upscale, background removal, add audio) ([VoltAgent list](https://github.com/VoltAgent/awesome-agent-skills)) | 263 / 2026-11-07 | Paid fal.ai API |
| [perso-dubbing-plugin](https://github.com/perso-ai/perso-dubbing-plugin) | plugin | Dubbing, lip-sync, subtitles, short clips ([VoltAgent list](https://github.com/VoltAgent/awesome-agent-skills)) | not checked | Commercial service |
| [Bria video-remove-background](https://github.com/Bria-AI/bria-skill/tree/main/skills/video-remove-background) | copy | Alpha-channel background removal for clips ([heilcheng list](https://github.com/heilcheng/awesome-agent-skills)) | not checked | Paid Bria API (inference) |
| [vibe-creating-skill](https://github.com/Alisa0808/vibe-creating-skill) | copy | Rewrites rough ideas into text-to-video prompts for Seedance, Sora, Kling and Veo; EN/中文 ([heilcheng list](https://github.com/heilcheng/awesome-agent-skills)) | not checked | Relevant to Veo prompt writing |
| [ComposioHQ awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) entries | in-repo folders | `tiktok-automation`, `youtube-automation`, `video-downloader`, `youtube-transcript` | — | The automation skills route through Composio (inference from the list's Composio branding). |

**Marketplaces and directories observed**
- skills.sh (Vercel) shows install counts and third-party audit badges: Gen Agent Trust Hub, Socket, Snyk — [skills.sh remotion page](https://skills.sh/remotion-dev/skills/remotion-best-practices). The `skills` CLI repo has 38k stars, last commit 2026-11-06 — [vercel-labs/skills](https://github.com/vercel-labs/skills).
- mcpmarket.com lists video skills such as "ffmpeg-video-editor", "video-processing-editing" and "video-editing-workflow" (the last adds Remotion) — [mcpmarket ffmpeg-video-editor](https://mcpmarket.com/tools/skills/ffmpeg-video-editor), [video-processing-editing](https://mcpmarket.com/tools/skills/video-processing-editing), [video-editing-workflow](https://mcpmarket.com/tools/skills/video-editing-workflow).
- claudemarketplace.net lists `ffmpeg-video-editor` (sundial-org): natural language → FFmpeg commands for cut, convert, compress and aspect change — [claudemarketplace.net](https://www.claudemarketplace.net/skills/ffmpeg-video-editor).
- officialskills.sh hosts vendor skills, e.g. `remotion-dev/skills/remotion`, `openai/skills/sora`, `google-labs-code/skills/remotion` ("walkthrough videos from Stitch app designs") — [VoltAgent awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills).
- One KirttiVushan repo has a video-editing SKILL.md that treats FFmpeg as the deterministic cutting layer and Claude as the planner — [KirttiVushan/claude-code](https://github.com/KirttiVushan/claude-code/blob/main/skills/video-editing/SKILL.md).

### Inferences
- Most relevant to the user's no-narration, 9:16, Veo-chained animal videos:
  - **ffmpeg-skill**: local, Windows-capable, reframe and loudness, contact-sheet verification.
  - **HyperFrames**: HTML title cards and captions over AI clips, free desktop app on Windows.
  - **iart-ai tiktok-video-skills**: has a verify loop.
  - **capcut-cli**: when the user wants a hand-editable CapCut draft before TikTok.
- video-use, ButterCut and ChatCut's talking-head features are transcript-centric. They add little for footage with no speech.
- The skills.sh install counts are very large (millions), probably inflated by agent-driven reinstalls, so treat them as relative signals only. That is an inference: skills.sh does not say whether the counts are weekly or all-time.

### Gaps
- I did not open skillsmp.com, claude-plugins.dev or claudemarketplaces.com directly, so their video categories and install counts are unverified.
- License not checked for video-use, Youtube-clipper-skill or social-auto-upload.
- The exact path of OpenAI's `sora` skill in `openai/skills` did not resolve at `skills/.curated/sora/SKILL.md`. It is listed via officialskills.sh only.

## Q2. Which MCP servers for video exist, and which are maintained and popular?

### Takeaway
The maintained, popular video MCP servers fall into four groups:
- **NLE bridges:** DaVinci Resolve MCP (4k stars), After Effects MCP (862), Adobe adb-mcp (740).
- **Local FFmpeg engines:** ffmpeg-skill's MCP, Kinocut (formerly mcp-video), video-creator/ffmpeg-mcp.
- **Agent-native editors:** WeftCut, FableCut, CapCut/VectCut API.
- **Cloud platforms:** VideoDB, Mux, Google's genmedia (Veo + AVTool).

Many early 2025 FFmpeg and Manim MCP servers are now stale.

### Cited Findings

**Editing and NLE control**

| Server | Install | Function | Stars / last commit | Notes |
|---|---|---|---|---|
| [davinci-resolve-mcp](https://github.com/samuelgursky/davinci-resolve-mcp) (Samuel Gursky) | `npx davinci-resolve-mcp setup`, or `git clone` | Full Resolve Scripting API coverage + guarded helpers for edit, media pool, render, markers, grading, Fusion, Fairlight. Local browser control panel. | 4k / 2026-11-06 | MIT. Resolve 18.5+ on macOS, Windows, Linux. External scripting is **Studio-only**; the free edition needs an in-app bridge. A "Verified-Trap Guard" refuses destructive ops (e.g. `CopyGrades`) and reports `unverified` honestly. |
| [davinci-resolve-ai-bridge-mcp](https://github.com/flamexnreal/davinci-resolve-ai-bridge-mcp) | — | Local bridge for Resolve Free and Studio: timeline inspection, zoom animation, color ([punkpeye list](https://github.com/punkpeye/awesome-mcp-servers)) | 44 / 2026-11-02 | Small |
| [after-effects-mcp](https://github.com/Dakkshin/after-effects-mcp) (Dakkshin) | — | Adobe After Effects control | 862 / 2026-04 | Description not fetched |
| [adb-mcp](https://github.com/mikechambers/adb-mcp) (Mike Chambers) | — | "Proof of concept" MCP controlling Adobe Photoshop and Premiere; tested with Claude Desktop on Mac and Windows. "The Premiere agent is a bit more limited" due to the Premiere plugin API. | 740 / 2026-07 | PoC status |
| [scout-premiere-mcp](https://github.com/tro2789/scout-premiere-mcp) | — | Premiere Pro via Scout panel: transcript search, markers, cuts, export ([punkpeye list](https://github.com/punkpeye/awesome-mcp-servers)) | 1 / 2026-09 | Negligible adoption |
| [fcpxml-mcp-server](https://github.com/DareDev256/fcpxml-mcp-server) | — | Parse, edit and generate Final Cut Pro FCPXML; health checks, **flash frame detection**, chapter markers, rough cuts ([punkpeye list](https://github.com/punkpeye/awesome-mcp-servers)) | 137 / 2026-11-02 | macOS |
| [WeftCut](https://github.com/WeftCut/WeftCut) | desktop app with localhost MCP | Full desktop NLE exposing "all editing tools" over MCP. Edits land live on the timeline, and every batch is checkpointed and undoable. | 319 / 2026-11-06 | MIT app; bundles GPL/LGPL FFmpeg. Pre-1.0. "We don't have a verified macOS installer yet" (Gatekeeper "Open Anyway"). |
| [VectCutAPI / CapCutAPI](https://github.com/sun-guannan/CapCutAPI) (sun-guannan) | `git clone https://github.com/sun-guannan/VectCutAPI.git`; `pip install -r requirements-mcp.txt` | "toAgent" cloud editing APIs + MCP for CapCut/JianYing drafts: subtitles, PiP, keyframes, AI VO. Supports the JianYing Pro 10 Windows layout. | 2.4k / 2026-10 | Repo renamed to VectCutAPI; hosted service at vectcut.com. License not checked. |
| [Kinocut](https://github.com/KyaniteLabs/kinocut) (formerly mcp-video) | MCP mode `kino --mcp` (exact package install not captured) | Local FFmpeg edits, captions, audio, effects, Hyperframes, Shorts/Reels repurposing, quality gates, "Video Receipts"/provenance. Default 20-tool registration, `KINOCUT_TOOLS=all`. | 252 / 2026-11-03 | Apache-2.0. "First-class Windows support" landed in 1.15.0 (2026-08). The MCPB package is "unsigned… is not a sandbox". |
| [video-creator/ffmpeg-mcp](https://github.com/video-creator/ffmpeg-mcp) | — | Local video search, trim, stitch, playback via ffmpeg CLI | 153 / 2026-05 | — |
| [proofcut](https://github.com/tydude001/proofcut) | — | Cut by transcript, b-roll, captions, then "verify the render against" the plan ([punkpeye list](https://github.com/punkpeye/awesome-mcp-servers)) | 4 / 2026-11-06 | Very new |
| [loudcheck](https://github.com/chaoz23/loudcheck) | — | EBU R128 / ATSC A/85 loudness pass/fail with ffmpeg remediation ([punkpeye list](https://github.com/punkpeye/awesome-mcp-servers)) | not checked | Useful QA gate |
| [video-audio-mcp](https://github.com/misbahsy/video-audio-mcp) | — | FFmpeg video and audio editing | 89 / 2025-05 | **STALE** |
| [video-edit-mcp](https://github.com/Aditya2755/video-edit-mcp) | — | Trim, merge, effects, overlays, YouTube download ([punkpeye list](https://github.com/punkpeye/awesome-mcp-servers)) | 30 / 2025-07 | **STALE** |
| [video-editing-mcp](https://github.com/burningion/video-editing-mcp) (Video Jungle) | — | Add, analyze, search and generate edits in a Video Jungle collection | 295 / 2025-10 | **STALE** (just over 12 months), cloud service |
| [manim-mcp-server](https://github.com/abhiemj/manim-mcp-server) | — | Local Manim animations | 657 / 2025-05 | **STALE** |
| [atsurae](https://github.com/1000ri-jp/atsurae), [clipkit](https://github.com/clipkit-video/clipkit) | — | Timeline/compositing editor; JSON motion graphics with frame preview ([punkpeye list](https://github.com/punkpeye/awesome-mcp-servers)) | 2 / 2026-02; 19 / 2026-08 | Low adoption |

**Generation and cloud media**
- Google `mcp-genmedia` (in [vertex-ai-creative-studio](https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/tree/main/experiments/mcp-genmedia), 1.2k stars, last commit 2026-11-06) — [mcp-genmedia README](https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/blob/main/experiments/mcp-genmedia/README.md):
  - Separate MCP servers for Veo 3/3.1, Gemini Image ("Nano Banana"), Gemini TTS / Chirp 3 HD, Lyria and **AVTool** (combining, concatenation, format conversion).
  - Agent Skills such as `genmedia-producer` for Gemini CLI and Antigravity.
  - Installs via `curl -sL https://raw.githubusercontent.com/GoogleCloudPlatform/genmedia-creative-studio/main/experiments/mcp-genmedia/mcp-genmedia-go/install-online.sh | bash`. Note that the installer URL names a different repo (`genmedia-creative-studio`), which suggests a rename.
- Mux official MCP: upload videos, live streams, thumbnails — [wong2 awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers).
- Many paid multi-model aggregators exist (WaveSpeedAI, AetherWave, Dare, Vercel AI Gateway MCP, CreativeClaw), all exposing Veo/Kling/Seedance/Sora behind API keys — [punkpeye awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers).

**YouTube and TikTok**
- [anaisbetts/mcp-youtube](https://github.com/anaisbetts/mcp-youtube): subtitles via yt-dlp. 552 stars, last commit 2026-08.
- [kimtaeyoon83/mcp-server-youtube-transcript](https://github.com/kimtaeyoon83/mcp-server-youtube-transcript): transcripts. 603 stars, last commit 2026-07.
- [anwerj/youtube-uploader-mcp](https://github.com/anwerj/youtube-uploader-mcp): uploads to YouTube from an assistant. 65 stars, last commit 2026-10.
- [Seym0n/tiktok-mcp](https://github.com/Seym0n/tiktok-mcp): TikTok post details and subtitles. 208 stars, last commit 2026-08.
- Cloud alternatives: [HasData/tiktok-mcp](https://github.com/HasData/tiktok-mcp), [HasData/youtube-mcp](https://github.com/HasData/youtube-mcp), [Upload-Post MCP](https://github.com/Upload-Post/upload-post-mcp) (publish/schedule to TikTok, YouTube, Facebook), [Supadata](https://github.com/supadata-ai/mcp) — [punkpeye list](https://github.com/punkpeye/awesome-mcp-servers), [wong2 list](https://github.com/wong2/awesome-mcp-servers).
- The punkpeye awesome-mcp-servers README (≈1.6 MB) shows a glama.ai score badge for each server — [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers).

### Inferences
- The best fits for the user's stack: ffmpeg-skill's MCP or Kinocut (local, Windows-tested) for stitching and QA; FCPXML or Resolve MCP only if they move to an NLE. Resolve automation needs the paid Studio edition, or the free-edition bridge.
- Google mcp-genmedia drives Veo through Vertex AI APIs (billed per use), not the Flow web UI the user automates today. It is an alternative path, not a drop-in.

### Gaps
- I did not query mcp.so, glama.ai or smithery.ai directly for install counts or quality scores.
- The Twelve Labs video-understanding MCP (`twelvelabs-io/twelvelabs-mcp-server`) was "repo not found"; its current location is unknown.
- Licenses and install commands for Dakkshin/after-effects-mcp and video-creator/ffmpeg-mcp were not captured.

## Q3. How do agents "see" and review their own edits?

### Takeaway
The working pattern in 2026 is: avoid dumping frames, then sample keyframes at scene changes or cut boundaries, tile them into contact sheets or filmstrip+waveform PNGs, and have the model inspect those images. The model also runs measurable checks (ffprobe duration, resolution, fps, loudness, platform spec) before showing the user a render. video-use, ffmpeg-skill, iart-ai motion-skills, FableCut and claude-real-video all implement versions of this loop. PySceneDetect remains the standard local scene detector.

### Cited Findings
- **video-use** — [video-use README](https://github.com/browser-use/video-use), [video-use SKILL.md](https://github.com/browser-use/video-use/blob/main/SKILL.md):
  - It rejects frame-dumping: "30,000 frames × 1,500 tokens = 45M tokens of noise". It uses transcripts plus on-demand visuals instead.
  - `timeline_view.py <video> <start> <end>` makes a "filmstrip + waveform PNG". The skill says to use it "at decision points, not constantly".
  - "Self-eval (before showing the user): Run `timeline_view` on the rendered output… at every cut boundary (±1.5s window)." It catches "visual jumps, audio pops, hidden subtitles".
- **ffmpeg-skill** — [ffmpeg-skill README](https://github.com/kajisho5/ffmpeg-skill):
  - Pipeline: "Verification: probe · check · look.py contact sheet".
  - "The result is probed, checked against the destination's spec and, when the picture changed, looked at as a contact sheet."
  - Advice: "Look at the contact sheet before deciding" a 9:16 crop. Tone mapping is reported as `unverified`.
- **claude-real-video (`crv`)** — [claude-real-video README](https://github.com/HUANGCHIHHUNGLeo/claude-real-video):
  - One chronological `ffmpeg select` pass grabs scene changes, with a density floor (`--fps-floor`) and dedup (`--dedup-window`). Action bursts get 0.2 s-spaced frames.
  - "58-second clip: fixed 1 fps sampling = 58 frames. crv keeps the 26 that actually differ — and `--grid` packs them into 3 contact sheets." One sheet holds nine keyframes with filenames on each cell.
  - Works on macOS, Windows and Linux. The author notes keyframes cannot convey "how the video moves — the camera work and the pacing".
- **iart-ai motion-skills**: visual skills ship "a deliver-and-verify loop plus a small scripts/ toolkit (freeze a frame, tile a contact sheet, probe the encoded MP4)" — [motion-skills README](https://github.com/iart-ai/motion-skills).
- **FableCut**: an `&frames=12` request returns "a 4×3 contact sheet across the clip — a cheap survey" — [FableCut README](https://github.com/ronak-create/FableCut).
- **ChatCut**: "Scene-by-scene video analysis, and checks that each edit is visible in the editor" — [ChatCut agent-plugin](https://github.com/ChatCut-Inc/agent-plugin).
- **OrkasVideoStudio**: "Delivery verification measures duration, canvas, audio, integrated loudness". `ovs plan promise-check` verifies the finished cut — [Orkas README](https://github.com/Orkas-AI/Orkas-VideoStudio).
- **DaVinci Resolve MCP**: results carry `verification.status`. Anything analyzed but unverifiable "is reported as unverified, never folded into" success — [davinci-resolve-mcp README](https://github.com/samuelgursky/davinci-resolve-mcp).
- **fcpxml-mcp-server** detects flash frames; **loudcheck** gives EBU R128 pass/fail — [punkpeye list](https://github.com/punkpeye/awesome-mcp-servers).
- **claude-code-video-toolkit**: `/scene-review` verifies visuals in Remotion Studio, and `/design` "critiques the render". `uv run tools/locate_watermark.py --input video.mp4 --grid --output-dir ./review/` writes a review grid — [toolkit README](https://github.com/digitalsamba/claude-code-video-toolkit).
- **PySceneDetect** — 5.4k stars, last commit 2026-11-07 — [PySceneDetect](https://github.com/Breakthrough/PySceneDetect):
  - Install: `pip install scenedetect --upgrade`.
  - CLI: `scenedetect -i video.mp4 split-video`, `save-images`, `time -s 10s`. Python API: `from scenedetect import detect, ContentDetector`. A Docker image is also available.
- **MartinDelophy Timeline Studio** is a counter-example: its desktop preview "plans from metadata, without analyzing video frames or audio" — [ai-video-editor README](https://github.com/MartinDelophy/ai-video-editor).

### Inferences
- The user's `khung-dau.mjs` grid workflow already matches this pattern. Two upgrades fit:
  - `crv --grid`: scene-aware sampling + dedup, Windows-capable.
  - A video-use-style post-render check: filmstrip + waveform at each crossfade seam (±1.5 s), to catch seam jumps before the user sees the video.
- PySceneDetect's `ContentDetector` could flag unintended hard cuts inside Veo clips or at stitched seams. This is an inference; I found no skill that does exactly that for AI-clip seams.

### Gaps
- No source compared vision-model review quality (e.g. Claude vs Gemini native video) for catching render defects.
- I found no maintained MCP that wraps PySceneDetect specifically.

## Q4. Skills for other agents (Codex, Cursor, Gemini CLI) that also work with Claude Code via the open Agent Skills format

### Takeaway
Claude Code follows the open Agent Skills standard (agentskills.io), and most 2026 video skills are published cross-agent. HyperFrames, Remotion, video-use, ChatCut, Timeline Studio and VideoDB explicitly target Claude Code, Codex, Cursor and Gemini CLI. OpenAI's `sora` skill and Google's genmedia skills are written for Codex and Gemini CLI. Because they share the SKILL.md format, they should load in Claude Code, but the vendor tooling (`$skill-installer`, Gemini extensions) does not carry over.

### Cited Findings
- "Claude Code skills follow the open Agent Skills standard, which works across multiple AI tools." Claude Code extensions (`disable-model-invocation`, `context: fork`, `!command` injection) are Claude Code-only — [Claude Code skills docs](https://code.claude.com/docs/en/skills).
- Remotion: skills "are useful for AI agents like Claude Code, Codex, Kimi Code or Cursor" — [remotion-dev/skills](https://github.com/remotion-dev/skills).
- HyperFrames: "Using Claude Code, Codex, Cursor, or another coding agent? Run `npx hyperframes skills update`" — [hyperframes README](https://github.com/heygen-com/hyperframes).
- video-use's setup prompt works in "Claude Code, Codex, Hermes, Openclaw, or any agent with shell access" — [video-use README](https://github.com/browser-use/video-use).
- Timeline Studio skill: "for Codex, Claude Code, Copilot and Gemini CLI" — [ai-video-editor README](https://github.com/MartinDelophy/ai-video-editor).
- ChatCut: Codex, ChatGPT, Claude Code, Cursor, Gemini CLI, Google Antigravity, Kimi and Qwen. Some ChatCut skill paths sit under `codex/skills/` — [ChatCut agent-plugin](https://github.com/ChatCut-Inc/agent-plugin), [VoltAgent list](https://github.com/VoltAgent/awesome-agent-skills).
- OpenAI `openai/skills` (29k stars, last commit 2026-06): curated skills install with `$skill-installer <name>` inside Codex — [openai/skills README](https://github.com/openai/skills). The `sora` skill ("Generate, remix, and manage short video clips via OpenAI's Sora API") is listed at officialskills.sh — [VoltAgent list](https://github.com/VoltAgent/awesome-agent-skills).
- Google genmedia Agent Skills (`genmedia-producer`, `install-mcp-genmedia`) target "Gemini CLI or Antigravity" — [mcp-genmedia README](https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/blob/main/experiments/mcp-genmedia/README.md).
- 6missedcalls video-editing-skill targets "OpenClaw, Claude Code, and Codex" — [repo](https://github.com/6missedcalls/video-editing-skill).
- `npx skills add` (Vercel's `skills` CLI) installs a repo's skills into whichever agent is present — [vercel-labs/skills](https://github.com/vercel-labs/skills), as used in [video-db/skills](https://github.com/video-db/skills).

### Inferences
- For Claude Code, the user can copy a Codex or Gemini skill folder into `~/.claude/skills/<name>/`, or use `npx skills add`. They should strip or ignore agent-specific frontmatter and check any `scripts/` for shell-only (Bash) assumptions before relying on them on Windows.

### Gaps
- I found no Gemini CLI *extension* (as opposed to skill or MCP) dedicated to video editing. My search on "Gemini CLI extension video" returned only Veo docs and the `veotools` PyPI package ([veotools](https://pypi.org/project/veotools/)). The package is not a confirmed Gemini CLI extension.
- I did not survey Cursor rules (.mdc) for video.

## Q5. Security: warnings about third-party skills and MCP servers (2025–2026)

### Takeaway
Skill and MCP supply-chain attacks are documented and large-scale:
- Snyk found 76 confirmed malicious skills among 3,984 scanned on ClawHub and skills.sh. 36.8% of all scanned skills had at least one flaw.
- Koi found 341 malicious skills on ClawHub.
- Unit 42 found skills engineered to evade marketplace scanning.
- The first malicious MCP server (`postmark-mcp`) silently BCC'd users' emails.

Several video tools in this catalog use risky install patterns: `curl | sh`, agent-driven auto-install, unsigned binaries.

### Cited Findings
- **Snyk ToxicSkills** (2026-02-05) — [Snyk ToxicSkills](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/):
  - Scanned 3,984 skills from ClawHub and skills.sh. Human review confirmed 76 malicious payloads (credential theft, backdoors, exfiltration); 8 were still live on clawhub.ai at publication.
  - 13.4% (534) had a critical issue; 36.82% (1,467) had at least one flaw.
  - Prompt injection appeared in 91% of malicious skills. Techniques included `curl | bash`-style unverifiable dependencies (21%) and persistence via agent memory files.
  - Snyk's scanner: `uvx mcp-scan@latest --skills`.
- **Koi Security** (Feb 2026): 2,857 ClawHub skills audited, 341 malicious, 335 from one campaign ("ClawHavoc") — [eSecurity Planet](https://esecurityplanet.com/threats/hundreds-of-malicious-skills-found-in-openclaws-clawhub). A secondary report cites a 1,184 ClawHavoc figure; the scopes differ.
- **Unit 42** (2026): persistent, evasive malicious ClawHub skills from Feb–May 2026, including skills that pass scanning via techniques like oversized file padding — [Unit 42](https://unit42.paloaltonetworks.com/openclaw-ai-supply-chain-risk/), [CSA research note](https://labs.cloudsecurityalliance.org/research/csa-research-note-openclaw-clawhub-supply-chain-risk-2026070/).
- **Crypto-mining swarm** (April 2026): 30 ClawHub skills by one author turned agents into a mining swarm. Secondary report — [LetsDataScience](https://letsdatascience.com/news/clawhub-skills-co-opt-ai-agents-into-crypto-swarm-d7382fb9).
- **ClawHub's response:** VirusTotal/ClawScan screening, plus a rule that accounts must be at least one week old to publish (via search summary) — [eSecurity Planet](https://esecurityplanet.com/threats/hundreds-of-malicious-skills-found-in-openclaws-clawhub).
- **postmark-mcp** (Sept 2025), "first malicious MCP server found":
  - Version 1.0.16 (2025-09-17) added one line that BCC'd every email to an attacker. The package had 1,643 downloads.
  - Sources: [The Hacker News](https://thehackernews.com/2025/09/first-malicious-mcp-server-found.html), [Koi](https://koi.ai/blog/postmark-mcp-npm-malicious-backdoor-email-theft).
- **Claude Code docs** — [Claude Code skills docs](https://code.claude.com/docs/en/skills):
  - "A skill can grant itself broad tool access, so review the `allowed-tools`…"
  - "Workspace trust doesn't gate this field."
  - `` !`<command>` `` lines run on your machine before Claude sees the skill. They can be blocked with `"disableSkillShellExecution": true`.
  - A skill folder with `.claude-plugin/plugin.json` can load its own agents, hooks and MCP servers.
- **skills.sh audits:** the page shows Gen Agent Trust Hub, Socket and Snyk results per skill. Even the official Remotion skill shows a Gen Agent Trust Hub "Fail" — [skills.sh](https://skills.sh/remotion-dev/skills/remotion-best-practices).
- **Risky install patterns among the video items:**
  - ChatCut: `curl -fsSL https://chatcut.io/install.sh | sh` and `irm … | iex` — [ChatCut](https://github.com/ChatCut-Inc/agent-plugin).
  - Google genmedia: `curl -sL …install-online.sh | bash` — [mcp-genmedia](https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/blob/main/experiments/mcp-genmedia/README.md).
  - video-use: lets the agent clone, install and handle an API key from a pasted prompt — [video-use](https://github.com/browser-use/video-use).
  - WeftCut: unsigned macOS app — [WeftCut](https://github.com/WeftCut/WeftCut).
  - Kinocut: its MCPB package is "unsigned… not a sandbox" — [Kinocut](https://github.com/KyaniteLabs/kinocut).
- **Data egress to clouds:**
  - VideoDB sends files, links and the API key to `api.videodb.io` — [video-db/skills](https://github.com/video-db/skills).
  - capcut-cli's `caption --cloud` uploads audio — [capcut-cli](https://github.com/renezander030/capcut-cli).

### Inferences
- Before installing any item here, the user should:
  - pin to a commit,
  - read SKILL.md and its `scripts/`,
  - run `uvx mcp-scan@latest --skills`,
  - prefer local tools that need no API keys (ffmpeg-skill, claude-real-video, PySceneDetect),
  - keep `app/data/settings.json` (which holds `claudeToken`) out of any tool's working folder.

### Gaps
- I found no reports of malicious skills or MCP servers that specifically target video tools.
- The ClawHub figures from different firms measure different scopes. No consolidated 2026 tally exists.
