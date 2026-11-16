#!/bin/bash
# Tạo 8 clip mì Quảng bằng Muse (profile my), mỗi clip 10 giây, lưu clips/<mã>-01.mp4. Log: muse-all.log
cd "$(dirname "$0")"
S=../../.claude/skills/muse-ai/scripts/muse.mjs
STYLE="Video khổ dọc 9:16, dài 10 giây, quay thật kiểu food ASMR, điện ảnh, nét cao. Bối cảnh bếp nhà quê miền Nam Việt Nam, nắng vàng ấm. Giữ cùng 1 bộ đồ nghề xuyên suốt các clip: bàn gỗ nâu cũ, tô sứ trắng viền xanh dương, rổ tre, thớt gỗ, chảo gang. Không người nói, không chữ, không nhạc; chỉ tiếng động ASMR thật. Làm luôn, không cần hỏi lại."
run() { # mã, prompt
  local id="$1"; shift
  [ -f "clips/$id-01.mp4" ] && { echo "== $id đã có, bỏ qua"; return; }
  echo "== $id $(date +%H:%M:%S)"
  node "$S" --profile my --out clips --prefix "$id" --prompt "$STYLE $*" 2>&1 | tail -6
}
run P "Cảnh 1: làm sợi mì Quảng. Thau bột gạo trắng pha nước nghệ thành màu vàng óng, tay khuấy; vá múc bột đổ lên tấm vải căng trên miệng nồi hơi đang sôi, tráng mỏng tròn, đậy vung tre, hơi nước bốc nghi ngút; mở vung, que tre dài vớt lá bánh vàng mỏng lên, lật ra mâm tre. Góc máy cận từ trên xuống rồi ngang tầm nồi. Tiếng nước sôi, tiếng vá chạm nồi, tiếng củi cháy."
run Q "Cảnh 2: trên thớt gỗ lớn, chồng lá bánh mì Quảng vàng óng xếp dày, tay dùng cọ thoa dầu phộng bóng lên từng lá, xếp chồng lại, dao bén cắt thành sợi to bản khoảng 1 cm, tay tơi sợi mì lên cho rời. Góc máy cận từ trên xuống. Tiếng dao cắt trên thớt, tiếng sợi mì rơi."
run A "Cảnh 3: thau nhôm trên bàn gỗ: tôm đất tươi, thịt ba chỉ cắt miếng, sườn non chặt khúc. Tay cho vào: nghệ tươi giã nhuyễn vàng, hành tím băm, tỏi băm, muối, nước mắm, tiêu; trộn đều bằng tay, màu vàng nghệ phủ lên tôm thịt. Góc máy từ trên xuống, cận. Tiếng giã nghệ, tiếng trộn."
run B "Cảnh 4: chảo gang trên bếp củi, dầu phộng nóng, phi hành tím tỏi vàng thơm, đổ tôm thịt sườn đã ướp vào xào, đảo đũa, tôm đỏ lên, nước nghệ vàng cam sôi xèo; chế vào nửa chén nước hầm xương, nấu sệt lại thành nước nhưn vàng cam đậm, sôi lăn tăn. Góc máy cận từ trên xuống. Tiếng xèo, tiếng sôi."
run C "Cảnh 5: chảo đậu phộng rang trên lửa nhỏ, lắc chảo, hạt nổ lách tách, đổ ra cối gỗ giã dập; bên cạnh bánh tráng mè nướng trên vỉ than hồng, phồng rộp, tay lật, bẻ miếng nghe giòn. Góc máy cận. Tiếng rang, tiếng giã, tiếng bánh tráng giòn."
run D "Cảnh 6: mẹt tre trên bàn gỗ: cải con, xà lách, bắp chuối bào mỏng trắng tím, húng lủi, giá, rau thơm; dĩa trứng cút luộc bóc vỏ, vài trái ớt xanh, miếng chanh. Tay rửa rau, vẩy nước, xếp lên mẹt; camera lướt chậm qua mẹt rau. Góc máy từ trên xuống. Tiếng nước, tiếng vẩy rau."
run E "Cảnh 7: tô sứ trắng viền xanh trên bàn gỗ: lót rau sống dưới đáy, gắp sợi mì Quảng vàng lên, xếp tôm đỏ, miếng thịt ba chỉ, sườn non, trứng cút; vá múc nước nhưn vàng cam chan chỉ lưng tô, không ngập; rắc đậu phộng giã, hành lá, bẻ bánh tráng mè cắm lên. Góc máy cận từ trên xuống. Tiếng chan nước, tiếng rắc đậu phộng."
run F "Cảnh 8: cận tô mì Quảng: tay vắt miếng chanh, trái ớt xanh cắn một miếng, đũa trộn đều rau với mì và nước nhưn vàng, gắp đũa mì to bản dính nước nhưn nhấc lên cao, bánh tráng bẻ rắc thêm; camera lùi chậm thấy toàn mâm: tô mì, mẹt rau, chén nước mắm ớt xanh, ly trà đá đọng nước, nắng chiều vàng. Tiếng bánh tráng giòn, tiếng đũa, tiếng ve."
echo "== XONG $(date +%H:%M:%S)"; ls clips
