# Agent-driven automation of professional video editors (After Effects, Premiere Pro, DaVinci Resolve, CapCut, Final Cut Pro) — state as of 2026-11-07

Method note (applies to every star count and date below): I took star counts, last-push dates (`pushed_at`, the last push to any branch, which approximates the last commit), and SPDX license IDs from the public GitHub search/repos API on 2026-11-07. I cite each repo by its URL. The API rate-limited me partway through. For repos marked "(release: …)" I also read the latest GitHub release. Repos with no push since before 2025-11-07 are marked **STALE**. Where a README was read, its content is cited to the repo URL as well.

## Q1. Which MCP servers or agent bridges exist for After Effects and Premiere Pro? Do they work on macOS? Which are actively maintained in 2025–2026?

### Takeaway
There are many community MCP bridges for both apps, all unofficial. Most are file-polling bridges into ExtendScript via a CEP or ScriptUI panel. The most mature are hetpatel-11/Adobe_Premiere_Pro_MCP (macOS-validated, 283 tools, export via Media Encoder) and leancoderkavy/premiere-pro-mcp (Win+mac, UXP WebSocket or CEP) for Premiere. For After Effects they are Dakkshin/after-effects-mcp (most stars, slowing) and kumoproductions/mcp-aftereffects (Win+mac, AE 2024–2026). Adobe's own agent story is a Firefly AI Assistant beta and a remote "Adobe for creativity" Claude connector. Neither drives a local Premiere/AE timeline in a documented way. Adobe MAX 2026 (Nov 10–12) has not happened yet.

### Cited Findings

**After Effects — MCP servers and bridges**
- **Dakkshin/after-effects-mcp**: 862 stars, last push 2026-04-01, MIT, no GitHub releases. — [GitHub](https://github.com/Dakkshin/after-effects-mcp)
  - Connection: a Node MCP server plus an ExtendScript panel script `mcp-bridge-auto.jsx` that you open via Window menu. The panel "will automatically check for commands every few seconds" (polling). `npm run install-bridge` copies the scripts into the AE install. — [GitHub](https://github.com/Dakkshin/after-effects-mcp)
  - Supports "Adobe After Effects (2022 or later)" and Node 14+. The README does not state OS support; its config example uses a Windows path. — [GitHub](https://github.com/Dakkshin/after-effects-mcp)
  - Tools: create-composition, run-script, get-results, setLayerKeyframe, setLayerExpression, setLayerProperties, batchSetLayerProperties, getLayerInfo, createCamera, createNullObject, duplicateLayer, deleteLayer, setLayerMask. Layer types: text, shape, solid/adjustment, camera, null. The README does not mention effects management or rendering. — [GitHub](https://github.com/Dakkshin/after-effects-mcp)
  - Maturity signals: 31 commits, 9 open issues, 17 open PRs (backlog suggests slow maintenance). — [GitHub](https://github.com/Dakkshin/after-effects-mcp)
  - Fork: TheLlamainator/after-effects-mcp has 24 stars, last push 2026-03-15, MIT, and the same description. — [GitHub](https://github.com/TheLlamainator/after-effects-mcp)
- **kumoproductions/mcp-aftereffects**: 166 stars, last push 2026-10-23, MIT, published on npm as `@kumoproductions/mcp-aftereffects`. — [GitHub](https://github.com/kumoproductions/mcp-aftereffects)
  - Supports Windows and macOS, "Adobe After Effects 2024 / 2025 / 2026", and Node 24+. It auto-detects 2026 → 2025 → 2024. — [GitHub](https://github.com/kumoproductions/mcp-aftereffects)
  - Connection: "file IPC". An optional resident agent installs a startup script into AE's `Scripts/Startup` and serves per-instance mailboxes. macOS needs Automation permission (and Accessibility for dialog detection). "Allow Scripts to Write Files and Access Network" must be ON. — [GitHub](https://github.com/kumoproductions/mcp-aftereffects)
  - Operations: inspect the project/comps/layers, edit layers and properties, keyframes, effects, masks, text, shapes, expressions, save/backup, and render single frames for preview. No render queue or aerender is mentioned. Arbitrary ExtendScript is off by default (`AE_MCP_ENABLE_EVAL`). A read-only mode exists. — [GitHub](https://github.com/kumoproductions/mcp-aftereffects)
  - Limits: modal dialogs block all scripts (`DIALOG_OPEN`). After a crash, the Safe Mode dialog blocks new instances. Each worker instance needs "a few gigabytes of memory". Dialog handling was verified on AE 26.5 / macOS 26.4. — [GitHub](https://github.com/kumoproductions/mcp-aftereffects)
- Other active AE MCP servers (metadata from GitHub search; READMEs not read in depth):
  - JUNKDOGE-JOE/after-effects-mcp: 96 stars, 2026-10-22, MIT. "Chat in a CEP panel or connect external agents." — [GitHub](https://github.com/JUNKDOGE-JOE/after-effects-mcp)
  - solomondivyananth/aftereffects-mcp: 83 stars, 2026-10-05, MIT. Reads, views and edits a live AE project. — [GitHub](https://github.com/solomondivyananth/aftereffects-mcp)
  - Engine-Room-Games/after-effects-mcp: 47 stars, 2026-11-01, MIT. Layers and keyframes from an animation description. — [GitHub](https://github.com/Engine-Room-Games/after-effects-mcp)
  - ishu86/after-effects-mcp: 46 stars, 2026-10-08, MIT, "70+ tools". — [GitHub](https://github.com/ishu86/after-effects-mcp)
  - HeroicSwan/after-effects-mcp: 46 stars, 2026-07-20, MIT. Motion graphics, editorial planning and QA. — [GitHub](https://github.com/HeroicSwan/after-effects-mcp)
  - a-y-ibrahim/after-effects-mcp: 29 stars, 2026-10-10, MIT. ExtendScript execution. — [GitHub](https://github.com/a-y-ibrahim/after-effects-mcp)
  - Arman-Luthra/aftr: 27 stars, 2026-07-13, MIT. "Puppeteer for After Effects. Use AE with Claude Code." — [GitHub](https://github.com/Arman-Luthra/aftr)
  - aedev-tools/adobe-agent-skills: 116 stars, 2026-03-02, Apache-2.0. Agent skills that generate AE automation scripts. — [GitHub](https://github.com/aedev-tools/adobe-agent-skills)
  - GUNMIN-KIM/after-effects-codex-agent: 23 stars, 2026-11-06, no license. Codex rules for an AE MCP runtime. — [GitHub](https://github.com/GUNMIN-KIM/after-effects-codex-agent)
  - machinepulse-ai/shotwright: 12 stars, 2026-10-31, MIT. An agent operates real AE "inside a Windows container". — [GitHub](https://github.com/machinepulse-ai/shotwright)
  - tiansuo-114/AE-agent: 65 stars, 2026-07-20, no license. — [GitHub](https://github.com/tiansuo-114/AE-agent)
  - AJSMonty/adobe-mcp: 8 stars, 2026-09-24, MIT. Multi-app: AE, Photoshop, Illustrator, Premiere, Character Animator. — [GitHub](https://github.com/AJSMonty/adobe-mcp)
- AE scripting platform status: an Adobe developer-forum post says AE beta build 27.0.0.63 is adding UXP plugin support. A private beta precedes a public beta at MAX. Adobe has an After Effects UXP docs page. — [CC Developer forum](https://forums.creativeclouddeveloper.com/tag/after-effects/200.md); [Adobe AE UXP](https://developer.adobe.com/after-effects/uxp/)
- "No-AE" alternatives showing up in "after effects claude" searches (code-based motion graphics, not AE): howseen-ai/claude-motion-design (786 stars, 2026-10-04, MIT, "HTML + Playwright + ffmpeg. No After Effects"), and charlie947/motion-graphics-skills (583 stars, 2026-10-11, MIT). — [GitHub](https://github.com/howseen-ai/claude-motion-design); [GitHub](https://github.com/charlie947/motion-graphics-skills)

**Premiere Pro — MCP servers and bridges**
- **hetpatel-11/Adobe_Premiere_Pro_MCP**: 828 stars, last push 2026-11-02, MIT. — [GitHub](https://github.com/hetpatel-11/Adobe_Premiere_Pro_MCP)
  - "CEP is the supported production bridge; UXP remains experimental." The Node server generates ExtendScript and writes it to `/tmp/premiere-mcp-bridge`. A CEP panel polls that directory and runs `CSInterface.evalScript()`. — [GitHub](https://github.com/hetpatel-11/Adobe_Premiere_Pro_MCP)
  - Supports Premiere Pro 2020+ (actively tested on 26.0) and Node 20+. **macOS is the validated platform.** Windows has only installer/config smoke checks in CI. — [GitHub](https://github.com/hetpatel-11/Adobe_Premiere_Pro_MCP)
  - 283 catalog tools. Only 5 are advertised by default (`search_tools`, `get_tool_schema`, `invoke_tool`, …); `PREMIERE_MCP_TOOLSET=full` lists all. — [GitHub](https://github.com/hetpatel-11/Adobe_Premiere_Pro_MCP)
  - Ops: `create_sequence`, `create_sequence_from_preset`, `create_sequence_from_clips`, `add_to_timeline(_batch)`, `insert_from_source`, `overwrite_from_source`, `add_transition`, `batch_add_transitions` (example: "Add cross dissolves to every cut on video track 1"), `apply_effect`, `set_effect_property`, `add_keyframe`, `set_keyframe_interpolation`. — [GitHub](https://github.com/hetpatel-11/Adobe_Premiere_Pro_MCP)
  - Export: `export_sequence` and `add_to_render_queue` via Adobe Media Encoder, plus `export_as_fcp_xml`, `export_aaf`, `export_omf`, `export_frame`. MOGRT: `import_mogrt`, `add_text_overlay`. — [GitHub](https://github.com/hetpatel-11/Adobe_Premiere_Pro_MCP)
  - Limits: "Premiere 26 has no scripting API to remove effects". `read_sequence_captions` often can't read caption text. `import_ae_comps` "failed in testing and could wedge the bridge". The `.zxp` is self-signed. Telemetry is on by default. The README says it "is not magic". — [GitHub](https://github.com/hetpatel-11/Adobe_Premiere_Pro_MCP)
- **leancoderkavy/premiere-pro-mcp**: 492 stars, last push 2026-11-06, MIT, latest version 1.29.0. — [GitHub](https://github.com/leancoderkavy/premiere-pro-mcp)
  - Two transports. (a) A CEP file-IPC bridge that "works across macOS and Windows without network sockets". (b) A UXP bridge over an authenticated WebSocket on `127.0.0.1:7777` (`PREMIERE_UXP_TOKEN` ≥16 chars), preferred on Premiere 25.6+. — [GitHub](https://github.com/leancoderkavy/premiere-pro-mcp)
  - Supports "Windows and macOS, Premiere Pro 2020-2026" and Node 20.19+. CI has no Adobe host. — [GitHub](https://github.com/leancoderkavy/premiere-pro-mcp)
  - 447 core tools across 68 modules, plus 98 UXP-gated tools. Timeline insert/overwrite, `create_sequence`, transitions, effect/keyframe readback, and AME export control. A "Match Source preset for vertical projects" exists. — [GitHub](https://github.com/leancoderkavy/premiere-pro-mcp)
  - Limits: **clip speed/direction cannot be set** (`speed_change`, `set_clip_speed_qe` and `reverse_clip` are unavailable). `add_text_overlay` stops because no raw-text-to-caption API is exposed. "Premiere Pro 26.3 … silently ignore[s]" some QE structural edits, so the tools verify and return errors. — [GitHub](https://github.com/leancoderkavy/premiere-pro-mcp)
- ayushozha/AdobePremiereProMCP: 138 stars, 2026-10-05, MIT. — [GitHub](https://github.com/ayushozha/AdobePremiereProMCP)
- antipaster/Adobe-Premiere-Pro-MCP: 44 stars, 2026-10-29, MIT, "170+ editing tools". — [GitHub](https://github.com/antipaster/Adobe-Premiere-Pro-MCP)
- CaYatur/PremiereProMCP: 6 stars, 2026-10-15, MIT, "UXP-first". — [GitHub](https://github.com/CaYatur/PremiereProMCP)
- sylphiette269/premiere-mcp-editor-cn: 8 stars, 2026-03-21, MIT. Chinese-language rough-cut assistant for Claude Code/Codex. — [GitHub](https://github.com/sylphiette269/premiere-mcp-editor-cn)
- **mikechambers/adb-mcp**: 740 stars, last push 2026-07-08, MIT (release v0.85.4, 2025-08-07). Proof-of-concept for Photoshop and Premiere, not endorsed by Adobe. Its Premiere agent is more limited than its Photoshop one "due to current limitations of the Premiere plugin API". It routes through a proxy server because UXP plugins cannot listen on a socket. — [GitHub](https://github.com/mikechambers/adb-mcp); [awesome.ecosyste.ms summary](https://awesome.ecosyste.ms/projects/github.com%2Fmikechambers%2Fadb-mcp)
- nepfaff/premiere-pro-mcp: 5 stars, created 2026-02-09, last push 2026-02-10, no license. A single execute-script tool over the Premiere UXP API. It needs Premiere 25.3+ and the UXP Developer Tool, and uses a JSON-file bridge. Effectively a one-off. — [lobehub listing](https://lobehub.com/mcp/nepfaff-premiere-pro-mcp); [GitHub](https://github.com/nepfaff/premiere-pro-mcp)
- **STALE** (no push in 12+ months): jordanl61/premiere-pro-mcp-server (14 stars, 2025-07-08) and stewberticus/adobe-mcp (11 stars, 2025-07-08). — [GitHub](https://github.com/jordanl61/premiere-pro-mcp-server); [GitHub](https://github.com/stewberticus/adobe-mcp)

**Premiere scripting platform (official)**
- UXP in Premiere: first public beta in v25.2.0 ("Release Date: December 4, 2024"). v25.6.0 is the "Official Release of UXP extensibility in Premiere Pro" (the page gives no date). — [Adobe UXP changelog](https://developer.adobe.com/premiere-pro/uxp/changelog/)
- UXP API additions: v26.3.0 added `Project.createSequenceWithPresetPath`, `EncoderManager.launchEncoder`/`startBatchEncode`, and `ProjectConverter.exportAAF`. v26.5.0 added `C2PAService`. v27.0.0 added `MogrtText`/`MogrtComment` for editing MOGRT parameters. The changelog lists no explicit timeline insert/overwrite or new transition/effect APIs; `AddTransitionOptions` appears in v26.5.0 docs. — [Adobe UXP changelog](https://developer.adobe.com/premiere-pro/uxp/changelog/)
- The Premiere UXP DOM covers "sequences, tracks, clips, markers, project items, and application settings". — [Adobe Premiere UXP](https://developer.adobe.com/premiere-pro/uxp/)
- Adobe staff said no removal of CEP/ExtendScript from Premiere "has been planned or scheduled" (forum thread). — [CC Developer forum](https://forums.creativeclouddeveloper.com/t/uxp-api-parity-for-mogrt-parameter-control-current-extendscript-support-status/12131)
- Types-for-Adobe (TypeScript types for AE/Premiere ExtendScript): 648 stars, 2026-05-18, MIT. — [GitHub](https://github.com/docsforadobe/Types-for-Adobe)

**Adobe first-party agent offerings**
- Anthropic launched "Adobe for creativity" as one of nine creative connectors on 2026-04-28. It draws "from 50+ tools across Creative Cloud apps including Photoshop, Premiere, Express, and more". After Effects is not mentioned. — [Anthropic](https://www.anthropic.com/news/claude-for-creative-work)
- Conflicting view: a hands-on test (2026-05-01) says the connector "operates at Adobe Express level, not Photoshop or Premiere". It says Premiere timeline control and color grading are not reachable. A 9:16 image reframe took 3 min 14 s with an off-center subject. — [MindStudio](https://www.mindstudio.ai/blog/claude-mcp-adobe-vs-photoshop-premiere-what-it-does)
- A community guide lists the remote MCP URL `https://adobe-creativity.adobe.io/mcp` (not verified against an Adobe source). — [skillsplayground](https://skillsplayground.com/connectors/adobe-creativity/)
- Firefly AI Assistant: reported public beta on 2026-06-18 in Premiere, Photoshop, Illustrator, InDesign and Frame.io. After Effects is reportedly in private beta. In Premiere it can reportedly sequence rough cuts from a brief. These come from secondary news snippets; I could not fetch the primary article (403). — [The Next Web](https://thenextweb.com/news/adobe-firefly-ai-assistant-creative-cloud-agentic-workflows); [themonexus](https://themonexus.com/articles/2026-06-18-adobe-creative-cloud-agentic-ai-firefly); [WinBuzzer](https://winbuzzer.com/2026/06/19/adobe-opens-creative-cloud-ai-assistant-public-beta-xcxwbn/)
- Adobe MAX 2026 runs November 10–12 in Miami Beach, after this research date. — [RedShark News](https://www.redsharknews.com/adobe-max-2026-preview-miami-beach?hs_amp=true)

### Inferences
- macOS: hetpatel-11 (macOS-validated) and kumoproductions (Win+mac, verified on macOS 26.4) are the safest picks. leancoderkavy claims Win+mac, but its README itself says "Live installation in Premiere Pro still requires host verification". For scripts that must also run on Windows, kumoproductions (AE) and leancoderkavy (Premiere) are the explicit cross-platform options.
- All Adobe bridges need the app running with a GUI and a panel open (or a startup script). None is headless editing. Rendering goes through Media Encoder (Premiere) or single-frame preview (kumo AE). AE batch rendering is better done with aerender/nexrender (Q3).
- For the user's animal videos (per-clip speed 1.4 + crossfades), Premiere MCPs can add cross dissolves. leancoderkavy explicitly cannot set clip speed, so per-clip speed must be baked in with ffmpeg first. AE is overkill for crossfade stitching. It is only useful if the user wants motion-graphics overlays.
- Adobe's own connector does not, on current evidence, give Claude Code timeline control over a local Premiere project.

### Gaps
- I could not read the README of most smaller AE/Premiere MCPs (JUNKDOGE-JOE, ishu86, Engine-Room-Games, antipaster, ayushozha). Their OS support and tool lists are unverified beyond the GitHub descriptions.
- Dakkshin/after-effects-mcp does not state macOS support explicitly. I found no confirmed macOS user report for it.
- The exact date of Premiere 25.6 (UXP GA) is not on Adobe's changelog page.
- I could not verify Adobe's official Premiere coverage for "Adobe for creativity" from Adobe's developer docs.

## Q2. What exists for DaVinci Resolve (free vs Studio) and for CapCut (draft-file generators)?

### Takeaway
Resolve has the strongest bridge: samuelgursky/davinci-resolve-mcp (~4k stars, v4.19.3 on 2026-11-06). Resolve Studio 21.1 (September 2026) also ships a native MCP server for Claude/Claude Code/Codex. External scripting is Studio-only, and since 21.1 Python scripting also moved to Studio. Free users are left with Lua-console bridges or FCPXML. The Resolve API has no add-transition call. For CapCut, the ecosystem is large and Chinese-led: pyJianYingDraft (4.8k stars), VectCutAPI (2.4k, has MCP), capcut-mate (2.1k), capcut-cli (1.1k) and pyCapCut (737). All of them **generate drafts**. Final export is manual in the CapCut app, except Windows-only UI automation for old JianYing ≤6 and paid or closed cloud renders.

### Cited Findings

**DaVinci Resolve — editions and scripting**
- Free edition (older): "external scripts are not supported. Only scripts entered into the Console window"; on Studio, "Local" lets local external scripts control Resolve (Blackmagic forum, Resolve 16 era). — [Blackmagic forum](https://forum.blackmagicdesign.com/viewtopic.php?p=670352)
- Resolve 21.1 (Puget, 2026-09-10) quotes Blackmagic: "We have moved the ability to script in Python to the Studio version". Puget says "Blackmagic has entirely removed scripting support from the free edition" and "there are no simple workarounds". — [Puget Systems](https://www.pugetsystems.com/blog/2026/09/10/how-davinci-resolve-free-v21-1-scripting-changes-affect-puget-bench/)
  - Partly contradicted by Digital Production (2026-09-08): "The scripting API stays available from the console in the free edition. Workflow Integrations, the native UIManager and external scripting require Studio." — [Digital Production](https://digitalproduction.com/2026/09/08/resolve-21-1-adds-mcp-and-finally-gets-presets/)
  - emircbngl's README: "since Resolve 21.1, Python scripting (and Resolve's own MCP server) are Studio-only". Its Lua bridge is "written for 21.1's restricted Lua". — [GitHub](https://github.com/emircbngl/davinci-resolve-mcp-free)
- **Native MCP in Resolve Studio 21.1**: "Resolve Studio 21.1 can connect to Claude, Claude Code and ChatGPT Codex". You set it up via File > Setup AI Assistants. Uses include project analysis, media organisation, settings changes and batch rendering. Blackmagic's example: cut a long clip into a 3-minute highlight, remove edits under 1 s, render H.265. 21.1 also adds 20 new scripting APIs and drops Python 2. Studio costs €305. — [Digital Production](https://digitalproduction.com/2026/09/08/resolve-21-1-adds-mcp-and-finally-gets-presets/); [YMCinema](https://ymcinema.com/2026/09/17/davinci-resolve-21-1-mcp-ai-assistants-control-edit/); [Motion Media](https://www.motionmedia.com/mm-blog/davinci-resolve-21-1-update-new-features)
  - Claim from a competing project: Resolve's native server exposes a single tool, `run_script_unsafe` (arbitrary Python). This is unverified vendor-competitor marketing. — [PyPI davinci-mcp](https://pypi.org/project/davinci-mcp/1.0.2/)
  - 21.1 system requirements on macOS: macOS 15 Sequoia+ on Apple Silicon, 8 GB RAM (16 GB with Fusion). 21.1 projects are not openable in 20.3. — [Digital Production](https://digitalproduction.com/2026/09/08/resolve-21-1-adds-mcp-and-finally-gets-presets/)
- Resolve scripting API (community mirror of the official README): no `AddTransition` or any transition method. Timeline building: `CreateEmptyTimeline`, `AppendToTimeline([{clipInfo}])` with `mediaPoolItem`/`startFrame`/`endFrame`, `CreateTimelineFromClips`, `ImportTimelineFromFile`. Render: `SetRenderSettings`, `AddRenderJob`, `StartRendering`, `LoadRenderPreset`. Fusion comps: `AddFusionComp`/`ImportFusionComp`. No general keyframe API. The mirror warns it may be outdated. — [DaVinciResolve-API-Docs mirror](https://deric.github.io/DaVinciResolve-API-Docs/)
- API-imported timelines: a forum user reports clips imported through the API arrive unlinked from the Media Pool (unlike UI import). A Reddit user reports FCPXML import keeps transitions/effects but clips arrive unlinked. — [Blackmagic forum](https://forum.blackmagicdesign.com/viewtopic.php?p=1151748); [r/davinciresolve mirror](https://reddit.birdcat.cafe/r/davinciresolve/comments/1kz6oh4/clips_not_autolinking_when_importing_aaf_otio)

**DaVinci Resolve — MCP servers and libraries**
- **samuelgursky/davinci-resolve-mcp**: 3,972 stars, last push 2026-11-06, MIT, Python (release v4.19.3, 2026-11-06). — [GitHub](https://github.com/samuelgursky/davinci-resolve-mcp)
  - Requires Resolve 18.5+ (baseline 19.1.3). Tested on 19.1.3, 20.3.2, 21.0.2 Studio and 21.0.3 free. "Blackmagic gates external scripting to Studio." Free users get an in-app bridge (Workspace ▸ Scripts), a "supported-until-it-is-not tier" confirmed only on 21.0.x. — [GitHub](https://github.com/samuelgursky/davinci-resolve-mcp)
  - OS: macOS validated directly. Windows 11 and Fedora 43 are confirmed only via user issue reports. Python 3.10–3.12. Installs with `npx davinci-resolve-mcp setup` for Claude Code, Claude Desktop, Cursor and VS Code. — [GitHub](https://github.com/samuelgursky/davinci-resolve-mcp)
  - Three servers: compound (37 tools), granular (390 tools, one per API method), and an offline Node server (18 tools) that edits `.drp/.drt/.drx` files with Resolve closed. Its `.drt` authoring covers "cuts, retimes, transitions, fades, markers, compounds". 361/361 API methods covered, 338 live-tested. — [GitHub](https://github.com/samuelgursky/davinci-resolve-mcp)
  - Live transitions, keyframes and vertical resolution are not described in the README. The README says `TimelineItem.CopyGrades` "replaces the target's grade wholesale". — [GitHub](https://github.com/samuelgursky/davinci-resolve-mcp)
- **emircbngl/davinci-resolve-mcp-free**: 17 stars, 2026-10-15, MIT. A Lua bridge in Workspace › Scripts › ResolvePilotBridge communicates via `~/.resolve-pilot/bridge`. It was verified on Resolve 20.3 and is untested on 21.1. Other routes: FCPXML export and macOS UI automation (macOS 12+). "The Mac App Store build is sandboxed and cannot talk to the bridge." Tools: `append_clips`, `set_clip_properties` (zoom/pan/crop/opacity), `queue_render`, `make_format_version` (9:16, 4:5, 1:1), `export_timeline` (FCPXML/EDL/AAF/OTIO/DRT), `run_lua`. Tests mock Resolve. — [GitHub](https://github.com/emircbngl/davinci-resolve-mcp-free)
- Other Resolve MCPs and CLIs (metadata from GitHub search):
  - barckley75/resolve-claude-mcp: 392 stars, 2026-05-14, MIT, Studio. — [GitHub](https://github.com/barckley75/resolve-claude-mcp)
  - hiteshK03/davinci-resolve-mcp: 156 stars, 2026-03-28, MIT. — [GitHub](https://github.com/hiteshK03/davinci-resolve-mcp)
  - apvlv/davinci-resolve-mcp: 79 stars, 2026-10-22, MIT, Resolve + Fusion. — [GitHub](https://github.com/apvlv/davinci-resolve-mcp)
  - flamexnreal/davinci-resolve-ai-bridge-mcp: 44 stars, 2026-11-02, MIT. Claims "Free Version and Studio". — [GitHub](https://github.com/flamexnreal/davinci-resolve-ai-bridge-mcp)
  - wassermanproductions/unofficial-davinci-mcp: 37 stars, 2026-07-20, Apache-2.0. Live Studio control plus free-edition FCPXML/LUT. — [GitHub](https://github.com/wassermanproductions/unofficial-davinci-mcp)
  - hoyt-harness/davinci-mcp-professional: 26 stars, 2026-10-31, GPL-3.0. — [GitHub](https://github.com/hoyt-harness/davinci-mcp-professional)
  - lordhoell/davinci-resolve-mcp: 25 stars, 2026-04-03, MIT. MCP plus a Claude Code skill, "440+ tools". — [GitHub](https://github.com/lordhoell/davinci-resolve-mcp)
  - mhadifilms/dvr: 15 stars, 2026-10-21, MIT. CLI, Python library and MCP. — [GitHub](https://github.com/mhadifilms/dvr)
  - Poechant/davinci-resolve-cli: 53 stars, 2026-05-22, MIT. — [GitHub](https://github.com/Poechant/davinci-resolve-cli)
  - pedrolabonia/pydavinci: 183 stars, 2026-04-01, MIT. Python wrapper. — [GitHub](https://github.com/pedrolabonia/pydavinci)
  - WheheoHu/pybmd: 37 stars, 2026-11-04, LGPL-3.0. — [GitHub](https://github.com/WheheoHu/pybmd)
  - ezin-rev/resolve-jcut: 3 stars, 2026-07-05, MIT. Silence removal "works on the FREE version". — [GitHub](https://github.com/ezin-rev/resolve-jcut)

**CapCut / JianYing — draft generators and bridges**
- **GuanYixuan/pyJianYingDraft** (JianYing, the Chinese build): 4,830 stars, last push 2026-10-14, Apache-2.0. — [GitHub](https://github.com/GuanYixuan/pyJianYingDraft)
  - Compares JianYing 5.9 vs 10.8. On newer JianYing, `draft_content.json` "往往不是可直接读取的明文 JSON" (often not plaintext). Templates need a `fallback_loader`. — [GitHub](https://github.com/GuanYixuan/pyJianYingDraft)
  - **Auto-export is Windows-only** (`uiautomation`), works only on JianYing ≤6 (tested on 5.9 and 6.8), and moves the mouse. "剪映7+版本对控件进行了隐藏" (7+ hides the controls). macOS can generate drafts but "不支持自动导出". — [GitHub](https://github.com/GuanYixuan/pyJianYingDraft)
  - Ops: video/audio/text/sticker segments, transitions, keyframes (alpha, position, rotation, scale, volume, saturation), filters, effects, masks, chroma key, 10 blend modes, fades, SRT import. Not supported: curved speed and keyframing effect/filter parameters. — [GitHub](https://github.com/GuanYixuan/pyJianYingDraft)
- **GuanYixuan/pyCapCut** (CapCut International port): 737 stars, last push 2026-10-16, no license file per the GitHub API. — [GitHub](https://github.com/GuanYixuan/pyCapCut)
  - Features verified on CapCut 8.2.0 and 9.5.0.4050. It reads only plaintext `draft_content.json` templates. "生成的草稿请在 Windows 版 CapCut 中打开并手动导出视频" (open generated drafts in **Windows** CapCut and export manually). "目前CapCut版暂不支持自动导出" (no auto-export). — [GitHub](https://github.com/GuanYixuan/pyCapCut)
  - Ops: segments, `speed`, `add_keyframe`, `add_effect`, `add_filter`, transitions, masks, chroma key, fades, SRT. Canvas size is set in `create_draft`. Some effects need a CapCut membership. v0.1.0 will break `add_track`; the README says to pin `pycapcut==0.0.4` for the current behavior. — [GitHub](https://github.com/GuanYixuan/pyCapCut)
- **sun-guannan/VectCutAPI** (formerly CapCutAPI; the old URL sun-guannan/CapCutAPI returns "Moved Permanently"): 2,365 stars, last push 2026-10-24, Apache-2.0 (release v1.5.0, 2025-09-23). — [GitHub](https://github.com/sun-guannan/VectCutAPI)
  - HTTP API (`capcut_server.py`, port 9001), stdio MCP server (`mcp_server.py`) and a `vectcut-skill` folder. Needs Python 3.10+ and FFmpeg. — [GitHub](https://github.com/sun-guannan/VectCutAPI)
  - `create_draft` takes width/height (example 1080×1920). Also `add_video` (with transition, e.g. `"fade_in"`), `add_text`, `add_video_keyframe` (scale_x, scale_y, alpha), audio, images, stickers, SRT, effects/filters. — [GitHub](https://github.com/sun-guannan/VectCutAPI)
  - `save_draft` writes a `dfd_` folder that you copy into the CapCut/JianYing drafts dir. Profiles: `capcut_legacy`, `jianying_legacy`, `jianying_pro_10`. Cloud rendering via vectcut.com is "not been open-sourced yet". — [GitHub](https://github.com/sun-guannan/VectCutAPI)
- **Hommy-master/capcut-mate**: 2,112 stars, last push 2026-11-01, Apache-2.0. A FastAPI draft API (`create_draft`, `add_videos`, `add_captions`, `add_effects`, `add_keyframes`) with a Coze plugin, n8n support and an Electron desktop client. `gen_video` submits an async **cloud render** task. Material upload is billed "0.005 CNY/MB". The README states no CapCut version. Windows/macOS/Docker installs are supported. — [GitHub](https://github.com/Hommy-master/capcut-mate)
  - Companion repos: capcut-mate-skill (59 stars, 2026-10-07) and **STALE** capcut-mate-mcp (14 stars, 2025-08-17). — [GitHub](https://github.com/Hommy-master/capcut-mate-skill); [GitHub](https://github.com/Hommy-master/capcut-mate-mcp)
- **renezander030/capcut-cli**: 1,125 stars, last push 2026-11-06, MIT, Node 18+, built-in modules only. — [GitHub](https://github.com/renezander030/capcut-cli)
  - Edits `draft_content.json`/`draft_info.json` against a version-aware schema with atomic writes and `.bak` backups. It knows macOS and Windows draft-store locations, has `sync-timelines` for "8.7 mirror repair", and has a doc on JianYing encryption. — [GitHub](https://github.com/renezander030/capcut-cli); [encryption doc](https://raw.githubusercontent.com/renezander030/capcut-cli/master/docs/jianying-encryption.md)
  - Ops: `init`, `compile` (from a JSON spec), add video/audio/text, trim, speed, volume, transitions, masks, animations, captions (Whisper), SRT/VTT, chroma key, `detect-scenes`, `detect-silence`. It is an agent skill / Claude Code plugin with "no MCP server or HTTP daemon". `render` makes only a low-res ffmpeg proxy; "The publish click stays human." — [GitHub](https://github.com/renezander030/capcut-cli)
  - Security: versions ≤0.17.0 had local command/filter injection paths. Fixes are in 0.17.1/0.18.0. — [GitHub](https://github.com/renezander030/capcut-cli)
- Other CapCut MCPs, skills and tools (metadata from GitHub search):
  - JmsLdrn/capcut-mcp: 17 stars, 2026-08-07, MIT. Reads and edits CapCut desktop drafts: add/move/trim/split clips, text. — [GitHub](https://github.com/JmsLdrn/capcut-mcp)
  - mrbuslov/capcut-ai-editor: 123 stars, 2026-10-27, MIT. Talking-head pause removal. — [GitHub](https://github.com/mrbuslov/capcut-ai-editor)
  - Atx-Guy/capcut-mcp-server: 91 stars, 2026-01-13. — [GitHub](https://github.com/Atx-Guy/capcut-mcp-server)
  - MigueDuque/capcut-mcp-server-extended: 14 stars, 2026-03-17, MIT. — [GitHub](https://github.com/MigueDuque/capcut-mcp-server-extended)
  - xuliang2024/cutcli-cookbook: 201 stars, 2026-05-26, MIT. — [GitHub](https://github.com/xuliang2024/cutcli-cookbook)
  - YeJe-cpu/easy-jianying: 167 stars, 2026-11-02. AI → editable JianYing drafts "on macOS". — [GitHub](https://github.com/YeJe-cpu/easy-jianying)
  - isYangs/jianying-editor-skill: 387 stars, 2026-10-15, MIT. — [GitHub](https://github.com/isYangs/jianying-editor-skill)
  - zenstory-ai/video-recap-skills: 606 stars, 2026-11-06, MIT. Exports editable JianYing/CapCut drafts. — [GitHub](https://github.com/zenstory-ai/video-recap-skills)
  - aoguai/pyJianYingDraft fork: 27 stars, 2026-10-14. Encrypted draft read/write and auto-registration of draft folders. — [GitHub](https://github.com/aoguai/pyJianYingDraft)
  - HTWMedia/JyDraft: 91 stars, 2026-10-30, Apache-2.0. Decrypts encrypted drafts, offers cloud concurrent rendering, and includes a C# library. — [GitHub](https://github.com/HTWMedia/JyDraft)
- **STALE** CapCut/JianYing repos:
  - fancyboi999/capcut-mcp: 96 stars, 2025-08-21. — [GitHub](https://github.com/fancyboi999/capcut-mcp)
  - chenzhaohua11/CapCutAPI-Complete: 97 stars, 2025-09-02. — [GitHub](https://github.com/chenzhaohua11/CapCutAPI-Complete)
  - hey-jian-wei/jianying-mcp: 323 stars, 2025-08-22. — [GitHub](https://github.com/hey-jian-wei/jianying-mcp)
  - JianYing-Automation/JianYingApi: 263 stars, 2024-05-08. — [GitHub](https://github.com/JianYing-Automation/JianYingApi)
  - notinmood/JianyingDraft.PY: 213 stars, 2024-06-28. — [GitHub](https://github.com/notinmood/JianyingDraft.PY)
  - luhailiang98/CapCutAPI-YYZC: 32 stars, 2025-09-11. — [GitHub](https://github.com/luhailiang98/CapCutAPI-YYZC)
  - pierluigigiancola/capcut-api: 30 stars, 2025-01-14. — [GitHub](https://github.com/pierluigigiancola/capcut-api)
- Encryption: search summaries say JianYing 6.0+ stores `draft_content.json` AES-encrypted, while CapCut International is reportedly not encrypted. A Jianying MCP reads encrypted drafts via the third-party `jy-draftc` calling a local `videoeditor.dll` (Windows). Its validated baseline is JianYing 10.0.5.13816. These are secondary and reverse-engineered, and keys change across releases. — [glama jianying-ai-mcp](https://glama.ai/mcp/servers/Xanthus-Sanslab/jianying-ai-mcp); [JyDraft README](https://gh.r-mj.com/HTWMedia/JyDraft/blob/main/README_EN.md)
- Adjacent, not CapCut but "CapCut alternative drivable by agents": 0xsline/OpenChatCut (2,958 stars, 2026-11-06, AGPL-3.0, local-first conversational editor) and pireel/pireel (1,355 stars, 2026-11-05, AGPL-3.0, "Drivable by any AI agent over MCP"). — [GitHub](https://github.com/0xsline/OpenChatCut); [GitHub](https://github.com/pireel/pireel)

### Inferences
- Resolve free on macOS: for a scripted pipeline, 21.0.x is the last free version where Python/in-app bridges are confirmed. Upgrading the free app to 21.1+ likely breaks Python-based MCPs. The native MCP and external scripting require Studio (€305 one-time).
- Resolve Studio + samuelgursky MCP (or the native 21.1 MCP) can build a timeline, set render settings and render headlessly-ish, with the app running. The **crossfades need a workaround**: the API has no transition call. Options are to generate FCPXML/OTIO/.drt containing dissolves and import it, or to render crossfades with ffmpeg first.
- CapCut drafts are the closest fit to the user's 9:16 TikTok/Shorts format. VectCutAPI and pyCapCut support a 1080×1920 canvas, speed, transitions and keyframes. But every open-source path ends with a human clicking Export in CapCut. pyCapCut even says to open drafts in Windows CapCut, which is a risk for a macOS user. capcut-cli explicitly handles macOS draft locations and newer builds (8.7). For fully automated output, the current ffmpeg pipeline stays more reliable.
- For "must run on Windows too", the CapCut draft generators are cross-platform Python/Node. pyJianYingDraft's auto-export works only on Windows with old JianYing.

### Gaps
- No Blackmagic primary source (release notes or manual) was fetched for 21.1. The exact scope of free-edition console scripting after 21.1 is conflicting (Puget vs Digital Production).
- The native Resolve 21.1 MCP tool list is not documented in sources I read. The `run_script_unsafe` claim is unverified.
- I did not verify that the Resolve API can set clip speed/retime or timeline resolution (the mirror doesn't document `timelineResolutionWidth`; samuelgursky's README doesn't describe it).
- I found no tested report on whether pyCapCut/VectCutAPI drafts open correctly in **macOS** CapCut on current builds (9.x/10.x). I also have no reliable data on whether CapCut International drafts are encrypted in late 2026.

## Q3. Templated rendering: nexrender, aerender, Adobe's own APIs. Can an agent fill an AE template and render headlessly?

### Takeaway
Yes, with caveats. nexrender (1.9k stars, v1.63.4, 2026-06-03) is the standard way to fill an AE template from JSON (swap footage, set text/properties/expressions, run JSX) and render via `aerender` without opening the AE GUI. AE must still be installed (licensed/trial or a render-only node), on Windows or macOS. Licensing for unattended render farms is unclear. Adobe offers no public cloud API to render AE projects or MOGRTs, and no Firefly video API for this purpose surfaced in my research.

### Cited Findings
- **inlife/nexrender**: 1,862 stars, last push 2026-06-03, MIT (release v1.63.4, 2026-06-03). — [GitHub](https://github.com/inlife/nexrender)
  - It uses AE's `aerender` CLI. It copies the project to a temp folder, replaces assets, and "never launches After Effects GUI application". — [GitHub](https://github.com/inlife/nexrender)
  - Job JSON: `template.src` + `composition`. Footage assets replace by `layerName`/`layerIndex`. Data assets set a `property` value or `expression` ("any error in expression will prevent the project from rendering"). Script assets run JSX with `NX.get()` params. Actions run at pre/post download/render: copy, encode (FFmpeg-style params), upload, cache, decompress. — [GitHub](https://github.com/inlife/nexrender)
  - Components: `nexrender-cli`, `nexrender-server` (tiny REST), `nexrender-worker`, `@nexrender/core`. The server runs on Win/macOS/Linux; the worker on Windows and macOS. — [GitHub](https://github.com/inlife/nexrender)
  - The README's tested AE versions list is old (CS5.5 through CC 2019). It notes AE 2023 needs an output module configured and can render MP4 directly. — [GitHub](https://github.com/inlife/nexrender)
  - Licensing is self-contradictory. The feature list says it "does not require licenses for Adobe After Effects on any worker machine". The worker requirements say "Installed licensed/trial version of Adobe After Effects". It auto-creates `ae_render_only_node.txt`. — [GitHub](https://github.com/inlife/nexrender)
  - Limits: Cinema 4D renderer comps may silently fail (switch to Classic/Advanced 3D). There are macOS aerender/temp-folder permission issues (issue #534). Analytics are on by default (`--no-analytics`). — [GitHub](https://github.com/inlife/nexrender)
  - MOGRT support is only a community action, vonstring/nexrender-action-mogrt-template: 13 stars, **STALE** (last push 2023-11-14). — [GitHub](https://github.com/vonstring/nexrender-action-mogrt-template)
  - inlife/nexrender-boilerplate is **STALE** (55 stars, last push 2022-01-22). — [GitHub](https://github.com/inlife/nexrender-boilerplate)
- **aerender (Adobe)**: a command-line renderer shipped with AE. A render-only instance is installed by installing AE, starting it once, then Help ▸ Sign Out and quit. A render-only node is marked by `ae_render_only_node.txt`. A macOS High Sierra user reported the file did not stop AE from launching and asking for authentication. — [Adobe Help](https://helpx.adobe.com/en/after-effects/using/automated-rendering-network-rendering.html); [Adobe Community](https://community.adobe.com/t5/after-effects-discussions/aerender-using-rendering-templates-in-server-farm/td-p/11210135)
  - Licensing: a forum answer (unsourced) says aerender is free on any number of machines if it supports a licensed human artist, but not for an "automated render farm". The accepted advice is to ask Adobe. — [Adobe Community](https://community.adobe.com/t5/after-effects-discussions/licensing-requirement-to-run-aerender-as-background-job/m-p/14339769)
- AE MCP servers do not render the queue. kumoproductions renders single preview frames only, and Dakkshin lists no render tool. — [GitHub](https://github.com/kumoproductions/mcp-aftereffects); [GitHub](https://github.com/Dakkshin/after-effects-mcp)
- Premiere-side templating: the Premiere UXP v27.0.0 changelog adds `MogrtText`/`MogrtComment` to edit MOGRT parameters. hetpatel-11 has `import_mogrt` and notes "Professional title design still depends on real MOGRT assets". — [Adobe UXP changelog](https://developer.adobe.com/premiere-pro/uxp/changelog/); [GitHub](https://github.com/hetpatel-11/Adobe_Premiere_Pro_MCP)
- nielsfranke/MOGRT-Converter (2 stars, 2026-11-03, AGPL-3.0) claims to "fill in and render After Effects MOGRT templates without Adobe" to ProRes 4444. It is unverified and very new. — [GitHub](https://github.com/nielsfranke/MOGRT-Converter)

### Inferences
- An agent can fill an AE template and render headlessly on macOS or Windows: Claude Code writes a nexrender job JSON → `nexrender-cli` → aerender. AE must be installed and signed in (or set up as a render-only node). The README's version testing is old, so test against AE 2025/2026 before relying on it.
- For the user's videos (no narration, no titles), templated AE rendering adds little. It would only help for a branded intro/outro or text overlays reused across many videos.

### Gaps
- No official Adobe statement on aerender licensing for automated, unattended use was found.
- I did not research Adobe Firefly Services / Firefly video APIs in depth. I found no evidence that they render AE projects or edit Premiere timelines.
- I found no current (2025–2026) user reports on nexrender with AE 2025/2026 on Apple Silicon.

## Q4. Interchange formats an agent can write directly (FCPXML, OpenTimelineIO, EDL), plus Final Cut Pro control. Which repos generate these from code?

### Takeaway
Writing an interchange file and importing it is the most portable and least fragile agent path. OpenTimelineIO (ASWF, 2.1k stars, actively maintained) writes OTIO natively, plus FCP7 XML, EDL and AAF via adapters. Premiere has released OTIO import/export; Resolve imports OTIO/FCPXML/EDL/AAF; Final Cut imports FCPXML. For Final Cut specifically, DareDev256/fcp-mcp-server generates FCPXML and can push it into a running FCP via Apple events (macOS). SpliceKit gives deep live control by injecting a dylib into a re-signed FCP copy. Final Cut has no programmatic export/render, so the final render stays manual.

### Cited Findings
- **AcademySoftwareFoundation/OpenTimelineIO**: 2,061 stars, last push 2026-11-07, Apache-2.0, C++ with Python bindings (release v0.18.1, 2025-11-09). — [GitHub](https://github.com/AcademySoftwareFoundation/OpenTimelineIO)
  - Adapters:
    - otio-fcp-adapter (FCP7 XML): 11 stars, 2026-04-08. — [GitHub](https://github.com/OpenTimelineIO/otio-fcp-adapter)
    - otio-cmx3600-adapter (EDL): 10 stars, 2025-12-12. — [GitHub](https://github.com/OpenTimelineIO/otio-cmx3600-adapter)
    - otio-aaf-adapter: 23 stars, 2026-10-22. — [GitHub](https://github.com/OpenTimelineIO/otio-aaf-adapter)
    - otio-fcpx-xml-adapter (FCPXML): 8 stars, **STALE** (last push 2024-06-25, v1.0.0 2023-07-07). — [GitHub](https://github.com/OpenTimelineIO/otio-fcpx-xml-adapter)
- Premiere OTIO: an Adobe community post titled "Now Released" says export is under File > Export > OpenTimelineIO and import via File > Import. It round-trips clip markers, frame size and sample rate. The OTIO apps page still lists Premiere support as beta. — [Adobe Community](https://community.adobe.com/announcements-732/now-released-otio-import-and-export-311699); [OTIO apps](https://otio-website.vercel.app/apps-and-tools)
  - Known bug (April 2026 feature request): speed / time-remapping keyframes are not preserved on OTIO round-trip; transform keyframes are kept. — [Adobe Community](https://community.adobe.com/feature-requests-730/otio-export-import-does-not-preserve-speed-keyframes-time-remapping-keyframes-in-premiere-pro-1556474)
- Resolve's `ImportTimelineFromFile(filePath, {importOptions})` imports AAF/OTIO/FCPXML. Imported clips may arrive unlinked. — [Blackmagic forum](https://forum.blackmagicdesign.com/viewtopic.php?p=1151748)
- **DareDev256/fcp-mcp-server** ("FCPXML MCP"): 137 stars, last push 2026-11-02, MIT, Python 3.10–3.12. — [GitHub](https://github.com/DareDev256/fcp-mcp-server)
  - XML mode works offline without FCP installed. Live mode (**macOS only**): `push_to_fcp` sends FCPXML into a running FCP via Apple's Open Document event, with "no patched binary, no private APIs, no accessibility scripting". — [GitHub](https://github.com/DareDev256/fcp-mcp-server)
  - It reads FCPXML v1.8–v1.14 and writes v1.13, covering FCP 10.4+ through 12.x. It exports to Resolve (FCPXML v1.9), Premiere/Avid (FCP7 XMEML v5), EDL and CSV. — [GitHub](https://github.com/DareDev256/fcp-mcp-server)
  - 15 grouped tools covering 102 operations: `auto_rough_cut`, `generate_montage`, `add_transition` (UUIDs from `list_effects`), and `preview_render` (an ffmpeg proxy using `xfade` for dissolves; not a final render). — [GitHub](https://github.com/DareDev256/fcp-mcp-server)
  - Limits: "Final Cut has scriptable import but no programmatic export". Still images referenced directly in FCPXML can crash FCP (convert them to short MOVs). It doesn't handle colour, framing or motion. — [GitHub](https://github.com/DareDev256/fcp-mcp-server)
- **elliotttate/SpliceKit**: 199 stars, last push 2026-08-29, MIT. — [GitHub](https://github.com/elliotttate/SpliceKit)
  - It injects a dylib into "a re-signed copy of Final Cut Pro" (copied to `~/Applications/SpliceKit/`) and exposes the full ObjC runtime, private APIs included. It runs a JSON-RPC server on `127.0.0.1:9876` and an MCP server with "~200 tools" (blading, retiming, color, effects, rendering; examples include cross dissolves, Motion titles, Batch Export). — [GitHub](https://github.com/elliotttate/SpliceKit)
  - Risks: FCP updates break it (re-patch needed). Private APIs may "behave unexpectedly". Crash reports go to Sentry. Supported FCP/macOS versions are not stated. 40 open issues. — [GitHub](https://github.com/elliotttate/SpliceKit)
- Other FCP tools:
  - elliotttate/finalcutpro-mcp: 18 stars, 2026-03-19, "99 tools". — [GitHub](https://github.com/elliotttate/finalcutpro-mcp)
  - dreliq9/fcp-mcp: 12 stars, 2026-10-12, MIT, "88 tools: FCPXML engine + live FCP control". — [GitHub](https://github.com/dreliq9/fcp-mcp)
  - Poechant/final-cut-pro-cli: 5 stars, 2026-05-27, MIT. — [GitHub](https://github.com/Poechant/final-cut-pro-cli)
  - AFangTeam/chatcut-to-fcpxml: 10 stars, 2026-08-20, MIT. — [GitHub](https://github.com/AFangTeam/chatcut-to-fcpxml)
- FCPXML generator libraries:
  - andrewarrow/cutlass (Go): 58 stars, 2025-07-06, MIT, "swiss army knife for generating fcpxml files", **STALE**. — [GitHub](https://github.com/andrewarrow/cutlass)
  - reuelk/pipeline (Swift FCPXML framework): 61 stars, 2021-10-18, **STALE**. — [GitHub](https://github.com/reuelk/pipeline)
  - GanymedeNil/srt2fcpxml: 120 stars, 2023-01-17, **STALE**. — [GitHub](https://github.com/GanymedeNil/srt2fcpxml)
  - cobanov/autocut (Rust/Tauri): 75 stars, 2026-08-31. Exports "DaVinci-friendly FCPXML". — [GitHub](https://github.com/cobanov/autocut)
  - ludmila-omlopes/video-timeline-copilot: 8 stars, 2026-11-02, MIT. Codex + Resolve + FCPXML. — [GitHub](https://github.com/ludmila-omlopes/video-timeline-copilot)
- Premiere-to-interchange: hetpatel-11 can `export_as_fcp_xml`, `export_aaf` and `export_omf` from Premiere. The UXP v26.3.0 changelog added `ProjectConverter.exportAAF`. — [GitHub](https://github.com/hetpatel-11/Adobe_Premiere_Pro_MCP); [Adobe UXP changelog](https://developer.adobe.com/premiere-pro/uxp/changelog/)
- Remotion documents an "export-opentimeline" path (code-based video → OTIO). — [Remotion docs](https://www.remotion.dev/docs/export-opentimeline)

### Inferences
- For the user's stitched clips with crossfades, an interchange file is a clean fit. A script writes FCPXML (or OTIO) with N clips, dissolves of a set length, and a 1080×1920 format, then imports it into FCP (push_to_fcp), Resolve (ImportTimelineFromFile) or Premiere (OTIO import) for review or manual polish. This avoids fragile live-bridge state. It does not automate the final render in FCP; Resolve Studio or Premiere+AME can render.
- OTIO in Python is cross-platform (macOS and Windows), which suits the requirement that some scripts run on Windows. FCP live push and SpliceKit are macOS-only.
- SpliceKit's approach (re-signed FCP plus dylib injection) is powerful but high-risk for a production machine. FCPXML + Apple events (DareDev256) is the safer FCP route.

### Gaps
- I did not verify which FCPXML transition elements Resolve's importer maps to native dissolves (only one user report says transitions survive).
- I don't know the exact Premiere version where OTIO left beta.
- I found no verified FCPXML version support table for FCP 12.x beyond the fcp-mcp-server README.

## Q5. Real-world reports: how well do these work and what breaks?

### Takeaway
Independent, first-hand evaluations are thin. Most evidence comes from the projects' own README "limitations" sections, a few forum threads and one hands-on blog test. Recurring failure modes: the bridge panel must stay open and scripting permissions must be on; modal dialogs block scripts; hosts silently ignore some scripted edits (Premiere 26.3 QE); APIs lack certain operations (Premiere clip speed, effect removal, Resolve transitions); imported timelines arrive with unlinked media; CapCut/JianYing draft formats change or get encrypted between versions; and final export usually needs a human.

### Cited Findings
- r/ClaudeAI post "I tested Claude + After Effects so you don't have to guess anymore" (around Dec 2025) is a YouTube teaser with no concrete results. The author says setup was "way less obvious than it should be". A commenter argues Adobe UIs "are designed for human" use. — [Reddit snapshot](https://reddit.sentinel-team.org/posts/1tjd814/snapshots/2026-05-23T02%3A20%3A04.239191Z)
- AE MCP setup gotchas: you must enable "Allow Scripts to Write Files and Access Network", and the bridge panel must stay open. These are a likely source of "it doesn't work" reports. — [mcpservers.org (Dakkshin)](https://mcpservers.org/ko/servers/Dakkshin/after-effects-mcp); [GitHub kumoproductions](https://github.com/kumoproductions/mcp-aftereffects)
- AE: modal dialogs block all scripts. Save prompts are cancelled, not confirmed. A Safe Mode dialog after a crash blocks new instances. — [GitHub kumoproductions](https://github.com/kumoproductions/mcp-aftereffects)
- Premiere:
  - "Premiere Pro 26.3 … silently ignore[s]" some QE structural edits, and clip speed can't be set. — [GitHub leancoderkavy](https://github.com/leancoderkavy/premiere-pro-mcp)
  - There is no API to remove effects. `import_ae_comps` "could wedge the bridge". Results distinguish verified changes from "accepted-but-unverified host responses". — [GitHub hetpatel-11](https://github.com/hetpatel-11/Adobe_Premiere_Pro_MCP)
  - A Vietnamese developer write-up says the Premiere API does not expose clip audio levels; it recommends doing silence detection with ffmpeg on the source files. — [Viblo](https://viblo.asia/p/tu-dong-hoa-dung-video-tren-premiere-pro-bang-ai-extendscript-cepuxp-va-mcp-tu-goc-nhin-developer-1QLxnmAO4Aw)
- Adobe for creativity connector test: a 9:16 reframe took 3:14 with an off-center subject. Per the tester, the connector does not reach Premiere timeline control. — [MindStudio](https://www.mindstudio.ai/blog/claude-mcp-adobe-vs-photoshop-premiere-what-it-does)
- Resolve:
  - API-imported clips arrive unlinked from the Media Pool. Users ask for a workaround short of "Reconform From Bin". — [Blackmagic forum](https://forum.blackmagicdesign.com/viewtopic.php?p=1151748)
  - The 21.1 free-edition scripting removal broke third-party tooling: Puget Bench will block the free edition from 21.1 onward. — [Puget Systems](https://www.pugetsystems.com/blog/2026/09/10/how-davinci-resolve-free-v21-1-scripting-changes-affect-puget-bench/)
  - samuelgursky's README: "Nothing here has an opinion about whether an edit is good"; output is a "first-pass assembly". — [GitHub](https://github.com/samuelgursky/davinci-resolve-mcp)
- CapCut/JianYing:
  - JianYing 7+ hides the UI controls that auto-export relied on. — [GitHub pyJianYingDraft](https://github.com/GuanYixuan/pyJianYingDraft)
  - Newer drafts are not plaintext. — [GitHub pyJianYingDraft](https://github.com/GuanYixuan/pyJianYingDraft)
  - CapCut 8.7 needed "mirror repair" (`sync-timelines`). — [GitHub capcut-cli](https://github.com/renezander030/capcut-cli)
  - capcut-cli also says "desktop acceptance on your app build remains unverified". — [GitHub capcut-cli](https://github.com/renezander030/capcut-cli)
- FCP:
  - Still images referenced in FCPXML can crash FCP. — [GitHub DareDev256](https://github.com/DareDev256/fcp-mcp-server)
  - SpliceKit breaks on FCP updates. — [GitHub SpliceKit](https://github.com/elliotttate/SpliceKit)
- Blender MCP (an adjacent bridge, not an NLE): a Reddit user says heavy scenes are where it "falls flat", because the MCP runs on the main thread and blocks the UI. This suggests bridge tools struggle on heavy projects. — [search summary of Reddit snapshot](https://reddit.sentinel-team.org/posts/1tare6x/snapshots/2026-05-16T01%3A22%3A27.604243Z)

### Inferences
- Fit for the user's use case (macOS + Claude Code; 20–26 s 9:16 animal life-cycle videos made of AI clips with crossfades and per-clip speed ~1.4; TikTok dance clips):
  - The current ffmpeg crossfade pipeline already does what these tools would automate. No NLE bridge here gives a fully unattended, cross-platform render that is more reliable than ffmpeg.
  - Best add-on if the user wants an **editable** project for manual polish: write a CapCut draft (VectCutAPI/pyCapCut, 1080×1920, transitions, speed) or an FCPXML/OTIO timeline from the same plan JSON. The user then opens and exports it by hand. Risk: CapCut drafts on macOS (pyCapCut says to use Windows CapCut), and format drift across CapCut versions.
  - If a paid pro NLE is acceptable, the Resolve Studio route is best documented: the 21.1 native MCP or samuelgursky's MCP, plus an FCPXML import for the dissolves, plus `AddRenderJob`/`StartRendering`. Premiere plus hetpatel-11 (macOS-validated, `batch_add_transitions`, AME export) is the Adobe equivalent. Speed must be pre-baked, at least with leancoderkavy.
  - After Effects/nexrender only pays off for reusable branded intros or text overlays. The user's videos have neither.
  - TikTok dance clips (single generated clip, posted as is) don't need an NLE bridge at all.

### Gaps
- I found no independent benchmark or long-form review of any AE/Premiere/Resolve MCP. No YouTube demo was inspected; video content can't be read through these tools.
- I did not search X/Twitter directly. The one X-related snippet (a Higgsfield–Claude AE integration, praised by users) came from a search summary I couldn't verify, so I excluded it from findings.
- There are no GitHub issue-tracker statistics (crash/bug rates). The GitHub API rate limit stopped further per-repo queries (issues and releases for ~15 repos).
