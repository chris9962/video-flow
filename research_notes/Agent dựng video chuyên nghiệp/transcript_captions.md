# Transcript-driven video editing and automatic captions for AI agents (state as of 2026-11-07)

Method note for the report writer: star counts and "last push" dates come from the ungh.cc GitHub cache (`https://ungh.cc/repos/<owner>/<repo>`), fetched 2026-11-07. The GitHub REST API was rate-limited, so only the first four rows (whisper, faster-whisper, WhisperX, whisper.cpp) came from api.github.com. "Last push" is the repo's `pushedAt`. It is close to the last commit date, but it is not a release date. Licenses come from GitHub's repo metadata (`spdxId`). `?` means GitHub showed no SPDX license or the field was not verified. **STALE** marks a project with no push in the 12 months before 2026-11-07, i.e. before 2025-11-07.

## 1. Transcription engines with word-level timestamps (and Vietnamese, and speed on Apple Silicon)

### Takeaway
For Vietnamese, the realistic local options are Whisper large-v3 / large-v3-turbo (through mlx-whisper on Mac, faster-whisper or whisper.cpp on Windows), the Vietnamese fine-tune PhoWhisper, and NVIDIA's new `parakeet-ctc-0.6b-Vietnamese`. That NVIDIA model has native word timestamps and an MLX port. Parakeet v3 and Qwen3-ForcedAligner do **not** cover Vietnamese. Qwen3-ASR transcribes Vietnamese with strong reported WER, but it cannot output Vietnamese word timestamps through its own aligner. For 20–26 s clips every engine finishes in seconds on Apple Silicon. Accuracy on Vietnamese and timestamp quality matter more than speed.

### Cited Findings

**Catalog: general engines**

| Tool | GitHub | ★ | Last push | License | macOS Apple Silicon | Windows | Languages | How an agent drives it |
|---|---|---|---|---|---|---|---|---|
| OpenAI Whisper | https://github.com/openai/whisper | 112,125 | 2026-08-31 | MIT | Python/PyTorch | Python | 99 ([Contra Collective](https://contracollective.com/blog/local-speech-to-text-whisper-parakeet-mlx-m5-max-2026)) | CLI `whisper`, Python API |
| faster-whisper (CTranslate2) | https://github.com/SYSTRAN/faster-whisper | 26,542 | 2026-11-06 | MIT | CPU | yes, also standalone exe (see Purfview row) | Whisper's 99 | Python `model.transcribe(..., word_timestamps=True)`, `vad_filter=True`, supports `"turbo"` and distil-large-v3 ([README](https://github.com/SYSTRAN/faster-whisper)) |
| WhisperX | https://github.com/m-bain/whisperX | 25,130 | 2026-10-22 | BSD-2-Clause | CPU only: README says to run on Mac with `--compute_type int8 --device cpu` | CUDA 12.8 or CPU | Whisper languages. Alignment models: torchaudio defaults for en/fr/de/es/it, others via HF | CLI `whisperx`, Python API. Word timestamps come from wav2vec2 forced alignment. 70x realtime batched on GPU. "Context-Aware Batching" added 2026 ([README](https://github.com/m-bain/whisperX)) |
| whisper.cpp | https://github.com/ggml-org/whisper.cpp | 54,985 | 2026-11-06 | MIT | "first-class": Metal GPU, Core ML encoder on ANE is ">3x faster" than CPU-only | MSVC and MinGW builds | Whisper languages | CLI binary, C API. Used by Remotion and many skills ([README](https://github.com/ggml-org/whisper.cpp)) |
| mlx-whisper (inside mlx-examples) | https://github.com/ml-explore/mlx-examples (whisper/) | 9,053 (whole mlx-examples repo) | 2026-04-06 | MIT | yes (MLX, Apple Silicon only) | no | Whisper languages | `pip install mlx-whisper`. CLI `mlx_whisper`. Python `mlx_whisper.transcribe(f, word_timestamps=True)` ([README](https://github.com/ml-explore/mlx-examples/blob/main/whisper/README.md)). Latest PyPI release 0.4.3 was uploaded 2025-08-29 ([PyPI](https://pypi.org/project/mlx-whisper/)), so the package release itself is >12 months old |
| whisper-timestamped | https://github.com/linto-ai/whisper-timestamped | 2,859 | 2026-09-28 | AGPL-3.0 | Python | Python | Whisper languages | Python/CLI. Word timestamps plus confidence (repo description) |
| stable-ts | https://github.com/jianfch/stable-ts | 2,280 | 2026-05-30 | MIT | Python | Python | Whisper languages | Python/CLI. Transcription, forced alignment, audio indexing (repo description) |
| insanely-fast-whisper | https://github.com/Vaibhavs10/insanely-fast-whisper | 13,060 | 2025-10-25 **STALE** | Apache-2.0 | ? | ? | Whisper | CLI |
| lightning-whisper-mlx | https://github.com/mustafaaljadery/lightning-whisper-mlx | 958 | 2024-05-08 **STALE** | ? | MLX | no | Whisper | Python |
| Purfview whisper-standalone-win (Faster-Whisper-XXL) | https://github.com/Purfview/whisper-standalone-win | 3,228 | 2025-11-07 (borderline stale) | ? | — | yes: "standalone executables for those who don't want to bother with Python" | Whisper | CLI exe |
| WhisperKit (Argmax) | https://github.com/argmaxinc/WhisperKit | 6,445 | 2026-10-27 | MIT (LICENSE file) | yes (Core ML, Swift) | no | Whisper | Swift package / CLI ("On-device Speech AI for Apple Silicon") |
| NVIDIA NeMo (Parakeet, Canary) | https://github.com/NVIDIA/NeMo | 18,705 | 2026-11-05 | Apache-2.0 (LICENSE file) | Python/PyTorch | Python | model-dependent | Python `asr_model.transcribe([...], timestamps=True)` returns char, word and segment timestamps ([parakeet-vi card](https://huggingface.co/nvidia/parakeet-ctc-0.6b-Vietnamese)) |
| parakeet-mlx | https://github.com/senstella/parakeet-mlx | 994 | 2026-11-05 | Apache-2.0 | yes (MLX) | no | Default model `parakeet-tdt-0.6b-v3`. Can load other Parakeet checkpoints, incl. the Vietnamese MLX port | CLI `parakeet-mlx`: `--output-format txt/srt/vtt/json/all`, `--highlight-words` for word timestamps in SRT/VTT, `--max-words`, chunking default 120 s. Also a Python API ([README](https://github.com/senstella/parakeet-mlx)). PyPI 0.7.0 released 2026-11-04 ([PyPI](https://pypi.org/project/parakeet-mlx/)) |
| mlx-audio | https://github.com/Blaizzy/mlx-audio | 8,211 | 2026-11-05 | MIT (LICENSE file) | yes (MLX) | no | model-dependent | Python. TTS + STT + STS on MLX (repo description) |
| FluidAudio | https://github.com/FluidInference/FluidAudio | 3,263 | 2026-11-02 | Apache-2.0 | yes (Core ML) | no | model-dependent | Swift. Core ML STT/TTS/VAD (repo description) |
| sherpa-onnx | https://github.com/k2-fsa/sherpa-onnx | 15,796 | 2026-11-06 | Apache-2.0 | ONNX | ONNX | model-dependent | many language bindings (repo description: STT, TTS, diarization, VAD) |
| Qwen3-ASR (0.6B / 1.7B) + Qwen3-ForcedAligner-0.6B | https://github.com/QwenLM/Qwen3-ASR | 3,839 | 2026-06-26 | Apache-2.0 | transformers backend (MPS not verified) | transformers backend. vLLM backend for speed | ASR: 30 languages + 22 Chinese dialects, **incl. Vietnamese (vi)**. ForcedAligner timestamps: 11 languages (zh, en, yue, fr, de, it, ja, ko, pt, ru, es), **no Vietnamese** | `pip install qwen-asr`. Python `Qwen3ASRModel.from_pretrained(...)` with `forced_aligner=` for timestamps. Released 2026-01-29. Native Transformers support added 2026-06-26 ([README](https://github.com/QwenLM/Qwen3-ASR)) |
| CrisperWhisper (verbatim, fillers) | https://github.com/nyrahealth/CrisperWhisper | 1,475 | 2026-11-06 | NOASSERTION (unverified) | Python | Python | v1.0 was English/German only. The README now claims verbatim mode "across most languages" and a disfluency-F1 lead averaged over 10 languages (8 of them on synthetic sets) | Python `CrisperWhisperModel("turbo")`, `model.transcribe(..., language="en")`. Keeps `[um]`, `[uh]`, repetitions, cut-offs ([README](https://github.com/nyrahealth/CrisperWhisper)) |
| Buzz (desktop GUI) | https://github.com/chidiwilliams/buzz | 22,441 | 2026-11-05 | MIT | yes | yes | Whisper | GUI app, offline (repo description) |
| Vibe (desktop GUI) | https://github.com/thewh1teagle/vibe | 8,016 | 2026-10-30 | MIT | ? | ? | Whisper | GUI app ("Transcribe on your own!") |
| Whisper-WebUI | https://github.com/jhj0517/Whisper-WebUI | 2,900 | 2025-12-29 | Apache-2.0 | ? | ? | Whisper | Gradio web UI for subtitles |

**Vietnamese-specific models and evidence**

- **PhoWhisper** (VinAI, ICLR 2024 Tiny Papers). Whisper fine-tuned on 844 h of Vietnamese with diverse accents. Model license BSD-3-Clause ([HF card](https://huggingface.co/vinai/PhoWhisper-large)). Repo https://github.com/VinAIResearch/PhoWhisper: 265★, last push 2024-11-12 **STALE**. The models are still the most-downloaded Whisper-family Vietnamese checkpoints: PhoWhisper-large has 14,192 downloads and 50 likes ([HF API](https://huggingface.co/api/models?search=phowhisper)).
- PhoWhisper WER (%) from the official README. Format is CMV-Vi / VIVOS / VLSP2020-T1 / VLSP2020-T2. large (1.55B): 8.14 / 4.67 / 13.75 / 26.68. medium: 8.27 / 4.97 / 14.12 / 26.85. small: 11.08 / 6.33 / 15.93 / 32.96 ([PhoWhisper README](https://github.com/VinAIResearch/PhoWhisper)).
- Community CTranslate2 conversions exist, e.g. `kiendt/PhoWhisper-large-ct2` (456 downloads) ([HF API](https://huggingface.co/api/models?search=phowhisper)). The 2026 "Revisit" paper used PhoWhisper-large in CTranslate2 format as a verifier ([arXiv 2603.14779](https://arxiv.org/html/2603.14779)).
- **NVIDIA `parakeet-ctc-0.6b-Vietnamese`** ("Parakeet-CTC-0.6B Unified Vietnamese–English CS", i.e. code-switching). It was created 2026-01-15 and has 95 likes ([HF API](https://huggingface.co/api/models?search=vietnamese&pipeline_tag=automatic-speech-recognition)). Training used more than 2,000 h of public Vietnamese speech from 10 datasets, incl. Common Voice 20.0, FLEURS and VLSP 2020. Qwen3 generated the punctuation and capitalization of the training transcripts. NeMo returns word, char and segment timestamps with `timestamps=True`. License: NVIDIA Open Model License (gated acknowledgement) ([model card](https://huggingface.co/nvidia/parakeet-ctc-0.6b-Vietnamese)).
- An MLX port `mlx-community/parakeet-ctc-0.6b-Vietnamese` was published 2026-11-02 for use with parakeet-mlx ([HF card](https://huggingface.co/mlx-community/parakeet-ctc-0.6b-Vietnamese)). An ONNX port also exists: `OpenVoiceOS/nvidia-parakeet-ctc-0.6b-vietnamese-onnx` ([HF API](https://huggingface.co/api/models?search=vietnamese&pipeline_tag=automatic-speech-recognition)).
- **Parakeet TDT 0.6B v3** covers 25 European languages only, and Vietnamese is not one of them ([Contra Collective](https://contracollective.com/blog/local-speech-to-text-whisper-parakeet-mlx-m5-max-2026); [Arun Baby](https://www.arunbaby.com/speech-tech/0073-whisper-vs-parakeet-asr-decision/)).
- **WhisperX alignment for Vietnamese** uses `nguyenvulebinh/wav2vec2-base-vi-vlsp2020`. It sits in `DEFAULT_ALIGN_MODELS_HF` in `whisperx/alignment.py`, line 88 ([source](https://github.com/m-bain/whisperX/blob/main/whisperx/alignment.py)).
- **Whisper large-v3 vs large-v3-turbo on FLEURS Vietnamese** (Q8_0 quantized): 8.74% vs 9.48% WER, with overlapping confidence intervals ([Handy model-by-language](https://models.handy.computer/languages/vi)).
- **Qwen3-ASR 1.7B vs Whisper turbo on FLEURS Vietnamese**: 5.07% vs 9.79% WER. This is the publisher's own run on read speech, not an independent benchmark ([WhisperNotes](https://whispernotes.app/blog/qwen3-asr-vs-whisper)).
- **ElevenLabs Scribe** (commercial API, used by video-use). These are vendor claims. Its Vietnamese page lists Scribe at 3.5% WER on FLEURS vs Whisper Large v3 at 10.7%. Localized versions of the page give conflicting figures (3.1% / 5.5%) and conflicting timestamp granularity (word vs character) ([ElevenLabs vi page](https://elevenlabs.io/speech-to-text/vietnamese)).
- **"Vietnamese Automatic Speech Recognition: A Revisit"** (Qualcomm, Findings of EACL 2026). The authors built PhoASR, a 502.67 h dataset with word-level timestamps, plus a 3,100 h extended set. Their pipeline used a Parakeet model as primary ASR and PhoWhisper-large CT2 as verifier. Overall refined-test results: PhoASR-whisper-small-3100h O-WER 11.70 / N-WER 8.20, timestamp F1 83.68, mIoU 57.39. ChunkFormer-large-vi: O-WER 32.43 / N-WER 6.89. PhoWhisper-small: 33.90 / 8.97. The authors call PhoASR-whisper-small-3100h "a more suitable choice" for automatic subtitling because O-WER (punctuated/cased) matters there ([arXiv 2603.14779](https://arxiv.org/html/2603.14779)). The code repo is https://github.com/Qualcomm-AI-research/PhoASR (3★, push 2026-08-31, license NOASSERTION, "Code for data pipeline").
- **ChunkFormer** Vietnamese checkpoints: `khanhld/chunkformer-ctc-large-vie` has 678 downloads and 39 likes ([HF API](https://huggingface.co/api/models?search=chunkformer)).
- The most-downloaded Vietnamese ASR checkpoints on HF are still the 2022 wav2vec2 models: `nguyenvulebinh/wav2vec2-base-vietnamese-250h` (45,860 downloads) and `dragonSwing/wav2vec2-base-vietnamese` (40,921) ([HF API](https://huggingface.co/api/models?search=vietnamese&pipeline_tag=automatic-speech-recognition)).

**Speed on Apple Silicon**

- On the same long speech file, mlx-whisper (`mlx-community/whisper-large-v3-turbo`) took 13.135 s ± 0.280 and whisper.cpp (`ggml-large-v3-turbo.bin`) took 26.704 s ± 0.625. That makes mlx-whisper about 2.0x faster (hyperfine, 10 runs, Jan 2026). Chip and audio length were not stated ([Bill Mill](https://notes.billmill.org/dev_blog/2026/01/updated_my_mlx_whisper_vs._whisper.cpp_benchmark.html)).
- On an M5 Max 64 GB with MLX backends and clean English, real-time factors were: Whisper large-v3 12–18x, large-v3-turbo 20–30x, Parakeet TDT 0.6B v3 "100x and up". The author recommends Whisper for wide language coverage and messy audio ([Contra Collective, 2026-07-19](https://contracollective.com/blog/local-speech-to-text-whisper-parakeet-mlx-m5-max-2026)).
- A third-party M4 short-utterance test reported parakeet-mlx at 0.4995 s vs mlx-whisper at 1.0230 s. That test used Parakeet v2 ([search summary of localaimaster/metawhisp pages](https://localaimaster.com/blog/best-speech-to-text-mac)). It is a single clip, so treat it as informal.
- The clipify skill reports "~20s of work for a 20s clip on Apple Silicon" end-to-end, using openai-whisper + ffmpeg ([clipify README](https://github.com/louisedesadeleer/clipify)).
- faster-whisper `--model small` runs at "roughly half to one times the video's length on a laptop" ([social-media-skills README](https://github.com/social-media-skills/video-editing-skill)).
- A harness that compares mlx-whisper, whisper.cpp and WhisperKit on one Mac exists: https://github.com/rymalia/mac-whisper-speedtest (1★, push 2026-11-04, MIT).

### Inferences
- For a Vietnamese pipeline that must run on both macOS and Windows, a pragmatic default is faster-whisper (or WhisperX) with large-v3 or turbo, or with a CT2 PhoWhisper-large. These run on both OSes. On Mac you can swap in mlx-whisper for speed.
- WhisperX on Mac falls back to CPU, but its Vietnamese wav2vec2 aligner gives forced-aligned word timestamps. That is useful for caption timing precision.
- `parakeet-ctc-0.6b-Vietnamese` via parakeet-mlx is the most interesting new option for Mac. It is Vietnamese-specific, handles code-switching and gives native word timestamps. No independent WER or timestamp benchmark against PhoWhisper or Whisper was found, and the MLX port is only five days old with 143 downloads. It should be tested on the user's own clips before adoption.
- Qwen3-ASR could serve as the most accurate Vietnamese text source. Word timing would then need a separate aligner, for example WhisperX's wav2vec2-vi aligner, because Qwen3-ForcedAligner excludes Vietnamese.
- Vietnamese writes a space between syllables, not between words. Whisper-style "word" timestamps and space-delimited caption tokenizers will therefore produce per-syllable tokens, e.g. "con ốc bươu vàng" becomes 4 tokens. This suits syllable-by-syllable TikTok highlighting. Grouping into lexical words would need a Vietnamese word segmenter. This is inferred, not tested.
- For 20–26 s clips, all engines finish in seconds. Speed is not a deciding factor.

### Gaps
- No independent benchmark of word-timestamp accuracy on Vietnamese for Whisper, PhoWhisper, parakeet-ctc-vi or WhisperX was found. The Revisit paper's timestamp metrics cover only its own PhoASR models, and whether those model weights are public was not verified.
- The WER numbers for `parakeet-ctc-0.6b-Vietnamese` are only in an image on the model card. They could not be extracted.
- The Open ASR Leaderboard was not checked for Vietnamese. It appears to focus on English and European languages, but this is unverified.
- Whether Qwen3-ASR runs on Apple MPS, and how fast, was not found.
- The terms of the NVIDIA Open Model License for commercial social-media use were not reviewed.
- Meta Omnilingual ASR, Mistral Voxtral and other 2025–2026 models were not checked for Vietnamese word timestamps.

## 2. Transcript-based cutting (open-source Descript-like): silence and filler removal, and how agents pick cuts

### Takeaway
The leading agent-native tool is browser-use's **video-use** (30.7k★, MIT). The LLM reads a packed, timestamped transcript and writes an EDL snapped to word boundaries, then self-checks filmstrip PNGs. It depends on the paid ElevenLabs Scribe API. **auto-editor** (5.8k★) is the mature non-LLM tool for silence and motion cuts. It now ships as a Nim binary plus an agent skill. Fully local transcript-cut skills include social-media-skills/video-editing-skill (faster-whisper) and kajisho5/ffmpeg-skill (`silence.py --filler`). Almost all of these target talking-head footage.

### Cited Findings

| Tool | GitHub | ★ | Last push | License | macOS AS | Windows | Speech engine | Agent interface | Cut logic |
|---|---|---|---|---|---|---|---|---|---|
| video-use | https://github.com/browser-use/video-use | 30,658 | 2026-10-08 | MIT | yes (brew install ffmpeg in README) | not stated | ElevenLabs Scribe API (key required) | Claude Code / Codex / Hermes / OpenClaw skill (symlink to `~/.claude/skills/video-use`) plus Python helpers | LLM reads `takes_packed.md` (see below) |
| auto-editor | https://github.com/WyattBlue/auto-editor | 5,787 | 2026-11-06 | Unlicense | binary + `brew install auto-editor` | binary (source build needs WSL) | none (audio loudness / motion) | CLI. Agent skill via `npx skills add WyattBlue/auto-editor` | thresholds (see below) |
| videogrep | https://github.com/antiboredom/videogrep | 3,466 | 2024-04-19 **STALE** | NOASSERTION | Python 3.6–3.10 | same | Vosk (pocketsphinx phased out), or existing .srt/.vtt | CLI `videogrep --input ... --search 'regex'` | regex supercuts. `--search-type fragment` needs word-level timestamps ([README](https://github.com/antiboredom/videogrep)) |
| unsilence | https://github.com/lagmoellertim/unsilence | 596 | 2023-03-28 **STALE** | MIT | Python | Python | none | CLI/library | silence removal |
| jumpcutter | https://github.com/carykh/jumpcutter | 3,144 | 2024-02-28 **STALE** | MIT | Python | Python | none | script | silence speed-up |
| Audapolis | https://github.com/bugbakery/audapolis | 1,906 | 2026-06-24 | AGPL-3.0 | GUI | GUI | built-in ASR | GUI only ("editor for spoken-word audio with automatic transcription") | manual text editing |
| tscaps | https://github.com/francozanardi/tscaps | 110 | 2026-11-01 | AGPL-3.0 (app); README says engine MIT | browser | browser | in-browser transcription | browser editor; tscaps cloud API for agents (free tier) ([pycaps README](https://github.com/francozanardi/pycaps)) | caption-focused |
| LosslessCut | https://github.com/mifi/lossless-cut | 45,749 | 2026-11-03 | GPL-2.0 | GUI | GUI | none | GUI | lossless manual cuts |
| OpenCut | https://github.com/OpenCut-app/OpenCut | 97,514 | 2026-09-24 | MIT | web/desktop | web/desktop | ? | GUI | "open-source CapCut alternative". Transcript features not verified |

- **video-use's mechanism.** "The LLM never watches the video. It reads it." It makes one Scribe call per source, which returns word-level timestamps, speaker diarization and audio events such as `(laughter)`. All takes are packed into a ~12 KB `takes_packed.md` of phrase lines like `[002.52-005.36] S0 ...`. Phrases break on any silence ≥0.5 s or a speaker change. A `timeline_view` tool renders a filmstrip + waveform + word-label PNG, called "only at decision points". Pipeline: Transcribe → Pack → LLM Reasons → EDL → Render → Self-Eval, with up to 3 fix/re-render loops ([README](https://github.com/browser-use/video-use)).
- **video-use's hard rules** ([SKILL.md](https://github.com/browser-use/video-use/blob/main/SKILL.md)):
  - Never cut inside a word. Snap every cut edge to a word boundary.
  - Pad cut edges by 30–200 ms, because "Scribe timestamps drift 50–100ms". The shipped example used 50 ms before and 80 ms after.
  - Use word-level verbatim ASR only, "never normalized fillers".
  - Prefer silences ≥400 ms as cut targets.
  - Add 30 ms audio fades at every boundary.
  - Apply subtitles last in the filter chain.
  - Compute master SRT offsets on the output timeline.
  - Get strategy confirmation before execution.
  - Spawn a critic sub-agent for published work.
  - Supported subtitle style: `bold-overlay`, ~2-word UPPERCASE chunks.
- **auto-editor's mechanism.**
  - Default `--edit audio:threshold=0.04`. `--edit motion:threshold=0.02` cuts motionless sections. Methods combine, e.g. `(or audio:0.03 motion:0.06)`, and dB units are accepted.
  - `--margin` pads cuts, 0.2 s by default.
  - Labels allow up to 255 classes with per-class actions such as `speed:1.5`.
  - Exports to Premiere, Resolve, Final Cut Pro, ShotCut, Kdenlive, or a clip sequence ([README](https://github.com/WyattBlue/auto-editor)).
  - Binaries exist for Windows, macOS and Linux. The CLI is "no longer being published on pip". Source builds use nim/nimble ([installing](https://auto-editor.com/installing)). The last PyPI version is 29.3.1, from 2025-11-04 ([PyPI](https://pypi.org/project/auto-editor/)).
- **social-media-skills/video-editing-skill's mechanism** ([README](https://github.com/social-media-skills/video-editing-skill)).
  - It transcribes with word timestamps from an existing SRT/VTT, a Groq or OpenAI key, or local faster-whisper. The transcriber "is prompted to write fillers down, because speech-to-text models leave most 'um's out otherwise".
  - The plan gives every cut a reason, and `edit-plan.md` must be approved before render.
  - Pauses shrink to a "natural beat" of real room tone, never to zero.
  - Retakes are detected by cue phrases ("let me say that again", "scratch that"), and the last take is kept.
  - It warns when the pace exceeds 190 wpm or more than 45% of the video is removed.
  - It writes an SRT plus optional burned captions or a 1080x1920 vertical version.
  - Its CI runs on Mac, Windows and Linux.
- **kajisho5/ffmpeg-skill.** `silence.py` removes dead air with a `--margin` of 0.2 s per side. `--filler` removes fillers "only where a speech engine timed them". `--speech-aware` cuts only at sentence-boundary pauses. `--timemap` exports a source-to-output time map. The skill describes itself as the "hands": it "does not decide what to cut" ([README](https://github.com/kajisho5/ffmpeg-skill)).
- **clipify.** It transcribes with Whisper and scans the transcript "for punchlines, reversals, awkward pauses, and audio peaks" to propose 3–5 candidate clips for the user to choose ([README](https://github.com/louisedesadeleer/clipify)).
- **CrisperWhisper.** Standard Whisper tends to omit fillers. CrisperWhisper's verbatim mode keeps `[um]`, `[uh]`, stutters and repetitions, which filler cutting needs ([README](https://github.com/nyrahealth/CrisperWhisper)).

### Inferences
- How agents choose cuts, across tools:
  1. Get verbatim word-level timestamps.
  2. Compress them into a phrase-level text view the LLM can read cheaply.
  3. Let the LLM select keep-ranges with reasons, snapped to word boundaries and padded 30–200 ms.
  4. Show a plan for human approval.
  5. Render per segment with micro-fades.
  6. Self-verify with contact sheets or filmstrips at each cut.
- The user's animal videos are AI-generated Veo clips with no speech. Transcript or silence cutting does not apply to them. The relevant automatic cutters are `auto-editor --edit motion` and scene/motion detection, e.g. `scenes.py` in ffmpeg-skill.
- Transcript cutting matters only for reference videos with speech or for future narrated formats.
- video-use's dependency on ElevenLabs (paid) is the main drawback for a cost-sensitive user. The local alternatives (social-media-skills, ffmpeg-skill) replicate the core loop with faster-whisper.

### Gaps
- No tool documents Vietnamese filler-word lists (e.g. "ờ", "ừm", "à", "thì là"). Filler detection quality on Vietnamese is untested.
- Windows support for video-use is not stated in its README.
- No comparison of cut quality between video-use and the local skills was found.
- Whether OpenCut includes transcript-based editing was not verified.

## 3. Animated word-by-word caption renderers (TikTok / CapCut style)

### Takeaway
There are three rendering families:
- **CSS/HTML/React renderers**: Remotion (`@remotion/captions`), HyperFrames, pycaps (CSS through Playwright). They give the most design freedom.
- **libass/ASS karaoke**: `\k`/`\kf` plus `\t` scale pops, burned with ffmpeg. This is the fastest and most portable, with only ffmpeg needed. ffmpeg-skill's `caption.py --animate pop --karaoke`, clipify and yerinsabraham use it.
- **MoviePy/Pillow**: captacity (stale), social-media-skills.

No objective "best-looking" comparison exists.

### Cited Findings

| Tool | GitHub | ★ | Last push | License | macOS AS | Windows | Transcription source | Agent interface |
|---|---|---|---|---|---|---|---|---|
| Remotion + `@remotion/captions` | https://github.com/remotion-dev/remotion | 71,085 | 2026-11-05 | Remotion License (NOASSERTION on GitHub). `@remotion/captions` itself is MIT ([docs](https://www.remotion.dev/docs/captions/api)) | Node | Node | whisper.cpp (`@remotion/install-whisper-cpp` → `toCaptions()`), `@remotion/whisper-webgpu`, OpenAI Whisper API (`openAiWhisperApiToCaptions()`), ElevenLabs (`elevenLabsTranscriptToCaptions()`) ([docs](https://www.remotion.dev/docs/captions/api)) | React code, CLI `npx remotion render`. Official agent skills (next row) |
| Remotion Agent Skills | https://github.com/remotion-dev/skills | 6,472 | 2026-11-05 | ? | — | — | `/remotion-captions` (v4.0.541) uses `@remotion/whisper-webgpu`, which "requires a compatible GPU" | `npx skills add remotion-dev/skills` or `gh skill install`. Skills: `/remotion-best-practices`, `/remotion-captions`, `/remotion-render`, `/remotion-markup`, `/remotion-docs`, etc. ([README](https://github.com/remotion-dev/skills)) |
| template-tiktok (Remotion) | https://github.com/remotion-dev/template-tiktok | 303 | 2026-11-02 | ? | Node + whisper.cpp | Node + whisper.cpp | whisper.cpp; default `medium.en` (1.5 GB). Non-English needs a model without `.en` in `whisper-config.mjs` | `node sub.mjs <video>` then `npx remotion render` ([README](https://github.com/remotion-dev/template-tiktok)) |
| HyperFrames (HeyGen) | https://github.com/heygen-com/hyperframes | 80,157 | 2026-11-07 | Apache-2.0 | yes (Studio app for Mac) | yes (Studio app for Windows) | `/media-use` skill covers "transcripts" | Claude Code plugin (`claude plugin marketplace add heygen-com/hyperframes`), `npx skills add heygen-com/hyperframes`, CLI `npx hyperframes init/preview/render`. About 450 registry blocks incl. "kinetic type, captions" ([README](https://github.com/heygen-com/hyperframes)) |
| pycaps | https://github.com/francozanardi/pycaps | 231 | 2026-09-30 | MIT | Python 3.10–3.12 + ffmpeg + Playwright Chromium | same | Whisper or faster-whisper. Or `--transcript` file (whisper_json / pycaps_json / srt / vtt) | CLI `pycaps render --input v.mp4 --template minimalist`. Python `CapsPipelineBuilder` / `TemplateLoader` ([README](https://github.com/francozanardi/pycaps)) |
| captacity | https://github.com/unconv/captacity | 141 | 2024-06-07 **STALE** | MIT | Python | Python | local openai-whisper or OpenAI API | CLI `captacity in out`, Python `add_captions(highlight_current_word=True, ...)` ([README](https://github.com/unconv/captacity)) |
| kajisho5/ffmpeg-skill `caption.py` | https://github.com/kajisho5/ffmpeg-skill | 4,673 | 2026-11-06 | MIT | yes | yes (Git Bash notes) | optional `--transcribe` with parakeet-mlx / faster-whisper / openai-whisper / whisper.cpp, or a supplied transcript | skill + MCP. `caption.py --animate pop --karaoke` |
| PyonFX | https://github.com/CoffeeStraw/PyonFX | 188 | 2025-08-31 **STALE** | LGPL-3.0 | Python | Python | none (ASS input) | Python library for ASS karaoke effects (KFX) |
| SubtitleEdit | https://github.com/SubtitleEdit/subtitleedit | 14,868 | 2026-11-05 | MIT | ? | yes | ? | GUI subtitle editor |
| VideoCaptioner (卡卡字幕助手) | https://github.com/WEIFENG2333/VideoCaptioner | 16,472 | 2026-09-12 | GPL-3.0 | macOS install script | Windows installer | faster-whisper, whisper-cpp, whisper-api, bijian, jianying | CLI `videocaptioner transcribe/subtitle/process`. LLM re-segmentation and translation ([README](https://github.com/WEIFENG2333/VideoCaptioner)) |
| subsai | https://github.com/absadiki/subsai | 1,683 | 2026-04-20 | GPL-3.0 | ? | ? | Whisper variants | Web UI + CLI + Python |
| auto-subtitle | https://github.com/m1guelpf/auto-subtitle | 2,296 | 2024-07-12 **STALE** | MIT | Python | Python | Whisper | CLI |

- **`createTikTokStyleCaptions()`** ([docs](https://www.remotion.dev/docs/captions/create-tiktok-style-captions)).
  - Inputs: `captions` and `combineTokensWithinMilliseconds`. A low value gives word-by-word display. The optional `breakOnSilenceAfterMilliseconds` (v4.0.514+) starts a new page after a gap.
  - Output: `pages` with `text`, `startMs`, `durationMs` and `tokens` (`text`, `fromMs`, `toMs`, `pageBreakAfter`).
  - Text is whitespace-sensitive. Each word needs a leading space, and the container needs `white-space: pre`.
  - The older `convertToCaptions()` was deprecated in 4.0.216 in favour of `toCaptions()` ([docs](https://www.remotion.dev/docs/install-whisper-cpp/convert-to-captions)).
- The **`Caption` type** is `{ text, startMs, endMs, timestampMs|null, confidence|null, pageBreakAfter? }` ([remotion-captions SKILL.md](https://github.com/remotion-dev/skills/blob/main/skills/remotion-captions/SKILL.md)).
- **Remotion License** terms ([LICENSE.md](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)):
  - Free, including commercial use, for individuals, for-profit organizations with up to 3 employees, and non-profits.
  - Others need a Company License (remotion.pro).
  - "In Remotion 5.0, the license will slightly change."
- **pycaps details.**
  - CSS state classes such as `.word-being-narrated`.
  - Word tagging by regex, word lists or AI.
  - Built-in animations (fades, pops, slides) and effects (typewriting, emoji, sound effects).
  - Two renderers: Playwright CSS (the default), and `PictexSubtitleRenderer`, which needs no browser and supports a subset of CSS.
  - Status is "alpha". The README says it is "not yet available on PyPI" and should be installed from git ([README](https://github.com/francozanardi/pycaps)).
  - Pitfall: `pip install pycaps` resolves to an unrelated 2017 package, v0.2.0 uploaded 2017-01-03 ([PyPI](https://pypi.org/project/pycaps/)). A `pycaps-ai` 0.2.1 listing exists ([PyPI](https://pypi.org/project/pycaps-ai/0.2.1/)).
- **ASS karaoke tags** (libass/Aegisub) ([Aegisub ASS tags](https://aegisub.org/docs/latest/ass_tags/)):
  - `\k<cs>`: secondary colour switches to primary when the syllable starts.
  - `\K`/`\kf`: left-to-right sweep.
  - `\ko`: outline appears at the syllable start.
  - `\t(t1,t2,accel,...)`: animates `\fscx`/`\fscy`, `\bord`, `\shad` and `\blur` (times in ms). Scale via `\fscx`/`\fscy` "should always be used with `\t` rather than `\fs`".
  - `\fad`, `\pos`, `\move`, `\an1–9` control fades and position.
- **yerinsabraham/video-edit-skill** uses HyperFrames and libass for "word-by-word kinetic captions, big key words, elegant serif feeling words", with whisper.cpp word timings "re-aligned to the real speech" ([README](https://github.com/yerinsabraham/video-edit-skill)).
- **clipify** burns "opus-style word-by-word captions (big bold white, yellow active-word highlight)". Styles are opus / karaoke / minimal, or "paste a reference image to match" ([README](https://github.com/louisedesadeleer/clipify)).
- **6missedcalls/video-editing-skill** offers 3 caption styles: Hormozi, standard, minimal ([README](https://github.com/6missedcalls/video-editing-skill)).
- **OpenMontage** renders "TikTok-style word-by-word captions" in Remotion ([README](https://github.com/calesthio/OpenMontage)).

### Inferences
- **Best-looking output** is subjective. React/HTML/CSS renderers (Remotion, HyperFrames, pycaps with Playwright) support arbitrary fonts, gradients, emoji, per-word spring animations and backgrounds. ASS is limited to libass features (colour, outline, scale, blur, move). In exchange, ASS renders in a single ffmpeg pass on both macOS and Windows without Node or a browser.
- For a 20–26 s vertical clip, render time is small either way.
- Vietnamese diacritics stacked over vowels need a font with full Vietnamese glyph coverage and enough line spacing in every renderer. Fonts must be chosen with a Vietnamese subset. This is inferred, not tested here.
- Remotion's free license fits an individual creator, which this user appears to be. A team of more than 3 employees would need a Company License.
- `createTikTokStyleCaptions` will treat each Vietnamese syllable as a token (see §1 inference). This is fine for syllable-level highlighting.

### Gaps
- No side-by-side visual quality comparison of Remotion, HyperFrames, pycaps and ASS was found.
- None of these renderers documents Vietnamese-specific testing.
- HyperFrames' exact caption component names and transcription engine were not extracted from its docs.
- The PyPI `pycaps-ai` package is not confirmed to be the official release, since the README contradicts it.

## 4. Existing Claude Code skills / MCP servers that do transcription + captions + cut in one flow

### Takeaway
Several Claude Code skills already run the whole loop (transcribe → cut → caption → verify):
- video-use (most popular, but needs paid ElevenLabs).
- kajisho5/ffmpeg-skill (popular, local, includes an MCP server, has a 9:16 TikTok template).
- social-media-skills/video-editing-skill (local, cross-platform CI, but 0★).
- yerinsabraham/video-edit-skill (local, kinetic captions, 5★).
- clipify (long-to-short clips, macOS).

Big agentic production systems (OpenMontage, HyperFrames, Remotion skills) include captions but are oriented to generating videos.

MCP options with transcription built in are few and mostly small or stale. ffmpeg-skill's MCP server is the strongest.

### Cited Findings

| Skill / server | GitHub | ★ | Last push | License | Platforms | ASR | Flow |
|---|---|---|---|---|---|---|---|
| video-use | https://github.com/browser-use/video-use | 30,658 | 2026-10-08 | MIT | macOS documented | ElevenLabs Scribe (paid) | inventory → converse → strategy → EDL → render → self-eval. Overlays via HyperFrames, Remotion, Manim or PIL in parallel sub-agents. Session memory in `project.md` ([README](https://github.com/browser-use/video-use)) |
| kajisho5/ffmpeg-skill | https://github.com/kajisho5/ffmpeg-skill | 4,673 | 2026-11-06 | MIT | macOS, Linux, Windows; Python stdlib + ffmpeg, "no API keys" | optional local parakeet-mlx / faster-whisper / openai-whisper / whisper.cpp (`FFMPEG_SKILL_ASR_ENGINE`, e.g. `large-v3-turbo`) | 42 tools: cut, silence/filler, fit 9:16, captions/karaoke, graphics, loudness, `check.py --platform tiktok`. `render.py --template tiktok`. MCP server `mcp/server.py` (12 core tools listed by default, all 42 with `FFMPEG_SKILL_MCP_FULL=1`). Installs with `npx ffmpeg-skill` ([README](https://github.com/kajisho5/ffmpeg-skill)) |
| social-media-skills/video-editing-skill | https://github.com/social-media-skills/video-editing-skill | 0 | 2026-10-30 | MIT | Mac, Windows, Linux (CI on all three) | faster-whisper local, Groq or OpenAI | silences, fillers, retakes, punch-ins, -14 LUFS, SRT, chapters, optional burned captions or 1080x1920. Installs via `gh skill install`, ClawHub or Gemini CLI ([README](https://github.com/social-media-skills/video-editing-skill)) |
| yerinsabraham/video-edit-skill | https://github.com/yerinsabraham/video-edit-skill | 5 | 2026-10-04 | Apache-2.0 | macOS (Apple Silicon / Intel), Linux, Windows; `setup.py --install` | whisper.cpp | best takes, kinetic captions (HyperFrames + libass), QA of safe zones and caption timing, rough EDL handoff to Premiere/Resolve/FCP ([README](https://github.com/yerinsabraham/video-edit-skill)) |
| clipify | https://github.com/louisedesadeleer/clipify | 627 | 2026-08-24 | MIT | macOS (VideoToolbox; other OSes after removing the hwaccel flags) | openai-whisper | long video → 3–5 candidates → 9:16 reframe by motion-energy speaker detection → word-by-word captions. Slash command `/clipify` ([README](https://github.com/louisedesadeleer/clipify)) |
| 6missedcalls/video-editing-skill | https://github.com/6missedcalls/video-editing-skill | 50 | 2026-02-27 | MIT | Bash; macOS/Linux, Windows install via Chocolatey | local Whisper → SRT | trim, jump cut, 3 caption styles, overlays, speed ([README](https://github.com/6missedcalls/video-editing-skill)) |
| kwindla/skill-caption-clip | https://github.com/kwindla/skill-caption-clip | 4 | 2026-01-27 | ? | ? | Deepgram (API) | YouTube segment → transcript cleaned by Claude → ffmpeg burn (repo description) |
| appariciojunior/video-editor-skills | https://github.com/appariciojunior/video-editor-skills | 422 | 2026-10-23 | CC BY-NC 4.0 per description (GitHub: NOASSERTION) | needs DaVinci Resolve | ? | transcript cuts, B-roll and captions inside Resolve. Non-commercial only (repo description) |
| auto-editor skill | https://github.com/WyattBlue/auto-editor | 5,787 | 2026-11-06 | Unlicense | Win/Mac/Linux binaries | none | `npx skills add WyattBlue/auto-editor` ([README](https://github.com/WyattBlue/auto-editor)) |
| kajisho5/transcription-skill | https://github.com/kajisho5/transcription-skill | 6 | 2026-10-31 | MIT | ? | faster-whisper | transcription-only skill (repo description) |
| kajisho5/remotion-ffmpeg-skill | https://github.com/kajisho5/remotion-ffmpeg-skill | 3 | 2026-10-31 | MIT | ? | uses ffmpeg-skill measurements | Remotion animated captions and silence jump cuts on real recordings ([ffmpeg-skill README](https://github.com/kajisho5/ffmpeg-skill)) |
| OpenMontage | https://github.com/calesthio/OpenMontage | 77,739 | 2026-11-03 | AGPL-3.0 | macOS/Linux; Windows PowerShell setup documented | WhisperX ("Transcriber") | 12 pipelines. Remotion or HyperFrames render. Word-level subtitles. Post-render self-review (ffprobe, frame sampling, subtitle presence) ([README](https://github.com/calesthio/OpenMontage)) |
| HyperFrames | https://github.com/heygen-com/hyperframes | 80,157 | 2026-11-07 | Apache-2.0 | Mac, Windows, Linux | via `/media-use` | 9 skills plus a Claude Code plugin ([README](https://github.com/heygen-com/hyperframes)) |
| Remotion skills | https://github.com/remotion-dev/skills | 6,472 | 2026-11-05 | ? | Node | `@remotion/whisper-webgpu` | `/remotion-captions` ([README](https://github.com/remotion-dev/skills)) |
| short-video-maker (MCP + REST) | https://github.com/gyoridavid/short-video-maker | 1,469 | 2025-06-21 **STALE** | MIT | ? | whisper.cpp `tiny.en` | Kokoro TTS + Whisper captions + Pexels footage + Remotion. "only capable generating videos with English voiceover" ([README](https://github.com/gyoridavid/short-video-maker)) |
| video-audio-mcp | https://github.com/misbahsy/video-audio-mcp | 89 | 2025-05-24 **STALE** | MIT | ? | — | basic ffmpeg MCP (repo description) |
| dahshury/video_editing_mcp (VEMCP) | https://github.com/dahshury/video_editing_mcp | 1 | 2026-01-30 | ? | Python 3.10+, ffmpeg | Whisper | `transcribe_audio`, `add_subtitles`, `add_srt_subtitles` ([LobeHub listing](https://lobehub.com/mcp/dahshury-video_editing_mcp)) |
| mcp-video (PyPI) | repo not verified | ? | ? | ? | pip/uvx | ? | 82 tools. v1.0.0 added silence removal, transcription and scene detection ([PyPI](https://pypi.org/project/mcp-video/1.0.0/)) |
| SmartCut MCP | repo not verified (LobeHub id `mrbuslov-capcut-ai-editor`) | ? | ? | ? | ? | OpenAI Whisper API | pause removal, duplicate takes, subtitles, CapCut project export ([LobeHub](https://lobehub.com/ko/mcp/mrbuslov-capcut-ai-editor)) |
| oakoss/agent-skills (`remotion` skill) | https://github.com/oakoss/agent-skills | 21 | 2026-08-17 | ? | — | — | community Remotion skill covering `createTikTokStyleCaptions()` ([llmbase listing](https://llmbase.ai/skills/oakoss/remotion/)) |

- The ffmpeg-skill star count (about 4.6k) was also reported by a third-party index ([skillsllm](https://skillsllm.com/skill/ffmpeg-skill)). That matches the 4,673 from ungh.cc.

### Inferences
- The best fit for this user, who wants something local, cross-platform and cheap, is kajisho5/ffmpeg-skill as the "hands" for deterministic ffmpeg operations, with captions and a 9:16 TikTok template. It runs on Mac and Windows, and its ASR engine is configurable, so it can use a Vietnamese-capable Whisper model.
- video-use is the best "brain" pattern to imitate: the packed transcript, EDL, `timeline_view` and self-eval. Its ElevenLabs dependency is the main drawback.
- The user's existing `voice-clone` skill already references OpenMontage. Per the skill listing in this session, it describes using a cloned voice "as narration for an OpenMontage video". OpenMontage's WhisperX transcriber and Remotion word-level captions may therefore already be partly installed on the user's machine. This needs checking locally.
- The popular repos (video-use, OpenMontage, HyperFrames) have very high star counts gained quickly in 2026. Popularity does not imply Vietnamese support. None of their READMEs mentions Vietnamese.

### Gaps
- None of these skills documents Vietnamese testing.
- The repo URLs for mcp-video and SmartCut MCP were not verified.
- Windows support for video-use, Remotion skills and HyperFrames CLI rendering was not explicitly verified, apart from HyperFrames Studio, which has Windows builds.
- Whether `npx skills add`-installed skills work identically on Windows was not checked.

## 5. For narration-free animal videos: on-screen text/titles without speech, and reusing a reference video's script

### Takeaway
The user's videos have no speech, so ASR-driven captioning only applies to (a) reference videos that have speech and (b) future narrated versions. On-screen text can be driven from a hand-written or LLM-written timed script (SRT or JSON) fed into the same caption renderers: pycaps `--transcript`, Remotion `Caption[]` / `parseSrt`, ffmpeg-skill `caption.py` and `graphics.py`, HyperFrames kinetic-type blocks. Reference-video scripts come from yt-dlp subtitles, local ASR, or OCR of burned-in text (VideOCR, RapidVideOCR, video-subtitle-extractor).

### Cited Findings
- **pycaps** accepts an existing transcript instead of transcribing: `pycaps render --input my_video.mp4 --template minimalist --transcript transcript.json`, with formats `whisper_json`, `pycaps_json`, `srt` and `vtt` ([README](https://github.com/francozanardi/pycaps)).
- **ffmpeg-skill `caption.py`** can "build SRT from timed plain text" and burns cue text "exactly as given" ("caption text unchanged"). `graphics.py` draws "lower-thirds, title cards, chapter chips, progress bars, countdowns, corner bugs, social stickers, opening hook cards and meme captions", and `--platform` keeps them inside the safe zone ([README](https://github.com/kajisho5/ffmpeg-skill)).
- The **Remotion captions skill** has an "Importing captions" path from `.srt` (`import-srt-captions.md`). Captions use the `Caption` JSON type, so hand-authored JSON works as well ([SKILL.md](https://github.com/remotion-dev/skills/blob/main/skills/remotion-captions/SKILL.md)).
- The **HyperFrames registry** has "about 450 ready-made blocks", including "titles, kinetic type, captions" ([README](https://github.com/heygen-com/hyperframes)).
- **editly** ("Slick, declarative command line video editing & API"): https://github.com/mifi/editly. 5,587★, last push 2025-05-12 **STALE**, MIT.
- **MoviePy**: https://github.com/Zulko/moviepy. 15,115★, push 2026-08-26, MIT ("Video editing with Python").
- **Motion Canvas**: https://github.com/motion-canvas/motion-canvas. 19,711★, push 2026-07-02, MIT.
- **Revideo**: https://github.com/redotvideo/revideo. 4,186★, push 2026-07-15, license ?.
- **MoneyPrinterTurbo**: https://github.com/harry0703/MoneyPrinterTurbo. 140,266★, push 2026-11-07, MIT. It generates short videos "from a topic or keyword" (repo description).
- **auto-editor `--edit motion:threshold=0.02`** cuts motionless sections without any speech ([README](https://github.com/WyattBlue/auto-editor)).
- **Reference video → script:**
  - **yt-dlp** (https://github.com/yt-dlp/yt-dlp, 205,745★, push 2026-11-04, Unlicense) downloads TikTok, YouTube and Facebook videos.
  - **videogrep** notes that YouTube `.vtt` files carry word-level timestamps ([README](https://github.com/antiboredom/videogrep)).
  - **OpenMontage** "Start from a reference video": "The agent analyzes transcript, pacing, scenes, keyframes, and style" ([README](https://github.com/calesthio/OpenMontage)).
  - **charlesdove977/watchvideo** (https://github.com/charlesdove977/watchvideo, 27★, push 2026-10-23, MIT) is a "Local video analyzer skill for Claude Code: yt-dlp + ffmpeg + Whisper + vision. Transcript, hook breakdown, and topic research" (repo description).
  - **HyperFrames** ships a `/reverse-any-video` skill, installed on demand ([README](https://github.com/heygen-com/hyperframes)).
- **OCR for burned-in on-screen text** (typical in no-narration TikToks):
  - **VideOCR** (https://github.com/timminator/VideOCR): 858★, push 2026-10-17, MIT. "Extract hardcoded subtitles from videos via a simple GUI ... Supports 200+ languages."
  - **RapidVideOCR** (https://github.com/SWHL/RapidVideOCR): 506★, push 2026-10-25, Apache-2.0. Extracts hard subtitles and generates SRT.
  - **video-subtitle-extractor** (https://github.com/YaoFANGUK/video-subtitle-extractor): 9,699★, push 2026-04-09, Apache-2.0. GUI, local, deep-learning hard-subtitle extraction to SRT (repo descriptions).

### Inferences
- For the user's flow-chain-video pipeline, the agent writes a short timed on-screen script, e.g. 3–6 Vietnamese phrases over 20–26 s, synced to clip boundaries the pipeline already knows. A renderer then animates the script. ASS (ffmpeg only, Windows-safe) and pycaps (CSS templates) are the lowest-friction choices. Remotion and HyperFrames suit richer kinetic titles.
- For a speech-bearing reference video, the chain is: yt-dlp (existing video-downloader skill) → mlx-whisper/faster-whisper/PhoWhisper → LLM rewrite. For a narration-free reference video, the on-screen text has to come from OCR. VideOCR claims Vietnamese is covered among its 200+ languages but does not say so explicitly.
- The ffmpeg-skill rule of burning cue text "exactly as given" prevents an agent from silently rewriting Vietnamese text. That property matters when the text is pre-approved.

### Gaps
- No tool was found that is designed specifically for narration-free "caption-as-storytelling" on AI animal or nature clips.
- Vietnamese OCR accuracy of VideOCR, RapidVideOCR and video-subtitle-extractor is unverified. Their language lists were not checked for "vi".
- Whether yt-dlp can fetch TikTok's auto-generated captions for Vietnamese videos was not verified.
- How well Remotion and HyperFrames render Vietnamese diacritics with stacked tone marks in kinetic animations is untested.
