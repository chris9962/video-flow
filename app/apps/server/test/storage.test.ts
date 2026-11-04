import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Workflow } from '@videoflow/shared';
import { WorkflowStore } from '../src/storage';

const wf = (id: string): Workflow => ({ id, name: `wf ${id}`, nodes: [], edges: [] });

describe('WorkflowStore', () => {
  let store: WorkflowStore;

  beforeEach(async () => {
    store = new WorkflowStore(await mkdtemp(path.join(tmpdir(), 'vf-')));
  });

  it('list returns empty initially', async () => {
    expect(await store.list()).toEqual([]);
  });

  it('saves and gets a workflow', async () => {
    await store.save(wf('a'));
    expect(await store.get('a')).toEqual(wf('a'));
  });

  it('get returns null when missing', async () => {
    expect(await store.get('nope')).toBeNull();
  });

  it('save overwrites and list returns all', async () => {
    await store.save(wf('a'));
    await store.save({ ...wf('a'), name: 'renamed' });
    await store.save(wf('b'));
    const all = await store.list();
    expect(all).toHaveLength(2);
    expect(all.find((w) => w.id === 'a')?.name).toBe('renamed');
  });

  it('deletes a workflow', async () => {
    await store.save(wf('a'));
    await store.delete('a');
    expect(await store.get('a')).toBeNull();
  });
});
