import { registerNode } from './registry';
import { textBlock } from './text';
import { imageBlock } from './image';
import { videoBlock } from './video';
import { klingBlock } from './kling';
import { klingEditBlock } from './kling-edit';
import { faceSwapBlock } from './faceswap';
import { motionBlock } from './motion';

export function registerBuiltinNodes(): void {
  registerNode(textBlock);
  registerNode(imageBlock);
  registerNode(videoBlock);
  registerNode(klingBlock);
  registerNode(klingEditBlock);
  registerNode(faceSwapBlock);
  registerNode(motionBlock);
}
