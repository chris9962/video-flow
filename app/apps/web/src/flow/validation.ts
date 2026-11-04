import { BLOCK_DEFINITIONS, type DataType } from '@videoflow/shared';

export function canConnect(
  sourceBlockType: string,
  targetBlockType: string,
  targetPort?: string | null,
): boolean {
  const def = BLOCK_DEFINITIONS[targetBlockType];
  if (!def) return false;
  // Loại data nguồn = emits của block nguồn (vd kling emits 'video'), không phải tên block
  const srcType = (BLOCK_DEFINITIONS[sourceBlockType]?.emits ?? sourceBlockType) as DataType;
  // Block nhiều cổng: kiểm theo accepts của đúng cổng đích; block 1 cổng: dùng accepts chung
  if (def.inputs) {
    const port = def.inputs.find((p) => p.id === targetPort) ?? def.inputs[0];
    return port.accepts.includes(srcType);
  }
  return def.accepts.includes(srcType);
}
