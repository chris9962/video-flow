import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import ffmpegPath from 'ffmpeg-static';
import { bootstrapBrowserServices } from '../src/services/bootstrap-browser';
import { getPilot } from '../src/services';
import { createFlowVideoGen } from '../src/services/flow-impl';

const execFileAsync = promisify(execFile);

const PROJECT_DIR = '/Users/nguyentruong/mino-house';
const ASSETS_DIR = path.join(PROJECT_DIR, 'assets');
const VID_DIR = path.join(ASSETS_DIR, 'vid');

const STYLE_PREAMBLE = 'Ultra-photorealistic architectural photography of a luxury modern ground-level courtyard villa, modern minimalist design, concrete and natural walnut wood, lush green garden landscaping, warm golden-hour light, shallow depth of field, magazine quality, no people.';

const STAGE_CONFIGS = [
  {
    id: 'entrance',
    stillPrompt: `${STYLE_PREAMBLE} Entrance pathway, concrete stepping stones over a shallow tranquil water feature, surrounded by lush minimalist Japanese garden landscaping, mature trees. Widescreen landscape view.`,
    legPrompt: `Single continuous cinematic camera move, no cuts. Continue the same slow, steady forward glide. The camera moves along the concrete stepping stones over the water, through the grand entryway doors into the indoor living space. In the final second, settle back into a slow, steady forward glide toward the interior. ${STYLE_PREAMBLE} Smooth, graceful, slow motion, subtle parallax. No text, no captions.`
  },
  {
    id: 'living',
    legPrompt: `Single continuous cinematic camera move, no cuts. Continue the same slow, steady forward glide. The camera glides from the entrance corridor into the sunken living space that opens completely to a central garden courtyard via open glass walls. In the final second, settle back into a slow, steady forward glide heading toward the kitchen/dining area. ${STYLE_PREAMBLE} Smooth, graceful, slow motion, subtle parallax. No text, no captions.`
  },
  {
    id: 'kitchen',
    legPrompt: `Single continuous cinematic camera move, no cuts. Continue the same slow, steady forward glide. The camera glides from the living space into the open dining and kitchen area, passing a large concrete island looking out to a quiet glass atrium garden. In the final second, settle back into a slow, steady forward glide towards the master bedroom door. ${STYLE_PREAMBLE} Smooth, graceful, slow motion, subtle parallax. No text, no captions.`
  },
  {
    id: 'bedroom',
    legPrompt: `Single continuous cinematic camera move, no cuts. Continue the same slow, steady forward glide. The camera glides through the master bedroom door, past a low-profile king bed, looking out at a private walled garden with bamboo illuminated at night. In the final second, settle back into a slow, steady forward glide exiting towards the back terrace. ${STYLE_PREAMBLE} Smooth, graceful, slow motion, subtle parallax. No text, no captions.`
  },
  {
    id: 'terrace',
    legPrompt: `Single continuous cinematic camera move, no cuts. Continue the same slow, steady forward glide. The camera glides out onto the wooden back terrace deck toward a sleek lap pool embedded in a lush forest-like garden at dusk. In the final second, settle back into a slow, steady forward glide overlooking the tranquil pool water. ${STYLE_PREAMBLE} Smooth, graceful, slow motion, subtle parallax. No text, no captions.`
  }
];

async function main() {
  console.log('=== STARTING ASSET GENERATION FOR MINO HOUSE (GROUND LEVEL) ===');
  await fs.mkdir(VID_DIR, { recursive: true });

  console.log('Initializing browser services...');
  bootstrapBrowserServices();

  const flowGen = createFlowVideoGen();

  // 1. Generate Scene 1 Still
  const scene1Still = path.join(ASSETS_DIR, 'scene-1.png');
  console.log(`Generating Still 1: ${scene1Still}`);
  await getPilot().generateImage({
    provider: 'chatgpt',
    prompt: STAGE_CONFIGS[0].stillPrompt!,
    referenceImagePaths: [],
    outFile: scene1Still
  });
  console.log('✓ Still 1 generated successfully.');

  let currentStill = scene1Still;

  for (let i = 0; i < STAGE_CONFIGS.length; i++) {
    const config = STAGE_CONFIGS[i];
    const rawVideo = path.join(VID_DIR, `raw-${config.id}.mp4`);
    const optimizedVideo = path.join(VID_DIR, `${config.id}.mp4`);

    console.log(`\n--- Generating Leg ${i + 1} (${config.id}) ---`);
    console.log(`Prompt: ${config.legPrompt}`);
    console.log(`Start Image: ${currentStill}`);
    console.log(`Output: ${rawVideo}`);

    await flowGen.generateVideo({
      prompt: config.legPrompt,
      imagePath: currentStill,
      model: 'veo-3.1-fast',
      durationSeconds: 8,
      aspectRatio: '16:9',
      outFile: rawVideo
    });

    console.log(`✓ Video generated. Optimizing to ${optimizedVideo}...`);
    // Optimize for smooth scrubbing
    await execFileAsync(ffmpegPath!, [
      '-i', rawVideo,
      '-an',
      '-vf', 'unsharp=5:5:0.8:5:5:0.0',
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '20',
      '-pix_fmt', 'yuv420p',
      '-g', '8',
      '-keyint_min', '8',
      '-sc_threshold', '0',
      '-movflags', '+faststart',
      '-y', optimizedVideo
    ]);
    console.log(`✓ Optimized.`);

    // If there is a next leg, extract the last frame of this leg to be the start image of the next leg
    if (i < STAGE_CONFIGS.length - 1) {
      const nextConfig = STAGE_CONFIGS[i + 1];
      const nextStill = path.join(ASSETS_DIR, `scene-${i + 2}.png`);
      console.log(`Extracting last frame of Leg ${i + 1} to act as Still ${i + 2}: ${nextStill}`);
      
      await execFileAsync(ffmpegPath!, [
        '-sseof', '-0.15',
        '-i', optimizedVideo,
        '-frames:v', '1',
        '-q:v', '2',
        '-y', nextStill
      ]);
      console.log(`✓ Frame extracted.`);
      currentStill = nextStill;
    }
  }

  console.log('\n=== ALL ASSETS GENERATED SUCCESSFULY ===');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal Error during generation:', err);
  process.exit(1);
});
