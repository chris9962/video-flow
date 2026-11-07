# First frame, hook (opening 1–3 s) and thumbnail of a YouTube Short

Research date: 2026-11-07. Source labels used below: **[Official]** = YouTube Help / YouTube Blog / Creator Insider; **[Expert-data]** = expert claim backed by a dataset; **[Opinion]** = expert or creator opinion, anecdote, or third-party guide without disclosed data. "(snippet)" = taken from a search-result summary, page not fetched in full.

## Q1. What does YouTube officially say about the opening of a Short and the "Viewed vs. swiped away" metric?

### Takeaway
YouTube officially says only "capture attention in the first few seconds to prevent viewers from scrolling" and defines "Viewed (vs. swiped away)" as the share of feed viewers who watched instead of swiping; it publishes no target percentage and no time threshold for what counts as a swipe-away. The numbers people quote ("1 second", "70%+") come from creators and analysts, not from YouTube.

### Cited Findings
**[Official] Metric definition and location**
- YouTube Help, "Content tab analytics tips – Shorts" (undated page, read 2026-11-07): the Shorts content tab has a card "How many chose to view", which "Highlights the percentage of times that viewers viewed your Shorts versus swiped away." The same page's tips are generic ("compare videos of the same type", "avoid comparing each video against a viral hit"); it gives no advice on hooks and no benchmark. — [YouTube Help 12942217](https://support.google.com/youtube/answer/12942217?hl=en&co=YOUTUBE._YTVideoType%3Dshorts)
- YouTube Help, "Understand your content reach and engagement" (snippet): "Shown in feed: the number of times your Shorts showed in the Shorts feed. Viewed (vs. swiped away): the percentage of total viewers who viewed your Shorts versus the percentage who swiped away." — [YouTube Help 12220281](https://support.google.com/youtube/answer/12220281?hl=en&co=GENIE.Platform%3DDesktop)
- The metric was introduced roughly 4 years ago (≈2022) via a YouTube Community post: "These metrics will be available to all Shorts creators on Studio web and Studio mobile in Advanced Analytics and on Content-level Analytics." (snippet) — [YouTube Community video post](https://support.google.com/youtube/community-video/273390203/new-youtube-shorts-metric-viewed-vs-swiped-away?hl=en)
- No official help text found that explains how "swiped away" is computed (e.g., a seconds threshold) or what a "good" value is. A third-party glossary (undated, ©2026) agrees: "YouTube does not publish one universal good, bad, or algorithmic cutoff for Viewed vs. Swiped Away"; it is "the closer feed equivalent to an initial selection measure, but it should not be called thumbnail CTR"; the viewed side is "also described as Stayed to watch" in YouTube's broader Analytics definitions. — [Creator Essentials glossary](https://www.creatoressentials.com/glossary/viewed-vs-swiped-away/)

**[Official] Statements on the opening**
- YouTube Blog, "Your guide to getting started with YouTube Shorts" (The YouTube Team, 2025-04-08): "Capture attention in the first few seconds to prevent viewers from scrolling." Also: "Shorts are capped at 3 minutes, so get your message across quickly." and "Overlay text to emphasize key points or add captions." — [YouTube Blog 2025-04-08](https://blog.youtube/creator-and-artist-stories/your-guide-to-getting-started-with-youtube-shorts/)
- YouTube Blog summary of a Creator Insider video with **Todd Sherman (Shorts Product Lead)** and creator **Jenny Hoyos** (2025-01-28). Jenny Hoyos: "I really do think you have one second to hook someone, especially on Shorts." She describes a 3-part hook: shock → intrigue → satisfaction. Todd Sherman notes some creators make even shorter ~15-second "moments" capturing a vibe or scene. — [YouTube Blog 2025-01-28](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/)
- vidIQ (updated 2026-10-09) paraphrases Todd Sherman (Creator Insider, undated): Shorts views "mostly seem to come from the feed itself", so each Short is tested on a small "seed audience" and widened only if that group engages. The "seed audience" wording is vidIQ's, not a verified YouTube quote. — [vidIQ, Shorts algorithm 2026](https://vidiq.com/blog/post/youtube-shorts-algorithm/)

**[Official] View counting change that affects how the opening is measured**
- From 2025-03-31, a Shorts "view" counts every time a Short starts or replays, with no minimum watch time. The previous metric was kept as **"Engaged views"** in Advanced mode; YPP eligibility and revenue still use engaged views. — [TechCrunch 2025-03-26](https://techcrunch.com/2025/03/26/youtube-is-changing-how-youtube-shorts-views-are-counted); [PPC Land](https://ppc.land/youtube-changes-how-shorts-views-are-counted-from-march-31/)
- Consequence noted by a third party: "a playback can contribute to the public Shorts Views count even when the viewer swipes away quickly", so "Viewed vs. swiped away" and engaged views are the honest hook signals, not the public view count. — [Creator Essentials glossary](https://www.creatoressentials.com/glossary/viewed-vs-swiped-away/)

**Todd Beaupré and Rene Ritchie on the hook**
- No direct 2025–2026 statement from Todd Beaupré or Rene Ritchie about the Shorts opening or swipe-away rate was found. The only secondhand Beaupré item found: Metricool reports he said in a Creator Insider interview that nothing in the algorithm boosts an account for uploading 10–20 Shorts a day (undated, secondhand). — [Metricool (ES)](https://metricool.com/es/algoritmo-youtube-shorts)

### Inferences
- In the Shorts feed the video autoplays, so viewers judge the Short by its **first frame and first second of motion**, not by a thumbnail. The swipe decision is therefore a judgment on frame 0 to ≈1 s.
- Because YouTube gives no benchmark, the channel should compare "Viewed vs. swiped away" across its own Shorts (e.g., videos with different openings) rather than against a fixed external target.
- Since 2025-03-31, a high public view count can be inflated by loops and quick swipes; the user should track engaged views and Viewed % per video when testing openings.

### Gaps
- No official definition of the swipe-away time window (e.g., "swiped within X seconds").
- No official benchmark for Viewed % or for Shorts retention.
- No primary-source quote from Rene Ritchie or Todd Beaupré on Shorts hooks was found; the Creator Insider videos themselves were not transcribed.

## Q2. As of 2025–2026, can creators upload a custom thumbnail for Shorts, and where is it shown?

### Takeaway
Yes, since **2026-07-24** YouTube Partner Program (YPP) creators can upload a fully custom Shorts thumbnail (desktop YouTube Studio; Help page also requires a verified account); everyone else can still pick any frame in the mobile app or one of 3 suggested frames on desktop. The thumbnail is **not shown in the Shorts feed** (where almost all Shorts views come from); it appears on the homepage, the channel page (Home and Shorts tabs) and, per third-party guides, search, hashtag and audio pages. There is no A/B testing for Shorts thumbnails.

### Cited Findings
**[Official] July 2026 change**
- YouTube Official Blog, "Making thumbnails easier on YouTube" (The YouTube Team, **2026-07-24**): YPP creators can now upload custom thumbnails for Shorts, with plans to expand "to more creators over time"; creators can choose from "three suggested thumbnail frames for Shorts on desktop"; in the YouTube mobile app they can pick any frame of the video. AI thumbnail generation in Ask Studio is for "long form videos" only. — [YouTube Blog 2026-07-24](https://blog.youtube/news-and-events/youtube-studio-custom-thumbnail-updates/)
- Creator Insider video (2026-07-25) presented by creator liaison **Rene Ritchie**: "Custom thumbnails for YouTube shorts. Can I get a finally and a W in the comments?" As reported by PPC Land: thumbnails show on the **homepage and on the Home and Shorts tabs of the channel page**; they are **not displayed in the Shorts feed**, where most Shorts views come from; Ritchie justified the feature by how Shorts look on the homepage and channel page, saying the channel look "to brands is really important"; **no A/B testing** for Shorts thumbnails (long-form got title/thumbnail testing with up to 3 variants in Dec 2025). — [PPC Land](https://ppc.land/youtube-ends-2-year-wait-for-shorts-thumbnails-but-blocks-a-b-testing/)
- Same report: Ritchie said that although Shorts are 9:16, thumbnails are used "closer to 3:2" across surfaces and advised keeping important content away from the edges. Note: "3:2" is landscape and may be a reporting error (2:3 or 4:5 portrait would fit the Help page below); treat the exact ratio as unverified, but the "keep the subject centered, away from edges" advice is consistent. — [PPC Land](https://ppc.land/youtube-ends-2-year-wait-for-shorts-thumbnails-but-blocks-a-b-testing/)
- Upload paths reported: new Short on desktop → attach thumbnail during upload; published Short → YouTube Studio → Content → Shorts filter → pencil icon → Thumbnail → upload → Save; Shorts uploaded from mobile can get a thumbnail later from a desktop browser. "Custom frame from the video" remains a mobile-app function. — [PPC Land](https://ppc.land/youtube-ends-2-year-wait-for-shorts-thumbnails-but-blocks-a-b-testing/); [AlternativeTo 2026-07-27](https://alternativeto.net/news/2026/7/youtube-introduces-custom-thumbnails-for-shorts-and-ask-studio-ai-thumbnail-generation/)

**[Official] Current YouTube Help page (read 2026-11-07)**
- "Custom thumbnails for Shorts are currently only available to add in YouTube Studio on a computer." "Your account must be verified to use this feature." Steps: Studio → Content → Shorts → edit → "Below 'Thumbnail,' click Upload file to create a custom Shorts thumbnail from an image on your device." → Save. — [YouTube Help 72431](https://support.google.com/youtube/answer/72431)
- Specs: recommended **2160 × 3840 px** for Shorts, minimum height 640 px; "For uploaded files, the recommended aspect ratio is 9:16."; JPG or PNG; 50 MB max on desktop; must follow Community Guidelines (violation → rejected thumbnail and possible strike); daily upload limit per channel. — [YouTube Help 72431](https://support.google.com/youtube/answer/72431)
- Same page: vertical videos with a 16:9 custom thumbnail get an **auto-generated 4:5 thumbnail** on home, explore and subscription pages. — [YouTube Help 72431](https://support.google.com/youtube/answer/72431)
- Eligibility wording differs: Blog says YPP; Help page says verified account. RouteNote reports both (YPP **and** verified). — [RouteNote](https://routenote.com/blog/youtube-shorts-custom-thumbnails/); vidIQ notes the mobile rollout was still expanding account by account (snippet). — [vidIQ Shorts thumbnails](https://vidiq.com/blog/post/youtube-shorts-custom-thumbnails)

**[Official] Why thumbnails matter little for discovery**
- YouTube Blog (2025-01-28): Jenny Hoyos: "Thumbnails are not important because 99.9% of the views are coming from the Shorts feed…" and "As far as channel marketing and branding, I think thumbnails are very important." Todd Sherman agreed. — [YouTube Blog 2025-01-28](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/). Conflict on attribution: PPC Land attributes the 99.9% figure to "YouTube's Shorts product lead" (2025-01-29). The YouTube Blog text puts the quote in Jenny Hoyos's mouth. — [PPC Land](https://ppc.land/youtube-ends-2-year-wait-for-shorts-thumbnails-but-blocks-a-b-testing/)
- YouTube Blog (2025-04-08): "Thumbnail Optimization: Though shorts are mostly viewed in feed, make sure that your channel as a whole looks good." — [YouTube Blog 2025-04-08](https://blog.youtube/creator-and-artist-stories/your-guide-to-getting-started-with-youtube-shorts/)

**[Opinion] Surfaces listed by third-party guides**
- Several third-party guides list search results, the channel page (Shorts tab/shelf), subscription/suggested feeds, hashtag pages, and audio/sound pivot pages as places where the Shorts thumbnail shows; all agree it does not show in the swipe feed. This came from search summaries; which page says what was not verified. Example page: [Creator Essentials, Shorts thumbnail](https://www.creatoressentials.com/glossary/shorts-thumbnail/)

**Outdated statements (do not use)**
- 2024-07-16: YouTube said custom Shorts thumbnails were not planned for 2024. — [PPC Land](https://ppc.land/youtube-ends-2-year-wait-for-shorts-thumbnails-but-blocks-a-b-testing/)
- An older vidIQ guide said the YouTube team had "no plans for custom thumbnails for the rest of 2025" (snippet). Superseded by the 2026-07-24 launch. — [vidIQ Shorts thumbnails](https://vidiq.com/blog/post/youtube-shorts-custom-thumbnails)
- Guides from 2024–early 2026 saying "Shorts thumbnails can only be a frame chosen in the mobile app" are outdated for YPP channels.

### Inferences
- For Life Cycle Lab, the custom thumbnail affects only the minority of traffic (home, channel page, search). It is worth doing, because the channel page grid is how a new viewer judges a faceless channel. It does not replace a strong first frame.
- A good Shorts thumbnail for this channel: 9:16 (2160×3840 or 1080×1920), subject centered and large (home may crop to 4:5), e.g., the adult animal with the egg/larva stage visible, consistent style across all videos so the channel grid looks like a series.
- If the channel is not yet in YPP or not verified, the user can only pick a frame: any frame in the mobile app, or one of 3 suggested frames on desktop. In that case the user should pick the clearest adult-animal frame, not frame 0.
- Without A/B testing for Shorts thumbnails, the only test loop is per-video comparison in analytics.

### Gaps
- Whether Life Cycle Lab is in YPP and verified is unknown; this decides custom upload vs. frame pick.
- The exact crop ratio for Shorts on each surface (home shelf, search, channel grid) is not documented officially; the "3:2" report conflicts with the Help page's "4:5".
- No official or data-based study on which Shorts thumbnail styles perform better was found.
- Social Media Today reported earlier frame-editing options (text, filters) for Shorts thumbnails, but the article was not read and its date was not verified. — [Social Media Today](https://www.socialmediatoday.com/news/youtube-adds-more-thumb-frame-editing-options-for-shorts/726120/)

## Q3. What do data-driven experts recommend for the first frame and hook, with numbers?

### Takeaway
The only large public dataset is Paddy Galloway & Chris Gileta's 2023 study (3.3 B views, ~5,400 Shorts): Shorts under **60% viewed** rarely did well and the best were typically **70–90% viewed**; Galloway's advice is to make the first second punchy and "treat the intro like a thumbnail". Jenny Hoyos says you have "one second" and the hook must be understandable on mute. No Shorts-specific first-frame data was found from MrBeast's team, Film Booth or TubeBuddy.

### Cited Findings
**[Expert-data] Paddy Galloway & Chris Gileta (thread dated Apr 14, 2023)**
- Dataset: 3.3 billion views, 33 channels across niches, ~5,400 Shorts; authors call the results "initial" and checked medians as well as averages. — [Galloway thread (Thread Reader)](https://threadreaderapp.com/thread/1646898356419981315.html)
- Viewed vs. swiped away (VVSA): Shorts **under 60%** rarely performed well; best performers were **typically 70–90%**; a high VVSA does not guarantee success, so do not obsess over it. — [Galloway thread](https://threadreaderapp.com/thread/1646898356419981315.html); secondary write-up: [videogen.io](https://videogen.io/blog/decoding-the-youtube-shorts-algorithm-a-deep-dive-into-3-3-billion-views)
- Hook advice: make the first second punchy and engaging; treat the intro like a thumbnail, because VVSA matters. — [Galloway thread](https://threadreaderapp.com/thread/1646898356419981315.html)
- Length: most Shorts in the sample ran 20–40 s; longer Shorts averaged more views; Shorts with average view duration above 50 s averaged 4.1 M views; outliers at all lengths. Likes/comments/shares had no strong relationship with performance. Average Shorts RPM ≈ $0.06. — [Galloway thread](https://threadreaderapp.com/thread/1646898356419981315.html)
- Dating caveat: this is 2023 data, collected when Shorts were capped at 60 s (vidIQ 2023: "you only have 60 seconds") and before the 2025-03-31 view-counting change; YouTube now caps Shorts at 3 minutes. — [vidIQ 2023](https://vidiq.com/blog/post/how-jenny-hoyos-gets-10m-views-per-youtube-short/); [YouTube Blog 2025-04-08](https://blog.youtube/creator-and-artist-stories/your-guide-to-getting-started-with-youtube-shorts/)

**[Expert-data] Nate Black study via vidIQ (article updated 2026-10-09)**
- Study of 35 billion Shorts views: Shorts of about 13 s or 60 s tend to perform best; channels with ≥200 Shorts tend to see steady growth; the first three seconds are "crucial for capturing viewer interest". vidIQ's FAQ recommends a "stronger hook in the first 1-3 seconds" if Shorts stop getting views. The original study was not read; numbers are as vidIQ reports them. — [vidIQ, Shorts algorithm 2026](https://vidiq.com/blog/post/youtube-shorts-algorithm/)

**[Opinion] Jenny Hoyos (top Shorts creator)**
- "I really do think you have one second to hook someone, especially on Shorts." (2025-01-28) — [YouTube Blog](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/)
- "It needs to be so good that you can be watching the video on mute and still know what it's about." (vidIQ, 2023-11-29, direct quote) — [vidIQ](https://vidiq.com/blog/post/how-jenny-hoyos-gets-10m-views-per-youtube-short/)
- "People only remember their favorite part of a movie and the ending" — basis for her pacing: fast hook, slower middle, fast peak, slow resolution, quick end (pacing structure is vidIQ's paraphrase). — [vidIQ](https://vidiq.com/blog/post/how-jenny-hoyos-gets-10m-views-per-youtube-short/)
- vidIQ's summary of her hook advice: "Give a sneak peek of what happens at the end of your video." (author's paraphrase, not a direct quote). — [vidIQ](https://vidiq.com/blog/post/how-jenny-hoyos-gets-10m-views-per-youtube-short/)
- Interview summaries say she writes the hook and the last line first, then fills the middle (snippet, secondhand). — [Leaderonomics](https://www.leaderonomics.com/videos/box-of-chocolates/how-to-make-great-youtube-shorts-lessons-from-jenny-hoyos)

**[Opinion] Third-party diagnosis of a low Viewed %**
- Causes listed by a glossary (no data disclosed): "The first frame is unclear."; "The opening takes too long to explain the subject."; also hard-to-read text, abrupt or unclear audio, a misleading or low-quality look, prior exposure to similar content, and a topic irrelevant to the viewer. It advises comparing similar Shorts on your own channel rather than using a fixed cutoff. — [Creator Essentials glossary](https://www.creatoressentials.com/glossary/viewed-vs-swiped-away/)

### Inferences
- A practical target for the user: keep Viewed % above ~70% and treat anything under ~60% as a failed opening. This rests on one 2023 dataset, so the user should treat it as a rough guide.
- Galloway's "intro = thumbnail" framing is the key idea for Life Cycle Lab: frame 0 has the job a thumbnail has in long-form.

### Gaps
- No Shorts-specific first-frame or hook data was found from MrBeast/Beast team, Film Booth or TubeBuddy. MrBeast's widely cited production advice concerns long-form (first minute), so it does not transfer directly; not verified in this session.
- A recap claimed Jenny Hoyos advises a simple first frame with high brightness and saturation, and a consistent first frame across videos for bingeability; the claim appeared only in a search summary and could not be tied to a specific page or direct quote.
- No public dataset compares openings by type (end-result first vs. chronological, text vs. no text).
- Search summaries mentioned third-party benchmark tiers (e.g., "75–80% viewed", "70%+ viewed is viral, 50/50 is average"), but the pages behind them were not identified or verified; they should not be cited.

## Q4. Should the first frame show the end result, use text, start in motion, preview the payoff? Is there evidence on looping?

### Takeaway
Evidence is mostly expert opinion, not controlled data. It consistently says: no slow intro, the subject must be clear at frame 0 (even on mute), and a preview or foreshadowing of the payoff helps people stay. Looping is a standard tactic: a Short replays automatically if not swiped, and since 2025-03-31 each replay counts as a view (not as an engaged view). No study isolates the effect of a seamless loop.

### Cited Findings
**Avoid slow intros / show the subject immediately**
- [Official] "Capture attention in the first few seconds to prevent viewers from scrolling." (2025-04-08) — [YouTube Blog](https://blog.youtube/creator-and-artist-stories/your-guide-to-getting-started-with-youtube-shorts/)
- [Opinion] vidIQ (2026): make the topic, payoff, question or visual clear right away and avoid long introductions. — [vidIQ, Shorts algorithm 2026](https://vidiq.com/blog/post/youtube-shorts-algorithm/)
- [Expert-data] Galloway: first second must be punchy; treat the intro like a thumbnail (2023). — [Galloway thread](https://threadreaderapp.com/thread/1646898356419981315.html)

**Payoff preview / end result first**
- [Opinion] Jenny Hoyos via vidIQ: give a sneak peek of what happens at the end (paraphrase, 2023); her hook structure is shock → intrigue → satisfaction (2025). — [vidIQ](https://vidiq.com/blog/post/how-jenny-hoyos-gets-10m-views-per-youtube-short/); [YouTube Blog 2025-01-28](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/)
- No controlled data found that "adult animal first" beats "egg first" for time-lapse content.

**Text overlay**
- [Official] YouTube lists "Overlay text to emphasize key points or add captions" among Shorts camera features (generic feature tip, not a hook study). — [YouTube Blog 2025-04-08](https://blog.youtube/creator-and-artist-stories/your-guide-to-getting-started-with-youtube-shorts/)
- [Opinion] Jenny Hoyos: the hook must be understood on mute. — [vidIQ](https://vidiq.com/blog/post/how-jenny-hoyos-gets-10m-views-per-youtube-short/)
- No data found on text vs. no-text first frames for Shorts.

**Looping**
- [Opinion] vidIQ (Lydia Sweatt, 2021-05-11, reviewed 2026-09-18): "Shorts replay automatically if you do not swipe away"; "Match the first and last frames"; keep the action just long enough to return to the start; loop the audio too or drop it if the cut is jarring. The article cites YouTube's 2021 Shorts report as recommending endings that flow into the beginning (report text not reproduced). Anecdote: Jake Fellman's looping animation did "15 million views in 48 hours" vs. a usual 3–4 M. — [vidIQ looping](https://vidiq.com/blog/post/double-youtube-watch-time-looping-shorts)
- [Official, via press] Since 2025-03-31, every start or replay counts as a Shorts view; engaged views exclude these loops and drive YPP/revenue. Loops inflate public views and watch-time/APV, but do not add engaged views. — [TechCrunch 2025-03-26](https://techcrunch.com/2025/03/26/youtube-is-changing-how-youtube-shorts-views-are-counted); [vidIQ looping FAQ](https://vidiq.com/blog/post/double-youtube-watch-time-looping-shorts)
- The vidIQ looping article shows a channel chart with average percentage viewed rising from 96.8% (Jan 2021) to 187.1% (Apr 2021), but it does not causally link this to looping. — [vidIQ looping](https://vidiq.com/blog/post/double-youtube-watch-time-looping-shorts)
- Galloway's 2023 thread does not cover looping. — [Galloway thread](https://threadreaderapp.com/thread/1646898356419981315.html)

### Inferences (applied to Life Cycle Lab's current opening)
- Current opening: ≈1.4 s fast push from a wide habitat cross-section into a close-up of eggs. Risk: at frame 0 the subject (eggs, or the animal) is tiny on a phone screen, and a muted viewer cannot tell what the video is about. That conflicts with "one second" and "understand on mute".
- Options that follow the expert advice (none tested by data for this niche):
  1. Start the camera push at frame 0 with no static hold, so motion is visible immediately; keep it at 1–1.5 s, as the user's own rule already says.
  2. Make frame 0 itself readable: a habitat frame where the burrow/eggs are already large and high-contrast, or a big bright subject in the center.
  3. Payoff preview: flash the adult animal for a fraction of a second (or show it at frame 0), then cut to the eggs. This follows the "sneak peek of the end" advice.
  4. A short on-screen text at frame 0 (e.g., "Egg → adult in 20 s" or the animal name) so the topic is clear on mute.
  5. Loop: end on a frame that matches the opening wide habitat shot (e.g., the adult returning to the burrow), so the replay looks seamless. Replays raise public views and APV, not engaged views.
- Because evidence is opinion-based, the user should A/B the opening across consecutive videos (e.g., wide push-in vs. adult-first) and compare Viewed % and engaged views per video in Studio.

### Gaps
- No controlled or large-sample evidence was found for: end-result-first vs. chronological openings, text overlay on frame 0, or seamless loops vs. hard cuts.
- No data on how AI-generated or time-lapse content specifically performs on Viewed %.

## Q5. How do top animal / nature / time-lapse Shorts open?

### Takeaway
No reliable breakdowns of how top animal life-cycle or time-lapse Shorts open were found; this question remains open and would need manual review of top Shorts in the niche.

### Cited Findings
- Searches for niche breakdowns returned only generic short-form hook guides without data.
- Long-form reference only: National Geographic / photographer Anand Varma's one-minute time-lapse of larvae turning into bees is a classic life-cycle time-lapse, but it is not a Shorts breakdown. — [AG Classroom resource](https://agclassroom.org/matrix/resource/925)

### Inferences
- Without niche data, the general Shorts rules from Q1–Q4 are the best available guide.

### Gaps
- No analysis of specific viral animal life-cycle or time-lapse Shorts (first frame, text, length, loop) was found. A manual review of the top 20–30 Shorts in the niche (e.g., search "life cycle timelapse" in the Shorts tab, sorted by views) would be needed to answer this.
