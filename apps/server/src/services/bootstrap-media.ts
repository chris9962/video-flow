import { createFalService } from './falai-impl';
import { createFlowVideoGen } from './flow-impl';
import { createVideoUnderstandingService } from './gemini-video-impl';
import { createGrokService } from './grok-impl';
import { setFal, setGrok, setKlingWeb, setMedia, setVideoGen, setVideoUnderstanding } from './index';
import { createKlingWebService } from './kling-web-impl';
import { createMediaService } from './media-impl';

/** Đăng ký MediaService (yt-dlp/ffmpeg) + VideoGenService (Google Flow qua browser) +
 *  FalService (Kling/Pixverse qua fal.ai API) + Kling web (kling.ai, dùng credit sub) +
 *  VideoUnderstanding (Gemini xem video → trích prompt) + Grok Imagine (grok.com, ảnh & video). */
export function bootstrapMediaServices(): void {
  setMedia(createMediaService());
  setVideoGen(createFlowVideoGen());
  setFal(createFalService());
  setKlingWeb(createKlingWebService());
  setVideoUnderstanding(createVideoUnderstandingService());
  setGrok(createGrokService());
}
