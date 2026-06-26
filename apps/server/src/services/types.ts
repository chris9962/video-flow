export type LlmProvider = 'chatgpt' | 'claude' | 'gemini';
/** Provider tạo/ghép ảnh qua browser — Gemini ghép đồ tốt và không chặn như ChatGPT */
export type ImageProvider = 'chatgpt' | 'gemini';

export interface BrowserPilot {
  /** Gửi prompt (kèm ảnh) tới web UI của provider, trả về text trả lời */
  sendPrompt(provider: LlmProvider, req: { prompt: string; imagePaths: string[] }): Promise<string>;
  /** Tạo/ghép ảnh qua web UI (ChatGPT hoặc Gemini), ghi kết quả vào outFile */
  generateImage(req: {
    provider: ImageProvider;
    prompt: string;
    referenceImagePaths: string[];
    outFile: string;
  }): Promise<void>;
  /** ChatGPT: gửi NHIỀU message liên tiếp trong CÙNG 1 tab (giữ ngữ cảnh) — message cuối tạo ảnh → tải vào outFile */
  generateImageSteps(req: {
    steps: { prompt: string; referenceImagePaths: string[] }[];
    outFile: string;
  }): Promise<void>;
  /** Mở cửa sổ browser headful để user đăng nhập provider (giữ session trong profile) */
  openLogin(provider: LlmProvider): Promise<void>;
  /** Mở 1 tab tới URL bất kỳ trong Chrome CDP (để user đăng nhập site web khác: kling.ai, Flow…) */
  openSite(url: string): Promise<void>;
}

export interface MediaService {
  /** Tải video từ URL (YouTube) về outDir, trả đường dẫn file + metadata */
  downloadVideo(url: string, outDir: string): Promise<{ file: string; info: Record<string, unknown> }>;
  /** Tách keyframes + transcript để video dùng được làm context cho LLM */
  extractVideoContext(
    videoPath: string,
    outDir: string,
  ): Promise<{ framePaths: string[]; transcript: string }>;
  /** Nối các video thành một (chuẩn hóa resolution/fps) */
  stitchVideos(videoPaths: string[], outFile: string): Promise<void>;
}

export interface VideoGenService {
  generateVideo(req: {
    prompt: string;
    /** Ảnh frame đầu (Start) — image→video */
    imagePath?: string;
    /** Ảnh frame cuối (End) — tạo chuyển động đầu→cuối (vd xoay người trước→sau) */
    endImagePath?: string;
    model: string;
    durationSeconds: number;
    aspectRatio: string;
    /** Độ phân giải (Mode) — chỉ Kling web dùng: '720p' | '1080p' */
    quality?: string;
    outFile: string;
  }): Promise<void>;
}

/** Các tác vụ video qua fal.ai (API trả tiền) — mỗi block tạo video model riêng gọi 1 method. */
export interface FalService {
  /** Kling text/image→video: Start (imagePath) + End (endImagePath) + Prompt. 1 lần = 1 video. */
  generateVideo(req: {
    prompt: string;
    imagePath?: string;
    endImagePath?: string;
    model: string;
    durationSeconds: number;
    aspectRatio: string;
    outFile: string;
  }): Promise<void>;
  /** Kling O1 video→video: đổi nền/nhân vật/style từ video mẫu, giữ chuyển động. */
  editVideo(req: {
    videoPath: string;
    prompt: string;
    /** Ảnh tham chiếu style (tuỳ chọn, ≤4) */
    refImagePaths?: string[];
    keepAudio?: boolean;
    outFile: string;
  }): Promise<void>;
  /** Pixverse: đổi mặt/đối tượng/nền trong video bằng 1 ảnh tham chiếu. */
  swapFace(req: {
    videoPath: string;
    imagePath: string;
    mode: 'person' | 'object' | 'background';
    resolution: '360p' | '540p' | '720p';
    keepAudio?: boolean;
    outFile: string;
  }): Promise<void>;
}

/** Hiểu video qua browser (Gemini xem video native) → text. Dùng cho block 'motion'. */
export interface VideoUnderstandingService {
  /** Gemini xem 1 video → mô tả chuyển động → trả 1 prompt (text) tái sử dụng cho block khác. */
  extractPrompt(videoPath: string): Promise<string>;
}

/** Grok Imagine (grok.com) qua browser — tạo ẢNH & VIDEO bằng credit gói SuperGrok (không API trả tiền). */
export interface GrokService {
  /** Tạo ảnh: prompt (+ ảnh tham chiếu tuỳ chọn), tỷ lệ khung hình → ghi vào outFile. */
  generateImage(req: {
    prompt: string;
    referenceImagePaths?: string[];
    aspectRatio?: string;
    outFile: string;
  }): Promise<void>;
  /** Tạo video: prompt (+ ảnh frame đầu tuỳ chọn), tỷ lệ khung hình → ghi vào outFile. */
  generateVideo(req: {
    prompt: string;
    imagePath?: string;
    aspectRatio?: string;
    outFile: string;
  }): Promise<void>;
}
