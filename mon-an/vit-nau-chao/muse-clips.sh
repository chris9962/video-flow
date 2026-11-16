#!/bin/bash
# Tạo 8 clip vịt nấu chao bằng Muse (profile my), mỗi clip 10 giây, lưu clips/<mã>-01.mp4. Log: muse-all.log
cd "$(dirname "$0")"
S=../../.claude/skills/muse-ai/scripts/muse.mjs
STYLE="Video khổ dọc 9:16, dài 10 giây, quay thật kiểu food ASMR, điện ảnh, nét cao. Bối cảnh nhà quê miền Tây Nam Bộ, nắng vàng ấm. Giữ cùng 1 bộ đồ nghề xuyên suốt các clip bếp: bàn gỗ nâu cũ, tô dĩa sứ trắng viền xanh dương, rổ tre, thớt gỗ, nồi đất nâu. Không người nói, không chữ, không nhạc; chỉ tiếng động ASMR thật. Làm luôn, không cần hỏi lại."
run() { # mã, prompt
  local id="$1"; shift
  [ -f "clips/$id-01.mp4" ] && { echo "== $id đã có, bỏ qua"; return; }
  echo "== $id $(date +%H:%M:%S)"
  node "$S" --profile my --out clips --prefix "$id" --prompt "$STYLE $*" 2>&1 | tail -6
}
run P "Cảnh 1, bắt vịt: ao nước sau nhà quê miền Tây sáng sớm, bờ ao có dừa và chuối, bầy vịt xiêm lông đen trắng đang bơi và rỉa lông. Một người đàn ông miền Tây áo bà ba nâu, quần xắn cao, lội xuống ao nước ngang đầu gối, rón rén tiến lại rồi chụp nhanh một con vịt xiêm, vịt vỗ cánh văng nước tung toé, ông ôm chặt con vịt hai tay, lội lên bờ, nước nhỏ giọt, vịt kêu. Góc máy ngang mặt nước rồi cận con vịt trong tay. Tiếng vịt kêu cạp cạp, tiếng nước văng, tiếng chim sớm."
run Q "Cảnh 2: trên thớt gỗ lớn, con vịt đã làm sạch lông, da vàng nhạt; tay giã gừng trong cối đá, trộn gừng giã với rượu trắng và muối hột, chà xát khắp mình vịt để khử hôi, rửa lại bằng nước sạch trong thau nhôm; rồi dao bén chặt vịt thành miếng vừa ăn nghe cốp cốp, xếp vào thau. Góc máy từ trên xuống rồi cận. Tiếng chày giã gừng, tiếng nước, tiếng dao chặt xương."
run A "Cảnh 3: trên bàn gỗ, chén sứ đựng chao đỏ và chao trắng, muỗng tán nhuyễn chao sánh mịn; thớt có tỏi băm, hành tím băm, sả băm, ớt băm; đổ chao, tỏi sả, muỗng đường, tiêu vào thau thịt vịt, hai tay bóp trộn đều cho thịt vịt thấm màu đỏ cam của chao, đậy lại ướp. Góc máy cận từ trên xuống. Tiếng muỗng tán chao, tiếng dao băm, tiếng trộn thịt."
run B "Cảnh 4: củ khoai môn tím vỏ sần trên thớt gỗ, dao gọt vỏ lộ ruột trắng vân tím, cắt thành miếng vuông; chảo gang dầu nóng, thả khoai môn vào chiên sơ xèo xèo, trở mặt vàng nhẹ, vớt ra rổ tre lót giấy. Góc máy cận từ trên xuống rồi ngang chảo. Tiếng dao gọt, tiếng dầu xèo xèo, tiếng vớt khoai."
run C "Cảnh 5: nồi đất nâu trên bếp củi, dầu nóng phi tỏi hành tím thơm vàng, đổ thịt vịt đã ướp chao vào, đũa đảo xào săn, thịt vịt lên màu đỏ cam bóng; rồi tay chặt trái dừa tươi, đổ nước dừa trong vào nồi ngập thịt, nước sôi lên. Góc máy từ trên xuống nồi rồi cận. Tiếng xèo xèo, tiếng đảo đũa, tiếng nước dừa đổ, tiếng lửa củi."
run D "Cảnh 6: nồi đất vịt nấu chao sôi liu riu trên bếp củi, cho khoai môn chiên vào, múc thêm muỗng chao đỏ nêm, vá vớt bọt; nước dùng sánh màu đỏ cam, váng mỡ óng, khoai môn mềm bở, thịt vịt mềm rục; đũa xiên thử miếng vịt. Góc máy cận mặt nồi từ trên xuống, hơi khói bốc trong nắng. Tiếng sôi lục bục, tiếng lửa, tiếng vá chạm nồi."
run E "Cảnh 7: mâm dọn trên bàn gỗ: nồi đất vịt nấu chao sôi bốc khói đặt trên bếp cồn nhỏ giữa mâm, dĩa rau muống cọng, cải xanh, dĩa bún tươi trắng, dĩa sứ viền xanh; tay múc chao vào chén nhỏ, dầm ớt đỏ, vắt chanh khuấy đều làm chén chao chấm. Góc máy từ trên xuống rồi cận chén chao. Tiếng rau giòn, tiếng muỗng khuấy, tiếng nồi sôi."
run F "Cảnh 8: cận nồi vịt nấu chao sôi, đũa gắp miếng vịt đỏ cam mềm chấm vào chén chao ớt rồi nhấc lên; nhúng nắm rau muống vào nồi, rau chín xanh gắp lên nghi ngút khói; camera lùi chậm từ trên xuống thấy toàn mâm: nồi vịt giữa, dĩa rau, dĩa bún, chén chao, ly trà đá đọng nước, nắng chiều vàng xuyên qua. Tiếng đũa, tiếng nồi sôi, tiếng đá trong ly, tiếng gió và ve."
echo "== XONG $(date +%H:%M:%S)"; ls clips
