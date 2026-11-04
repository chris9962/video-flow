import { execFile } from 'node:child_process';
import { access, mkdir, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import ffmpegPath from 'ffmpeg-static';
import YTDlpWrapImport from 'yt-dlp-wrap';
import { BIN_DIR } from '../paths';
import type { MediaService } from './types';

// yt-dlp-wrap là CJS không có __esModule — Node ESM nhận { default: class }
type YTDlpWrapClass = typeof YTDlpWrapImport;
const YTDlpWrap: YTDlpWrapClass =
  (YTDlpWrapImport as unknown as { default?: YTDlpWrapClass }).default ?? YTDlpWrapImport;

const execFileAsync = promisify(execFile);
const EXEC_OPTS = { maxBuffer: 64 * 1024 * 1024, timeout: 30 * 60 * 1000 };
const FRAME_COUNT = 8;

function ffmpeg(): string {
  if (!ffmpegPath) throw new Error('ffmpeg-static không hỗ trợ platform này');
  return ffmpegPath;
}

let ytDlpReady: Promise<string> | undefined;

async function ensureYtDlp(): Promise<string> {
  ytDlpReady ??= (async () => {
    const bin = path.join(BIN_DIR, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
    await mkdir(BIN_DIR, { recursive: true });
    try {
      await access(bin);
    } catch {
      await YTDlpWrap.downloadFromGithub(bin);
    }
    return bin;
  })();
  // Download fail thì reset để lần gọi sau retry thay vì kẹt promise rejected
  try {
    return await ytDlpReady;
  } catch (err) {
    ytDlpReady = undefined;
    throw err;
  }
}

/** ffmpeg -i không có output sẽ exit != 0 nhưng vẫn in metadata ra stderr */
async function ffmpegStderr(args: string[]): Promise<string> {
  try {
    const { stderr } = await execFileAsync(ffmpeg(), args, EXEC_OPTS);
    return stderr;
  } catch (err) {
    const stderr = (err as { stderr?: string }).stderr;
    if (typeof stderr === 'string' && stderr.includes('Duration:')) return stderr;
    throw err;
  }
}

function parseDuration(stderr: string): number {
  const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) throw new Error('Không đọc được duration từ ffmpeg — file video có thể bị hỏng');
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

const hasAudioStream = (stderr: string): boolean => /Stream #\d+:\d+.*: Audio:/.test(stderr);

/** Bóc text thuần từ srt/vtt: bỏ index, timestamp, tag; auto-subs hay lặp dòng nên dedupe liền kề */
function subtitleToText(raw: string): string {
  const lines: string[] = [];
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.replace(/<[^>]*>/g, '').trim();
    if (!line) continue;
    if (/^\d+$/.test(line)) continue;
    if (line.includes('-->')) continue;
    if (/^WEBVTT/.test(line) || /^(Kind|Language):/.test(line)) continue;
    if (line !== lines[lines.length - 1]) lines.push(line);
  }
  return lines.join('\n');
}

async function findSubtitleFile(videoPath: string): Promise<string | undefined> {
  const dir = path.dirname(videoPath);
  const base = path.basename(videoPath, path.extname(videoPath));
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return undefined;
  }
  const subs = entries.filter(
    (f) => f.startsWith(`${base}.`) && (f.endsWith('.srt') || f.endsWith('.vtt')),
  );
  // yt-dlp đặt tên dạng source.vi.srt — ưu tiên srt (đã convert), rồi tiếng Việt
  subs.sort((a, b) => {
    const score = (f: string) => (f.endsWith('.srt') ? 0 : 2) + (f.includes('.vi.') ? 0 : 1);
    return score(a) - score(b);
  });
  return subs[0] ? path.join(dir, subs[0]) : undefined;
}

async function readImageSize(imagePath: string): Promise<{ width: number; height: number }> {
  const stderr = await ffmpegStderr(['-i', imagePath]);
  const m = stderr.match(/Video:.*?, (\d{2,5})x(\d{2,5})/);
  if (!m) throw new Error(`Không đọc được kích thước ảnh ${path.basename(imagePath)}`);
  return { width: Number(m[1]), height: Number(m[2]) };
}

export function createMediaService(): MediaService {
  return {
    async downloadVideo(url, outDir) {
      const ytDlpBin = await ensureYtDlp();
      await mkdir(outDir, { recursive: true });
      const ytDlp = new YTDlpWrap(ytDlpBin);
      await ytDlp.execPromise(
        [
          url,
          '-f',
          'bv*[height<=1080]+ba/b',
          '--merge-output-format',
          'mp4',
          '--write-auto-subs',
          '--sub-langs',
          'vi,en',
          '--convert-subs',
          'srt',
          '--write-info-json',
          '--no-playlist',
          // yt-dlp cần ffmpeg để merge/convert — máy user có thể không cài sẵn
          '--ffmpeg-location',
          ffmpeg(),
          '-o',
          path.join(outDir, 'source.%(ext)s'),
        ],
        EXEC_OPTS,
      );
      const file = path.join(outDir, 'source.mp4');
      let info: Record<string, unknown> = {};
      try {
        info = JSON.parse(await readFile(path.join(outDir, 'source.info.json'), 'utf8'));
      } catch {
        // info.json chỉ là metadata phụ — thiếu cũng không chặn download
      }
      return { file, info };
    },

    async extractFrame(videoPath, seconds, outFile) {
      await mkdir(path.dirname(outFile), { recursive: true });
      const duration = parseDuration(await ffmpegStderr(['-i', videoPath]));
      // -ss bằng đúng độ dài thì ffmpeg không ra khung nào → lùi 0,1 giây
      const t = Math.min(Math.max(0, seconds), Math.max(0, duration - 0.1));
      await execFileAsync(
        ffmpeg(),
        ['-ss', t.toFixed(2), '-i', videoPath, '-frames:v', '1', '-y', outFile],
        EXEC_OPTS,
      );
    },

    imageSize: readImageSize,

    async videoDuration(videoPath) {
      return parseDuration(await ffmpegStderr(['-i', videoPath]));
    },

    async padToAspect(imagePath, aspect, outFile) {
      const { width, height } = await readImageSize(imagePath);
      // Kích thước chẵn: một số encoder ảnh/video báo lỗi với cạnh lẻ.
      const even = (n: number) => Math.round(n / 2) * 2;
      const w = width / height < aspect ? even(height * aspect) : even(width);
      const h = width / height < aspect ? even(height) : even(width / aspect);
      await execFileAsync(
        ffmpeg(),
        [
          '-i', imagePath,
          '-filter_complex',
          `[0]scale=${w}:${h},boxblur=20:5[bg];[bg][0]overlay=(W-w)/2:(H-h)/2`,
          '-frames:v', '1', '-y', outFile,
        ],
        EXEC_OPTS,
      );
    },

    async cropToAspect(imagePath, aspect, outFile) {
      const a = aspect.toFixed(6);
      await execFileAsync(
        ffmpeg(),
        ['-i', imagePath, '-vf', `crop=w='min(iw,ih*${a})':h='min(ih,iw/${a})'`, '-frames:v', '1', '-y', outFile],
        EXEC_OPTS,
      );
    },

    async extractVideoContext(videoPath, outDir) {
      await mkdir(outDir, { recursive: true });
      const duration = parseDuration(await ffmpegStderr(['-i', videoPath]));

      const framePaths: string[] = [];
      for (let i = 0; i < FRAME_COUNT; i++) {
        // Lấy giữa mỗi đoạn để tránh frame đen ở t=0 và EOF
        const t = ((i + 0.5) * duration) / FRAME_COUNT;
        const framePath = path.join(outDir, `frame-${i + 1}.jpg`);
        await execFileAsync(
          ffmpeg(),
          ['-ss', t.toFixed(2), '-i', videoPath, '-frames:v', '1', '-q:v', '3', '-y', framePath],
          EXEC_OPTS,
        );
        framePaths.push(framePath);
      }

      let transcript = '';
      const subFile = await findSubtitleFile(videoPath);
      if (subFile) transcript = subtitleToText(await readFile(subFile, 'utf8'));
      return { framePaths, transcript };
    },

    async stitchVideos(videoPaths, outFile) {
      if (videoPaths.length === 0) throw new Error('Không có video nào để ghép');
      const probes = [];
      for (const p of videoPaths) probes.push(await ffmpegStderr(['-i', p]));

      const args: string[] = [];
      for (const p of videoPaths) args.push('-i', p);

      // Input thiếu audio → chèn silence cùng độ dài để concat v=1:a=1 không fail
      const audioLabels: string[] = [];
      let extraInput = videoPaths.length;
      probes.forEach((stderr, i) => {
        if (hasAudioStream(stderr)) {
          audioLabels.push(`[${i}:a]`);
        } else {
          args.push(
            '-f',
            'lavfi',
            '-t',
            parseDuration(stderr).toFixed(2),
            '-i',
            'anullsrc=channel_layout=stereo:sample_rate=44100',
          );
          audioLabels.push(`[${extraInput++}:a]`);
        }
      });

      const filters: string[] = [];
      const concatInputs: string[] = [];
      videoPaths.forEach((_, i) => {
        filters.push(
          `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,` +
            `pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}]`,
        );
        filters.push(
          `${audioLabels[i]}aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a${i}]`,
        );
        concatInputs.push(`[v${i}][a${i}]`);
      });
      filters.push(`${concatInputs.join('')}concat=n=${videoPaths.length}:v=1:a=1[v][a]`);

      await mkdir(path.dirname(outFile), { recursive: true });
      await execFileAsync(
        ffmpeg(),
        [
          ...args,
          '-filter_complex',
          filters.join(';'),
          '-map',
          '[v]',
          '-map',
          '[a]',
          '-c:v',
          'libx264',
          '-preset',
          'veryfast',
          '-crf',
          '20',
          '-pix_fmt',
          'yuv420p',
          '-c:a',
          'aac',
          '-b:a',
          '192k',
          '-movflags',
          '+faststart',
          '-y',
          outFile,
        ],
        EXEC_OPTS,
      );
    },
  };
}
