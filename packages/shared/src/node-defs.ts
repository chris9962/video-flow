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
};

// Prompt mặc định block restyle — dùng chung server (khi config rỗng) lẫn FE (hiện sẵn để user sửa 1 phần).
export const RESTYLE_DEFAULT_ANALYZE =
  'Xem kỹ ảnh này và GHI NHỚ chính xác: góc máy (hướng, độ cao, độ nghiêng), ánh sáng (tông màu, hướng sáng, độ mềm/đổ bóng), và background. Chỉ cần ghi nhớ, CHƯA tạo ảnh.';
export const RESTYLE_DEFAULT_GEN =
  'Tạo một ảnh chân dung của người trong ảnh này, GIỮ NGUYÊN khuôn mặt và danh tính của họ, nhưng dùng ĐÚNG góc máy, ánh sáng và background mà bạn vừa ghi nhớ ở ảnh trước. Ảnh chân thực, tự nhiên.';
