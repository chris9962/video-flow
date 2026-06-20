import { createFlowVideoGen } from '../src/services/flow-impl';

const gen = createFlowVideoGen();
const t0 = Date.now();
try {
  await gen.generateVideo({
    prompt: 'the model slowly turns 180 degrees from front to back, smooth cinematic motion',
    imagePath: '/tmp/frame-start.png',
    endImagePath: '/tmp/frame-end.png',
    model: 'omni-flash',
    durationSeconds: 4,
    aspectRatio: '9:16',
    outFile: '/tmp/flowgen-img2vid.mp4',
  });
  console.log('SUCCESS image→video (start+end) in', Math.round((Date.now() - t0) / 1000), 's');
} catch (e) {
  console.log('FAILED after', Math.round((Date.now() - t0) / 1000), 's');
  console.log('ERROR:', (e as Error).message);
}
process.exit(0);
