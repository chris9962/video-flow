# Hành vi người xem quyết định phân phối video Shorts

YouTube nói feed Shorts thử mỗi video với một nhóm người xem nhỏ, rồi mở rộng hoặc giảm theo hành vi của nhóm đó. Bộ dữ liệu chuyên gia lớn nhất cho thấy video Shorts tốt thường giữ 70–90% người xem không lướt qua, nên khung hình đầu quan trọng nhất. Tiêu đề chủ yếu phục vụ tìm kiếm, thumbnail không hiện trong feed, và YouTube nói giờ đăng không ảnh hưởng hiệu quả lâu dài. Trên kênh Life Cycle Lab, cùng khung giờ đăng và cùng mẫu tiêu đề cho cả 1.008.853 lượt xem lẫn 400–900 lượt xem. Video tôm càng xanh mở đầu thẳng bằng cận cảnh tôm mẹ ôm trứng cam, không có clip M camera tiến vào. Kênh chỉ dùng clip M từ 2026-11-05, nên bạn nên đo tỷ lệ chọn xem trước khi giữ clip M làm mặc định.

Báo cáo dùng 4 nhãn. **YouTube chính thức** là Help Center, blog của YouTube hoặc nhân viên YouTube. **Số liệu chuyên gia** là nghiên cứu có công bố cỡ mẫu. **Ý kiến** là lời khuyên của creator, blog hoặc nhà cung cấp không công bố dữ liệu. **Áp vào kênh** là suy luận của báo cáo từ dữ liệu kênh. Dữ liệu kênh lấy từ `memory/khung-gio-dang-video.md` và các file `kich-ban.md`, `dang-bai.md` của từng video trong git, commit `e579912`.

| Câu hỏi | Kết luận | Bằng chứng mạnh nhất |
|---|---|---|
| Yếu tố giúp video Shorts phân phối rộng | Phản ứng của nhóm người xem thử: chọn xem hay lướt qua, xem bao lâu | YouTube chính thức; dữ liệu 5.400 video của Galloway |
| Khung hình đầu | Chủ thể lớn, rõ trong giây đầu, hiểu được khi tắt tiếng | YouTube nói chung chung; số liệu Galloway; ý kiến Hoyos |
| Thumbnail | Không hiện trong feed; phục vụ trang chủ và trang kênh | YouTube chính thức, 2026-07-24 |
| Tiêu đề | Tên con vật và "life cycle" trong 40 ký tự đầu; phục vụ tìm kiếm | YouTube chính thức về tìm kiếm; độ dài là ý kiến |
| Giờ đăng | Chỉ ảnh hưởng lượt xem sớm, không ảnh hưởng hiệu quả lâu dài | YouTube Help; nghiên cứu nhà cung cấp mâu thuẫn nhau |

## Feed Shorts mở rộng video theo phản ứng của nhóm người xem thử

### YouTube chính thức: người xem quyết định, YouTube không công bố ngưỡng

Todd Sherman, trưởng sản phẩm Shorts, giải thích cơ chế trong video Creator Insider tháng 2023-08. Người xem Shorts lướt feed "not knowing what comes next", nên feed ưu tiên đa dạng ([TechCrunch](https://techcrunch.com/2023/08/25/youtube-demystifies-the-shorts-algorithm-views-and-answers-other-creator-questions/)). Theo Sherman, hệ thống "effectively find like a seed audience", tức một nhóm người xem thử. Sau đó video "may get a lot more traffic or it may taper off" ([TechCrunch](https://techcrunch.com/2023/08/25/youtube-demystifies-the-shorts-algorithm-views-and-answers-other-creator-questions/)). Sherman tóm tắt: **"The audience is the algorithm."** ([Search Engine Journal](https://www.searchenginejournal.com/youtube-explains-how-shorts-algorithm-works/494953/)).

Rene Ritchie, Creator Liaison của YouTube, mô tả cùng cơ chế ngày 2024-04-04. Ông viết: "the vast majority of Shorts are watched in the Shorts feed, where there are no thumbnails, and so no impressions or click-throughs." Vài trăm hoặc vài nghìn lượt xem đầu tiên là "impression-like views". Nếu video "doesn't perform as well as others in the feed, it won't go much beyond those initial" lượt xem đó ([YouTube Blog](https://blog.youtube/creator-and-artist-stories/renes-top-five-march-4-2024/)).

Trang "How YouTube Works" liệt kê tín hiệu cho hệ thống đề xuất: hành vi xem, lượt thích, lượt không thích, kênh đăng ký và khảo sát hài lòng ([How YouTube Works](https://www.youtube.com/howyoutubeworks/product-features/recommendations/)). Trang này áp cho toàn YouTube, không có mục riêng cho Shorts. Riêng Shorts, Analytics có chỉ số "Viewed (vs. swiped away)": "the percentage of total viewers who viewed your Shorts versus the percentage who swiped away" ([YouTube Help](https://support.google.com/youtube/answer/12220281)). Báo cáo này gọi chỉ số đó là **tỷ lệ chọn xem**. YouTube không công bố mức tỷ lệ chọn xem nào là tốt, cũng không nói người xem lướt sau bao nhiêu giây thì tính là lướt qua ([YouTube Help](https://support.google.com/youtube/answer/12942217?hl=en&co=YOUTUBE._YTVideoType%3Dshorts)). Sherman cũng nói YouTube không ưu tiên độ dài nào; creator nên làm video dài đúng bằng nội dung cần ([TechCrunch](https://techcrunch.com/2023/08/25/youtube-demystifies-the-shorts-algorithm-views-and-answers-other-creator-questions/)).

YouTube đổi cách đếm lượt xem hai lần. Từ 2025-03-31, mỗi lần video Shorts bắt đầu phát hoặc phát lại tính là một lượt xem, không cần thời gian xem tối thiểu ([TechCrunch](https://techcrunch.com/2025/03/26/youtube-is-changing-how-youtube-shorts-views-are-counted)). Chỉ số cũ đổi tên thành **engaged view**, nghĩa là "clicking to watch or watching past the initial seconds". Từ 2026-08-24, YouTube áp cách đếm mới cho mọi định dạng và viết: "no change to recommendations — the algorithm" ([YouTube Blog](https://blog.youtube/inside-youtube/engaged-views-youtube-explained/)). Engaged view vẫn quyết định điều kiện của chương trình YouTube Partner Program, viết tắt YPP, và chia doanh thu Shorts ([PPC Land](https://ppc.land/youtube-changes-how-shorts-views-are-counted-from-march-31/)).

YouTube gỡ trang Trending và danh sách "Trending Now" ngày 2025-07-22 ([RouteNote](https://routenote.com/blog/youtube-removes-trending-page/)). YouTube giải thích lượt truy cập trang Trending "decrease significantly, especially over the last five years" ([9to5Google](https://9to5google.com/2025/07/10/youtube-trending-page-removal/)). Vì vậy, từ 2025-07-22, "lên xu hướng" với video Shorts nghĩa là feed Shorts cá nhân hóa phân phối video tới nhiều người. Trên blog của YouTube ngày 2025-01-28, creator Jenny Hoyos nói "99.9% of the views are coming from the Shorts feed", và Todd Sherman đồng ý trong cùng buổi ([YouTube Blog](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/)).

### Số liệu chuyên gia: hành vi xem dự báo kết quả tốt hơn like, comment, share

Paddy Galloway và analyst Chris Gileta phân tích **5.400 video Shorts của 33 kênh, tổng 3,3 tỷ lượt xem**, công bố ngày 2023-04-14 ([Paddy Galloway thread](https://threadreaderapp.com/thread/1646898356419981315.html)). Video có tỷ lệ chọn xem **dưới 60%** hiếm khi đạt kết quả tốt. Video tốt nhất thường có tỷ lệ chọn xem **70–90%**, nhưng tỷ lệ cao không bảo đảm thành công. Video có thời gian xem trung bình trên 50 giây đạt trung bình 4,1 triệu lượt xem. Lượt thích, chia sẻ và bình luận không có quan hệ mạnh với kết quả. Galloway kiểm tra cả trung bình lẫn trung vị, và gọi kết quả là bước đầu.

Dữ liệu Galloway có trước hai lần đổi cách đếm lượt xem, và trước khi Shorts dài tối đa 3 phút. Nate Black phân tích 35 tỷ lượt xem Shorts trong phỏng vấn với vidIQ ([vidIQ](https://vidiq.com/blog/post/youtube-shorts-algorithm/)). Ông thấy 3 giây đầu quyết định, và kênh có ít nhất 200 video Shorts tăng lượt xem đều. Con số 200 là tương quan, vì kênh đăng nhiều thường cũng làm lâu năm hơn. Metricool phân tích 799.718 video của 71.177 tài khoản năm 2026: **83% tương tác xảy ra trong 10 ngày đầu** ([Metricool](https://metricool.com/press-release-youtube-study-2026/)). Agentio đo 550 video Shorts năm 2026: lượt xem cao hơn engaged view khoảng 65% ([Agentio](https://www.agentio.com/blog/youtube-view-vs-engaged-view)).

### Ý kiến: video cũ ít nhận lượt xem muộn, ngưỡng trên blog không có nguồn

Tubefilter đưa tin ngày 2025-12-05: nhiều kênh mất lượt xem ở video Shorts đăng hơn 30 ngày, còn video mới giữ lượt xem ([Tubefilter](https://www.tubefilter.com/2025/12/05/youtube-shorts-algorithm-change-new-uploads/amp/)). Mario Joos gọi hiện tượng này là "the flattening" và nói nó ảnh hưởng "dozens of channels". YouTube chưa bình luận khi Tubefilter đăng bài. Một số blog nói YouTube định kỳ thử lại video Shorts cũ với người xem mới ([Smash Balloon](https://smashballoon.com/youtube-shorts-not-getting-views/)). Cut.Pro viết ngày 2026-11-04 rằng không có cơ chế chính thức nào giải thích video ít lượt xem rồi tăng lại sau nhiều tuần ([Cut.Pro](https://cut.pro/en/blog/youtube-shorts-stuck-low-views-2026)). Các ngưỡng như "75–80% viewed" trên blog không công bố cỡ mẫu ([Subscribr](https://subscribr.ai/p/youtube-shorts-analytics-metrics-viral)).

### Áp vào kênh: chênh lệch hơn 1.000 lần khớp cơ chế nhóm người xem thử

Chênh lệch giữa 1.008.853 và 400–900 lượt xem khớp cơ chế Sherman và Ritchie mô tả. Nhóm người xem thử phản hồi tốt với video tôm càng xanh, nên feed mở rộng tiếp. Các video khác dừng ở mức vài trăm tới vài nghìn lượt xem đầu tiên. Ghi chú nghiên cứu chưa có tỷ lệ chọn xem và engaged view của từng video. Bạn phải lấy hai số này trong YouTube Studio để biết nhóm người xem thử phản ứng khác nhau ở đâu. Cut.Pro và Creator Essentials gọi phía "viewed" của chỉ số là "Stayed to watch"; báo cáo chưa xác minh tên này trên trang Help ([Creator Essentials](https://www.creatoressentials.com/glossary/viewed-vs-swiped-away/)).

## Khung hình đầu quyết định người xem ở lại hay lướt qua

### YouTube chính thức: thu hút trong vài giây đầu, không có số liệu

Blog của YouTube ngày 2025-04-08 viết: **"Capture attention in the first few seconds to prevent viewers from scrolling."** ([YouTube Blog](https://blog.youtube/creator-and-artist-stories/your-guide-to-getting-started-with-youtube-shorts/)). Cùng bài khuyên "Overlay text to emphasize key points or add captions." YouTube không nói khung hình đầu nên chứa gì. YouTube cũng không công bố số liệu nào về đoạn mở đầu.

### Số liệu chuyên gia: phần mở đầu làm nhiệm vụ của thumbnail

Từ bộ dữ liệu 5.400 video, Galloway khuyên làm giây đầu thật cuốn hút. Ông nói phần mở đầu của video Shorts làm nhiệm vụ của thumbnail ở video dài, vì tỷ lệ chọn xem quyết định kết quả ([Paddy Galloway thread](https://threadreaderapp.com/thread/1646898356419981315.html)). Nate Black nói 3 giây đầu là "crucial for capturing viewer interest". vidIQ khuyên "stronger hook in the first 1-3 seconds" khi video Shorts ngừng nhận lượt xem ([vidIQ](https://vidiq.com/blog/post/youtube-shorts-algorithm/)). Không bộ dữ liệu công khai nào so các kiểu mở đầu: kết quả trước hay theo trình tự, có chữ hay không có chữ.

### Ý kiến: chủ thể rõ ngay, hiểu được khi tắt tiếng, khung cuối nối khung đầu

Jenny Hoyos là creator Shorts lớn. Câu của cô nằm trên blog của YouTube, nhưng vẫn là ý kiến cá nhân. Hoyos nói: **"I really do think you have one second to hook someone, especially on Shorts."** ([YouTube Blog](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/)). Cô chia đoạn mở đầu thành 3 phần: gây sốc, gây tò mò, rồi thỏa mãn. Cô cũng nói: "It needs to be so good that you can be watching the video on mute and still know what it's about." ([vidIQ](https://vidiq.com/blog/post/how-jenny-hoyos-gets-10m-views-per-youtube-short/)). vidIQ tóm lời khuyên của Hoyos: cho người xem thấy trước một phần kết quả cuối video.

Creator Essentials liệt kê nguyên nhân tỷ lệ chọn xem thấp, không kèm dữ liệu. Hai nguyên nhân đầu là "The first frame is unclear." và "The opening takes too long to explain the subject." ([Creator Essentials](https://www.creatoressentials.com/glossary/viewed-vs-swiped-away/)). Về vòng lặp, vidIQ khuyên "Match the first and last frames", vì video Shorts tự phát lại khi người xem không lướt ([vidIQ](https://vidiq.com/blog/post/double-youtube-watch-time-looping-shorts)). Từ 2025-03-31, mỗi lần phát lại tính là một lượt xem, nhưng không tính là engaged view. Không nghiên cứu công khai nào đo riêng tác dụng của vòng lặp. Theo bản tóm tắt phỏng vấn, Hoyos nói video dưới 30 giây của cô cần tỷ lệ xem trung bình trên 100%, tức người xem xem lại ([Briefread](https://briefread.pages.dev/en/summary/meet-the-youtuber-who-solved-shorts)).

### YouTube chính thức: thumbnail chỉ hiện ngoài feed Shorts

Ngày 2026-07-24, YouTube cho creator trong YPP tải thumbnail riêng cho video Shorts ([YouTube Blog](https://blog.youtube/news-and-events/youtube-studio-custom-thumbnail-updates/)). Creator khác chọn một khung bất kỳ trong app YouTube trên điện thoại, hoặc một trong 3 khung gợi ý trên máy tính. Thumbnail hiện ở trang chủ, tab Home và tab Shorts của trang kênh, không hiện trong feed Shorts ([PPC Land](https://ppc.land/youtube-ends-2-year-wait-for-shorts-thumbnails-but-blocks-a-b-testing/)). YouTube không có A/B test cho thumbnail Shorts. Trang Help yêu cầu tài khoản đã xác minh, và khuyên ảnh 2160 × 3840 px, tỉ lệ 9:16, định dạng JPG hoặc PNG ([YouTube Help](https://support.google.com/youtube/answer/72431)). Theo PPC Land, Ritchie khuyên đặt nội dung chính xa mép ảnh, vì mỗi trang cắt thumbnail theo tỉ lệ khác nhau.

Blog của YouTube ngày 2025-04-08 viết: "Though shorts are mostly viewed in feed, make sure that your channel as a whole looks good." ([YouTube Blog](https://blog.youtube/creator-and-artist-stories/your-guide-to-getting-started-with-youtube-shorts/)). Hoyos nói ngày 2025-01-28: "As far as channel marketing and branding, I think thumbnails are very important." ([YouTube Blog](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/)). Vì vậy thumbnail phục vụ người xem mở trang kênh, không phục vụ khám phá trong feed.

### Áp vào kênh: video tôm càng xanh không có clip M

Clip M là cảnh camera tiến nhanh 1–1,5 giây, từ toàn cảnh mặt cắt nơi sống vào cận cảnh trứng. Kênh dùng clip M lần đầu ở video gián nhà ngày 2026-11-05. Các video trước đó mở đầu thẳng bằng ảnh K01, camera đứng yên.

| Video | Ngày đăng | Khung hình đầu | Clip M | Lượt xem |
|---|---|---|---|---|
| Tôm càng xanh | 2026-10-31 | Cận cảnh tôm mẹ nhìn ngang, khối trứng cam sáng dưới bụng | Không | 1.008.853 |
| Cua đồng | 2026-10-31 | Cận cảnh cua mẹ trên hòn đá, trứng vàng hổ phách ở mép yếm | Không | 54.260 |
| Ốc bươu vàng | 2026-11-01 | Ốc mẹ bám thân lúa, dưới cụm trứng hồng | Không | dưới 6.000 |
| Nhện nước | 2026-11-01 | Nhện mẹ sát mặt nước, bụng có lớp khí bạc | Không | 400–900 |
| Ngài vải | 2026-11-02 | Cận cảnh ngài cái trên tường vữa | Không | 400–900 |
| Gián nhà | 2026-11-05 | Toàn cảnh căn bếp ban đêm | Có | dưới 6.000 |
| Lươn đồng | 2026-11-06 | Toàn cảnh nơi sống, clip M dài 1,5 giây | Có | 870 |

Bảng cho thấy hai điều. Thứ nhất, clip M không tạo ra video 1.008.853 lượt xem, vì video đó không có clip M. Thứ hai, cận cảnh con mẹ ôm trứng ở khung hình đầu cũng không đủ. Ốc bươu vàng, nhện nước và ngài vải mở đầu theo kiểu này nhưng đều dưới 6.000 lượt xem. Giả thuyết của báo cáo: chủ thể là biến lớn, vì hai video cao nhất đều là giáp xác có khối trứng màu lớn ở giữa khung. Kênh chỉ có một video trên 1 triệu lượt xem, nên dữ liệu chưa đủ để tách nguyên nhân.

Clip M đổi khung hình đầu từ chủ thể lớn sang toàn cảnh mặt cắt nơi sống. Trên màn hình điện thoại, trứng ở khung hình đầu nhỏ. Người xem tắt tiếng chưa biết video nói về con gì. Hai điều này trái với lời khuyên "one second" và "on mute" ở trên. Clip M cũng làm khung hình đầu khác khung cuối. Video cua đồng làm ảnh cuối K06 cùng bố cục với K01 để video phát lặp liền; clip M bỏ mất khớp nối này.

## Tiêu đề phục vụ tìm kiếm nhiều hơn feed Shorts

### YouTube chính thức: tiêu đề khớp truy vấn, Shorts không có A/B test

Trang "How YouTube search works" xếp hạng kết quả theo "how well the title, tags, description, and video content match your search query" ([YouTube Help](https://support.google.com/youtube/answer/16090438)). Ritchie viết ngày 2024-07-25: "Shorts can and do appear in Search, on the Home and Channel pages, and in other places where you can browse them, like the Subs feed." ([YouTube Blog](https://blog.youtube/creator-and-artist-stories/renes-top-five-july-25-2024/)). Ghi chú nghiên cứu lấy câu này qua đoạn trích của công cụ tìm kiếm, chưa mở bài gốc. YouTube chưa nói tiêu đề có ảnh hưởng tới phân phối trong feed Shorts hay không. Trang Help ghi: **"A/B testing is not available for Shorts."** ([YouTube Help](https://support.google.com/youtube/answer/13861714)).

Trang Help định nghĩa Shorts theo độ dài tối đa 3 phút và khung vuông hoặc dọc, không nhắc hashtag ([YouTube Help](https://support.google.com/youtube/answer/13861714)). Sherman nói hashtag không bắt buộc ([Search Engine Journal](https://www.searchenginejournal.com/youtube-explains-how-shorts-algorithm-works/494953/)). Với hashtag chủ đề, ông nói: "Other times they're focused on topics, and I think in both those cases, creators should consider using them." ([Social Media Today](https://www.socialmediatoday.com/news/youtube-shares-advice-for-shorts-creators-including-notes-on-hashtags-the/691835/)).

### Số liệu chuyên gia: #Shorts trong tiêu đề không có lợi rõ

OverseerOS phân tích 17.280 video Shorts của 1.191 kênh, đăng từ 2026-08-30 tới 2026-10-23 ([OverseerOS](https://www.overseeros.com/blog/should-you-put-shorts-in-youtube-title)). Khi so trong cùng kênh, 26 kênh nghiêng về tiêu đề có #Shorts, 25 kênh nghiêng về tiêu đề không hashtag. Tỉ số trung vị là **1,01 lần**. Tác giả kết luận "no consistent advantage". Tiêu đề không hashtag trong mẫu có trung vị 43 ký tự. Nghiên cứu là quan sát, không chia ngẫu nhiên, và không xét hashtag trong mô tả.

### Ý kiến: tiêu đề ngắn, từ khóa đặt đầu, rõ ràng trước tò mò

vidIQ khuyên tiêu đề Shorts dài 20–40 ký tự, khoảng 4–6 từ ([vidIQ](https://vidiq.com/blog/post/youtube-shorts-titles)). Theo vidIQ, feed trên điện thoại cắt tiêu đề quanh 40 ký tự, nên từ khóa chính nên nằm trong 40 ký tự đầu. vidIQ khuyên dùng từ người xem gõ khi tìm kiếm, ưu tiên rõ ràng, rồi mới thêm yếu tố gây tò mò. Subscribr nói điện thoại cắt sau 55–60 ký tự và khuyên 60–80 ký tự, trái với vidIQ ([Subscribr](https://subscribr.ai/youtube-strategy/youtube-shorts-titles-thumbnails-matter)). Không nguồn nào có thử nghiệm A/B so tiêu đề gây tò mò với tiêu đề rõ ràng cho Shorts.

### Áp vào kênh: cùng mẫu tiêu đề cho video cao nhất và video thấp nhất

| Video | Tiêu đề | Ký tự | Tên con vật và "life cycle" trong 40 ký tự đầu | Lượt xem |
|---|---|---|---|---|
| Tôm càng xanh | Giant freshwater prawn life cycle time-lapse: orange eggs to blue-claw male | 75 | Có | 1.008.853 |
| Cua đồng | Rice field crab life cycle time-lapse: eggs under mom to adult crab | 67 | Có | 54.260 |
| Nhện nước | Diving bell spider life cycle time-lapse: the spider that lives in an air bubble | 80 | Có | 400–900 |
| Ngài vải | Household casebearer life cycle time-lapse: the grey case on your wall is alive | 79 | Có | 400–900 |
| Gián nhà | American cockroach life cycle time-lapse: from an egg case under the kitchen sink to a winged adult | 99 | Có | dưới 6.000 |
| Ếch | Pip (common frog) frogspawn to frog time-lapse | 46 | Không | 480 |

Năm video dùng cùng mẫu "[tên con vật] life cycle time-lapse: [chi tiết]", nhưng lượt xem chênh hơn 1.000 lần. Vì vậy tiêu đề không giải thích chênh lệch lượt xem trên kênh. Mẫu này khớp lời khuyên về từ khóa, vì tên con vật và "life cycle" nằm trong 40 ký tự đầu. Phần sau dấu hai chấm nằm ngoài 40 ký tự đầu, nên người xem trên điện thoại không thấy phần này. Tiêu đề ếch mở đầu bằng "Pip", từ người xem không gõ khi tìm kiếm, và thiếu cụm "life cycle". Kênh đặt #shorts trong mô tả, không đặt trong tiêu đề; cách này khớp dữ liệu OverseerOS.

## Giờ đăng chỉ ảnh hưởng lượt xem sớm, không ảnh hưởng hiệu quả lâu dài

### YouTube chính thức: giờ đăng không phải tín hiệu xếp hạng

Trang Help của YouTube viết: **"Publish time is not known to impact a video's long-term performance."** ([YouTube Help](https://support.google.com/youtube/answer/141805?hl=en)). Cùng trang viết: "Publishing videos when your audience is most active can be beneficial for early viewership." Về giờ trong ngày, Sherman nói: "It's not something that we think about optimizing for." ([Creator Insider](https://www.youtube.com/watch?v=n3jsYK_-aRU&t=327s)). Ngoại lệ là tin tức, vì tin tức cần độ mới ([TechCrunch](https://techcrunch.com/2023/08/25/youtube-demystifies-the-shorts-algorithm-views-and-answers-other-creator-questions/)). Ritchie nói ngày 2025-11-12 rằng hệ thống chưa có dữ liệu hành vi người xem cho tới khi video công khai. Ông nói: "Waiting 24 to 48 hours is no different than waiting 24 to 48 seconds or weeks or months." ([Search Engine Journal](https://www.searchenginejournal.com/youtube-debunks-24-48-hour-upload-delay-recommendation/560613/)).

Về tần suất đăng, trang Help viết YouTube "found that growth in views across uploads is not correlated with time between uploads." ([YouTube Help](https://support.google.com/youtube/answer/141805?hl=en)). Sherman nói: "There is nothing in our systems that's like when you hit the five video or 10 short threshold per day..." ([Creator Insider](https://www.youtube.com/watch?v=n3jsYK_-aRU&t=345s)). Sherman khuyên không xóa rồi đăng lại video Shorts ít lượt xem. Theo TechCrunch, lý do là YouTube có khả năng coi hành vi này là spam ([TechCrunch](https://techcrunch.com/2023/08/25/youtube-demystifies-the-shorts-algorithm-views-and-answers-other-creator-questions/)). Trang Help gợi ý dùng báo cáo "When your viewers are on YouTube" chủ yếu cho Premiere và livestream ([YouTube Help](https://support.google.com/youtube/answer/9314416)).

### Số liệu nhà cung cấp: kết quả mâu thuẫn, múi giờ không rõ

| Nghiên cứu | Cỡ mẫu | Khung tốt nhất cho Shorts | Hạn chế |
|---|---|---|---|
| [Buffer](https://buffer.com/resources/best-time-to-post-on-youtube/), 2026-07-24 | 1,8 triệu video | Thứ Sáu 16:00; buổi tối 18:00–23:00 | Không định nghĩa "engagement". Bản 2025 của Buffer chọn 15:00–17:00 ngày thường. |
| [SocialPilot](https://www.socialpilot.co/insights/best-time-to-post-on-youtube), không ghi ngày | 301.000 video của hơn 27.000 kênh | 12:00–14:00 hoặc 18:00–19:00; Thứ Sáu 16:00–19:00 | Tự mâu thuẫn về khung sáng sớm |
| [Adobe Express](https://www.adobe.com/express/learn/blog/best-times-to-post-youtube-shorts), 2025-07-01 | 24.274 video Shorts của 280 creator | Thứ Bảy 16:00 | Mẫu nhỏ. Video đăng ngoài giờ cao điểm đạt trung bình 8,7 triệu lượt xem, cao hơn 6,2 triệu của khung 8:00–10:00. |

Cả ba nghiên cứu dùng "local time", nhưng không nói đó là giờ của người đăng hay của người xem. Cả ba là tương quan: giờ đăng đi kèm cỡ kênh, ngách và chất lượng nội dung. Không nghiên cứu nào công bố khung tốt nhất hơn khung trung vị bao nhiêu phần trăm.

### Áp vào kênh: video đăng buổi tối ở Mỹ cũng dưới 6.000 lượt xem

Mỹ dùng giờ mùa hè tới 2026-11-01, nên giờ miền Đông Mỹ chậm hơn giờ Việt Nam 11 giờ trước ngày đó và 12 giờ từ ngày đó. London dùng giờ GMT từ 2026-10-25, chậm hơn giờ Việt Nam 7 giờ.

| Video | Giờ Việt Nam | Giờ miền Đông Mỹ | Giờ London | Lượt xem |
|---|---|---|---|---|
| Bọ ngựa | 06:25 Thứ Hai 2026-10-26 | 19:25 Chủ Nhật 2026-10-25 | 23:25 Chủ Nhật | dưới 6.000 |
| Dế mèn | 08:27 Thứ Ba 2026-10-27 | 21:27 Thứ Hai 2026-10-26 | 01:27 Thứ Ba | dưới 6.000 |
| Cua đồng | 11:30 Thứ Bảy 2026-10-31 | 00:30 Thứ Bảy | 04:30 Thứ Bảy | 54.260 |
| Tôm càng xanh | 21:31 Thứ Bảy 2026-10-31 | 10:31 Thứ Bảy | 14:31 Thứ Bảy | 1.008.853 |
| Nhện nước | 21:29 Chủ Nhật 2026-11-01 | 09:29 Chủ Nhật | 14:29 Chủ Nhật | 400–900 |
| Ngài vải | 21:01 Thứ Hai 2026-11-02 | 09:01 Thứ Hai | 14:01 Thứ Hai | 400–900 |
| Lươn đồng | 21:45 Thứ Sáu 2026-11-06 | 09:45 Thứ Sáu | 14:45 Thứ Sáu | 870 |

Khung 21:00–21:45 giờ Việt Nam cho 1.008.853 lượt xem một lần và 400–900 lượt xem ba lần. Chênh lệch hơn 1.000 lần trong cùng khung giờ cho thấy giờ đăng không phải nguyên nhân chính. Video bọ ngựa đăng lúc 19:25 tối Chủ Nhật giờ miền Đông Mỹ, đúng khung Buffer xếp đầu cho Chủ Nhật. Video dế mèn đăng lúc 21:27 tối Thứ Hai giờ miền Đông Mỹ, gần khung Buffer xếp đầu cho Thứ Hai. Cả hai video vẫn dưới 6.000 lượt xem. Bạn chưa biết người xem của kênh ở nước nào, nên cột giờ Mỹ và giờ London chỉ là giả định.

## Nội dung AI theo template chung là rủi ro lớn hơn nhãn AI

### YouTube chính thức: nhãn AI không giảm người xem, template lặp lại mất quyền kiếm tiền

Trang Help viết: **"Disclosing AI content alone won't limit a video's audience or impact its eligibility to earn money."** ([YouTube Help](https://support.google.com/youtube/answer/14328491)). Creator phải công bố nội dung AI trông thật, gồm cảnh trông thật nhưng chưa từng xảy ra. Script `dang-bai.mjs` của kênh chọn mục `VIDEO_HAS_ALTERED_CONTENT_YES` khi đăng YouTube, nên kênh đã công bố.

Ngày 2025-07-15, YouTube đổi tên "repetitious content" thành "inauthentic content" trong chính sách YPP ([YouTube Help](https://support.google.com/youtube/answer/1311392)). Nhóm không được kiếm tiền gồm "AI-generated content made with generic or unoriginal templates". Nhóm này cũng gồm "Similar or repetitive content with low educational value, commentary, narratives, or minimal variation across videos". Series vẫn đủ điều kiện kiếm tiền khi "each video has a distinct storyline, focus, or concept". Trang Help cảnh báo "monetization may be removed from your entire channel". Ritchie nói loại nội dung này vốn không đủ điều kiện YPP, và bản cập nhật chỉ làm rõ chính sách ([Search Engine Journal](https://www.searchenginejournal.com/youtube-monetization-update-spam-not-reaction-channels/550755/)).

CEO Neal Mohan viết trong thư ngày 2026-01-21: "The rise of AI has raised concerns about low-quality content, aka "AI slop."" ([YouTube Blog](https://blog.youtube/inside-youtube/the-future-of-youtube-2026/)). Ông viết YouTube "actively building on our established systems that have been very successful in combatting spam and clickbait". Câu này nói về hệ thống chống spam, tức là về phân phối, không chỉ về kiếm tiền. YouTube không công bố tín hiệu nào dùng để nhận diện AI slop. eWeek dẫn nghiên cứu của Kapwing: AI slop chiếm hơn 20% đề xuất cho người dùng mới; ghi chú nghiên cứu chưa mở được bản gốc ([eWeek](https://www.eweek.com/news/youtube-ai-slop-crackdown-creators/)).

### Áp vào kênh: khung chung giữa các video gần với mô tả rủi ro

Mọi video của kênh dùng cùng khung: time-lapse AI 20–26 giây, không thuyết minh, cùng trình tự con mẹ, trứng, con trưởng thành. Mô tả của các video dùng chung hai câu "Which stage did you not expect? Tell me in the comments 👇" và "Subscribe for more life cycles." Khung này gần với hai cụm "templated storylines" và "AI-generated content made with generic or unoriginal templates". Mỗi loài có chi tiết sinh học riêng, khớp ngoại lệ "distinct storyline". Bạn nên giữ khác biệt này rõ trong hình ảnh, tiêu đề và mô tả của từng video.

## Kết luận

Phát biểu chính thức và dữ liệu kênh cùng dẫn tới một kết luận. Kết quả của một video Shorts hình thành trong vài giây đầu, với nhóm người xem thử, chứ không ở tiêu đề hay giờ đăng. Dữ liệu kênh loại được hai giả thuyết của bạn: khung 21:30 và mẫu tiêu đề không tạo ra video 1.008.853 lượt xem. Dữ liệu kênh chưa loại được giả thuyết thứ ba: chủ thể giáp xác có trứng màu lớn ở giữa khung. Clip M là biến mới nhất của kênh. Quy tắc clip M dựa trên đánh giá của bạn về độ sinh động, chưa dựa trên tỷ lệ chọn xem.

Metricool thấy 83% tương tác xảy ra trong 10 ngày đầu, và Tubefilter báo video cũ hơn 30 ngày mất lượt xem. Vì vậy mỗi video cho kết quả đọc được sau khoảng 10 ngày, và video cũ ít cơ hội tăng lại. Một đợt thử 6–10 video xen kẽ hai kiểu mở đầu cho kết quả trong khoảng 3 tuần. Phép so phải dùng tỷ lệ chọn xem và engaged view, vì lượt xem cao hơn engaged view khoảng 65% và tính cả lần phát lại. Bạn nên giữ cố định giờ đăng và mẫu tiêu đề trong đợt thử, vì hai biến này không giải thích kết quả và chỉ làm nhiễu phép so.

## Việc cần làm cho kênh Life Cycle Lab

> Cảnh báo: bạn không nên xóa rồi đăng lại video Shorts ít lượt xem. Theo TechCrunch, YouTube có khả năng coi hành vi này là spam.

### Đo dữ liệu đã có

1. Bạn mở YouTube Studio, vào Analytics, tab Content, chọn Shorts.
2. Bạn xem thẻ "How many chose to view" của từng video.
3. Bạn ghi tỷ lệ chọn xem, engaged view và tỷ lệ xem trung bình cho mỗi video.
4. Bạn ghi số liệu của tôm càng xanh, cua đồng, ốc bươu vàng, nhện nước, ngài vải, gián nhà và lươn đồng trước.
5. Bạn so tỷ lệ chọn xem của gián nhà và lươn đồng với 5 video không có clip M.

### Thử đoạn mở đầu

6. Bạn nên đăng xen kẽ hai kiểu mở đầu trong 6–10 video kế tiếp.
7. Kiểu thứ nhất giữ clip M 1–1,5 giây.
8. Kiểu thứ hai mở thẳng bằng cận cảnh con mẹ ôm trứng, như video tôm càng xanh.
9. Với kiểu có clip M, bạn nên làm khung hình đầu có chủ thể lớn và tương phản cao.
10. Với kiểu không có clip M, bạn nên làm ảnh cuối cùng bố cục với K01, như video cua đồng.
11. Sau đợt thử clip M, bạn nên thử thêm chữ ngắn ở khung hình đầu, ví dụ "Prawn: egg → adult".

### Giữ cố định các biến khác

12. Bạn giữ giờ đăng cố định trong đợt thử, ví dụ 21:30 giờ Việt Nam.
13. Bạn giữ mẫu tiêu đề "[tên con vật] life cycle time-lapse: [chi tiết]".
14. Bạn đánh giá mỗi video sau 10 ngày, bằng tỷ lệ chọn xem và engaged view.
15. Bạn không so video bằng lượt xem, vì lượt xem tính cả lần phát lại.

### Tiêu đề, thumbnail và giờ đăng sau đợt thử

16. Bạn dùng tên con vật mà người xem gõ khi tìm kiếm, không dùng biệt danh như "Pip".
17. Bạn không đặt hashtag trong tiêu đề.
18. Bạn kiểm tra kênh đã vào YPP và đã xác minh tài khoản chưa.
19. Nếu kênh đủ điều kiện, bạn tải thumbnail 2160 × 3840 px, chủ thể lớn ở giữa ảnh.
20. Nếu kênh chưa đủ điều kiện, bạn chọn khung con trưởng thành rõ nhất trong app YouTube trên điện thoại.
21. Bạn dùng cùng phong cách thumbnail cho mọi video, để trang kênh nhìn thành một series.
22. Bạn mở Analytics của kênh, tab Audience, xem "Top geographies" và "When your viewers are on YouTube".
23. Nếu người xem chủ yếu ở Mỹ, bạn nên hẹn giờ đăng 05:00–10:00 giờ Việt Nam. Đây là buổi tối ở Mỹ trong mùa đông.

### Chính sách AI

24. Bạn tiếp tục chọn mục nội dung AI khi đăng YouTube.
25. Bạn nên viết câu mô tả riêng cho từng loài, thay hai câu dùng chung.
26. Bạn nên đưa một chi tiết sinh học riêng của loài vào phần sau dấu hai chấm của tiêu đề.
