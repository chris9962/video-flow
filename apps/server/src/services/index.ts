import type {
  BrowserPilot,
  FalService,
  GrokService,
  MediaService,
  VideoGenService,
  VideoUnderstandingService,
} from './types';

function notReady(what: string): never {
  throw new Error(`${what} chưa sẵn sàng — kiểm tra trang Settings`);
}

let pilot: BrowserPilot = {
  sendPrompt: async () => notReady('Browser Pilot'),
  generateImage: async () => notReady('Browser Pilot'),
  generateImageSteps: async () => notReady('Browser Pilot'),
  openLogin: async () => notReady('Browser Pilot'),
  openSite: async () => notReady('Browser Pilot'),
};

let media: MediaService = {
  downloadVideo: async () => notReady('Media tools'),
  extractVideoContext: async () => notReady('Media tools'),
  stitchVideos: async () => notReady('Media tools'),
};

let videoGen: VideoGenService = {
  generateVideo: async () => notReady('Video generation (Google Flow)'),
};

let fal: FalService = {
  generateVideo: async () => notReady('fal.ai'),
  editVideo: async () => notReady('fal.ai'),
  swapFace: async () => notReady('fal.ai'),
};

// Kling qua web (kling.ai) — dùng credit gói sub; cùng interface VideoGenService như Flow
let klingWeb: VideoGenService = {
  generateVideo: async () => notReady('Kling web (kling.ai)'),
};

// Gemini xem video → trích prompt (block 'motion')
let videoUnderstanding: VideoUnderstandingService = {
  extractPrompt: async () => notReady('Trích prompt video (Gemini)'),
};

// Grok Imagine (grok.com) — tạo ảnh & video qua browser bằng credit gói SuperGrok
let grok: GrokService = {
  generateImage: async () => notReady('Grok Imagine'),
  generateVideo: async () => notReady('Grok Imagine'),
};

export const getPilot = (): BrowserPilot => pilot;
export const setPilot = (p: BrowserPilot): void => void (pilot = p);
export const getMedia = (): MediaService => media;
export const setMedia = (m: MediaService): void => void (media = m);
export const getVideoGen = (): VideoGenService => videoGen;
export const setVideoGen = (v: VideoGenService): void => void (videoGen = v);
export const getFal = (): FalService => fal;
export const setFal = (f: FalService): void => void (fal = f);
export const getKlingWeb = (): VideoGenService => klingWeb;
export const setKlingWeb = (v: VideoGenService): void => void (klingWeb = v);
export const getVideoUnderstanding = (): VideoUnderstandingService => videoUnderstanding;
export const setVideoUnderstanding = (v: VideoUnderstandingService): void =>
  void (videoUnderstanding = v);
export const getGrok = (): GrokService => grok;
export const setGrok = (g: GrokService): void => void (grok = g);

export type {
  BrowserPilot,
  FalService,
  GrokService,
  MediaService,
  VideoGenService,
  VideoUnderstandingService,
  LlmProvider,
  ImageProvider,
} from './types';
