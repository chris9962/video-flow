/**
 * Fashion Try-On Video Workflow
 * Usage: npx tsx run-fashion.ts <person_image> <clothing_image> [outDir]
 *
 * Chrome phải đang chạy: npm run chrome (trong ~/hermes_workspace/browser-pilot)
 */

import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { geminiGenerateImage, flowGenerateVideo } from '../../pilot.js';

// ─── PROMPTS CỐ ĐỊNH ────────────────────────────────────────────────────────

const PROMPT_EXTRACT = `Analyze the attached image in extreme detail and extract ALL visible clothing items and accessories worn or present in the image.

For each detected item:
- Isolate it completely from the original subject and background.
- Recreate it as a standalone product image.
- Preserve exact color, fabric texture, stitching, seams, folds, logos (if any), material thickness, proportions, and structural details.
- Maintain accurate scale and garment construction.
- Do not redesign or reinterpret the item.

Each clothing item and accessory must be:
- Fully visible
- Properly shaped as it would appear naturally laid flat or positioned cleanly
- Free of distortion
- Photorealistic
- High resolution
- Studio-quality product photography

BACKGROUND:
Pure solid white background (#FFFFFF).
No shadows unless soft natural grounding shadow directly beneath the item.
No reflections. No gradients. No environmental elements.

LIGHTING:
Soft studio lighting. Even exposure. No dramatic shadows.
Accurate color reproduction. True-to-life material rendering.

STRICT RULES:
- Do NOT include the model or body parts.
- Do NOT merge multiple items into one object.
- Separate each item individually.
- Maintain 99% visual accuracy compared to the original image.
- Do NOT stylize. No CGI look. No artistic reinterpretation. No texture smoothing.

NEGATIVE PROMPT:
blurry, distorted shape, warped fabric, incorrect color, missing details, artificial shine, over-smoothing, CGI, illustration, cartoon, rendering artifacts, merged objects, incomplete garment, cut-off edges.`;

const PROMPT_TRYON = `Image 1 is a person. Image 2 is a clothing item.
Dress the person in Image 1 with the exact garment from Image 2.
Preserve the garment's pattern, color, texture and shape faithfully.
Keep the person's face, hair, body, pose, lighting and background unchanged.
Photorealistic, natural fabric folds, correct proportions.`;

const PROMPT_SPIN = `Static locked-off camera, framing unchanged. The woman performs a graceful, slow full 360-degree spin in place — rotating smoothly to reveal the outfit from every angle: front, left side, back, right side, then returning to face the camera. One complete rotation, fluid and elegant, no stepping forward or backward.`;

const PROMPT_BREATHE = `Static locked-off camera, framing unchanged. The woman stands poised and confident, her outfit fully visible. She takes a slow, natural breath — the fabric of her clothing shifts and drapes elegantly with the movement. She gently smooths the outfit with one hand in a calm, graceful gesture, then lowers her arm back to her side. The clothing's texture, cut, and silhouette are showcased clearly throughout. Soft even studio lighting, neutral background.`;

const PROMPT_WALK = `Static locked-off camera, framing unchanged. The woman walks purposefully toward the camera at a brisk but still graceful pace — starting from a full-body wide shot, she strides forward with confidence and comes very close to the camera, ending in a tight mid-body close-up where her torso and outfit fill the frame. She stops right in front of the camera without stepping back. The movement is fluid and direct, the outfit clearly visible and flowing with every step.`;

const PROMPT_SELFIE = `Static locked-off camera, framing unchanged; she keeps the phone up covering her face the whole time. From the exact pose in the photo, her free hand sweeps up to push her long hair back behind her shoulder, then gives a small relaxed wave near the phone with a light bounce to a slow rhythm, and finally lowers the hand back down to return to the original neutral pose by the end. Hair resettles; the dress and sheer shirt shimmer with the small movements. Keep the outfit, gray wall, white sneakers and soft lighting identical. Photorealistic, smooth, 8 seconds, ends exactly at the starting pose.`;

const PROMPT_SELFIE2 = `A fictional young woman, holding a phone up near her face with her right hand as if filming a mirror selfie. She keeps the phone in the same right hand the entire time and never switches hands; the phone stays steadily near her face throughout. She shifts her weight from one leg to the other, slowly turning her hips side to side to show her outfit. With her free left hand she lightly touches her waist, then rests it on her hip. She lifts her free left hand toward her shoulder, tilts her head slightly, and turns her body gently from side to side. She lowers her left hand and returns to standing upright. Slow, graceful, natural movements. Soft even indoor lighting, vertical portrait framing, static camera, cinematic and realistic.`;

// ─── MAIN ───────────────────────────────────────────────────────────────────

const [personImage, clothingImage, outDirArg] = process.argv.slice(2);

if (!personImage || !clothingImage) {
  console.error('Usage: npx tsx run-fashion.ts <person_image> <clothing_image> [outDir]');
  process.exit(1);
}

const sessionId = process.env.HERMES_SESSION_ID ?? new Date().toISOString().slice(0, 10);
const outDir = outDirArg ?? path.join(os.homedir(), 'hermes_workspace', 'videos', sessionId, `fashion-${Date.now()}`);

console.log(`
🎬 Fashion Try-On Workflow
  Person : ${personImage}
  Outfit : ${clothingImage}
  Output : ${outDir}
`);

await fs.mkdir(outDir, { recursive: true });

// Bước 1: Tách đồ ra nền trắng
const extractedPath = path.join(outDir, 'step1_extracted_clothing.png');
console.log('⏳ Bước 1/3 — Tách đồ ra nền trắng (Gemini)...');
await geminiGenerateImage(PROMPT_EXTRACT, [personImage], extractedPath);
console.log('✅ Bước 1 xong:', extractedPath);

// Bước 2: Ghép đồ vào người
const tryonPath = path.join(outDir, 'step2_person_with_outfit.png');
console.log('⏳ Bước 2/3 — Ghép đồ vào người (Gemini)...');
await geminiGenerateImage(PROMPT_TRYON, [extractedPath, clothingImage], tryonPath);
console.log('✅ Bước 2 xong:', tryonPath);

// Bước 3: Tạo 5 video song song
console.log('⏳ Bước 3/3 — Tạo 5 video song song (Google Flow omni-flash)...');
const videos = [
  { name: 'video_spin',    prompt: PROMPT_SPIN },
  { name: 'video_breathe', prompt: PROMPT_BREATHE },
  { name: 'video_walk',    prompt: PROMPT_WALK },
  { name: 'video_selfie',  prompt: PROMPT_SELFIE },
  { name: 'video_selfie2', prompt: PROMPT_SELFIE2 },
];

const results = await Promise.allSettled(
  videos.map(v =>
    flowGenerateVideo({
      prompt: v.prompt,
      imagePath: tryonPath,
      model: 'omni-flash',
      durationSeconds: 4,
      aspectRatio: '9:16',
      outFile: path.join(outDir, `step3_${v.name}.mp4`),
    }).then(() => console.log(`  ✅ ${v.name} xong`))
      .catch(e => { throw new Error(`${v.name}: ${e.message}`); })
  )
);

console.log('\n📦 KẾT QUẢ:');
results.forEach((r, i) => {
  if (r.status === 'fulfilled') console.log(`  ✅ ${videos[i].name}`);
  else console.log(`  ❌ ${videos[i].name} — ${r.reason.message}`);
});
console.log(`\n📁 Output folder: ${outDir}`);

process.exit(0);
