#!/bin/bash
# Tạo 13 clip hủ tiếu bằng Muse (profile my), mỗi clip 10 giây, lưu clips/<mã>-01.mp4. Log: muse-all.log
cd "$(dirname "$0")"
S=../../.claude/skills/muse-ai/scripts/muse.mjs
STYLE="Video khổ dọc 9:16, dài 10 giây, quay thật kiểu food ASMR, điện ảnh, nét cao. Bối cảnh nhà quê miền Tây Nam Bộ, nắng vàng ấm. Giữ cùng 1 bộ đồ nghề xuyên suốt các clip: bàn gỗ nâu cũ, tô sứ trắng viền xanh dương, rổ tre, thớt gỗ, nồi nhôm. Không người nói, không chữ, không nhạc; chỉ tiếng động ASMR thật. Làm luôn, không cần hỏi lại."
run() { # mã, prompt
  local id="$1"; shift
  [ -f "clips/$id-01.mp4" ] && { echo "== $id đã có, bỏ qua"; return; }
  echo "== $id $(date +%H:%M:%S)"
  node "$S" --profile my --out clips --prefix "$id" --prompt "$STYLE $*" 2>&1 | tail -6
}
run P  "Cảnh 1: chợ quê miền Tây sáng sớm, sạp thịt heo tươi trên bàn gỗ, cô bán hàng đội nón lá. Bàn tay khách chỉ chọn: xương ống heo, một cái giò heo, một miếng thịt nạc; cô cầm dao chặt xương ống nghe cốp, cân rồi bỏ vào bịch. Góc máy ngang tầm sạp, cận. Tiếng chợ lao xao, tiếng dao chặt xương."
run Q  "Cảnh 2: góc nhìn từ trên xuống bàn gỗ nâu cũ ở bếp quê. Xương ống, giò heo, thịt nạc đổ từ rổ tre ra thau nước; tay xát muối hột, chà rửa, nước đục chảy. Tiếng nước, tiếng muối cọ."
run A  "Cảnh 3: nồi nhôm nước sôi trên bếp củi, bỏ xương ống và giò heo vào chần, bọt bẩn nổi lên; đổ nước đầu ra, xả lại xương dưới vòi cho sạch. Góc máy từ trên xuống rồi cận. Tiếng nước sôi, tiếng củi cháy."
run B  "Cảnh 4: nồi lớn hầm xương, nước trong, bỏ vào: khúc củ cải trắng cắt khúc, hành tím nướng cháy xém vỏ, một con khô mực nướng thơm, nắm tôm khô. Hơi nước bốc lên. Góc máy từ trên xuống nồi. Tiếng nước sôi lăn tăn, tiếng lửa."
run C  "Cảnh 5: cận mặt nước lèo trong veo đang sôi nhẹ, vá nhôm vớt bọt, múc một vá nước lèo trong vàng nhạt giơ lên ánh nắng rồi đổ lại; rắc đường phèn và muối. Tiếng múc nước, tiếng sôi."
run D  "Cảnh 6: trên thớt gỗ, miếng thịt nạc luộc chín vớt ra, dao bén thái lát mỏng đều, xếp thành hàng; bên cạnh chảo gang xào thịt bằm với tỏi băm, xèo xèo, đảo đũa. Góc máy từ trên xuống. Tiếng dao thái, tiếng xèo."
run E  "Cảnh 7: dĩa sứ trắng viền xanh trên bàn gỗ: tôm luộc đỏ au bóc vỏ xếp vòng, trứng cút luộc bóc vỏ trắng mịn, gan heo luộc thái lát. Tay xếp từng món vào dĩa. Góc máy từ trên xuống, cận. Tiếng bóc vỏ trứng, tiếng dĩa."
run F  "Cảnh 8: sợi hủ tiếu dai trắng trong, trụng trong vợt tre nhúng vào nồi nước sôi, nhấc lên xóc ráo, hơi bốc nghi ngút, sợi bóng dai. Góc máy cận. Tiếng nước sôi, tiếng xóc vợt."
run G  "Cảnh 9: mẹt tre trên bàn gỗ: giá tươi, hẹ cắt khúc, xà lách, cần tây; chén hành phi vàng giòn và tỏi phi. Tay rắc hành phi vào chén, camera lướt chậm qua mẹt. Góc máy từ trên xuống. Tiếng hành phi giòn rụm."
run I  "Cảnh 10: tô sứ trắng viền xanh, cho sợi hủ tiếu đã trụng vào, xếp lần lượt lên trên: thịt nạc lát, thịt bằm xào, tôm đỏ, trứng cút, gan heo, rắc hẹ. Góc máy từ trên xuống, tay xếp gọn đẹp. Tiếng đũa, tiếng tô."
run J  "Cảnh 11: cận tô hủ tiếu, vá nhôm chan nước lèo nóng trong veo bốc khói ngập tô, nước dâng lên, rắc hành phi, tiêu xay, hẹ. Hơi khói bay trong nắng. Tiếng nước chan, tiếng rắc tiêu."
run K  "Cảnh 12: chén nhỏ nước tương đen, muỗng múc sa tế đỏ cho vào, vắt miếng chanh, khuấy; đũa gắp sợi hủ tiếu và miếng thịt chấm vào chén rồi nhấc lên. Góc máy cận từ trên xuống. Tiếng vắt chanh, tiếng khuấy."
run L  "Cảnh 13: camera lùi chậm từ trên xuống: tô hủ tiếu đầy đủ bốc khói ở giữa bàn gỗ, dĩa giá hẹ, chén nước tương sa tế, ly trà đá đọng nước, nắng chiều vàng xuyên qua. Hết cảnh là toàn mâm. Tiếng ve, tiếng gió, tiếng đá trong ly."
echo "== XONG $(date +%H:%M:%S)"; ls clips
