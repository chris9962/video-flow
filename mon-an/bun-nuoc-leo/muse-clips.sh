#!/bin/bash
# Tạo 8 clip bún nước lèo bằng Muse (profile my), mỗi clip 10 giây, lưu clips/<mã>-01.mp4. Log: muse-all.log
cd "$(dirname "$0")"
S=../../.claude/skills/muse-ai/scripts/muse.mjs
STYLE="Video khổ dọc 9:16, dài 10 giây, quay thật kiểu food ASMR, điện ảnh, nét cao. Bối cảnh nhà quê miền Tây Nam Bộ, nắng vàng ấm. Giữ cùng 1 bộ đồ nghề xuyên suốt các clip bếp: bàn gỗ nâu cũ, tô sứ trắng viền xanh dương, rổ tre, thớt gỗ, nồi nhôm. Không người nói, không chữ, không nhạc; chỉ tiếng động ASMR thật. Làm luôn, không cần hỏi lại."
run() { # mã, prompt
  local id="$1"; shift
  [ -f "clips/$id-01.mp4" ] && { echo "== $id đã có, bỏ qua"; return; }
  echo "== $id $(date +%H:%M:%S)"
  node "$S" --profile my --out clips --prefix "$id" --prompt "$STYLE $*" 2>&1 | tail -6
}
run P "Cảnh 1, làm mắm cá ở quê Sóc Trăng: thau nhôm đầy cá sặc và cá linh tươi óng ánh, bàn tay người phụ nữ miền Tây làm sạch cá, trộn với muối hột trắng trong thau, xếp cá vào khạp sành nâu, nén bằng nẹp tre và đậy nắp; rồi cảnh mở nắp khạp mắm đã chín, mắm màu nâu đỏ óng, tay múc một miếng mắm cá sặc lên cận cảnh, hơi mắm bốc nhẹ trong nắng. Góc máy từ trên xuống rồi cận. Tiếng cá quẫy, tiếng muối rào rào, tiếng nắp khạp sành."
run Q "Cảnh 2: nồi nhôm nước sôi trên bếp củi, cho mắm cá sặc nâu đỏ vào cùng mấy cây sả đập dập, mắm rã dần trong nước sôi, đũa khuấy; sau đó đổ qua rây lược trên nồi khác, nước mắm nâu trong chảy xuống, xương cá nằm lại trên rây. Góc máy cận từ trên xuống. Tiếng nước sôi, tiếng củi, tiếng nước chảy qua rây."
run A "Cảnh 3: nồi lớn nước lèo đang hầm xương ống heo, tay đổ nước dừa tươi từ trái dừa vào nồi, rồi đổ nước mắm đã lược vào, cho củ ngải bún giã dập và sả cây, nêm muỗng đường thốt nốt, vá nhôm vớt bọt; nước lèo màu nâu vàng trong, bốc khói. Góc máy từ trên xuống nồi rồi cận mặt nước. Tiếng nước sôi lăn tăn, tiếng nước dừa đổ, tiếng lửa."
run B "Cảnh 4: cá lóc đồng luộc chín vớt ra dĩa sứ trắng viền xanh, bàn tay gỡ xương lấy từng miếng thịt cá trắng ngần xếp sang dĩa khác; bên cạnh tôm đất luộc đỏ au, tay bóc vỏ tôm xếp thành hàng. Góc máy cận từ trên xuống trên bàn gỗ. Tiếng gỡ cá, tiếng bóc vỏ tôm, tiếng chim ngoài sân."
run C "Cảnh 5: trên thớt gỗ, miếng thịt heo quay da vàng giòn rộp, dao bén chặt từng miếng vuông nghe rắc giòn, da nứt lớp mỡ bóng; bên cạnh miếng huyết heo luộc nâu sẫm mịn, dao cắt thành miếng vuông đều xếp vào dĩa. Góc máy cận từ trên xuống. Tiếng dao chặt da giòn, tiếng dao cắt huyết mềm."
run D "Cảnh 6: mẹt tre trên bàn gỗ đầy rau: bắp chuối bào mỏng tím trắng, giá tươi, hẹ cắt khúc, rau muống bào, rau húng, chanh ớt; tay bốc rau xếp ra dĩa. Sau đó vợt tre trụng bún tươi sợi nhỏ vào nồi nước sôi, nhấc lên xóc ráo, sợi bún trắng bóng bốc hơi. Góc máy từ trên xuống rồi cận. Tiếng rau giòn, tiếng nước sôi, tiếng xóc vợt."
run E "Cảnh 7: tô sứ trắng viền xanh trên bàn gỗ, cho bún vào, xếp lần lượt thịt cá lóc trắng, tôm đỏ, miếng heo quay da giòn, huyết heo, rắc hẹ; rồi vá nhôm chan nước lèo nâu vàng trong veo nóng bốc khói ngập tô, nước dâng lên, rắc ngò rí và tiêu. Góc máy từ trên xuống, cận, hơi khói bay trong nắng. Tiếng đũa chạm tô, tiếng nước lèo chan."
run F "Cảnh 8: cận tô bún nước lèo bốc khói, tay vắt miếng chanh, bỏ lát ớt đỏ, đũa gắp sợi bún kèm miếng heo quay chấm vào chén muối ớt rồi nhấc lên nghi ngút khói; camera lùi chậm từ trên xuống thấy toàn mâm: tô bún giữa bàn gỗ, dĩa rau bắp chuối giá hẹ, chén muối ớt, ly trà đá đọng nước, nắng chiều vàng xuyên qua. Tiếng vắt chanh, tiếng đũa, tiếng đá trong ly, tiếng gió và ve."
echo "== XONG $(date +%H:%M:%S)"; ls clips
