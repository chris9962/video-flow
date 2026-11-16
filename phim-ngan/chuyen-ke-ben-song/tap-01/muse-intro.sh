#!/bin/bash
# 3 cảnh mở đầu (Diễm My 22:52: quay cận nhân vật chính), chạy SAU muse-clips.sh (Muse chỉ có 1 luồng chat).
cd "$(dirname "$0")"
while ! grep -q "== XONG" muse-all.log 2>/dev/null; do sleep 20; done
S=../../../.claude/skills/muse-ai/scripts/muse.mjs
M=../mau
STYLE="Video khổ dọc 9:16, dài 10 giây, phong cách phim điện ảnh thực tế, nét cao. Bối cảnh làng quê nghèo miền Tây Nam Bộ Việt Nam chừng hai mươi hộ dân, thanh bình, mộc mạc, giản dị, người dân biết quan tâm giúp đỡ nhau, vui tươi dù nghèo; nhà gỗ mái tôn sạch sẽ, dừa, cau, sông có cây bần, bến đò có xuồng; nắng chiều vàng ấm. Nhân vật người Việt, GIỮ ĐÚNG gương mặt và trang phục trong ảnh đính kèm. Không ai nói chuyện, không chữ, không logo; chỉ tiếng động môi trường và nhạc nền nhẹ êm. Làm luôn, không cần hỏi lại."
run() { local id="$1" refs="$2"; shift 2; [ -f "clips/$id-01.mp4" ] && return; echo "== $id $(date +%H:%M:%S)"
  local a=(); IFS=, read -ra rs <<<"$refs"; for r in "${rs[@]}"; do [ -n "$r" ] && a+=(--ref "$M/$r-01.png"); done
  node "$S" --profile my --out clips --prefix "$id" "${a[@]}" --prompt "$STYLE $*" 2>&1 | tail -6; }
run i1 "" "Cảnh: camera bay từ trên cao hạ xuống chậm: một xóm nhỏ ven sông chừng hai mươi nóc nhà gỗ mái tôn nằm giữa vườn dừa, cau, hàng bần ven sông, bến đò có vài chiếc xuồng gỗ, khói bếp bay, nắng chiều vàng. Tiếng chim, tiếng gió, nhạc nền êm."
run i2 co-hong,ut "Cảnh: trước sân nhà gỗ mái tôn. Người mẹ (ảnh 1, cô Hồng áo bà ba hồng) ngồi lặt rau, cậu bé Út (ảnh 2) ngồi kế bên phụ, hai mẹ con cười với nhau. Camera quay CẬN MẶT từng người: cận mặt cô Hồng cười hiền, rồi cận mặt Út tinh nghịch, dây chuyền cỏ bốn lá trên cổ lấp lánh nắng. Tiếng gà, tiếng gió, nhạc nền êm."
run i3 ba-bay,ong-tam "Cảnh: hàng rào gỗ thấp giữa hai nhà, nắng chiều. Người đàn ông (ảnh 2, ông Tám đội nón lá) đưa xâu cá qua hàng rào cho bà cụ (ảnh 1, bà Bảy), bà cười nhận, gật đầu cảm ơn. Camera quay CẬN MẶT từng người: cận mặt ông Tám cười phúc hậu, rồi cận mặt bà Bảy hiền từ. Cuối cảnh camera quay chậm ra bến đò, mặt sông phẳng lặng. Tiếng cười nói xa, tiếng chim, nhạc nền êm."
run i4 anh-hung "Cảnh: bến đò buổi sáng nắng nhẹ. Người đàn ông (ảnh, anh Hưng sơ mi trắng, hơi mập, mặt tròn hiền) xách túi hành lý bước xuống chiếc xuồng gỗ để đi làm xa, quay lại vẫy tay cười với bờ. Camera quay CẬN MẶT anh Hưng cười hiền rồi lùi ra, xuồng rời bến, mặt sông lặng. Tiếng máy xuồng nhỏ, tiếng nước, nhạc nền êm."
echo "== XONG INTRO $(date +%H:%M:%S)"
