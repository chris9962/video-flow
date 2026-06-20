import type { BlockTypeDefinition, FileRef } from '@videoflow/shared';

/** Input gom theo loại (texts/images/videos) cho 1 lần thực thi */
export interface PortInputs {
  texts: string[];
  images: FileRef[];
  videos: FileRef[];
}

/** Input gom theo loại block nguồn; `byPort` gom thêm theo cổng đích (start/prompt/end…) */
export interface BlockInputs extends PortInputs {
  byPort: Record<string, PortInputs>;
}

export interface ExecuteContext {
  config: Record<string, unknown>;
  inputs: BlockInputs;
  /** Thư mục output của block trong run hiện tại (data/runs/<runId>/<nodeId>), đã tồn tại */
  dir: string;
  /** Chỉ số phần tử khi block chạy trong fan-out — dùng đặt tên file không đụng nhau */
  itemIndex?: number;
}

export interface BlockResult {
  /** Giá trị phát ra output (text | FileRef | mảng khi text block trả JSON array) */
  out: unknown;
  /** Giá trị đè vào content của block trên canvas; mặc định dùng out */
  content?: unknown;
}

export interface ExecutableBlock {
  definition: BlockTypeDefinition;
  execute(ctx: ExecuteContext): Promise<BlockResult>;
}

const registry = new Map<string, ExecutableBlock>();

export function registerNode(block: ExecutableBlock): void {
  registry.set(block.definition.type, block);
}

export function getExecutable(type: string): ExecutableBlock {
  const block = registry.get(type);
  if (!block) throw new Error(`Unknown block type: ${type}`);
  return block;
}

export function hasInputs(inputs: BlockInputs): boolean {
  return inputs.texts.length > 0 || inputs.images.length > 0 || inputs.videos.length > 0;
}
