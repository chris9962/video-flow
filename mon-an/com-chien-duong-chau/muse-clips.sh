#!/bin/bash
# Tạo 8 clip cơm chiên Dương Châu bằng Muse (profile my), mỗi clip 10 giây, lưu clips/<mã>-01.mp4. Log: muse-all.log
cd "$(dirname "$0")"
S=../../.claude/skills/muse-ai/scripts/muse.mjs
STYLE="Video khổ dọc 9:16, dài 10 giây, quay thật kiểu food ASMR, điện ảnh, nét cao. Bối cảnh nhà quê miền Nam Việt Nam, nắng vàng ấm. Giữ cùng 1 bộ đồ nghề xuyên suốt các clip bếp: bàn gỗ nâu cũ, dĩa sứ trắng viền xanh dương, rổ tre, thớt gỗ, chảo gang đen. Không người nói, không chữ, không nhạc; chỉ tiếng động ASMR thật. Làm luôn, không cần hỏi lại."
run() { # mã, prompt
  local id="$1"; shift
  [ -f "clips/$id-01.mp4" ] && { echo "== $id đã có, bỏ qua"; return; }
  echo "== $id $(date +%H:%M:%S)"
  node "$S" --profile my --out clips --prefix "$id" --prompt "$STYLE $*" 2>&1 | tail -6
}
run P "Cảnh 1: ruộng lúa chín vàng ở miền Tây Nam Bộ sáng sớm, bông lúa trĩu hạt đọng sương lấp lánh, bàn tay nông dân vuốt dọc bông lúa, cận cảnh từng hạt lúa vàng căng, rồi liềm gặt một nắm lúa. Góc máy cận hạt lúa rồi lùi ra thấy ruộng mênh mông, hàng dừa xa. Tiếng gió lùa qua lúa, tiếng chim, tiếng liềm cắt."
run Q "Cảnh 2: lúa phơi trên sân gạch, cào lúa; máy xay xát nhỏ ở nhà quê đổ ra gạo trắng mới, tay bốc nắm gạo cho chảy qua kẽ tay; vo gạo trong nồi, nấu cơm trên bếp củi, mở nắp hơi bốc, xới cơm chín ra mâm tre dàn mỏng để nguội. Góc máy từ trên xuống rồi cận. Tiếng gạo chảy, tiếng vo gạo, tiếng xới cơm."
run A "Cảnh 3: thớt gỗ trên bàn gỗ nâu: dao cắt lạp xưởng đỏ thành hạt lựu, tôm tươi bóc vỏ xếp chén, cà rốt cắt hạt lựu cam, đậu Hà Lan xanh, bắp hạt vàng, đập 3 trứng gà vào chén, hành lá cắt nhỏ; từng chén nguyên liệu xếp hàng nhiều màu. Góc máy từ trên xuống, cận. Tiếng dao, tiếng đập trứng."
run B "Cảnh 4: chảo gang nóng trên bếp lửa, đổ dầu, đánh trứng đổ vào chảo xèo, đảo nhanh thành trứng tơi vàng, múc ra; cho lạp xưởng vào xào mỡ chảy bóng, thêm tôm đảo lên đỏ au. Góc máy cận từ trên xuống. Tiếng xèo, tiếng đảo xẻng."
run C "Cảnh 5: đổ cơm nguội hạt rời vào chảo gang, lửa lớn bùng cao, đầu bếp hất chảo, hạt cơm nhảy tung lên rồi rơi xuống, cơm săn lại, bóng dầu vàng nhạt, khói thơm. Góc máy ngang tầm chảo rồi cận hạt cơm. Tiếng lửa phừng, tiếng hất chảo, tiếng cơm rang lách tách."
run D "Cảnh 6: cho cà rốt, đậu Hà Lan, bắp, trứng tơi, tôm, lạp xưởng vào chảo cơm, rưới muỗng nước tương, rắc muối, tiêu xay, đảo đều; cơm vàng rực lẫn đỏ cam xanh, rắc hành lá cuối cùng. Góc máy từ trên xuống, cận. Tiếng đảo xẻng, tiếng rắc tiêu."
run E "Cảnh 7: múc cơm chiên ép chặt vào chén sứ, úp ngược lên dĩa sứ trắng viền xanh, nhấc chén lên thành khuôn cơm tròn đẹp, rắc hành lá, xếp dưa leo và cà chua cắt lát quanh dĩa, chén nhỏ nước tương với ớt lát bên cạnh. Góc máy từ trên xuống, cận. Tiếng úp chén, tiếng xếp dĩa."
run F "Cảnh 8: cận dĩa cơm chiên Dương Châu: muỗng xúc một muỗng cơm hạt rời có tôm, lạp xưởng, trứng, chấm nhẹ nước tương, nhấc lên cao hơi bốc; camera lùi chậm thấy toàn mâm trên bàn gỗ: dĩa cơm chiên, chén nước tương ớt, dưa leo, ly trà đá đọng nước, nắng chiều vàng. Tiếng muỗng chạm dĩa, tiếng đá trong ly, tiếng ve."
echo "== XONG $(date +%H:%M:%S)"; ls clips
