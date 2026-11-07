# Hook, retention và cắt video dài thành short: công cụ mở và workflow cho agent

Cách lấy số liệu: researcher lấy số sao từ trường `stargazerCount` trong HTML trang repo. Ngày commit cuối lấy từ `github.com/<repo>/commits.atom`. Release mới nhất lấy từ `releases.atom`. License và nền tảng lấy từ trang repo và README. Mọi số liệu lấy ngày 2026-11-07. Link repo trong bảng là nguồn của dòng đó. **STALE** nghĩa là commit cuối trước 2025-11-07, tức hơn 12 tháng không có commit. Cột nền tảng chỉ ghi điều README nói rõ. "README không nêu" nghĩa là researcher không tìm thấy thông tin trong README.

## 1. Công cụ mở thay Opus Clip và reframe 9:16: cái nào còn bảo trì, cái nào chạy trên macOS?

### Takeaway
Ba công cụ cắt clip lớn nhất vẫn có commit trong tuần này: zhouxiaoka/autoclip (10061 sao), mutonby/openshorts (7530 sao) và Anil-matcha/AI-Youtube-Shorts-Generator (5786 sao). Trong ba công cụ này, chỉ README của autoclip xác nhận có bản desktop cho macOS Apple Silicon (kèm Windows x64), CLI và MCP. FunClip của Alibaba vẫn được bảo trì. ClipsAI và reels-clips-automator đã STALE. Hầu hết công cụ chọn đoạn dựa trên transcript, nên không có tín hiệu để chọn đoạn trong video động vật không thuyết minh.

### Cited Findings

**Công cụ cắt clip (video dài → short)**

| Công cụ | Sao | Commit cuối | Release mới nhất | License | Nền tảng (theo README) | Agent điều khiển thế nào, tính năng |
|---|---|---|---|---|---|---|
| [zhouxiaoka/autoclip](https://github.com/zhouxiaoka/autoclip) | 10061 | 2026-11-03 | AutoClip Desktop v1.x, 2026-11-03 | MIT | Desktop macOS Apple Silicon hoặc Windows x64; CLI; Docker | CLI `autoclip` và MCP server (lệnh `get_version`). Desktop, CLI và MCP cập nhật cùng nhau. Tạo video, ảnh bìa và caption đăng bài cho Douyin, Xiaohongshu, TikTok, Reels, Shorts. |
| [mutonby/openshorts](https://github.com/mutonby/openshorts) | 7530 | 2026-11-06 | không có | MIT | Docker. Windows chạy qua Docker Desktop với WSL2 và driver NVIDIA. README không nêu macOS. | Có "API + MCP server" và bản hosted cloud. AI phát hiện khoảnh khắc, face tracking. Khi có 2 người, tool xếp chồng 2 khung thay vì thu nhỏ khung rộng. Mô-đun script viết theo khung "hook – problem – solution – CTA". Có AI actor lip-sync và B-roll. |
| [Anil-matcha/AI-Youtube-Shorts-Generator](https://github.com/Anil-matcha/AI-Youtube-Shorts-Generator) | 5786 | 2026-11-06 | không có | MIT | README nhắc CUDA, không nêu macOS | Script Python. LLM (OpenAI, Gemini, Ollama) xếp hạng highlight theo hook, đỉnh cảm xúc, xung đột, câu đáng trích dẫn ("Virality-Aware Highlight Selection"). |
| [modelscope/FunClip](https://github.com/modelscope/FunClip) (Alibaba) | 6503 | 2026-11-01 | v2.2.1, 2026-09-01 | MIT | README nêu Windows, Linux. README khuyên dùng môi trường Python 3.12 riêng. | Repo tự mô tả là công cụ nhận dạng giọng nói và cắt video, có tích hợp LLM clipping. Tool cắt theo văn bản ASR, nên phải có lời nói. |
| [WyattBlue/auto-editor](https://github.com/WyattBlue/auto-editor) | 5798 | 2026-11-07 | 31.8.0, 2026-10-30 | Unlicense | README không nêu | CLI cắt theo độ lớn âm thanh (bỏ khoảng lặng). Cài thành skill bằng `npx skills add WyattBlue/auto-editor`. |
| [ClipsAI/clipsai](https://github.com/ClipsAI/clipsai) | 564 | 2024-01-17 **STALE** | 0.2.1, 2024-01-15 | MIT | README không nêu | Thư viện Python tìm clip từ transcript. Thuật toán resize tự reframe theo người nói. |
| [xixihhhh/hotclip](https://github.com/xixihhhh/hotclip) | 434 | 2026-10-26 | v0.33.0, 2026-10-26 | AGPL-3.0 | macOS, Windows, Linux, Docker | MCP và CLI. Nhắm Douyin, Kuaishou, Bilibili, Xiaohongshu. Tool dùng độ nóng của danmaku (bình luận chạy) để chọn điểm nổ. |
| [kurbaitaev/ghost-editor](https://github.com/kurbaitaev/ghost-editor) | 241 | 2026-10-30 | v0.3.0, 2026-10-30 | MIT | Render trên Mac. Reel 60 giây mất 15–25 phút máy trên M3 MacBook Air. | Claude Code skill dựng reel talking-head. Người dùng gọi preset style bằng lời, ví dụ "edit this in Hologram HUD". |
| [artbyjazi/autoclip](https://github.com/artbyjazi/autoclip) | 233 | 2026-08-01 | không có | MIT | macOS, Windows, Linux, CUDA, Docker | CLI. Tool burn caption và theo người nói ở khung 9:16. |
| [eddieoz/reels-clips-automator](https://github.com/eddieoz/reels-clips-automator) | 232 | 2023-09-03 **STALE** | không có | MIT | README không nêu | CLI dùng OpenAI. |
| [ColinGPT9/clips-studio](https://github.com/ColinGPT9/clips-studio) ("Clips Kitty") | 214 | 2026-11-05 | 2.1, 2026-10-21 | AGPL-3.0 | macOS, Windows, Linux, CUDA, Docker | MCP. Phát hiện clip đa phương thức, face tracking theo người nói, chat để sửa. Bản fork mô tả là chạy Google Gemma trên máy ([search result](https://github.com/shobhitagnihotri69/clips-studio)). |
| [SamurAIGPT/ai-clipping-generator](https://github.com/SamurAIGPT/ai-clipping-generator) | 111 | 2026-10-22 | không có | MIT | SaaS Next.js | API web. |
| [nmbrthirteen/podcli](https://github.com/nmbrthirteen/podcli) | 86 | 2026-11-03 | v2.8.2, 2026-10-29 | AGPL-3.0 | macOS Apple Silicon, Linux x64/arm64, Windows x64. README ghi rõ không hỗ trợ Mac Intel. | Điều khiển bằng CLI, web studio hoặc coding agent qua MCP. Một lệnh làm transcript, chọn đoạn, crop theo mặt và burn caption. |
| [fralapo/clippyme](https://github.com/fralapo/clippyme) | 62 | 2026-10-13 | không có | MIT | Docker, CUDA | Web self-host. Gemini chọn khoảnh khắc viral. Không có key Gemini thì tool chỉ chia theo chủ đề, không xếp hạng ([search result](https://github.com/fralapo/clippyme)). |
| [Anil-matcha/ai-clipping-comfyui](https://github.com/Anil-matcha/ai-clipping-comfyui) | 34 | 2026-07-21 (theo [topic page](https://github.com/topics/opus-clip-alternative)) | — | — | Node ComfyUI | Xử lý qua API hosted muapi.ai, nên không chạy local hoàn toàn. |
| [GrepCut/OpenClipper](https://github.com/GrepCut/OpenClipper) | 16 | 2026-10-22 | không có | MIT | Desktop Windows (Tauri) | MCP server local cho agent đọc dữ liệu project. Reframe 9:16, 4:5, 1:1, 16:9. |

- Topic page [opus-clip-alternative](https://github.com/topics/opus-clip-alternative) và [opusclip-alternative](https://github.com/topics/opusclip-alternative) liệt kê thêm hàng chục repo dưới 100 sao. Hầu hết repo này có commit trong tháng 10–11/2026.
- Web search trả về nhiều repo trùng mô tả "clips-studio" với chủ khác nhau: [shobhitagnihotri69](https://github.com/shobhitagnihotri69/clips-studio), [mozzie49](https://github.com/mozzie49/clips-studio), [amrokld](https://github.com/amrokld/clips-studio), [Llhhy1](https://github.com/Llhhy1/clips-studio). Metadata của vài trang fork ghi "Open source: No." — theo kết quả [web search](https://github.com/shobhitagnihotri69/clips-studio).

**Reframe 9:16 theo chủ thể**

| Công cụ | Sao | Commit cuối | Release | License | Nền tảng | Cách dùng |
|---|---|---|---|---|---|---|
| [kamilstanuch/Autocrop-vertical](https://github.com/kamilstanuch/Autocrop-vertical) | 443 | 2026-02-15 | không có | researcher không đọc được | README có tùy chọn encoder phần cứng macOS VideoToolbox / NVIDIA NVENC | CLI Python. Bản mirror mô tả tool dùng YOLOv8 phát hiện chủ thể và crop động ([SourceForge](https://sourceforge.net/projects/autocrop-vertical.mirror/)). |
| [KazKozDev/auto-vertical-reframe](https://github.com/KazKozDev/auto-vertical-reframe) | 25 | 2026-10-04 | không có | MIT | macOS có launcher (`brew install ffmpeg`). README ghi Linux và Windows chưa test. | CLI. Dùng YOLOv11 + ByteTrack. Chế độ mặc định là saliency thủ công, README nói chế độ này tốt nhất cho video 1 chủ thể. Có mode 2 người và preset `talking_head`. Log in mức zoom từng cảnh. |
| [fralapo/FrameShift](https://github.com/fralapo/FrameShift) | 15 | 2026-06-18 | v1.0.1, 2026-06-18 | MIT | README không nêu | CLI giữ mặt và vật thể trong khung khi đổi tỉ lệ. |
| [pyautoflip (PyPI)](https://pypi.org/project/pyautoflip/) | — | — | — | — | Python 3.10+, FFmpeg | Thư viện pip. Mặc định dùng phát hiện mặt và vật thể, có chế độ saliency. Researcher chưa kiểm repo gốc. |

ClipsAI, openshorts, podcli, Clips Kitty và artbyjazi/autoclip có reframe theo mặt hoặc người nói tích hợp sẵn (xem bảng trên).

### Inferences
- Các công cụ mà README xác nhận chạy trên macOS: autoclip desktop, podcli (đều chỉ Apple Silicon), hotclip, artbyjazi/autoclip, Clips Kitty, ghost-editor, auto-vertical-reframe. openshorts thiên về Docker và GPU NVIDIA, nên trên Mac có thể chậm. README của openshorts không nói gì về Mac.
- Các công cụ chạy trên Windows: autoclip (x64), podcli (x64), OpenClipper (desktop), Clips Kitty, artbyjazi/autoclip.
- Video động vật của người dùng dài 20–26 giây, đã ở 9:16 và không có lời. Vì vậy, nhóm công cụ cắt video dài ít giá trị cho dòng video này. Nhóm này chỉ có ích khi người dùng ghép compilation dài rồi cắt lại.
- Clip nhảy TikTok vốn đã 9:16. Reframe YOLO chỉ cần khi nguồn là 16:9.
- Theo kiến thức chung (researcher chưa kiểm trong phiên này), lớp COCO của YOLO có chim, chó, mèo, ngựa, bò, voi, gấu nhưng không có côn trùng. Với video bướm, chuồn chuồn hay kiến, bạn nên dùng mode saliency của auto-vertical-reframe.
- Nhiều repo nhỏ, mới, trùng mô tả có dấu hiệu fork để lấy SEO. Agent nên chọn repo gốc có nhiều sao nhất và đọc license trước khi dùng.

### Gaps
- README của openshorts, AI-Youtube-Shorts-Generator và FunClip không nói rõ có chạy trên macOS hay không. Researcher không chạy thử.
- Researcher chưa kiểm quan hệ giữa `SamurAIGPT/AI-Youtube-Shorts-Generator` (tên hay được nhắc) và `Anil-matcha/AI-Youtube-Shorts-Generator`.
- Researcher chưa kiểm tình trạng MediaPipe AutoFlip của Google.
- Không có benchmark chất lượng độc lập giữa các công cụ cắt clip.

## 2. Thiết kế hook: có skill, prompt library hay framework nào tạo hoặc chấm hook? Có công cụ nào phân tích hook, nhịp và độ dài shot của video mẫu?

### Takeaway
Đã có Claude skill tạo và chấm hook. Tuy vậy, các skill này chấm hook dạng lời hoặc script, ví dụ 21 công thức hook của youtube-agent-skill hay khung hook–problem–solution–CTA của openshorts. Researcher không tìm thấy công cụ mở nào chấm hook hình ảnh không lời. Để phân tích video mẫu, agent phải ghép PySceneDetect (độ dài shot) với mô hình đọc hình ảnh (VLM). OpenMontage có sẵn bước phân tích nhịp, cảnh, keyframe và style.

### Cited Findings

**Skill và framework cho hook, retention**

| Tên | Sao | Commit cuối | License | Agent dùng thế nào | Nội dung hook/retention |
|---|---|---|---|---|---|
| [Jakeschincariol/youtube-agent-skill](https://github.com/jakeschincariol/youtube-agent-skill) | 4861 | 2026-09-16 | MIT | 11 Claude skill. Không cần đăng ký hay API key. | Viết script từ 21 công thức hook và chấm điểm hook trước khi quay. "Retention reader" tìm chỗ người xem rời đi. Có Shorts cutter. `/yt-viral` xếp hạng video theo bội số so với median của chính kênh đó. |
| [AgriciDaniel/claude-youtube](https://github.com/AgriciDaniel/claude-youtube) | 692 | 2026-04-10 | MIT | Claude Code skill. README nhắc MCP, Gemini. | Audit kênh, script tối ưu retention, biến thể hook, tối ưu Shorts. |
| [iart-ai/tiktok-video-skills](https://github.com/iart-ai/tiktok-video-skills) | 20 | 2026-06-22 | MIT | `npx skills add iart-ai/tiktok-video-skills` hoặc plugin marketplace | Skill short-form "survives the swipe". Theo snippet search: caption karaoke theo từng từ, hướng dẫn vài giây đầu và pattern interrupt. |
| [nopefallacy/vertical-video-editing-skills](https://github.com/nopefallacy/vertical-video-editing-skills) | 68 | 2026-06-21 | MIT | Claude Code skill, render bằng HyperFrames | Dựng short 9:16 từ script + footage talking-head. Mỗi lần dựng, skill xuất `edit-report.md` ghi quyết định từng beat, asset, SFX và bằng chứng kiểm tra. |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | 77770 | 2026-11-03 | AGPL-3.0 | Chạy với Claude Code, Cursor, Copilot, Windsurf, Codex. README có lệnh cài cho macOS/Linux và Windows PowerShell. | README ghi bước "agent analyzes transcript, pacing, scenes, keyframes, and style". Pipeline "Clip Factory" xuất lô clip short có xếp hạng từ 1 nguồn dài. Dùng ElevenLabs cho TTS, nhạc AI và SFX. |
| [mutonby/openshorts](https://github.com/mutonby/openshorts) | 7530 | 2026-11-06 | MIT | API + MCP | AI viết script theo khung "hook – problem – solution – CTA". |
| [zenstory-ai/video-recap-skills](https://github.com/zenstory-ai/video-recap-skills) | 606 | 2026-11-06 | MIT | Agent skill. README nêu macOS, Windows. Không cần GPU. | Tự cắt shot, xem hình để viết lời bình, lồng tiếng. Xuất draft 剪映/CapCut sửa được. |
| [ghost-editor](https://github.com/kurbaitaev/ghost-editor), [6missedcalls/video-editing-skill](https://github.com/6missedcalls/video-editing-skill) (50 sao, MIT, commit 2026-02-27) | — | — | MIT | Claude Code skill | Dành cho talking-head: jump cut, caption kiểu Hormozi, đổi tốc độ. ghost-editor có preset style. |

- Bài tổng hợp tháng 10/2026 liệt kê 8 skill dựng video miễn phí cho Claude. Bài này nhắc skill caption của HeyGen trong HyperFrames ([dariusreed.com](https://www.dariusreed.com/claude-video-editing-skills/)).
- [pj4533/fishing-video-editing](https://github.com/pj4533/fishing-video-editing) là Claude skill cho footage câu cá GoPro. Skill xuất clip TikTok/Reels/Shorts và zoom 4K vào động vật hoang dã. Researcher chưa lấy số sao.

**Công cụ phân tích video mẫu**

| Tên | Sao | Commit cuối | Release | License | Dùng để |
|---|---|---|---|---|---|
| [Breakthrough/PySceneDetect](https://github.com/Breakthrough/PySceneDetect) | 5401 | 2026-11-07 | v0.7.2, 2026-10-12 | BSD-3-Clause | CLI/Python phát hiện ranh giới shot. Từ đó agent tính độ dài shot và nhịp cắt của video mẫu. README nêu Windows, Docker. |
| [soCzech/TransNetV2](https://github.com/soCzech/TransNetV2) | 1080 | 2021-07-28 **STALE** | không có | MIT | Model phát hiện chuyển cảnh. README nhắc CUDA, Docker. |
| [OpenMontage](https://github.com/calesthio/OpenMontage) | 77770 | 2026-11-03 | — | AGPL-3.0 | Bước phân tích nhịp, cảnh, keyframe, style (xem trên). |

### Inferences
- Video động vật của người dùng không có lời, nên mọi công cụ chấm hook dựa trên chữ đều không dùng được trực tiếp. Agent có thể tự chấm hook hình ảnh theo 3 bước: (1) PySceneDetect đo độ dài shot đầu và số lần cắt trong 3 giây đầu của video mẫu viral; (2) Claude xem lưới khung hình 0–3 giây, giống cách repo đang dùng `khung-dau.mjs` cho aidancing; (3) Agent đối chiếu với tỉ lệ engaged views / views trên YouTube làm số liệu thật (xem mục 5).
- Clip mở đầu camera tiến vào dài 1–1,5 giây của người dùng nằm trong khung "1–3 giây đầu" mà TikTok Academy gọi là hook (xem mục 5).
- Crossfade là chuyển cảnh mờ dần. Bộ phát hiện theo ngưỡng của PySceneDetect có thể bỏ sót crossfade. Điều này chưa kiểm, nên agent phải kiểm bằng mắt trên vài video mẫu.
- OpenMontage có cả bước phân tích lẫn render. Skill voice-clone của người dùng đã gắn với OpenMontage, nên đây là ứng viên tích hợp ít tốn công nhất. Lưu ý: license AGPL-3.0.

### Gaps
- Researcher không tìm thấy prompt library hay mô hình mở nào chấm **hook hình ảnh** không lời.
- Researcher chưa mở danh sách 21 công thức hook của youtube-agent-skill để xem có công thức nào dùng được cho video không lời.
- Researcher không tìm thấy công cụ mở nào lấy được đường retention của video **người khác**. Retention reader của youtube-agent-skill có vẻ đọc analytics của kênh mình (chưa kiểm).

## 3. Tự động hoá chỉnh sửa retention: beat detection, cắt theo beat, zoom, B-roll, SFX, nhạc

### Takeaway
Các thư viện beat detection đã ổn định. librosa ra 1.0.0 ngày 2026-08-17. beat_this (ISMIR 2024, MIT) vẫn được bảo trì. madmom và all-in-one đã STALE. Nhiều repo tự cắt theo beat: easyedit, BeatSync-Engine (chỉ Windows) và motion-video-skill. Researcher không tìm thấy repo nào tự đặt tiếng whoosh vào chuyển cảnh. Agent phải tự đặt bằng ffmpeg dựa trên timestamp điểm nối. Các mô hình video-to-audio (MMAudio, ThinkSound, HunyuanVideo-Foley) tạo được tiếng động khớp hình, hợp với video động vật không lời.

### Cited Findings

**Beat, downbeat, cấu trúc nhạc**

| Tên | Sao | Commit cuối | Release | License | Nền tảng / ghi chú |
|---|---|---|---|---|---|
| [librosa/librosa](https://github.com/librosa/librosa) | 8804 | 2026-11-05 | 1.0.0, 2026-08-17 | ISC | Thư viện Python: beat tracking, onset. |
| [CPJKU/beat_this](https://github.com/CPJKU/beat_this) | 470 | 2026-05-28 | 1.1.0, 2026-04-14 | MIT | Bản chính thức của bài ISMIR 2024 "Beat This! Accurate Beat Tracking Without DBN Postprocessing". Có CLI. README nhắc CUDA. |
| [mir-aidj/all-in-one](https://github.com/mir-aidj/all-in-one) | 880 | 2023-10-10 **STALE** | v1.1.0, 2023-10-10 | MIT | Xuất beats, downbeats và đoạn nhạc (segment). README ghi NATTEN tự cài trên macOS, phải cài tay trên Linux và Windows. |
| [CPJKU/madmom](https://github.com/CPJKU/madmom) | 1736 | 2024-08-25 **STALE** | 2019 | researcher không đọc được | README nêu macOS, Linux. |
| [aubio/aubio](https://github.com/aubio/aubio) | 3781 | 2026-04-10 | 0.4.9, 2019-02-27 | researcher không đọc được | README nêu macOS, Windows, Linux. Release cuối đã 7 năm. |
| [MTG/essentia](https://github.com/MTG/essentia) | 3795 | 2026-11-05 | 2.1 beta5, 2020-09-16 | AGPL-3.0 | README nêu macOS, Windows, Linux, Docker. |
| [emjjkk/beat-detection](https://github.com/emjjkk/beat-detection) | 21 | 2026-07-26 | — | — | Xuất beat/onset thành marker EDL cho DaVinci Resolve, Premiere, Final Cut ([search](https://github.com/emjjkk/beat-detection)). |

**Cắt theo beat và dựng tự động**

| Tên | Sao | Commit cuối | License | Nền tảng | Agent dùng thế nào |
|---|---|---|---|---|---|
| [blixvip/easyedit](https://github.com/blixvip/easyedit) | 168 | 2026-11-06 | MIT | Windows (`.cmd`), Linux, CUDA; có MCP | Một lệnh: chọn lời và bài hát, transcript từng từ, theo mặt, tìm drop, cắt theo beat. Render bằng composition HyperFrames: camera theo mặt, caption. |
| [Merserk/BeatSync-Engine](https://github.com/Merserk/BeatSync-Engine) | 78 | 2026-07-06 (v4, 2026-06-30) | AGPL-3.0 | App Windows portable | Dựng AMV/GMV/MV cắt theo beat từ 1 bài nhạc và nhiều video. |
| [bestagentkits/motion-video-skill](https://github.com/bestagentkits/motion-video-skill) | 136 | 2026-09-25 | MIT | `npx skills add bestagentkits/motion-video-skill` | Video motion graphic 1920×1080 30 fps cắt theo beat bằng HyperFrames (HTML + GSAP), có giọng AI, nhạc và SFX. |
| [devbret/av-sync](https://download.plaud.ai/devbret/av-sync) | chưa kiểm | — | — | — | librosa (onset, segment) + OpenCV (chuyển động) + FFmpeg. Xuất manifest JSON các quyết định timing. Researcher chỉ thấy bản mirror, chưa thấy repo GitHub. |
| [awesome-beat-sync-video-editors](https://github.com/for-he-s-loved/awesome-beat-sync-video-editors) | 2 | 2026-10-27 | — | — | Danh sách công cụ cắt theo beat và thư viện beat detection. |

**Framework render cho agent (text, zoom, overlay)**

| Tên | Sao | Commit cuối | Release | License | Agent dùng thế nào |
|---|---|---|---|---|---|
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 80160 | 2026-11-07 | v0.9.19, 2026-11-06 | Apache-2.0 | "Write HTML. Render video. Built for agents." Bạn chạy `npx hyperframes skills update` một lần rồi bảo agent dựng video. Skill `/media-use` lấy hoặc tạo nhạc, SFX, ảnh, icon, giọng đọc. README so sánh: HyperFrames dùng Apache 2.0, còn Remotion dùng "Source-available Remotion License". README nêu macOS, Windows, Linux, Docker. |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | 71323 | 2026-11-06 | v4.0.541, 2026-11-05 | Remotion License, source-available (theo [README HyperFrames](https://github.com/heygen-com/hyperframes)) | Dựng video bằng React. |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | 6489 | 2026-11-05 | — | researcher không đọc được | Agent Skill chính thức cho Claude Code, Codex, Cursor khi làm project Remotion. |
| [browser-use/video-use](https://github.com/browser-use/video-use) | 30663 | 2026-10-08 | — | MIT | "Edit videos with Claude Code. 100% open source." |
| [digitalsamba/claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit) | 2464 | 2026-11-06 | v0.25.0, 2026-11-05 | MIT | Claude Code viết script, tạo giọng đọc, nhạc, hình rồi render MP4. ElevenLabs lo TTS, nhạc, SFX. Cài Python bằng `uv`. README nêu macOS, Windows, Linux, Docker, MCP. |
| [video-db/Director](https://github.com/video-db/Director) | 1575 | 2026-01-23 | v0.1.1, 2024-12-03 | MIT | Framework agent cho video, có API. Commit đã thưa. |
| [HKUDS/VideoAgent](https://github.com/HKUDS/VideoAgent) | 2007 | 2026-07-22 | — | MIT | Framework agent hiểu và tạo video. |
| [Zulko/moviepy](https://github.com/Zulko/moviepy) | 15117 | 2026-08-26 | v2.2.1, 2025-05-21 | MIT | Thư viện Python dựng video. |
| [mifi/editly](https://github.com/mifi/editly) | 5588 | 2025-02-20 **STALE** | v0.15.0-rc.1, 2025-01-19 | MIT | Dựng video bằng file JSON khai báo, có CLI. |

**Caption theo từ**

| Tên | Sao | Commit cuối | License | Ghi chú |
|---|---|---|---|---|
| [m-bain/whisperX](https://github.com/m-bain/whisperX) | 25130 | 2026-10-22 | BSD-2-Clause | Timestamp từng từ. README nêu macOS, Windows, Linux. |
| [unconv/captacity](https://github.com/unconv/captacity) | 141 | 2024-06-07 **STALE** | MIT | Caption kiểu short, dùng OpenAI. |

**SFX, foley và nhạc**

| Tên | Sao | Commit cuối | License | Ghi chú |
|---|---|---|---|---|
| [hkchengrex/MMAudio](https://github.com/hkchengrex/MMAudio) | 2308 | 2026-02-23 | MIT (code) | Tạo âm thanh từ video. Weights release ngày 2026-02-21. README nhắc CUDA. Có demo Hugging Face, Colab, Replicate. |
| [QwenAudio/ThinkSound](https://github.com/QwenAudio/ThinkSound) | 1385 | 2026-03-24 | researcher không đọc được | Repo cũ `FunAudioLLM/ThinkSound` redirect về đây. Từ 2025-07-15, repo đưa dependency lên PyPI và có script `.bat` cho Windows. |
| [Tencent-Hunyuan/HunyuanVideo-Foley](https://github.com/Tencent-Hunyuan/HunyuanVideo-Foley) | 1093 | 2025-09-28 **STALE** | researcher không đọc được | "Professional-grade AI sound effect generation for video content creators". README nêu Linux, CUDA. |
| [ace-step/ACE-Step-1.5](https://github.com/ace-step/ACE-Step-1.5) | 14463 | 2026-08-29 (v0.1.8, 2026-05-18) | MIT | Tạo nhạc. Chỉnh được thời lượng, BPM, giọng/key, nhịp. Python 3.11–3.12. Khuyên CUDA, cũng chạy MPS (Apple Silicon), ROCm, CPU. Có API. |
| [ace-step/ACE-Step](https://github.com/ace-step/ACE-Step) | 5032 | 2026-02-15 | Apache-2.0 | Bản trước của ACE-Step. |
| [facebookresearch/audiocraft](https://github.com/facebookresearch/audiocraft) | 23832 | 2025-03-13 **STALE** | MIT (code) | MusicGen, AudioGen. |

- Web search tìm "auto whoosh placement" không ra repo nào. Kết quả gần nhất là các công cụ cắt theo beat và xuất marker ([emjjkk/beat-detection](https://github.com/emjjkk/beat-detection), [devbret/av-sync](https://download.plaud.ai/devbret/av-sync)).
- [KazKozDev/auto-vertical-reframe](https://github.com/KazKozDev/auto-vertical-reframe) ghi mức zoom từng cảnh trong log (ví dụ `zoom=1.05`). Đây là punch-in theo chủ thể đơn giản.

### Inferences
- Theo mô tả skill flow-chain-video, pipeline của người dùng đã ghép crossfade và đo điểm nối. Agent có thể lấy timestamp điểm nối, rồi đặt whoosh hoặc SFX bằng ffmpeg (`adelay` + `amix`). Cách này không cần repo mới.
- Agent nên tạo nhạc bằng ACE-Step-1.5 với BPM cố định. Khi đã biết BPM, agent tính trước lưới beat và căn tâm crossfade vào beat gần nhất, khỏi phải chạy beat detection. Nếu dùng nhạc có sẵn, beat_this hoặc librosa lấy được lưới beat.
- Với video động vật không lời, âm thanh là kênh duy nhất ngoài hình. MMAudio hoặc ThinkSound tạo được tiếng động khớp hình, ví dụ tiếng nước, tiếng cánh. README của MMAudio chỉ nhắc CUDA, nên tool có thể chậm trên Mac (chưa kiểm).
- Punch-in và text trên màn hình làm được bằng ffmpeg `zoompan` hoặc HyperFrames/Remotion. HyperFrames dùng Apache-2.0. Remotion dùng license source-available, nên bạn phải đọc điều khoản trước khi dùng thương mại.
- Clip nhảy TikTok hợp với easyedit và beat_this: cắt hoặc đổi trang phục đúng beat/downbeat. Trên Windows, BeatSync-Engine dùng được ngay.
- Script chạy được trên cả Windows nên dùng librosa, beat_this, ffmpeg, PySceneDetect (đều thuần Python hoặc CLI đa nền tảng).

### Gaps
- Researcher không tìm thấy repo tự đặt SFX vào điểm chuyển cảnh.
- Researcher không tìm thấy công cụ mở nào chọn nhạc trending theo nền tảng.
- Researcher chưa kiểm license weights của MMAudio, ThinkSound, HunyuanVideo-Foley, audiocraft. Các license này có thể cấm dùng thương mại.
- Researcher chưa kiểm MMAudio và ThinkSound có chạy được trên Apple Silicon (MPS) hay không.
- Researcher không tìm thấy repo nào tự chèn B-roll cho video không lời. openshorts dùng B-roll đi kèm AI actor và voiceover. README của Anil-matcha trỏ sang repo [AI-B-roll](https://github.com/Anil-matcha/AI-B-roll), researcher chưa kiểm cách repo này chèn B-roll.

## 4. Mô hình "viral score" hoặc dự đoán engagement: mã nguồn mở hay API, độ tin cậy ra sao?

### Takeaway
Không có mô hình mở nào đóng gói sẵn để chấm "viral". Kết quả nghiên cứu tốt nhất là cuộc thi VQualA 2025 trên dữ liệu Snapchat. Mô hình thắng giải đạt SROCC 0,707 khi dự đoán tỉ lệ người xem quá 5 giây. Mức này chỉ đủ để xếp hạng tương đối số lượng lớn video, không đủ để quyết định cho 1 video. Opus Clip có virality score 0–99 nhưng không công bố số liệu kiểm chứng.

### Cited Findings
- Bộ dữ liệu SnapUGC có khoảng 90.000 video UGC ngắn của Snapchat. Nhóm tác giả đo engagement bằng normalized average watch percentage (NAWP) và engagement continuation rate (ECR), không dùng view hay like thô. Code ở [dasongli1/SnapUGC_Engagement](https://github.com/dasongli1/SnapUGC_Engagement) — [arXiv 2410.00289](https://arxiv.org/abs/2410.00289).
- Dữ liệu cuộc thi gồm 120.651 video Snapchat Spotlight dài 5–60 giây. Mỗi video có trên 2000 lượt xem — [review của challenge report](https://www.themoonlight.io/review/vquala-2025-challenge-on-engagement-prediction-for-short-videos-methods-and-results).
- ECR là xác suất thời gian xem vượt 5 giây — [arXiv 2508.02516](https://arxiv.org/html/2508.02516v2).
- Mô hình thắng giải ghép VideoLLaMA2 (khung hình + metadata + âm thanh) và Qwen2.5-VL (khung hình + metadata). Trên tập test, bản ghép đạt final score 0,710, SROCC 0,707, PLCC 0,714. VideoLLaMA2 riêng lẻ đạt 0,695, Qwen2.5-VL đạt 0,664, baseline Li24 đạt 0,660. Mô hình chỉ đo chất lượng hình (MinimalisticVQA) đạt 0,585. Các đội khác đạt 0,698 (IMCL-DAMO), 0,680, 0,667, 0,667 — [arXiv 2508.02516](https://arxiv.org/html/2508.02516v2).
- Nhóm tác giả viết rằng dự đoán ECR khi chưa có dữ liệu xem (cold start) "remains a challenging task". Họ cũng thấy mô hình có âm thanh luôn vượt mô hình không âm thanh — [arXiv 2508.02516](https://arxiv.org/abs/2508.02516). Bài có 2 chỗ lệch: phần chữ ghi điểm 0,714, bảng ghi 0,710; quy mô dữ liệu ghi 90.000 ở một chỗ, 114.651 ở chỗ khác — [arXiv HTML v2](https://arxiv.org/html/2508.02516v2).
- Code của mô hình thắng giải: [sunwei925/LMM-EVQA](https://github.com/sunwei925/LMM-EVQA). Repo có 23 sao, commit cuối 2025-08-08 (**STALE**). Repo SnapUGC_Engagement có 25 sao, commit cuối 2025-05-29 (**STALE**).
- Trợ giúp của Opus Clip mô tả virality score là ước lượng 0–99 về khả năng clip được tương tác và chia sẻ. Chỉ gói Pro và Starter thấy điểm này — [help.opus.pro](https://help.opus.pro/docs/article/virality-score). Researcher không tìm thấy số liệu kiểm chứng công khai.
- BigVU thử Opus Clip 14 ngày với hơn 50 clip. Họ bỏ khoảng 40% số clip và cho rằng virality score có thể gây hiểu nhầm — [BigVU](https://bigvu.tv/blog/opus-clip-tested-2026-where-ai-wins-40-percent-discard/). Researcher chỉ đọc được snippet, chưa xem phương pháp.
- Các công cụ mở "xếp hạng viral" thực chất gọi LLM chấm transcript: [AI-Youtube-Shorts-Generator](https://github.com/Anil-matcha/AI-Youtube-Shorts-Generator), [clippyme](https://github.com/fralapo/clippyme) (Gemini), [openwarehq/fableclip](https://github.com/openwarehq/fableclip) ("ranked by an explained score", 3 sao).
- [facebookresearch/tribev2](https://github.com/facebookresearch/tribev2) (3343 sao, commit 2026-06-23) là "foundation model of vision, audition, and language for in-silico neuroscience". README không mô tả nó là mô hình dự đoán engagement.

### Inferences
- ECR (tỉ lệ người xem quá 5 giây) là thước đo học thuật gần nhất với độ mạnh của hook. SROCC 0,7 nghĩa là mô hình đúng xu hướng trên hàng nghìn video, nhưng sai nhiều với từng video.
- Người dùng chỉ đăng vài video mỗi tuần. Với số lượng này, số liệu thật của nền tảng đáng tin hơn mọi điểm dự đoán. Ví dụ: tỉ lệ engaged views / views trên YouTube, thời gian xem trung bình trên Facebook/Instagram.
- Mô hình được huấn luyện trên Snapchat có thể không áp được cho TikTok, YouTube hay Facebook.

### Gaps
- Researcher không tìm thấy nghiên cứu độc lập nào kiểm chứng virality score của Opus Clip, Vizard hay Klap.
- Researcher không tìm thấy mô hình mở nào huấn luyện trên dữ liệu retention của TikTok hoặc YouTube Shorts.
- Researcher không thu được bằng chứng Reddit có link cụ thể về độ chính xác của virality score.

## 5. Hướng dẫn có bằng chứng về hook và retention cho TikTok, YouTube Shorts, Facebook Reels (2025–2026)

### Takeaway
Nguồn chính thức thống nhất ở 2 điểm. Thứ nhất, 1–3 giây đầu quyết định người xem ở lại hay lướt đi. Thứ hai, nền tảng đo việc xem tiếp sau vài giây đầu, xem hết và chia sẻ. Với việc dùng lại nội dung, quy định về tính nguyên bản (Meta 2026, YouTube 2025) quan trọng hơn mẹo làm hook.

### Cited Findings
- **YouTube:** Từ 2025-03-31, YouTube đếm view Shorts mỗi lần video bắt đầu phát hoặc phát lại, không cần thời gian xem tối thiểu. Chỉ số cũ đổi tên thành "Engaged views", đếm số lần người xem ở lại quá vài giây đầu (không tính vòng lặp). Điều kiện YPP và doanh thu Shorts dựa trên engaged views — [YouTube Help: How engagement metrics are counted](https://support.google.com/youtube/answer/2991785?hl=en) (theo tóm tắt search, researcher chưa mở trang).
- **YouTube:** Một trang Help mới hơn ghi rằng từ tháng 8/2026 (một trang ghi ngày 24/8/2026), YouTube đếm view ngay khi video bắt đầu phát ở mọi định dạng. Thu nhập YPP vẫn dựa trên "engaged Shorts views" — [YouTube Help](https://support.google.com/youtube/answer/12220281?hl=en&co=GENIE.Platform%3DDesktop) (theo tóm tắt search, researcher chưa xác định đúng trang).
- **YouTube:** YouTube không công bố ngưỡng chuẩn cho chỉ số "Viewed vs. swiped away". Các mức như "trên 70% là tốt" chỉ đến từ bên thứ ba — [Creator Essentials](https://www.creatoressentials.com/glossary/viewed-vs-swiped-away/), [Bytecap](https://www.bytecap.io/research/youtube-shorts-retention-benchmarks).
- **YouTube:** Ngày 2025-07-15, YouTube đổi tên quy định "repetitious content" thành "inauthentic content" trong YPP. Báo chí đọc thay đổi này là nhắm vào video AI sản xuất hàng loạt. Rene Ritchie của YouTube gọi đây là cập nhật nhỏ của quy định cũ — [Plagiarism Today](https://www.plagiarismtoday.com/2025/07/08/youtube-targets-inauthentic-content/), [Digiday](https://digiday.com/media/youtubes-ai-slop-crackdown-has-creators-concerned-marketers-cheering).
- **TikTok:** Một tập của TikTok Academy định nghĩa hook là 1–3 giây mở đầu, quyết định quảng cáo được xem hay bị lướt qua. Tập này dành cho nhà quảng cáo — [TikTok Academy](https://www.tiktokacademy.com/sl/1951c44e).
- **TikTok:** Báo cáo của TikTok và CreatorIQ cho thấy xuất hiện người trong vài giây đầu làm "hooking power" tăng 50%. Đây là nghiên cứu quảng cáo — [Marketing Brew, 2023-12-18](https://marketingbrew.com/stories/2023/12/18/pay-attention-to-me-report-shares-brand-tips-for-catching-users-interest-on-tiktok).
- **Instagram:** Adam Mosseri viết rằng các dự đoán quan trọng nhất cho Reels là khả năng người xem chia sẻ lại, xem hết, bấm like và mở trang âm thanh. Instagram giảm hiển thị Reels độ phân giải thấp, có watermark, tắt tiếng, có viền, chủ yếu là chữ, hoặc đăng lại từ app khác — [Instagram Ranking Explained](https://about.instagram.com/blog/announcements/instagram-ranking-explained).
- **Instagram:** Reel mới hiển thị trước cho một nhóm nhỏ người chưa theo dõi. Reel làm tốt thì Instagram mở rộng dần, không phụ thuộc số follower — [Instagram Creators blog](https://creators.instagram.com/blog/helping-creators-of-all-sizes-break-through).
- **Facebook (3/2026):** Meta coi nội dung do chủ Page tự quay hoặc tự sản xuất là nguyên bản. Reaction, ghép nhiều clip, hay thuyết minh lại thứ đã có trên màn hình mà không thêm gì đáng kể đều bị coi là không nguyên bản và có thể bị giảm phân phối. Chỉnh nhỏ như thêm viền, caption hay đổi tốc độ cũng không đủ. Tài khoản dùng lại nội dung nhiều lần mất quyền kiếm tiền một thời gian và bị giảm phân phối mọi bài — [About Meta: Rewarding Original Creators on Facebook](https://about.fb.com/news/2026/03/rewarding-original-creators-on-facebook/).
- **Facebook:** Meta nói lượt xem và thời gian xem Reels nguyên bản tăng khoảng gấp đôi trong nửa cuối 2025 so với cùng kỳ 2024. Đây là số liệu do Meta tự công bố — [About Meta](https://about.fb.com/news/2026/03/rewarding-original-creators-on-facebook/). Quy định trước đó: [Combating unoriginal content](https://creators.facebook.com/blog/combating-unoriginal-content).

### Inferences
- Chỉ số để đo hook của video động vật là tỉ lệ engaged views / views trên YouTube Shorts. Tỉ lệ này tương ứng với ECR trong nghiên cứu ở mục 4.
- Video động vật làm từ clip AI theo cùng một khuôn có rủi ro bị xếp vào nhóm "inauthentic/mass-produced" khi xin YPP. Mỗi video nên có kịch bản và cách mở đầu riêng.
- Clip aidancing lấy chuyển động từ clip TikTok của người khác. Nếu đăng chéo lên Facebook hoặc Instagram, clip có thể bị coi là không nguyên bản theo quy định của Meta. Việc đổi mặt và quần áo có đủ "thêm giá trị" hay không thì chưa rõ.
- Instagram giảm hiển thị video có watermark. Agent không được đăng bản tải từ TikTok còn watermark lên Reels.
- Video không lời phải dựa vào âm thanh và chuyển động để giữ người xem. Bằng chứng gián tiếp: mô hình dự đoán có âm thanh tốt hơn (mục 4), Instagram tính cả lượt mở trang âm thanh.

### Gaps
- Researcher không đọc được trang chính thức của TikTok về cách đề xuất nội dung. Trang support.tiktok.com redirect sang trang rỗng.
- Researcher không tìm thấy số liệu chính thức của TikTok về độ dài hook hay tỉ lệ xem hết cho nội dung tự nhiên (không phải quảng cáo).
- Researcher chưa kiểm chứng phát biểu năm 2025 của Mosseri về "sends per reach".
- Researcher chưa thu thập dữ liệu creator đáng tin trên Reddit (r/NewTubers, r/TikTokhelp).
- Researcher chưa mở trực tiếp 2 trang YouTube Help nói trên; các chi tiết lấy từ tóm tắt search.
