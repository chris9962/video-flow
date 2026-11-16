#!/bin/bash
# Tạo 12 clip tập 1 "Bến Cô Ba" bằng Muse (profile my), 10 giây/clip, lưu clips/<NN>-01.mp4. Log: muse-all.log
cd "$(dirname "$0")"
S=../../../.claude/skills/muse-ai/scripts/muse.mjs
M=../mau
STYLE="Video khổ dọc 9:16, dài 10 giây, phong cách phim điện ảnh thực tế, nét cao, tâm linh nhẹ nhàng. Bối cảnh làng quê miền Tây Nam Bộ Việt Nam thanh bình, giản dị, nhà gỗ mái tôn sạch sẽ, dừa, cau, sông có cây bần và cầu ván; màu phim ấm. Nhân vật người Việt, GIỮ ĐÚNG gương mặt và trang phục trong ảnh đính kèm. Không ai nói chuyện, không chữ, không logo; chỉ tiếng động môi trường và nhạc nền nhẹ. Không máu me. Làm luôn, không cần hỏi lại."
node "$S" --profile my --expect text --timeout 2 --prompt "Bỏ qua yêu cầu video trước, không cần làm nữa. Chỉ trả lời: ok." 2>&1 | tail -2
run() { # NN, refs (phẩy), prompt
  local id="$1" refs="$2"; shift 2
  [ -f "clips/$id-01.mp4" ] && { echo "== $id đã có, bỏ qua"; return; }
  echo "== $id $(date +%H:%M:%S)"
  local a=(); IFS=, read -ra rs <<<"$refs"; for r in "${rs[@]}"; do [ -n "$r" ] && a+=(--ref "$M/$r-01.png"); done
  node "$S" --profile my --timeout "${TO:-15}" --out clips --prefix "$id" "${a[@]}" --prompt "$STYLE $*" 2>&1 | tail -6
}
run 01 ut,co-hong "Cảnh: nắng chiều 5 giờ vàng ấm, sân nhà gỗ mái tôn. Người mẹ (ảnh 2, cô Hồng áo bà ba hồng) đang lui cui phơi đồ sau hè, quay lưng. Cậu bé Út (ảnh 1) rón rén ngó mẹ, rồi lẻn ra cổng rào gỗ, chạy ra đường đất, nhìn lại một cái. Tiếng gà, tiếng gió, tiếng dép chạy."
run 02 ut "Cảnh: cậu bé Út (ảnh) nhập bọn với 4-5 đứa trẻ quê cùng tuổi, cả đám chạy ùa trên bờ đê đất ven sông ra bến, cười giỡn, hai bên là dừa và cây bần, nắng chiều vàng. Camera chạy theo ngang. Tiếng cười con nít, tiếng chim."
run 03 ut "Cảnh: đám trẻ nhảy ùm xuống sông từ cầu ván, nước bắn tung trong nắng chiều. Cậu bé Út (ảnh) bơi ra xa nhất, giữa sông yên ả, mặt nước lấp lánh. Camera ngang mặt nước. Tiếng nước, tiếng cười."
TO=6 run 04 "" "Cảnh quay dưới mặt nước sông đục màu nâu xanh, ánh nắng chiều xuyên xuống thành tia, bọt khí li ti nổi lên. Từ đáy tối, những sợi tóc dài đen lờ lững trôi lên, uốn lượn như rong, ẩn hiện trong làn nước, từ từ dâng về phía mặt nước sáng. Không có người trong khung hình. Nhạc nền rùng rợn nhẹ, tiếng nước ù ù."
TO=6 run 05 "" "Cảnh quay dưới mặt nước sông đục, ánh sáng mờ xanh. Từ trong bóng tối dưới đáy, một bàn tay người lớn da tái nhợt, gầy gò, ngón dài, từ từ vươn lên về phía ánh sáng trên mặt nước, các ngón tay khép lại như nắm lấy thứ gì đó rồi kéo xuống. Tóc dài đen trôi quanh cánh tay. Không thấy mặt, không máu. Camera cận, chậm. Nhạc nền rùng rợn, tiếng nước trầm."
TO=6 run 06 ut "Cảnh: trên mặt sông lúc chạng vạng, cậu bé Út (ảnh) đang bơi bỗng bị kéo khựng lại, chới với, chìm lên chìm xuống, vùng vẫy, uống nước. Trên bờ, đám trẻ hoảng hốt leo lên cầu ván, la hét chỉ tay ra sông. Tiếng nước đập, tiếng la."
run 07 ba-bay "Cảnh: đường đất ven sông lúc chạng vạng, trời tím cam. Bà cụ (ảnh, bà Bảy) xách đèn dầu đi ngang, nghe tiếng la hét, giật mình nhìn ra sông rồi hớt hải chạy xuống bến, một tay thò vô túi áo bà ba. Tiếng chân chạy, tiếng la vọng, tiếng dế."
run 08 ba-bay "Cảnh: bà cụ (ảnh, bà Bảy) đứng mép bến giơ cao đèn dầu, vốc nắm gạo muối trong tay ném mạnh ra sông, miệng lẩm nhẩm. Giữa sông, mặt nước đang sục xoáy bỗng xoáy một vòng rồi lặng hẳn. Trời tối dần. Nhạc nền căng rồi lặng, tiếng gạo rơi xuống nước."
run 09 ut,ba-bay "Cảnh: bến sông tối dần. Cậu bé Út (ảnh 1) ướt sũng nằm trên cầu ván ho sặc sụa, bà cụ (ảnh 2, bà Bảy) ôm nó vuốt lưng, đèn dầu đặt bên cạnh. Bà ngẩng lên nhìn ra giữa sông phẳng lặng, mặt nghiêm, không nói. Camera tiến chậm. Tiếng ho, tiếng dế, tiếng nước."
run 10 ut "Cảnh: đêm, trong nhà gỗ. Cậu bé Út (ảnh) nằm ngủ trong mùng trắng, một bàn tay người lớn tắt đèn dầu rồi đi ra, phòng tối om. Trong bóng tối, sợi dây chuyền bạc hình cỏ bốn lá trên cổ Út từ từ sáng lên ánh vàng kim, soi mặt cậu bé đang ngủ. Camera cận chậm. Tiếng dế, nhạc nền huyền bí."
TO=6 run 11 co-ba "Cảnh giấc mơ: bến sông đầy sương mù, trăng mờ, màu xanh tím. Cuối bến, người đàn bà (ảnh, cô Ba) mặc áo bà ba trắng ướt, tóc dài đen ướt che mặt, đứng quay lưng nhìn ra sông, im lìm. Camera tiến chậm lại gần từ phía sau, bà hơi nghiêng đầu. Nhạc nền ma mị, tiếng gió, tiếng nước nhỏ giọt."
TO=6 run 12 ut "Cảnh: đêm, trong mùng. Cậu bé Út (ảnh) giật mình ngồi bật dậy, thở dốc, mồ hôi, sợi dây chuyền cỏ bốn lá trên cổ còn sáng mờ vàng. Ngoài cửa sổ gỗ, một bóng trắng mờ lướt qua rồi biến mất. Út quay đầu nhìn ra cửa sổ. Camera cận. Tiếng thở, tiếng dế, nhạc nền rùng rợn nhẹ rồi im bặt."
echo "== XONG $(date +%H:%M:%S)"; ls clips
