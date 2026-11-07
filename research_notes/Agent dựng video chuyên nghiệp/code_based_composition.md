# Code-based video composition and motion-graphics frameworks for AI agents (state as of 2026-11-07)

Method note: Star counts, last-push dates, licenses and languages come from the public GitHub REST API (`api.github.com/repos/<owner>/<repo>`), queried on 2026-11-07, unless stated otherwise. "Stale" = no push in 12+ months (pushed before 2025-11-07). The user's local OpenMontage clone at `/Users/nguyentruong/OpenMontage` was inspected directly (last local commit 2026-06-22). The user's own `flow-chain-video` skill already stitches clips with FFmpeg `xfade=transition=fade` (found by grep in `.claude/skills/`).

## Q1. Remotion: official agent skills, MCP, prompt-to-video templates, and what people build with Claude Code + Remotion

### Takeaway
Remotion is the most agent-integrated React video framework: it ships official Agent Skills (`remotion-dev/skills`, 13 skills including `/remotion-best-practices`), AI-readable docs (`.md` URLs and content negotiation), and a prompt-to-video template. Its hosted MCP server was shut down on 2026-10-26 in favor of the `/remotion-docs` skill. It is free for individuals and companies with up to 3 employees; larger companies pay ($25/seat/month or $0.01/render with a $100/month minimum).

### Cited Findings
- `remotion-dev/remotion`: 71,322 stars, last push 2026-11-06, TypeScript, license "NOASSERTION" (custom Remotion license), description "Make videos programmatically with React" — [GitHub API](https://api.github.com/repos/remotion-dev/remotion)
- Latest release v4.0.541, published 2026-11-05 — [GitHub releases API](https://api.github.com/repos/remotion-dev/remotion/releases/latest)
- `remotion-dev/skills`: 6,489 stars, last push 2026-11-05, description "Agent Skills" — [GitHub API](https://api.github.com/repos/remotion-dev/skills)
- Skills shipped: `/remotion-best-practices` (umbrella), `/remotion-create`, `/remotion-markup` (compositions, animations, layout, typography, media, effects, audio, fonts, timing), `/remotion-studio`, `/remotion-render`, `/remotion-maps` (Mapbox, MapLibre, MapTiler, GeoJSON, CesiumJS 3D flyovers), `/remotion-captions`, `/remotion-saas`, `/remotion-interactivity`, `/remotion-docs`, `/remotion-license`, `/remotion-upgrade`, `/remotion-multimedia` (Mediabunny) — [remotion-dev/skills README](https://github.com/remotion-dev/skills)
- Install: `npx skills add remotion-dev/skills`, `gh skill install remotion-dev/skills`, or offered during `bun create video`; supported agents listed: Claude Code, Codex, Kimi Code, Cursor — [remotion-dev/skills README](https://github.com/remotion-dev/skills)
- The Remotion MCP page also gives `npx remotion skills add` as the install command — [Remotion docs: MCP](https://www.remotion.dev/docs/ai/mcp.md)
- MCP status: "The hosted Remotion MCP server was shut down on October 26, 2026 and is no longer available." It "duplicated the `/remotion-docs` skill"; users should remove the `remotion-documentation` entry and use `/remotion-docs` — [Remotion docs: MCP](https://www.remotion.dev/docs/ai/mcp.md)
- AI-ready docs: every doc page has "Copy as Markdown"; appending `.md` returns raw markdown; pages honor `Accept: text/markdown`, so Claude Code/opencode fetch markdown automatically — [Remotion docs: AI](https://www.remotion.dev/docs/ai/)
- Launch timing: Agent Skills launched in early January 2026 and were called the most significant Remotion update of 2026 (secondary sources, not Remotion's own announcement) — [StartupHub](https://www.startuphub.ai/news/remotion-ai-video-makes-production-code-from-plain-prompts); [autoae.online tracker](https://autoae.online/blog/remotion-updates-2026)
- A Claude Code plugin route `claude plugin marketplace add remotion-dev/claude-code-plugin` is reported by a Portuguese blog (unverified against official docs) — [horadecodar](https://horadecodar.com.br/?p=44180)
- Prompt-to-video template: `remotion-dev/template-prompt-to-video`, 170 stars, last push 2026-11-02, "Create a story with images and voiceover from a prompt" — [GitHub API](https://api.github.com/repos/remotion-dev/template-prompt-to-video)
- Free License eligibility: individuals; for-profit organizations with up to 3 employees; non-profits; evaluation. Free use may be commercial. Prohibited: copying/modifying Remotion to sell or sublicense a derivative — [Remotion LICENSE.md](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)
- Company License pricing: "Remotion for Automators" $0.01 per render, minimum spend $100/month; "Remotion for Creators" $25 per seat per month, no seat minimum; combined minimum $100/month; Enterprise minimum $500/month (from search snippets of the official pricing page; I could not render the page's table directly) — [remotion.dev/docs/license/pricing](https://www.remotion.dev/docs/license/pricing); conflicting annual tiers ($150/$250/$500 by headcount) reported by [aipicks.jp](https://aipicks.jp/mag/remotion-pricing-2026), likely outdated
- Remotion 5.0 license (draft PR): contractors will count toward team size; company license bound to new T&Cs; restates a ban on "operating a bring-your-own-code rendering service" — [PR #3750](https://github.com/remotion-dev/remotion/pull/3750)
- Community builds with Claude Code + Remotion (Reddit, via a snapshot mirror): a product launch video where "claude code wrote every single line of TSX"; brand-styled reels; a skill combining ffmpeg + Remotion to trim silence and cut bad takes with a QA loop that compares output to a reference clip; YouTube editing pipelines; questions about lyric videos — [Reddit snapshot 1](https://reddit.sentinel-team.org/posts/1t51k8s/snapshots/2026-05-09T02%3A30%3A12.086538Z); [Reddit snapshot 2](https://reddit.sentinel-team.org/posts/1qkais5/snapshots/2026-01-24T06%3A14%3A00.964385Z)
- Many third-party Remotion skills exist in marketplaces (e.g. `wshuyi/remotion-video-skill`, `remotion-script-writer`, `remotion-video-production`), and Google Labs' `stitch-skills` includes a `remotion` skill — [claudemarketplaces: wshuyi](https://claudemarketplaces.com/skills/wshuyi/remotion-video-skill/remotion-video); [killer-skills: google-labs-code/stitch-skills/remotion](https://killer-skills.pages.dev/en/skills/google-labs-code/stitch-skills/remotion)
- Higgsfield "Vibe Motion" is a third-party product that uses Claude + Remotion — [eesel.ai on Claude Motion](https://eesel.ai/blog/claude-motion); [skills.sh higgsfield-vibe-motion](https://skills.sh/osidemedia/higgsfield-ai-prompt-skill/higgsfield-vibe-motion)
- Related: Anthropic reportedly launched "Claude Motion" (beta, 2026-10-08) for Team/Enterprise plans: Claude writes code that animates text, charts, shapes and images, exports MP4, no video-generation model. Only secondary sources found — [eesel.ai](https://eesel.ai/blog/claude-motion); [layer3labs guide](https://www.layer3labs.io/guides/claude-motion)
- OpenMontage (the user's baseline) bundles Remotion `^4.0.441` in `remotion-composer/` with components such as CaptionOverlay, HeroTitle, StatReveal, ParticleOverlay, ProductReveal, and compositions CinematicRenderer, CollageBurst, Explainer, LyricOverlay, TalkingHead — local inspection of `/Users/nguyentruong/OpenMontage/remotion-composer` ([upstream repo](https://github.com/calesthio/OpenMontage))

### Inferences
- The user is an individual, so Remotion's Free License covers commercial TikTok/YouTube use. The license only becomes a cost if the user incorporates a company with 4+ people (contractors count from Remotion 5.0).
- Since the MCP server is dead, the agent path for Remotion in Claude Code is skills + `.md` docs, not MCP. Any guide that tells the user to add the Remotion MCP is outdated.
- `template-prompt-to-video` targets narrated image stories (voiceover), which does not match the user's no-narration Veo-clip chains.

### Gaps
- Official Remotion announcement date for Agent Skills not found; dates come from secondary blogs.
- Could not render the official pricing table or the full list of `@remotion/transitions` presentations (the docs pages render them from components that WebFetch could not read).
- Official Anthropic documentation for "Claude Motion" not found; treat details as unverified.

## Q2. Alternatives (Motion Canvas, Revideo, HyperFrames, Editly, MoviePy 2.x, Manim, Lottie/rlottie, Theatre.js, FFmpeg MCP servers, MLT) and which are most agent-friendly

### Takeaway
HyperFrames (HeyGen, Apache-2.0, 80k stars, HTML+GSAP rendered by headless Chrome + FFmpeg) is the most agent-native alternative: it is "built for agents", ships a Claude Code plugin with 9 skills, ~450 registry blocks, and a remote MCP, and it has no license thresholds. Remotion is the other first-tier option. Motion Canvas/Revideo are capable but slower-moving and have no official agent skills; Editly, Theatre.js, lottie-web, ShortGPT-era tools are stale. FFmpeg (directly via Bash or via community MCP servers) remains the lowest-friction tool for simple crossfade stitching.

### Cited Findings

Comparison table (GitHub API data as of 2026-11-07):

| Tool | GitHub | Stars | Last push / release | License | Lang | Render method | Agent-friendliness | Status / limits |
|---|---|---|---|---|---|---|---|---|
| Remotion | [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | 71,322 | push 2026-11-06; v4.0.541 2026-11-05 | Custom source-available; free ≤3 employees | TS/React | Headless Chrome screenshots + FFmpeg; Lambda/Cloud Run | Official skills (13), `.md` docs; MCP shut down 2026-10-26 | Company license above 3 employees |
| HyperFrames (HeyGen) | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 80,160 | push 2026-11-07; v0.9.19 2026-11-06 | Apache-2.0 | TS (HTML) | Seeks each frame in headless Chrome, encodes with FFmpeg | Claude Code plugin, 9 skills, ~450 blocks, remote MCP (beta) | Pre-1.0; Node 22+; some features need paid Pro |
| Motion Canvas | [motion-canvas/motion-canvas](https://github.com/motion-canvas/motion-canvas) | 19,712 | push 2026-07-02; last release v3.17.2 2024-12-14 | MIT | TS | Browser editor, frame export | No official skills found | Releases stale (~23 months) |
| Revideo | [midrender/revideo](https://github.com/midrender/revideo) (moved from redotvideo/revideo) | 4,186 | push 2026-07-15 | MIT | TS | Headless browser under Node; parallel workers; Cloud Run | No official skills found | Now "engine behind Midrender"; PostHog telemetry on by default |
| Editly | [mifi/editly](https://github.com/mifi/editly) | 5,588 | push 2025-05-12 | MIT | TS | Declarative JSON → FFmpeg pipeline | JSON spec is LLM-friendly | **Stale** |
| MoviePy | [Zulko/moviepy](https://github.com/Zulko/moviepy) | 15,117 | push 2026-08-26; v2.2.1 2025-05-21 | MIT | Python | Python frame compositing → FFmpeg | Plain Python, easy for agents | Releases slow (last 18 months ago) |
| Manim Community | [ManimCommunity/manim](https://github.com/ManimCommunity/manim) | 42,310 | push 2026-11-05; v0.22.1 2026-10-27 | MIT | Python | Cairo/OpenGL → FFmpeg | Skills exist in OpenMontage (`manimce-best-practices`) | Math/diagram style only |
| 3b1b/manim | [3b1b/manim](https://github.com/3b1b/manim) | 96,214 | push 2026-09-09 | MIT | Python | OpenGL | `manimgl-best-practices` skill in OpenMontage | Personal tool of 3Blue1Brown |
| lottie-web | [airbnb/lottie-web](https://github.com/airbnb/lottie-web) | 32,371 | push 2025-09-01 | MIT | JS | Renders AE/Bodymovin JSON in browser | JSON is generatable but verbose | **Stale** (14 months) |
| rlottie | [Samsung/rlottie](https://github.com/Samsung/rlottie) | 1,446 | push 2026-09-30 | NOASSERTION | C++ | Native Lottie rasterizer | Low-level library | Active |
| Theatre.js | [theatre-js/theatre](https://github.com/theatre-js/theatre) | 12,912 | push 2024-08-14 | Apache-2.0 | TS | Web motion editor | Editor-centric, not agent-centric | **Stale** (27 months) |
| MLT / melt | [mltframework/mlt](https://github.com/mltframework/mlt) | 1,871 | push 2026-11-06 | LGPL-2.1 | C | XML timeline via `melt` CLI (Shotcut/Kdenlive engine) | XML playlists scriptable | Active |
| Diffusion Studio core | [diffusionstudio/core](https://github.com/diffusionstudio/core) | 1,251 | push 2025-11-18 | MPL-2.0 | TS | Browser compositing via WebCodecs | — | Near-stale (~11.6 months) |
| etro | [etro-js/etro](https://github.com/etro-js/etro) | 1,155 | push 2026-11-04 | GPL-3.0 | TS | Browser video editing library | — | Active, GPL |

Sources for the table: GitHub API entries for each repo ([remotion](https://api.github.com/repos/remotion-dev/remotion), [hyperframes](https://api.github.com/repos/heygen-com/hyperframes), [motion-canvas](https://api.github.com/repos/motion-canvas/motion-canvas), [revideo](https://api.github.com/repos/redotvideo/revideo), [editly](https://api.github.com/repos/mifi/editly), [moviepy](https://api.github.com/repos/Zulko/moviepy), [ManimCommunity](https://api.github.com/repos/ManimCommunity/manim), [3b1b](https://api.github.com/repos/3b1b/manim), [lottie-web](https://api.github.com/repos/airbnb/lottie-web), [rlottie](https://api.github.com/repos/Samsung/rlottie), [theatre](https://api.github.com/repos/theatre-js/theatre), [mlt](https://api.github.com/repos/mltframework/mlt), [diffusionstudio](https://api.github.com/repos/diffusionstudio/core), [etro](https://api.github.com/repos/etro-js/etro)) and release endpoints (`/releases/latest`).

HyperFrames details:
- "free, open-source framework for turning HTML, CSS, media, and seekable animations into deterministic MP4 videos"; "The renderer seeks each frame in headless Chrome and encodes the result with FFmpeg"; animation adapters for GSAP, CSS, Lottie, Three.js, Anime.js, WAAPI, or custom; compositions are HTML with data attributes for timing/tracks, playable in a browser with no build step — [HyperFrames README](https://github.com/heygen-com/hyperframes)
- CLI: `npx hyperframes init my-video`, `npx hyperframes preview`, `npx hyperframes render`; requires Node.js 22+ and FFmpeg — [HyperFrames README](https://github.com/heygen-com/hyperframes)
- Claude Code: `claude plugin install hyperframes@hyperframes` after adding the marketplace; also Codex, Cursor, Gemini CLI, IBM Bob; 9 skills (core: `/hyperframes`, `/hyperframes-cli`, `/hyperframes-registry`, `/media-use`; on demand incl. `/figma`, `/slideshow`) — [HyperFrames README](https://github.com/heygen-com/hyperframes)
- Registry: "About 450 ready-made blocks and components installed as editable source" (transitions, overlays, captions, charts, maps), e.g. `npx hyperframes add data-chart`; frame.md design templates at hyperframes.studio/design — [HyperFrames README](https://github.com/heygen-com/hyperframes)
- Audio: `<audio>` elements with timing/volume attributes; the producer package mixes audio; `/media-use` covers music, voiceover and mixing — [HyperFrames README](https://github.com/heygen-com/hyperframes)
- Platforms: desktop app for macOS, Windows, Linux (.deb); Docker rendering — [HyperFrames README](https://github.com/heygen-com/hyperframes)
- Limits: some skills/features require paid HyperFrames Pro; Git LFS baselines (~240 MB) for full clones; skills.sh registry "can lag `main` by hours"; Studio "Available, evolving"; 82 open issues / 137 open PRs at fetch time — [HyperFrames README](https://github.com/heygen-com/hyperframes)
- Remote MCP `mcp.heygen.com/mcp/hyperframes` listed in Claude's connector directory (beta), uses HeyGen credits, pricing not published (listed by JSON2Video, a competitor) — [JSON2Video MCP list, 2026-10-18](https://json2video.com/claude-video/video-mcp-servers/)
- Comparison claims: HyperFrames uses plain HTML vs Remotion's React; Remotion is "source-available, not open source"; HyperFrames has no per-render fees or commercial thresholds; distributed rendering is single-machine in one comparison although an AWS Lambda option is listed; used in production at HeyGen; launch coverage dated 2026-07-10 — [yuv.ai blog](https://yuv.ai/blog/heygen-hyperframes-html-video)

Revideo details:
- "Revideo is a rendering engine for creating videos in code"; borrows concepts from Remotion and Rive; "the engine behind Midrender"; headless render API + React player; `<Video/>`/`<Audio/>` with audio export; renders split across workers; Cloud Run example; telemetry via PostHog, disable with `DISABLE_TELEMETRY=true` — [midrender/revideo README](https://github.com/midrender/revideo)
- The old `redotvideo/revideo` API URL returns "Moved Permanently" to repository id 770297271 = `midrender/revideo` — [GitHub API](https://api.github.com/repos/redotvideo/revideo)

FFmpeg and FFmpeg MCP servers:
- FFmpeg `xfade` on the user's machine lists 58 named transitions plus `custom` (fade, wipe*, slide*, circlecrop, rectcrop, distance, fadeblack, fadewhite, radial, smooth*, circleopen/close, vert/horzopen/close, dissolve, pixelize, diag*, *slice, hblur, fadegrays, squeezeh/v, zoomin, fadefast, fadeslow, *wind, cover*, reveal*) — local `ffmpeg -h filter=xfade`; [FFmpeg filters docs](https://ffmpeg.org/ffmpeg-filters.html#xfade)
- `kyanitelabs/mcp-video`: video-editing MCP with "87 FFmpeg and Hyperframes tools", Python client and CLI, Apache-2.0, v1.4.0 on PyPI (`uvx mcp-video`), updated 2026-05-09, ~19 stars (aggregator data, unverified) — [awesome.ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com%2Fkyanitelabs%2Fmcp-video); [getdrio listing](https://www.getdrio.com/mcp/io-github-kyanitelabs-mcp-video/md)
- `video-creator/ffmpeg-mcp`: cut/stitch/overlay/concat via natural language, ~134 stars, MIT (repo URL not confirmed) — [Enterprise DNA directory](https://enterprisedna.co/directories/mcp/video-creator-ffmpeg-mcp)
- Others: `kush36agrawal/video_editor_mcp` (Python 3.9+), `conneroisu/vfx-mcp` (FastMCP, Python 3.13+), `video-dev/ffmpeg-mcp-comp` ("EXPLORATION ONLY - NOT FOR PRODUCTION USE"), `burningion/video-editing-mcp` (Video Jungle) — [awesome.ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com%2Fkush36agrawal%2Fvideo_editor_mcp); [lobehub vfx-mcp](https://lobehub.com/ja/mcp/conneroisu-vfx-mcp); [video-dev/ffmpeg-mcp-comp](https://www.github.com/video-dev/ffmpeg-mcp-comp); [JSON2Video MCP list](https://json2video.com/claude-video/video-mcp-servers/)
- JSON2Video's MCP survey notes that Claude Code can run FFmpeg directly on the computer, so a wrapper MCP is optional; Rendi's MCP is documentation-only — [JSON2Video MCP list](https://json2video.com/claude-video/video-mcp-servers/)

### Inferences
- Agent-friendliness ranking for Claude Code on macOS+Windows (Nov 2026): (1) HyperFrames and Remotion (official skills, active weekly releases); (2) FFmpeg via Bash (no install friction, 58 transitions, cross-platform); (3) MoviePy / Manim (plain Python, LLMs know them well, but no official skills); (4) Motion Canvas / Revideo (capable, but no official agent tooling and slow releases); (5) Editly, Theatre.js, lottie-web (stale).
- FFmpeg MCP servers add little in Claude Code because the agent can already call `ffmpeg`; they matter mainly for claude.ai/Desktop clients without a shell. Most have tiny star counts.
- HyperFrames at v0.9.x means API churn risk; pin the version in scripts. Its Node 22+ requirement must be met on the Windows machine too.
- MLT/melt is a credible cross-platform XML timeline engine, but no agent tooling or skills were found for it.

### Gaps
- Motion Canvas audio/multi-track capability and any Motion Canvas agent skill were not verified.
- Editly's transition library (I believe it uses gl-transitions) was not verified from the README in this session.
- Official HyperFrames MCP documentation was not found; the README only shows a `server.json` file and an "mcp" topic tag. The remote MCP URL comes from a competitor's listing.
- HyperFrames official launch date not found (earliest coverage found: 2026-07-10).
- No star-history data collected (only current counts).

## Q3. Agentic video production systems: OpenMontage as baseline vs ViMax, MoneyPrinterTurbo, ShortGPT, short-video-maker, NarratoAI and others

### Takeaway
OpenMontage (77.8k stars, AGPL-3.0) is the broadest agent-driven studio: it runs inside Claude Code/Cursor/Codex, has 12 pipelines, 100+ tools, 700+ skill files, and composes with both Remotion and HyperFrames plus FFmpeg. Competitors are narrower: MoneyPrinterTurbo (140k stars) is a one-click topic-to-short generator with stock footage and TTS; ViMax is an AI-generated-film pipeline (Veo/Seedance) without motion graphics; NarratoAI does commentary-style re-edits; ShortGPT and short-video-maker are stale. The user's local OpenMontage copy is about 4.5 months behind upstream.

### Cited Findings
- `calesthio/OpenMontage`: 77,768 stars, last push 2026-11-03, AGPL-3.0, Python; description "12 production pipelines, 100+ tools, 700+ agent skill and pr[oduction-knowledge files]" — [GitHub API](https://api.github.com/repos/calesthio/OpenMontage)
- Upstream page: 77.8k stars, 10.4k forks, 501 commits, no releases/tags; "60+ provider integrations"; pipelines: Animated Explainer, Animation, Avatar Spokesperson, Cinematic, Clip Factory, Documentary Montage, Hybrid, Localization & Dub, Podcast Repurpose, Screen Demo, Talking Head (+ character-animation); newer features include Backlot live storyboard and approval gates, and support for Seedance 2.5/2.0, Gemini Omni Flash, GPT Image 2, Seedream 5.0, Nano Banana 2, Grok Imagine; default budget $10, per-action approval above $0.50; local LLM support "Coming soon"; Windows PowerShell setup path — [OpenMontage README](https://github.com/calesthio/OpenMontage)
- OpenMontage picks Remotion or HyperFrames at proposal time (`render_runtime`), locked through `edit_decisions`; "Silent swaps between runtimes are a governance violation"; Remotion = default for data-driven explainers; HyperFrames = motion-graphics-heavy briefs, kinetic typography, product promos, website-to-video, SVG character rigs — [OpenMontage README](https://github.com/calesthio/OpenMontage)
- OpenMontage post-production tools: Video Stitch (crossfades, PiP), Audio Mixer (ducking, fades), Color Grade (LUT-based), Subtitle Gen, WhisperX word-level captions, Real-ESRGAN upscale, scene detect, CLIP/BLIP-2 video understanding; style playbooks Clean Professional / Flat Motion Graphics / Minimalist Diagram; 9:16 1080×1920 TikTok/Shorts/Reels profiles; "Start from a reference video" analysis of pacing/hooks — [OpenMontage README](https://github.com/calesthio/OpenMontage)
- OpenMontage was reportedly open-sourced in late March 2026 (third-party listing) — [sourcepulse](https://www.sourcepulse.org/projects/27442522)
- Local clone `/Users/nguyentruong/OpenMontage`: last commit 2026-06-22 ("docs(readme): add #1 GitHub Trending badge"); `pipeline_defs/` has 13 YAMLs including `cinematic.yaml`, `clip-factory.yaml`, `framework-smoke.yaml`; `.agents/skills/` includes `remotion`, `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `gsap*` (8 packs), `lottie-bodymovin`, `manim-composer`, `manimce-best-practices`, `ffmpeg`, `framer-motion`, `d3-viz` — local inspection ([upstream](https://github.com/calesthio/OpenMontage))
- MoneyPrinterTurbo: 140,290 stars, MIT, last push 2026-11-07 — [GitHub API](https://api.github.com/repos/harry0703/MoneyPrinterTurbo). Topic/keyword → script, stock footage (Pexels, Pixabay, Coverr, local), AI video/image services (MiniMax H3, Seedance, WaveSpeed), many LLMs (incl. Claude, Gemini, DeepSeek, Ollama), TTS (Edge TTS free, ElevenLabs, Kokoro, etc., or no voiceover), auto subtitles (edge timestamps or faster-whisper), BGM; 9:16/16:9/1:1; WebUI, API, CLI; AI agents can drive it via a Skill document; Windows one-click package; transitions not described — [MoneyPrinterTurbo README](https://github.com/harry0703/MoneyPrinterTurbo)
- ViMax (HKUDS): 12,861 stars, MIT, last push 2026-09-30 — [GitHub API](https://api.github.com/repos/HKUDS/ViMax). Modes Idea2Video, Script2Video, Novel2Video, AutoCameo; script → storyboard → characters → reference images/first frames → camera continuity → parallel shot generation → assembly; picks among 2 keyframe candidates with a vision model; models: Nano Banana, GPT Image 2, Veo, Google Omni, Seedance 2.0 Fast; Agent Loop TUI + Web UI; captions/motion graphics not mentioned; "Skill-based workflow extensions" on roadmap — [ViMax README](https://github.com/HKUDS/ViMax); paper [arXiv 2606.07649](https://arxiv.org/html/2606.07649v1)
- NarratoAI: 11,736 stars, MIT, last push 2026-10-24, "利用 AI 大模型，一键解说并剪辑视频" (one-click AI commentary and editing of existing videos) — [GitHub API](https://api.github.com/repos/linyqh/NarratoAI)
- ShortGPT: 8,118 stars, MIT, last push 2025-02-10 (**stale**), "Experimental AI framework for youtube shorts / tiktok channel automation" — [GitHub API](https://api.github.com/repos/RayVentura/ShortGPT)
- short-video-maker: 1,471 stars, MIT, last push 2025-06-21 (**stale**), "Creates short videos for TikTok, Instagram Reels, and YouTube Shorts using the Model Context Protocol (MCP) and a REST A[PI]" — [GitHub API](https://api.github.com/repos/gyoridavid/short-video-maker)
- MoneyPrinter (original): 14,161 stars, MIT, last push 2026-03-26, "Automate Creation of YouTube Shorts using MoviePy" — [GitHub API](https://api.github.com/repos/FujiwaraChoki/MoneyPrinter)
- Other multi-agent film frameworks cited in the ViMax paper: FilmAgent (2025), Kubrick (2024), VideoGen-of-Thought (2024) — [arXiv 2606.07649](https://arxiv.org/html/2606.07649v1); [Hugging Face paper page](https://huggingface.co/papers/2606.07649.md)
- Commercial agent equivalents: Shotstack "Director" agent (describe a video, agent creates it, also via MCP/CLI) — [Shotstack pricing](https://shotstack.io/pricing/); invideo agent — [invideo FAQ](https://invideo.io/faq/what-are-the-best-multi-agent-ai-tools-for-film/)
- A "Claude-Code-Video-Toolkit" repo by wilwaldon was surfaced on a Hacker News reader (stats not verified) — [HN reader link](https://hn.jakechampion.name/reader/https://github.com/wilwaldon/Claude-Code-Video-Toolkit)

### Inferences
- What competitors do better than OpenMontage: MoneyPrinterTurbo has a one-click WebUI, Windows package and mass production with free Edge TTS; ViMax has stronger story/character continuity logic for fully AI-generated films (Veo first-frame continuity, VLM keyframe selection), which is conceptually closest to the user's `flow-chain-video`; NarratoAI is specialized for commentary re-cuts.
- What they do worse: none of them offers OpenMontage's dual Remotion/HyperFrames motion-graphics layer, style playbooks, LUT grading, governance/approval gates, or agent-native skill library. MoneyPrinterTurbo/ShortGPT/MoneyPrinter produce stock-footage + TTS + subtitle videos; all assume narration, which the user's videos do not use.
- OpenMontage's AGPL-3.0 matters only if the user distributes a modified OpenMontage as a network service; making videos with it is fine. The Remotion part inside it still follows Remotion's license (free for the individual user).
- For the user, OpenMontage's `cinematic` pipeline and Remotion/HyperFrames composers could add title cards, captions and grading on top of Veo clips, but its pipeline governance is heavy for a 20–26 s crossfade chain. Pulling upstream (≈4.5 months of changes since 2026-06-22) is advisable before relying on it.

### Gaps
- No verified, comprehensive 2026 list of open-source "agent video studios" found; FilmAgent/MovieAgent repos were not checked.
- Did not verify how ViMax assembles the final video (MoviePy vs FFmpeg) or whether it supports 9:16.
- Did not read NarratoAI's README for 9:16 support or agent integration.
- No independent quality comparison (blind tests) between OpenMontage and competitors found.

## Q4. Cloud render APIs with JSON timelines (Shotstack, Creatomate, JSON2Video, Plainly): cost, agent drivability, MCP

### Takeaway
All four have official MCP servers as of Oct 2026: Shotstack (remote, beta) and Creatomate (remote) work even in claude.ai; JSON2Video and Plainly run locally via CLI/npx in Claude Code/Desktop. Rendering a 20–26 s vertical short costs roughly $0.05–0.16 on these services, but local FFmpeg/Remotion/HyperFrames renders are free, so cloud APIs only pay off for unattended scale or when no local machine is available.

### Cited Findings
- Official MCP servers (survey published 2026-10-18 by JSON2Video, which discloses it is a vendor): JSON2Video local (`npm i -g @json2video/cli`, then `json2video mcp install claude`; Claude Code, Desktop, Cursor, VS Code, Windsurf); Creatomate remote `https://api.creatomate.com/mcp` (claude.ai, Desktop, Claude Code); Shotstack (beta) remote `https://mcp.shotstack.io/`; Plainly local `npx -y @plainly-videos/mcp-server@latest` with `PLAINLY_API_KEY`; also Runway, Google Genmedia (Veo/Imagen), HyperFrames remote MCP; "Sora has no server, because OpenAI removed its video API on September 24, 2026" — [JSON2Video MCP list](https://json2video.com/claude-video/video-mcp-servers/)
- Shotstack pricing: Pay-as-you-go $10 for 50 min (20¢/min, 1080p); Starter $39/month, 250 min (15.6¢/min, 1080p); Pro $99/month, 750 min (13.2¢, 4K); Scale $199/month, 2,000 min (10¢, 4K); Volume $499/month, 10,000 min (5¢, 4K); rendering pauses when minutes run out; plan minutes roll over 3 months; 10 free credits on signup (30 days, no card); free sandbox on every option; Director AI agent included from Starter; MCP/CLI for your own agent — [Shotstack pricing](https://shotstack.io/pricing/)
- Creatomate pricing: Essential $45/month (2,000 credits ≈ 289 Shorts); Growth $108/month (10,000–40,000 credits; 10k ≈ 1,447 Shorts); Beyond $274/month (50,000–200,000 credits); a "Short" = 30 s vertical 720p; one 30 s 720p/25 fps video ≈ 6.91 credits; free plan: 50 credits, previews up to 480 px; annual 17% cheaper; llms.txt available; MCP not mentioned on the pricing page — [Creatomate pricing](https://creatomate.com/pricing)
- Third-party per-minute comparison (checked 21–23 Oct 2026): Shotstack ≈ $0.16/$0.13/$0.10 per minute (Starter/Pro/Scale); Creatomate Growth 10K ≈ $0.48/min at 1080p, rising sharply at 4K — [Wireflow: Creatomate pricing](https://www.wireflow.ai/blog/creatomate-pricing); [Wireflow: JSON2Video pricing](https://www.wireflow.ai/blog/json2video-pricing)
- JSON2Video: free tier 600 credits ≈ 10 watermarked minutes, no time limit; JSON2Video itself says Shotstack is cheaper per rendered minute at every level — [JSON2Video: Shotstack alternative](https://json2video.com/how-to/shotstack-alternative/); a "Startup 500 min for $99.95" figure appears in Wireflow but is unverified — [Wireflow](https://www.wireflow.ai/blog/json2video-pricing)
- Plainly: After Effects–template based; only pricing found is a 2025 figure (Starter from $69/month with 50 render minutes), likely outdated — [Plainly blog 2025](https://www.plainlyvideos.com/blog/best-video-editing-api)

### Inferences
- Per-video cost estimates for a 25 s vertical short: Shotstack Starter ≈ 25/60 × $0.156 ≈ $0.065; Creatomate Essential ≈ 6.91 × $45/2,000 ≈ $0.155 (at 720p). These assume per-second billing granularity, which I did not verify.
- For the user's workload (a few videos per week, local Mac/Windows machines, FFmpeg already in use), cloud APIs add cost and upload time without quality gains. Plainly/Creatomate templates could help only if the user wants After-Effects-grade branded intros at scale.
- Remote MCPs (Shotstack, Creatomate, HyperFrames) are the only way to compose videos from claude.ai mobile/web without a shell.

### Gaps
- JSON2Video and Plainly current (Nov 2026) official pricing not verified.
- Watermark terms of Shotstack sandbox not stated on the pricing page.
- Creatomate credit rate for 1080p not given on the pricing page.

## Q5. What makes output look "professional" (easing, kinetic typography, transitions, LUTs, sound design) and which repos ship good templates

### Takeaway
The quality ceiling of code-based video comes from four layers: (1) easing/spring timing and kinetic typography (GSAP in HyperFrames, springs in Remotion); (2) curated transition and overlay libraries (HyperFrames' ~450 registry blocks incl. shader transitions and grain; FFmpeg's 58 `xfade` transitions; Remotion's transitions package); (3) color grading via LUTs; (4) audio: music beds, ducking and SFX. HyperFrames' registry and OpenMontage's component library + style playbooks are the richest ready-made sets found; Remotion's official value is mostly in its best-practice skills rather than a template pack.

### Cited Findings
- HyperFrames registry: ~450 editable blocks (transitions, overlays, captions, charts, maps); frame.md design templates (e.g. Biennale Yellow, BlockFrame) at hyperframes.studio/design — [HyperFrames README](https://github.com/heygen-com/hyperframes)
- OpenMontage describes HyperFrames registry blocks as including "data charts, grain overlays, shader transitions", and Remotion scenes as "spring-animated image scenes, stat reveals, section titles, hero cards, TikTok-style word-by-word captions, scene transitions (fade/slide/wipe/flip), Google Fonts" — [OpenMontage README](https://github.com/calesthio/OpenMontage)
- OpenMontage style playbooks control "typography, color palettes, motion styles, audio profiles, and quality rules" (Clean Professional, Flat Motion Graphics for social/TikTok, Minimalist Diagram) — [OpenMontage README](https://github.com/calesthio/OpenMontage)
- OpenMontage demo "Afternoon in Candyland": 12 FLUX images with multi-image crossfade, cinematic camera motion; "Mori no Seishin": parallax crossfade, drift/pan, firefly and petal particles, vignette; "SIGNAL FROM TOMORROW": Veo clips + soundtrack + Remotion composition; "VOID" ad cost "$0.6x" with one OpenAI key — [OpenMontage README](https://github.com/calesthio/OpenMontage)
- OpenMontage post tools: LUT-based Color Grade, Audio Mixer with ducking/fades, Audio Enhance (noise reduction, normalization), ElevenLabs SFX, Suno music — [OpenMontage README](https://github.com/calesthio/OpenMontage)
- OpenMontage's local `.agents/skills` ships GSAP knowledge packs (`gsap`, `gsap-core`, `gsap-timeline`, `gsap-plugins`, `gsap-react`, `gsap-performance`, `gsap-utils`, `gsap-scrolltrigger`) and `lottie-bodymovin`, `framer-motion`, `canvas-procedural-animation` — local inspection of `/Users/nguyentruong/OpenMontage/.agents/skills` ([upstream](https://github.com/calesthio/OpenMontage))
- Remotion's `/remotion-markup` skill covers animations, layout, typography, effects, audio, fonts and timing; `/remotion-captions` covers captions — [remotion-dev/skills](https://github.com/remotion-dev/skills)
- FFmpeg `xfade`: 58 named transitions + custom expressions (e.g. `fadeblack`, `smoothleft`, `circleopen`, `dissolve`, `zoomin`, `hblur`) — local `ffmpeg -h filter=xfade`; [FFmpeg filters docs](https://ffmpeg.org/ffmpeg-filters.html#xfade)
- Community QA practice: a Claude Code skill compares rendered output against a reference clip in a loop — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1t51k8s/snapshots/2026-05-09T02%3A30%3A12.086538Z)
- Reference-driven planning: OpenMontage analyzes a pasted TikTok/Short for "transcript, pacing, scenes, keyframes, and style" before producing — [OpenMontage README](https://github.com/calesthio/OpenMontage)

### Inferences
- Fit for the user's animal life-cycle videos (9:16, 20–26 s, Veo clips, crossfades, no narration): the current FFmpeg `xfade=fade` stitch is already the right core. The cheapest "professional" upgrades are: a 1–2 s kinetic hook title over clip M, a short end card, a LUT pass (FFmpeg `lut3d`) for consistent color across Veo clips, a music bed with fade-out, and 1–3 whoosh/ambient SFX at seams. HyperFrames (Apache-2.0, Claude Code plugin, registry captions/grain/shader transitions, Windows desktop app) is the lowest-friction framework for that overlay layer; Remotion is equally capable and free for the user, with stronger docs.
- Fit for TikTok fashion dance clips (aidancing output): little compositing is needed; at most a text hook or trending-style caption overlay. A full framework or cloud API is overkill; FFmpeg `drawtext`/overlay or a single HyperFrames/Remotion caption template suffices.
- Narration-centric pipelines (MoneyPrinterTurbo, ShortGPT, short-video-maker, Remotion's prompt-to-video template) do not fit either video type.
- Cross-platform: FFmpeg, Remotion and HyperFrames all run on macOS and Windows; HyperFrames needs Node 22+. Python options (MoviePy, Manim) also run on Windows but add a Python dependency the user's Node-based scripts do not currently need.

### Gaps
- No objective benchmark of "professional look" across frameworks found; quality claims are vendor demos or community anecdotes.
- Full list of `@remotion/transitions` presentations not retrieved (docs render it from a component).
- No verified curated LUT or SFX libraries specifically packaged for these frameworks were found; licensing of free LUT/SFX packs not researched.
