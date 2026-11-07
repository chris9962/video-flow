---
name: luon-co-clip-do-bo
description: "Mỗi lần người dùng gửi link Shopee, luôn làm thêm 1 clip mẫu mặc đồ bộ miền Tây lấy từ ảnh Google, cùng clip nhảy; clip đồ bộ để mặt mộc"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 6b5a03f4-0b5f-4adf-9623-ad9e393f112b
  modified: 2026-11-03T16:09:47.694Z
---

Mỗi lần người dùng gửi 1 hoặc nhiều link Shopee cho luồng aidancing, Claude luôn làm thêm 1 clip: mẫu mặc 1 bộ đồ bộ mặc nhà kiểu miền Tây, nhìn bình dân, quê mùa. Ảnh đồ bộ lấy từ Google Hình ảnh, từ khoá "đồ bộ miền tây": Claude lấy 1 ảnh thật có 1 người mặc nguyên bộ, cắt riêng 1 khung nếu ảnh ghép nhiều khung. Không để ChatGPT tự vẽ đồ bộ: ngày 2026-11-03 người dùng xem bản ChatGPT vẽ và nói "đồ bộ gpt gen ra chán quá". Clip đồ bộ dùng cùng clip nhảy và cùng mặt mẫu với các bộ Shopee.

Ngày 2026-11-05, người dùng yêu cầu thêm: clip đồ bộ là clip đầu của clip biến hình, nên mẫu để mặt mộc, không trang điểm. Các clip Shopee phía sau giữ trang điểm. Mục đích: người xem thấy rõ khác biệt khi biến hình. `ghep-nhieu-bo.mjs` tự thêm yêu cầu mặt mộc (hằng `MAT_MOC`) cho riêng nhánh đồ bộ.

**Why:** người dùng dựng clip biến hình: mẫu mặc đồ bộ, rồi chuyển sang đồ Shopee. Hai clip phải cùng chuyển động để ghép được. Người dùng yêu cầu ngày 2026-11-03.

**How to apply:** chạy `ghep-nhieu-bo.mjs` với `--do-bo-image <ảnh Google>` cùng các `--product`. Ảnh đồ bộ đi qua bước tách sản phẩm như ảnh Shopee. Clip đồ bộ đi chung bước duyệt ảnh ghép trên FE và chung bước AI Dancing, nên tốn thêm 1 job aidancing. Liên quan: [[video-flow-ghep-mau-aidancing]], [[tiktok-mo-ta-khong-ten-san-pham]].
