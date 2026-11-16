#!/bin/bash
# Tạo 8 clip cơm tấm bằng Muse (profile my), mỗi clip 10 giây, lưu clips/<mã>-01.mp4. Log: muse-all.log
cd "$(dirname "$0")"
S=../../.claude/skills/muse-ai/scripts/muse.mjs
STYLE="Video khổ dọc 9:16, dài 10 giây, quay thật kiểu food ASMR, điện ảnh, nét cao. Bối cảnh nhà quê miền Tây Nam Bộ, nắng vàng ấm. Giữ cùng 1 bộ đồ nghề xuyên suốt các clip bếp: bàn gỗ nâu cũ, dĩa sứ trắng viền xanh dương, rổ tre, thớt gỗ, bếp than. Không người nói, không chữ, không nhạc; chỉ tiếng động ASMR thật. Làm luôn, không cần hỏi lại."
run() { # mã, prompt
  local id="$1"; shift
  [ -f "clips/$id-01.mp4" ] && { echo "== $id đã có, bỏ qua"; return; }
  echo "== $id $(date +%H:%M:%S)"
  node "$S" --profile my --out clips --prefix "$id" --prompt "$STYLE $*" 2>&1 | tail -6
}
run P "Cảnh 1, món hoàn chỉnh: trên bàn gỗ, dĩa cơm tấm sườn bì chả đầy đặn: cơm tấm trắng tơi hạt nhỏ, miếng sườn cốt lết nướng vàng cháy cạnh bóng mỡ, bì sợi, miếng chả trứng, trứng ốp la lòng đào, dưa leo cà chua, mỡ hành xanh rưới trên cơm; muỗng múc nước mắm chua ngọt có tỏi ớt chan đều lên cơm, nước mắm thấm xuống; đũa và muỗng xắn miếng sườn, kéo thịt mềm ra. Góc máy cận từ trên xuống rồi ngang dĩa, nắng vàng. Tiếng nước mắm chan, tiếng muỗng chạm dĩa."
run Q "Cảnh 2, nguồn gạo tấm: nhà máy xay xát lúa nhỏ ở quê miền Tây, máy xay cũ chạy ầm ầm, gạo trắng chảy xuống máng; một người phụ nữ miền Tây đội nón lá dùng sàng tre sàng gạo, hạt gạo nguyên rơi xuống thúng, phần hạt gạo gãy nhỏ li ti còn lại trên sàng; cô hốt nắm gạo tấm đưa ra trước máy quay, hạt nhỏ gãy trắng, rồi đổ vào bao. Góc máy cận bàn tay và sàng, bụi gạo bay trong nắng xiên. Tiếng máy xay, tiếng sàng gạo rào rào."
run A "Cảnh 3: thau nhôm vo gạo tấm, nước đục trắng, chắt ra; gạo tấm đổ vào xửng hấp lót vải mỏng, đặt vài lá dứa xanh lên trên, đậy nắp, hơi nước bốc nghi ngút trên bếp than; mở nắp, cơm tấm chín tơi, xới lên bông, hơi khói bay. Góc máy cận từ trên xuống. Tiếng nước vo gạo, tiếng hơi nước xì, tiếng xới cơm."
run B "Cảnh 4: trên thớt gỗ, những miếng sườn cốt lết heo tươi dày có xương; cối giã sả tỏi hành tím; thau ướp sườn với sả tỏi băm, muỗng mật ong vàng sánh, nước mắm, sữa đặc, tiêu, dầu hào; hai tay bóp đều từng miếng sườn cho thấm, màu nâu óng, đậy lại ướp. Góc máy cận từ trên xuống. Tiếng chày giã, tiếng bóp ướp, tiếng muỗng."
run C "Cảnh 5: bếp than hồng đỏ rực ngoài sân, vỉ nướng đặt lên, xếp sườn cốt lết đã ướp lên vỉ, xèo xèo, khói thơm bốc; tay cầm quạt mo quạt than, lửa bùng; cọ phết nước ướp lên sườn, mỡ nhỏ xuống than cháy xèo, trở mặt sườn vàng cháy cạnh bóng loáng; gắp sườn ra dĩa. Góc máy cận ngang vỉ rồi từ trên xuống. Tiếng than nổ, tiếng mỡ xèo xèo, tiếng quạt."
run D "Cảnh 6: thớt gỗ, thịt nạc heo luộc và da heo luộc thái sợi nhỏ đều tay, cho vào thau, rắc thính gạo rang vàng, tỏi phi, muối, trộn đều thành bì; bên cạnh, tô trộn chả trứng: thịt băm, miến ngâm, nấm mèo thái, trứng, đổ vào khuôn hấp, mặt phết lòng đỏ vàng óng; hấp xong lấy ra, dao cắt chả thành miếng vuông. Góc máy cận từ trên xuống. Tiếng dao thái sợi, tiếng trộn thính, tiếng dao cắt chả."
run E "Cảnh 7: nồi nhỏ nấu nước mắm chua ngọt: đường, nước, nước mắm, khuấy tan sôi nhẹ, để nguội rồi cho tỏi ớt băm nổi lên mặt, rót vào chén sứ; chảo nhỏ làm mỡ hành: hành lá cắt nhỏ, đổ dầu nóng vào xèo lên xanh mướt; hũ đồ chua cà rốt củ cải trắng ngâm giấm đường. Góc máy cận từ trên xuống. Tiếng khuấy, tiếng dầu xèo, tiếng dao băm tỏi ớt."
run F "Cảnh 8: trên bàn gỗ, dĩa sứ trắng viền xanh: xới cơm tấm nóng lên dĩa, xếp miếng sườn nướng vàng cháy cạnh, gắp bì sợi, đặt miếng chả trứng, trứng ốp la lòng đào, lát dưa leo cà chua, đồ chua; muỗng rưới mỡ hành xanh lên cơm, chan nước mắm chua ngọt tỏi ớt; camera lùi chậm từ trên xuống thấy toàn mâm: dĩa cơm tấm, chén nước mắm, chén canh, ly trà đá đọng nước, nắng chiều vàng xuyên qua. Tiếng xới cơm, tiếng nước mắm chan, tiếng đá trong ly, tiếng gió và chim."
echo "== XONG $(date +%H:%M:%S)"; ls clips
