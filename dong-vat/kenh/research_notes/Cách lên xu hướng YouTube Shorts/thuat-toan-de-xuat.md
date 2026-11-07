# Thuật toán đề xuất YouTube Shorts: tín hiệu, cơ chế thử nghiệm, Trending/Explore và chính sách AI (ghi ngày 2026-11-07)

Quy ước nhãn cho từng mục:
- **[Chính thức]**: YouTube nói, qua Help Center, blog.youtube, Creator Insider hoặc nhân viên YouTube.
- **[Dữ liệu]**: chuyên gia hoặc công ty công bố số liệu kèm cỡ mẫu.
- **[Ý kiến]**: giai thoại, ý kiến creator, hoặc blog không rõ nguồn số liệu.

Ghi chú bối cảnh: YouTube đổi cách đếm view hai lần (2025-03-31 với Shorts, 2026-08-24 với mọi định dạng). Số liệu chuyên gia trước các mốc này dùng định nghĩa view cũ. Người đọc nên coi số liệu năm 2023 là mốc tham khảo, không phải ngưỡng hiện hành.

## 1. YouTube chính thức nói feed Shorts dùng tín hiệu nào?

### Takeaway
YouTube chỉ công bố tín hiệu ở mức khái quát: người xem chọn xem hay lướt qua, hành vi xem, like, dislike, đăng ký, khảo sát hài lòng. YouTube không công bố ngưỡng số nào, và cố ý giấu ngưỡng tính view để chống gian lận.

### Cited Findings
- **[Chính thức, 2023-08-25]** Todd Sherman (product lead của Shorts) giải thích khác biệt cốt lõi. Người xem long-form chủ động chạm chọn video. Người xem Shorts lướt feed "not knowing what comes next". Vì vậy feed Shorts ưu tiên đa dạng, do người xem lướt "hundreds of videos versus maybe 10 or 20 in long-form" — [TechCrunch](https://techcrunch.com/2023/08/25/youtube-demystifies-the-shorts-algorithm-views-and-answers-other-creator-questions/); video gốc trên Creator Insider: [YouTube](https://www.youtube.com/watch?v=n3jsYK_-aRU)
- **[Chính thức, 2023-08-25]** Sherman nói view Shorts phản ánh ý định xem, vượt một "meaningful threshold". YouTube không công bố ngưỡng này vì thỉnh thoảng điều chỉnh và không muốn bị lách — [TechCrunch](https://techcrunch.com/2023/08/25/youtube-demystifies-the-shorts-algorithm-views-and-answers-other-creator-questions/)
- **[Chính thức, không ghi ngày]** Trang "How YouTube Works" liệt kê tín hiệu cho hệ thống đề xuất: hành vi xem, lượt thích, lượt không thích, kênh đăng ký, ý kiến phản hồi, gồm khảo sát mức độ hài lòng. Trang này không có mục riêng cho Shorts. Trang cũng nói hệ thống xét "danh tiếng và chất lượng của kênh" và dùng người đánh giá bên ngoài — [How YouTube Works: Recommendations](https://www.youtube.com/howyoutubeworks/product-features/recommendations/)
- **[Chính thức, 2023-02]** YouTube thêm hai chỉ số Shorts vào Analytics tháng 2/2023: "Shown in feed" (số lần Short hiện trong feed) và "Viewed (vs. swiped away)" (tỷ lệ người xem chọn xem so với tỷ lệ lướt qua) — [YouTube Studio App Help: app updates](https://support.google.com/youtubecreatorstudio/answer/10089025/youtube-studio-app-updates?hl=en); định nghĩa chỉ số: [YouTube Help: Understand your content reach and engagement](https://support.google.com/youtube/answer/12220281)
- **[Chính thức, theo trích dẫn thứ cấp, 2026]** Cut.Pro trích Help Center với chỉ số "Stayed to watch": "the percentage of times viewers stayed to watch past the initial seconds of a Short". Tôi chưa mở trực tiếp trang Help để xác nhận YouTube đã đổi tên chỉ số "Viewed vs. swiped away" hay chưa — [Cut.Pro, 2026-11-04](https://cut.pro/en/blog/youtube-shorts-stuck-low-views-2026)
- **[Chính thức, 2025-03-31]** Từ 2025-03-31, YouTube đếm một view Shorts mỗi khi Short bắt đầu phát hoặc phát lại, không cần thời gian xem tối thiểu. Chỉ số cũ thành "engaged views". Engaged views vẫn quyết định điều kiện YPP và chia doanh thu Shorts — [TechCrunch, 2025-03-26](https://techcrunch.com/2025/03/26/youtube-is-changing-how-youtube-shorts-views-are-counted); [PPC Land](https://ppc.land/youtube-changes-how-shorts-views-are-counted-from-march-31/)
- **[Chính thức, 2026-08-19]** Từ 2026-08-24, YouTube đếm view từ khung hình đầu cho mọi định dạng: "Shorts, Long Form, Podcasts, Live; all the formats". Định nghĩa view cũ đổi tên thành "engaged view", tức "clicking to watch or watching past the initial seconds". YouTube nói rõ: "no change to recommendations — the algorithm". CTR, AVD, retention trong Analytics vẫn tính theo engaged views — [YouTube Blog: Engaged views explained](https://blog.youtube/inside-youtube/engaged-views-youtube-explained/)
- **[Chính thức, 2025-01-28]** Bài blog YouTube với Todd Sherman và creator Jenny Hoyos nói thumbnail ít quan trọng với khám phá trên feed Shorts. Hoyos nói: "Thumbnails are not important because 99.9% of the views are coming from the Shorts feed." Hoyos cũng nói: "I really do think you have one second to hook someone, especially on Shorts." — [YouTube Blog: Shorts deep dive](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/)
- **[Chính thức, theo trích dẫn thứ cấp]** Todd Beaupré (Growth & Discovery) mô tả hệ thống gồm nhiều thuật toán, gộp thành một danh sách xếp hạng riêng cho từng người xem — [Digiday](https://digiday.com/future-of-tv/future-of-tv-briefing-youtube-gives-a-peek-at-how-its-recommendation-algorithms-work). Bản tóm tắt của vidIQ nói Beaupré mô tả YouTube đo mức hài lòng bằng khảo sát sau khi xem và hành vi người xem; "không phải mọi watch time đều có giá trị như nhau" — [vidIQ qua Rosetta](https://rosetta.to/u/vidiq/the-ultimate-small-channel-guide-to-the-youtube-algorithm); [vidIQ qua Rosetta](https://rosetta.to/u/vidiq/youtube-launches-new-algorithm-updates-2025)
- **[Chính thức, 2026-01-21]** Thư thường niên của CEO Neal Mohan: "AI has been the quiet engine behind our most important innovations, like recommending the next video". Shorts đạt trung bình 200 tỷ view mỗi ngày — [YouTube Blog: The future of YouTube 2026](https://blog.youtube/inside-youtube/the-future-of-youtube-2026/)

### Inferences
- "Viewed vs. swiped away" là tín hiệu duy nhất YouTube công khai đưa vào Analytics riêng cho feed Shorts. Đây là chỉ số gần nhất với tín hiệu "người xem chọn ở lại" mà Sherman mô tả.
- Từ 2026-08-24, view công khai tăng vì tính từ khung đầu. Chủ kênh nên so sánh hiệu quả bằng engaged views, không bằng view công khai.
- YouTube không công khai trọng số của like, share, comment cho riêng Shorts. Danh sách tín hiệu trên trang "How YouTube Works" áp cho toàn hệ thống đề xuất.

### Gaps
- Tôi không tìm được phát biểu gốc của Rene Ritchie hay Todd Beaupré mô tả riêng tín hiệu Shorts (looping, average percentage viewed, share). Nguồn thứ cấp gán nhiều câu cho Beaupré nhưng không dẫn video gốc.
- YouTube không công bố ngưỡng "Viewed vs. swiped away" hay retention tối thiểu. Một hướng dẫn nói thẳng YouTube không có benchmark chính thức cho mọi chỉ số Shorts — [Subscribr](https://subscribr.ai/p/youtube-shorts-analytics-metrics-viral).
- Không có tuyên bố chính thức nào nói share hay loop là tín hiệu xếp hạng riêng của Shorts.

## 2. YouTube mô tả quá trình thử nghiệm rồi mở rộng thế nào? Vì sao có Short nhận view sau nhiều ngày hoặc nhiều tuần?

### Takeaway
YouTube xác nhận có cơ chế tìm "seed audience" rồi tăng hoặc giảm phân phối theo phản hồi. YouTube không công bố mô hình nhiều đợt hay lịch thử lại. Giải thích "Short sống lại sau nhiều tuần" chủ yếu đến từ blog bên thứ ba. Cuối 2025, creator báo cáo Short cũ hơn 30 ngày mất view đột ngột.

### Cited Findings
- **[Chính thức, 2023-08-25]** Todd Sherman: "There are parts of the algorithm that try and find people, find creators an audience." Sherman tiếp: "And sometimes those algorithms will go and effectively find like a seed audience". Sherman kết luận: "And depending on how that goes, it may get a lot more traffic or it may taper off," — [TechCrunch](https://techcrunch.com/2023/08/25/youtube-demystifies-the-shorts-algorithm-views-and-answers-other-creator-questions/)
- **[Chính thức, 2023-08-25]** TechCrunch ghi nhận hiện tượng creator gọi là "stuck": Short có đà rồi view chững lại. Sherman khuyên không xóa rồi đăng lại Short để kích view, vì YouTube có thể coi đó là spam — [TechCrunch](https://techcrunch.com/2023/08/25/youtube-demystifies-the-shorts-algorithm-views-and-answers-other-creator-questions/)
- **[Chính thức, theo trích dẫn thứ cấp]** Cut.Pro gán câu "many waves of interest in channels" cho Beaupré và câu "no penalty box" cho nhóm growth của YouTube. Bài không dẫn link gốc, nên tôi chưa xác minh được — [Cut.Pro, 2026-11-04](https://cut.pro/en/blog/youtube-shorts-stuck-low-views-2026)
- **[Ý kiến, 2026-11-04]** Cut.Pro viết rằng chuyện Short "chết" sống lại sau nhiều tuần không có cơ chế chính thức nào đứng sau — [Cut.Pro](https://cut.pro/en/blog/youtube-shorts-stuck-low-views-2026)
- **[Ý kiến]** Một số blog cho rằng YouTube định kỳ thử lại Short cũ với nhóm khán giả mới — [Smash Balloon](https://smashballoon.com/youtube-shorts-not-getting-views/); [Shortimize](https://www.shortimize.com/blog/how-does-youtube-shorts-algorithm-work). Socialinsider báo nhiều video có đỉnh view sau nhiều tuần — [Socialinsider](https://www.socialinsider.io/blog/how-long-does-it-take-for-yt-shorts-to-get-views/)
- **[Dữ liệu, 2026]** Metricool phân tích 799.718 video từ 71.177 tài khoản. Kết quả: 83% tương tác diễn ra trong 10 ngày đầu — [Metricool 2026 study](https://metricool.com/press-release-youtube-study-2026/), theo trích dẫn của [Cut.Pro](https://cut.pro/en/blog/youtube-shorts-stuck-low-views-2026)
- **[Ý kiến có dữ liệu ẩn danh, 2025-12-05]** Tubefilter đưa tin nhiều kênh Shorts mất view mạnh ở Short đăng hơn 30 ngày trước, còn Short mới không bị ảnh hưởng. Mario Joos (CEO, Stokes Twins) gọi hiện tượng này là "the flattening", ảnh hưởng "dozens of channels", bắt đầu khoảng tháng 9/2025. Tim Chesney nhận xét: "It pushes the creator to produce more instead of better." YouTube chưa bình luận khi bài đăng — [Tubefilter](https://www.tubefilter.com/2025/12/05/youtube-shorts-algorithm-change-new-uploads/amp/)
- **[Dữ liệu, 2026]** Agentio đo 550 Short tự nhiên năm 2026. View công khai cao hơn engaged views khoảng 65% — [Agentio](https://www.agentio.com/blog/youtube-view-vs-engaged-view), theo trích dẫn của [Cut.Pro](https://cut.pro/en/blog/youtube-shorts-stuck-low-views-2026)

### Inferences
- Mô hình chính thức gần nhất là: hệ thống tìm seed audience, đo phản hồi, rồi mở rộng hoặc giảm dần. Mô hình "3 đợt" hay "pha 1, pha 2" trên blog là diễn giải của bên thứ ba.
- Nếu hiện tượng "the flattening" cuối 2025 đúng, Short cũ ít có cơ hội nhận view muộn hơn trước. Short mới đăng sẽ chiếm phần lớn view của kênh.
- Một phần "view tăng muộn" có thể do đổi cách đếm view (2025-03-31, 2026-08-24), không phải do Short được phân phối thêm.

### Gaps
- YouTube không công bố seed audience lớn bao nhiêu, kéo dài bao lâu, hay có thử lại Short cũ không.
- Google chưa xác nhận hay bác bỏ thay đổi "ưu tiên Short mới" cuối 2025 trong các nguồn tôi tìm được.

## 3. Kích thước kênh, số subscriber hoặc tần suất đăng có ảnh hưởng tới tầm với của một Short không?

### Takeaway
YouTube nói tần suất đăng và giờ đăng không phải yếu tố nên tối ưu. Tôi không tìm được tuyên bố chính thức gốc về vai trò của số subscriber với Shorts. Dữ liệu chuyên gia gợi ý kênh có nhiều Short tăng view đều hơn theo thời gian.

### Cited Findings
- **[Chính thức, 2023-08-25]** Theo TechCrunch, Sherman nói giờ đăng trong ngày không cần tối ưu, trừ tin tức vì tin cần độ mới. Đăng nhiều không giúp Short có đà; bài tóm tắt là "quality over quantity" — [TechCrunch](https://techcrunch.com/2023/08/25/youtube-demystifies-the-shorts-algorithm-views-and-answers-other-creator-questions/)
- **[Chính thức, 2023-08]** Benzinga tóm tắt cùng buổi Creator Insider với tiêu đề: đăng 10 video mỗi ngày không ảnh hưởng hiệu quả, và thuật toán không ưu ái creator theo tần suất đăng — [Benzinga](https://benzinga.com/z/34020532)
- **[Chính thức, theo trích dẫn thứ cấp]** Cut.Pro trích Rene Ritchie: "The algorithm follows the audience." Ritchie cũng nói YouTube "might consider that as spam" khi nói về đăng lại nhiều lần. Bài không dẫn link gốc — [Cut.Pro](https://cut.pro/en/blog/youtube-shorts-stuck-low-views-2026)
- **[Chính thức, không ghi ngày]** Trang "How YouTube Works" nói hệ thống xét "danh tiếng và chất lượng của kênh" — [How YouTube Works](https://www.youtube.com/howyoutubeworks/product-features/recommendations/)
- **[Dữ liệu, không rõ năm]** Nate Black phân tích 35 tỷ view Shorts trong phỏng vấn với vidIQ. Kênh có ít nhất 200 Short đã đăng có view tăng đều theo thời gian — [vidIQ, cập nhật 2026-10-09](https://vidiq.com/blog/post/youtube-shorts-algorithm/)
- **[Dữ liệu, 2023-04-14]** Paddy Galloway (5.400 Short, 33 kênh, 3,3 tỷ view) thấy Shorts chuyển đổi subscriber kém long-form tính trung bình. Riêng kênh trên 1 triệu subscriber, Shorts chuyển đổi subscriber tốt hơn long-form — [Paddy Galloway thread](https://threadreaderapp.com/thread/1646898356419981315.html)

### Inferences
- Theo lời YouTube, đăng dày không tự tăng tầm với cho từng Short. Đăng nhiều chỉ tăng số lần thử với seed audience.
- Con số "200 Short" của Nate Black là tương quan. Kênh đăng nhiều thường cũng là kênh làm lâu và giỏi hơn, nên con số này không chứng minh quan hệ nhân quả.
- "Danh tiếng và chất lượng của kênh" có thể khiến chính sách chống nội dung lặp (mục 6) ảnh hưởng toàn kênh, nhưng YouTube không nói rõ cơ chế này áp cho feed Shorts.

### Gaps
- Tôi không tìm được phát biểu gốc của YouTube nói rằng kênh nhỏ có cơ hội ngang kênh lớn trên feed Shorts. Nhiều blog khẳng định điều này nhưng không dẫn nguồn chính thức.
- Galloway không phân tích tần suất đăng.

## 4. Chuyên gia có dữ liệu nói gì về yếu tố dự báo một Short viral?

### Takeaway
Dữ liệu chuyên gia nhất quán ở một điểm: tỷ lệ chọn xem (viewed vs. swiped away) và thời gian xem dự báo hiệu quả tốt hơn like, comment, share. Về độ dài, các nguồn mâu thuẫn nhau. YouTube nói không có độ dài nào được lợi.

### Cited Findings
- **[Dữ liệu, 2023-04-14]** Paddy Galloway và analyst Chris Gileta phân tích 5.400 Short từ 33 kênh, tổng 3,3 tỷ view. Kết quả:
  - Short dưới 60% "viewed vs. swiped away" hiếm khi làm tốt. Short tốt nhất thường nằm trong khoảng 70–90%. VVSA cao không bảo đảm thành công.
  - Short có AVD trên 50 giây đạt trung bình 4,1 triệu view.
  - Phần lớn Short dài 20–40 giây. Short dài hơn có view trung bình cao hơn. Outlier xuất hiện ở mọi độ dài.
  - Like, share, comment không có quan hệ mạnh với hiệu quả. Galloway nói cần thử thêm.
  - RPM Shorts trung bình khoảng 0,06 USD mỗi 1.000 view.
  - Galloway kiểm tra cả trung bình và trung vị — [Paddy Galloway thread](https://threadreaderapp.com/thread/1646898356419981315.html); [Digital Information World, 2023-04](https://www.digitalinformationworld.com/2023/04/paddy-galloway-decoded-youtube-shorts.html)
- **[Dữ liệu, không rõ năm]** Nate Black (35 tỷ view Shorts, phỏng vấn vidIQ): Short dài 13 giây hoặc 60 giây thường làm tốt nhất. Nội dung trình diễn gốc và nội dung giác quan như ASMR hút view ổn định. 3 giây đầu quyết định — [vidIQ, cập nhật 2026-10-09](https://vidiq.com/blog/post/youtube-shorts-algorithm/)
- **[Chính thức, 2023-08-25]** Sherman nói không có độ dài nào được lợi. Creator nên làm dài đúng bằng câu chuyện cần — [TechCrunch](https://techcrunch.com/2023/08/25/youtube-demystifies-the-shorts-algorithm-views-and-answers-other-creator-questions/). Bài blog YouTube 2025-01-28 nhắc Sherman khen các creator làm "moment" khoảng 15 giây — [YouTube Blog](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/)
- **[Ý kiến có số liệu kênh riêng]** Jenny Hoyos, theo bản tóm tắt phỏng vấn với Jay Clouse: Short nổi nhất của cô dài khoảng 34 giây. Với kênh của cô, Short dưới 30 giây cần retention trên 100% mới cất cánh. Retention trung bình vượt 100% vì người xem xem lại vòng lặp — [Briefread summary](https://briefread.pages.dev/en/summary/meet-the-youtuber-who-solved-shorts); [Chaindesk summary](https://chaindesk.ai/tools/youtube-summarizer/meet-the-you-tuber-who-solved-shorts-jenny-hoyos-interview-As7abwNhG7Y). Các bản tóm tắt tự động không khớp nhau hoàn toàn. Một bản ghi 92% scroll-through rate và 20% share/view, tôi chưa xác minh được.
- **[Chính thức, 2025-01-28]** Hoyos chia mỗi Short thành chuỗi "bits", mỗi bit là một câu chuyện nhỏ. Công thức hook của cô gồm ba phần: sốc, tò mò, thỏa mãn — [YouTube Blog](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/)
- **[Ý kiến]** Một số hướng dẫn đặt mục tiêu 75–80% viewed vs. swiped away. Nguồn này khác nghiên cứu của Galloway và không công bố cỡ mẫu — [Subscribr](https://subscribr.ai/p/youtube-shorts-analytics-metrics-viral)
- **[Ý kiến]** Blog bên thứ ba đưa ra các ngưỡng như "20% swipe-away" hay "60% viewed". Các ngưỡng này mâu thuẫn nhau và không đến từ YouTube — tổng hợp từ [Shortimize](https://www.shortimize.com/blog/how-does-youtube-shorts-algorithm-work), [Metricool](https://metricool.com/youtube-shorts-algorithm/)
- **[Dữ liệu, 2026-11]** Cut.Pro dẫn một kênh có khoảng 27% viewed và 73% swiped away trong 90 ngày, như ví dụ kênh kém — [Cut.Pro](https://cut.pro/en/blog/youtube-shorts-stuck-low-views-2026), dẫn lại Social Media Examiner.

### Inferences
- Trên các nguồn có dữ liệu, VVSA trên 70% là điều kiện cần thường gặp ở Short lớn. VVSA cao vẫn chưa đủ.
- Với Short 20–26 giây, chỉ số AVD trên 50 giây của Galloway không áp được. Chỉ số tương đương là average percentage viewed vượt 100%, tức người xem xem lại. Hoyos dùng đúng logic này cho Short dưới 30 giây.
- Galloway không thấy like, comment, share dự báo mạnh. Trang "How YouTube Works" lại liệt kê like và dislike là tín hiệu. Hai điều này không loại trừ nhau: tín hiệu có trong mô hình nhưng có thể yếu so với hành vi xem.
- Số liệu Galloway có trước khi Shorts dài tới 3 phút (tháng 10/2024) và trước hai lần đổi cách đếm view. Định nghĩa VVSA trong Analytics có thể đã đổi sau 2026-08-24.

### Gaps
- Tôi không tìm được số liệu công khai của MrBeast hay đội Beast về Shorts. Tôi cũng không tìm được nghiên cứu có số liệu của Think Media, Film Booth hay TubeBuddy về Shorts trong phạm vi tìm kiếm này.
- Không có nghiên cứu công khai nào đo riêng loop rate như biến dự báo.
- Không có dữ liệu riêng cho kênh faceless, kênh AI, hay ngách động vật và time-lapse.

## 5. Trang "Trending" và "Explore" là gì, và có còn liên quan tới Shorts năm 2025–2026 không?

### Takeaway
YouTube đã gỡ trang Trending và danh sách "Trending Now" ngày 2025-07-22. Thay vào đó là các bảng xếp hạng (Charts) theo danh mục. Shorts lan rộng qua feed Shorts cá nhân hóa, không qua một danh sách xu hướng chung.

### Cited Findings
- **[Chính thức, qua báo chí, 2025-07-10]** YouTube thông báo gỡ trang Trending và danh sách Trending Now. Lý do YouTube đưa ra: lượt truy cập trang Trending "decrease significantly, especially over the last five years". Trang Trending ra mắt năm 2015 — [9to5Google](https://9to5google.com/2025/07/10/youtube-trending-page-removal/); [RouteNote](https://routenote.com/blog/youtube-removes-trending-page/)
- **[Chính thức, qua báo chí, 2025-07-22]** Ngày hiệu lực là 2025-07-22. YouTube thay bằng các bảng như Trending Music Videos, Weekly Top Podcast Shows, Trending Movie Trailers, và hứa thêm danh mục. Trang Gaming Explore vẫn giữ video gaming thịnh hành — [RouteNote](https://routenote.com/blog/youtube-removes-trending-page/); [Neowin](https://www.neowin.net/news/youtube-kills-the-trending-page-after-a-decade-of-existence/)
- **[Báo chí, 2025-07]** Theo báo chí, YouTube nói người xem giờ tìm nội dung phổ biến qua đề xuất, gợi ý tìm kiếm, Shorts, bình luận và Communities. Menu Explore vẫn cho duyệt nội dung không cá nhân hóa. YouTube giới thiệu tab Inspiration trong YouTube Studio cho creator tìm ý tưởng — [The Week](https://www.theweek.in/news/sci-tech/2025/07/14/ten-years-on-youtube-trending-tab-is-no-longer-trending.html); [9to5Google](https://9to5google.com/2025/07/10/youtube-trending-page-removal/)
- **[Chính thức, 2025-01-28]** Hoyos nói 99,9% view Shorts đến từ feed Shorts — [YouTube Blog](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/)

### Inferences
- Với kênh Shorts năm 2026, "lên xu hướng" nghĩa là được feed Shorts cá nhân hóa đẩy rộng. Không còn trang Trending chung để lọt vào.
- Trang Trending cũ chủ yếu chứa long-form do biên tập và tín hiệu tăng trưởng chọn. Nguồn tôi đọc không cho thấy Shorts từng là nguồn view chính từ trang Trending.

### Gaps
- Tôi không mở được thông báo gốc của YouTube trên Help Center hay blog.youtube về việc gỡ Trending, nên trích dẫn đến từ báo chí.
- Tôi không tìm được nguồn nói Charts hay Explore có mục riêng cho Shorts năm 2026.

## 6. Chính sách 2025–2026 nói gì về nội dung AI, faceless, lặp lại? Nhãn AI có ảnh hưởng tới đề xuất không?

### Takeaway
YouTube nói riêng việc gắn nhãn AI không hạn chế khán giả hay khả năng kiếm tiền. Rủi ro lớn hơn đến từ chính sách "inauthentic content" (2025-07-15): nội dung AI làm theo template chung, ít khác biệt giữa các video, không đủ điều kiện kiếm tiền, và YouTube có thể gỡ kiếm tiền cả kênh. Năm 2026, CEO nói YouTube mở rộng hệ thống chống spam để giảm lan truyền "AI slop".

### Cited Findings
- **[Chính thức, Help Center]** "Disclosing AI content alone won't limit a video's audience or impact its eligibility to earn money." Trang không nói gì riêng về xếp hạng đề xuất hay tìm kiếm — [YouTube Help: Disclosing altered or synthetic content](https://support.google.com/youtube/answer/14328491)
- **[Chính thức, Help Center]** Creator phải công bố nội dung AI trông thật: người thật nói hoặc làm điều họ không làm, cảnh quay sự kiện hoặc địa điểm thật bị chỉnh, "cảnh trông thật chưa từng xảy ra". Creator không phải công bố: "Creators don't need to disclose non-realistic content that's made with AI, or edits to realistic content that are minor." Ví dụ không phải công bố: "Someone riding a unicorn through a fantastical world." Với nội dung ảnh thật (photorealistic), nhãn có thể hiện trong trình phát. Với nội dung hoạt hình hay không ảnh thật, nhãn hiện trong phần mô tả mở rộng — [YouTube Help](https://support.google.com/youtube/answer/14328491)
- **[Chính thức, 2025-07-15]** YouTube đổi tên "repetitious content" thành "inauthentic content" trong chính sách kiếm tiền YPP. Các mục không được kiếm tiền gồm:
  - "Image slideshows, templated storylines, or scrolling text with minimal or no narrative, commentary, or educational value"
  - "Similar or repetitive content with low educational value, commentary, narratives, or minimal variation across videos"
  - "AI-generated content made with generic or unoriginal templates"
  - Kênh không được "mass-produced, generic, repetitive, or manipulative"
  
  Các mục vẫn được kiếm tiền gồm: cùng intro và outro nhưng phần lớn nội dung khác nhau, và series mà "each video has a distinct storyline, focus, or concept" — [YouTube Help: YPP policies](https://support.google.com/youtube/answer/1311392)
- **[Chính thức, Help Center]** Cưỡng chế áp cho cả kênh: "monetization may be removed from your entire channel" khi video vi phạm, hoặc khi YouTube không rõ bạn có tự làm nội dung không — [YouTube Help: YPP policies](https://support.google.com/youtube/answer/1311392)
- **[Chính thức, qua báo chí, 2025-07]** Rene Ritchie nói loại nội dung bị nhắm (mass-produced, lặp lại) vốn đã không đủ điều kiện YPP. Bản cập nhật 2025 là làm rõ chính sách. YouTube nói kênh reaction và clip không bị nhắm riêng, nhưng sẽ tăng cưỡng chế với nội dung lặp kiểu spam — [Search Engine Journal](https://www.searchenginejournal.com/youtube-monetization-update-spam-not-reaction-channels/550755/); [Social Samosa](https://www.socialsamosa.com/news-2/youtube-clarifies-monetisation-policy-targeting-inauthentic-content-9493155)
- **[Chính thức, 2026-01-21]** Thư CEO Neal Mohan: "The rise of AI has raised concerns about low-quality content, aka "AI slop."" Mohan viết YouTube "actively building on our established systems that have been very successful in combatting spam and clickbait". Thư cũng nói: "creators must disclose when they've created realistic altered or synthetic content." Mohan thêm: "Because labels aren't always enough, we remove any harmful synthetic media that violates our Community Guidelines." — [YouTube Blog: The future of YouTube 2026](https://blog.youtube/inside-youtube/the-future-of-youtube-2026/)
- **[Chính thức, 2026-05]** Lyor Cohen (YouTube Music) nhắc lại YouTube đang chống lan truyền nội dung AI chất lượng thấp — [YouTube Blog](https://blog.youtube/inside-youtube/lyor-cohen-youtube-music-strategy/)
- **[Dữ liệu chưa xác minh, 2026-01]** Báo chí dẫn nghiên cứu của Kapwing: AI slop chiếm hơn 20% đề xuất cho người dùng mới, và 16 trong 100 kênh slop nhiều subscriber nhất đã bị gỡ. Tôi chưa mở được nghiên cứu gốc — [eWeek](https://www.eweek.com/news/youtube-ai-slop-crackdown-creators/)
- **[Ý kiến, 2026-11-04]** Cut.Pro nói điều kiện YPP mới từ 2027-02-01 là 20 triệu view Shorts hợp lệ trong 90 ngày hoặc 8.000 giờ xem (đối tác hiện tại: 10 triệu). Bài chỉ dẫn bài khác của chính Cut.Pro, không dẫn nguồn YouTube. Tôi coi con số này là chưa xác minh — [Cut.Pro](https://cut.pro/en/blog/youtube-shorts-stuck-low-views-2026)

### Inferences
- Chính sách "inauthentic content" là chính sách kiếm tiền (YPP), không phải chính sách xếp hạng đề xuất. Thư CEO 2026 lại nói rõ YouTube dùng hệ thống chống spam để "giảm lan truyền" AI slop. Vậy nội dung bị coi là AI slop có thể bị giảm phân phối, không chỉ mất tiền.
- Kênh Life Cycle Lab dùng cùng một khung cho mọi video: time-lapse AI 20–26 giây, không thuyết minh, cấu trúc giống nhau. Khung này chạm vào hai mô tả rủi ro: "templated storylines… with minimal or no narrative" và "AI-generated content made with generic or unoriginal templates". Mỗi loài có câu chuyện riêng là điểm khác biệt, khớp với ngoại lệ "each video has a distinct storyline, focus, or concept". Chủ kênh nên giữ khác biệt rõ giữa các video.
- Video time-lapse AI ảnh thật về động vật có thể rơi vào nhóm "cảnh trông thật chưa từng xảy ra", nên có thể phải công bố. YouTube nói riêng nhãn không làm giảm khán giả.

### Gaps
- YouTube không công bố tín hiệu nào phát hiện "AI slop" trong hệ thống đề xuất, cũng không nói nội dung AI không gắn nhãn bị xếp hạng khác không.
- Tôi không tìm được tuyên bố chính thức nào nói kênh faceless bị đối xử khác trong đề xuất.
- Tôi không xác minh được điều kiện YPP 2027 mà Cut.Pro nêu.
