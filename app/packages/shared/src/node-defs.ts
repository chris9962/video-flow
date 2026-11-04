import type { DataType } from './workflow';

/** Một cổng input của block — block có nhiều cổng thì phân biệt input theo cổng (vd video: start/prompt/end) */
export interface BlockInputPort {
  id: string;
  label: string;
  /** Loại block được phép nối vào cổng này */
  accepts: DataType[];
}

/**
 * Block vừa là input vừa là output: không có input nối vào thì là nguồn (content
 * user cung cấp), có input thì tự generate khi Run và kết quả đè vào content.
 */
export interface BlockTypeDefinition {
  /** Định danh block (cũng là node.type). Block tạo video theo model riêng có id riêng: kling/kling-edit/faceswap */
  type: string;
  /** Loại DỮ LIỆU phát ra ở cổng out — tách khỏi `type` vì nhiều block (kling…) cùng phát 'video' */
  emits: DataType;
  label: string;
  description: string;
  /** Loại block được phép nối vào — gộp accepts của mọi cổng (dùng cho block 1 cổng 'in') */
  accepts: DataType[];
  /** Nhiều cổng input có tên riêng; bỏ trống = 1 cổng 'in' nhận mọi loại trong accepts */
  inputs?: BlockInputPort[];
  /** Loại input tiêu thụ nguyên danh sách (không fan-out) — vd video đổ vào video block để ghép */
  consumeWhole?: DataType[];
}

export const BLOCK_DEFINITIONS: Record<string, BlockTypeDefinition> = {
  text: {
    type: 'text',
    emits: 'text',
    label: 'Text',
    description:
      'Gõ text/prompt. Có input nối vào thì thành AI agent: text của block là prompt, input là context (video sẽ được tách keyframes + transcript). Kết quả là JSON array thì các block sau chạy lặp.',
    accepts: ['text', 'image', 'video'],
  },
  image: {
    type: 'image',
    emits: 'image',
    label: 'Ảnh',
    description:
      'Upload ảnh. Có input nối vào thì tự tạo ảnh: text input là prompt, ảnh input là tham chiếu.',
    accepts: ['text', 'image'],
    // 2 cổng riêng cho gọn gàng: Prompt (text) + Ảnh tham chiếu (image). Engine vẫn gom vào
    // inputs.texts/inputs.images chung nên logic chạy không đổi; cổng 'in' cũ tự route về đúng cổng.
    inputs: [
      { id: 'prompt', label: 'Prompt', accepts: ['text'] },
      { id: 'image', label: 'Ảnh', accepts: ['image'] },
    ],
  },
  video: {
    type: 'video',
    emits: 'video',
    label: 'Video (Flow)',
    description:
      'Upload video hoặc dán link YouTube. Nối Start (ảnh frame đầu) + Prompt (mô tả chuyển động) + End (ảnh frame cuối) thì tự tạo video qua Google Flow.',
    accepts: ['text', 'image'],
    // 3 cổng riêng: Start/End nhận 1 ảnh frame, Prompt nhận text mô tả chuyển động
    inputs: [
      { id: 'start', label: 'Start', accepts: ['image'] },
      { id: 'prompt', label: 'Prompt', accepts: ['text'] },
      { id: 'end', label: 'End', accepts: ['image'] },
    ],
  },
  // Block tạo video theo model fal.ai — mỗi model 1 block, MỖI BLOCK = 1 VIDEO (không fan-out trong block).
  kling: {
    type: 'kling',
    emits: 'video',
    label: 'Kling',
    description:
      'Tạo video bằng Kling (fal.ai): Start (ảnh đầu) + Prompt (mô tả chuyển động) + End (ảnh cuối, tuỳ chọn). 1 block ra 1 video.',
    accepts: ['text', 'image'],
    inputs: [
      { id: 'start', label: 'Start', accepts: ['image'] },
      { id: 'prompt', label: 'Prompt', accepts: ['text'] },
      { id: 'end', label: 'End', accepts: ['image'] },
    ],
  },
  'kling-edit': {
    type: 'kling-edit',
    emits: 'video',
    label: 'Kling Edit',
    description:
      'Đổi nền / nhân vật / style từ 1 video mẫu, giữ nguyên chuyển động (Kling O1, fal.ai). Nối Video + Prompt → 1 video mới.',
    accepts: ['text', 'video'],
    inputs: [
      { id: 'video', label: 'Video', accepts: ['video'] },
      { id: 'prompt', label: 'Prompt', accepts: ['text'] },
    ],
    // Video mẫu nhận nguyên 1 file (không tách keyframes như khi đổ vào text agent)
    consumeWhole: ['video'],
  },
  faceswap: {
    type: 'faceswap',
    emits: 'video',
    label: 'Face Swap',
    description:
      'Đổi mặt trong video bằng 1 ảnh mặt tham chiếu (Pixverse, fal.ai). Nối Video + Mặt (ảnh) → 1 video đổi mặt.',
    accepts: ['image', 'video'],
    inputs: [
      { id: 'video', label: 'Video', accepts: ['video'] },
      { id: 'face', label: 'Mặt', accepts: ['image'] },
    ],
    consumeWhole: ['video'],
  },
  // Trích prompt từ video: Gemini xem video → mô tả chuyển động → text. ĐẶC BIỆT: chạy được dù không
  // nối input (xử lý video đã upload trong block); cổng Video tuỳ chọn để nối 1 video nguồn thay cho upload.
  motion: {
    type: 'motion',
    emits: 'text',
    label: 'Trích Prompt (Video)',
    description:
      'Upload 1 video → Gemini xem và mô tả chuyển động nhân vật → ra prompt (text) tái sử dụng. Chạy được dù không nối input; kéo cổng out vào Prompt của block video/kling.',
    accepts: ['video'],
    inputs: [{ id: 'video', label: 'Video', accepts: ['video'] }],
    consumeWhole: ['video'],
  },
  // ChatGPT 2 message LIÊN TIẾP cùng 1 tab: B1 đưa ảnh THAM CHIẾU (GPT ghi nhớ góc máy/ánh sáng/bg),
  // B2 đưa ảnh MẪU + tạo ảnh áp style đó, giữ nguyên mặt. 2 cổng ảnh: ref + face.
  restyle: {
    type: 'restyle',
    emits: 'image',
    label: 'Ảnh GPT 2 bước',
    description:
      'ChatGPT 2 message liên tiếp cùng 1 tab: B1 đưa ảnh THAM CHIẾU để GPT ghi nhớ góc máy/ánh sáng/background; B2 đưa ảnh MẪU + tạo ảnh áp style đó, GIỮ NGUYÊN gương mặt. Nối Tham chiếu + Mẫu (2 ảnh).',
    accepts: ['image'],
    inputs: [
      { id: 'ref', label: 'Tham chiếu', accepts: ['image'] },
      { id: 'face', label: 'Mẫu', accepts: ['image'] },
    ],
  },
  // Ghép mẫu: 3 message cùng 1 tab — B1 nhớ mặt mẫu, B2 nhớ trang phục, B3 sửa ảnh dáng (khung hình cắt từ clip).
  // Sửa thẳng ảnh dáng thay vì tạo ảnh mới để giữ đúng tư thế, góc máy, background → ảnh khớp clip khi làm video.
  tryon: {
    type: 'tryon',
    emits: 'image',
    label: 'Ghép mẫu',
    description:
      'Ghép mặt mẫu cố định + trang phục vào ảnh dáng cắt từ clip, giữ nguyên tư thế. Nối Mặt mẫu và Ảnh dáng; thiếu Ảnh dáng thì nối Clip để block tự cắt khung hình ở giây đã chọn. Trang phục không bắt buộc: không nối thì giữ quần áo trong Ảnh dáng. Background không bắt buộc: nối thì thêm 1 bước đưa nhân vật đã ghép vào background mới.',
    accepts: ['image', 'video'],
    inputs: [
      { id: 'face', label: 'Mặt mẫu', accepts: ['image'] },
      { id: 'outfit', label: 'Trang phục · không bắt buộc', accepts: ['image'] },
      { id: 'pose', label: 'Ảnh dáng', accepts: ['image'] },
      { id: 'clip', label: 'Clip', accepts: ['video'] },
      { id: 'background', label: 'Background · không bắt buộc', accepts: ['image'] },
    ],
    consumeWhole: ['video'],
  },
  // aidancing.net (model copy chuyển động): ảnh mẫu (thường là khung đầu của clip đã ghép mặt + đồ) + video mẫu → video.
  aidancing: {
    type: 'aidancing',
    emits: 'video',
    label: 'AI Dancing',
    description:
      'aidancing.net copy chuyển động: nhân vật trong Ảnh mẫu làm theo động tác của Video mẫu. Ảnh mẫu nên là khung đầu của Video mẫu (đã ghép mặt + trang phục) để cùng tỉ lệ người. Dùng credit aidancing, job chạy khoảng 30 phút.',
    accepts: ['image', 'video'],
    inputs: [
      { id: 'image', label: 'Ảnh mẫu', accepts: ['image'] },
      { id: 'video', label: 'Video mẫu', accepts: ['video'] },
    ],
    consumeWhole: ['video'],
  },
};

/** Thời lượng aidancing cho chọn (giây tính tiền) */
export const AIDANCING_DURATIONS = [10, 15, 20, 25];

// Prompt mặc định block restyle — dùng chung server (khi config rỗng) lẫn FE (hiện sẵn để user sửa 1 phần).
export const RESTYLE_DEFAULT_ANALYZE = `Xem kỹ ảnh này và GHI NHỚ chính xác:
- Góc máy: hướng, độ cao, độ nghiêng.
- Ánh sáng: tông màu, hướng sáng, độ mềm/đổ bóng.
- Background.
- Góc nghiêng của cơ thể, cách chân tạo dáng, cách tay tạo dáng.
- Hướng nhìn của mắt, góc của mặt so với camera, cách xõa tóc.
Chỉ cần ghi nhớ, CHƯA tạo ảnh.`;
export const RESTYLE_DEFAULT_GEN = `Đầu tiên hãy ghi nhớ đặc điểm gương mặt của ảnh này: ánh mắt, nụ cười, sóng mũi.
Tạo một ảnh chân dung của người trong ảnh này (với các đặc điểm vừa ghi nhớ), GIỮ NGUYÊN khuôn mặt (có thể đổi góc mặt cho phù hợp với ảnh mẫu trước đó) và danh tính của họ, nhưng dùng ĐÚNG góc máy, ánh sáng và background mà bạn vừa ghi nhớ ở ảnh trước. Ảnh chân thực, tự nhiên.
QUAN TRỌNG — đổi góc nhìn của gương mặt cho KHỚP với ảnh mẫu (góc của mặt so với camera), và đổi cả cách xõa tóc cho khớp với ảnh mẫu.`;

// Prompt mặc định block tryon (Ghép mẫu) — 3 bước cùng 1 tab, bước 3 đính kèm Ảnh dáng.
export const TRYON_DEFAULT_FACE = `Đây là ảnh gương mặt người mẫu của tôi. Hãy GHI NHỚ thật kỹ: hình dáng khuôn mặt, mắt, lông mày, mũi, môi, màu da, kiểu tóc và màu tóc.
Chỉ cần ghi nhớ, CHƯA tạo ảnh.`;
export const TRYON_DEFAULT_OUTFIT = `Đây là ảnh sản phẩm trang phục. Hãy GHI NHỚ thật kỹ: loại trang phục, màu sắc, chất liệu, hoa văn, cổ áo, tay áo, độ dài, độ ôm, chi tiết nút, khoá, đường may.
Chỉ cần ghi nhớ, CHƯA tạo ảnh.`;
export const TRYON_DEFAULT_GEN = `chỉnh sửa trực tiếp ảnh đính kèm này, không tạo ảnh mới từ đầu.
- Thay gương mặt của người trong ảnh bằng gương mặt người mẫu đã ghi nhớ ở ảnh thứ nhất.
- Thay trang phục của người trong ảnh bằng trang phục đã ghi nhớ ở ảnh thứ hai, đúng màu sắc và chi tiết. Chỉ vẽ phần trang phục nằm trong khung hình hiện tại.
- GIỮ NGUYÊN 100% khung hình: người ở đúng vị trí và đúng kích thước như ảnh đính kèm. Không zoom ra, không zoom vào, không thêm phần cơ thể nằm ngoài khung. Ảnh gốc cắt ngang chỗ nào thì ảnh mới cắt ngang đúng chỗ đó.
- GIỮ NGUYÊN 100%: tư thế, vị trí tay chân, hướng người, góc máy, background, hướng sáng, vóc dáng.
- Làm ánh sáng trên da nhân vật giảm xuống, loại bỏ các yếu tố làm da trông như nhựa, như ảnh AI. Làm màu da, độ đổ bóng và ánh sáng tự nhiên hơn.
- Ảnh chân thực, tự nhiên.`;
// Thêm vào cuối prompt bước 3 khi không nối Trang phục.
export const TRYON_KEEP_OUTFIT = `- Không có ảnh trang phục: GIỮ NGUYÊN trang phục đang mặc trong ảnh này, bỏ qua mọi yêu cầu thay trang phục.`;
// Bước 4 block tryon, chỉ chạy khi nối Background: đính kèm ảnh Background, sửa tiếp ảnh vừa ghép.
export const TRYON_DEFAULT_BG = `đưa nhân vật trong ảnh vừa tạo vào background của ảnh đính kèm này.
- Thay toàn bộ background của ảnh vừa tạo bằng background trong ảnh đính kèm.
- GIỮ NGUYÊN 100% nhân vật: gương mặt, trang phục, tư thế, vị trí tay chân, vóc dáng, kích thước và vị trí của nhân vật trong khung hình.
- Ánh sáng, màu sắc và bóng đổ trên nhân vật khớp với ánh sáng của background mới. Chân nhân vật đứng đúng trên mặt sàn của background, có bóng đổ dưới chân.
- GIỮ NGUYÊN 100% khung hình của ảnh vừa tạo: không zoom ra, không zoom vào, nhân vật cắt ngang đúng chỗ như ảnh vừa tạo. Ảnh chân thực, tự nhiên.`;
