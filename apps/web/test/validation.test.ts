import { describe, it, expect } from 'vitest';
import { canConnect } from '../src/flow/validation';

describe('canConnect', () => {
  it('text nhận mọi loại input', () => {
    expect(canConnect('text', 'text')).toBe(true);
    expect(canConnect('image', 'text')).toBe(true);
    expect(canConnect('video', 'text')).toBe(true);
  });

  it('image nhận text/ảnh nhưng không nhận video', () => {
    expect(canConnect('text', 'image')).toBe(true);
    expect(canConnect('image', 'image')).toBe(true);
    expect(canConnect('video', 'image')).toBe(false);
  });

  it('video nhận mọi loại input', () => {
    expect(canConnect('text', 'video')).toBe(true);
    expect(canConnect('image', 'video')).toBe(true);
    expect(canConnect('video', 'video')).toBe(true);
  });

  it('rejects unknown block types', () => {
    expect(canConnect('nope', 'text')).toBe(false);
    expect(canConnect('text', 'nope')).toBe(false);
  });
});
