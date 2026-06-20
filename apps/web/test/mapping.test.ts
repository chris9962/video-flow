import { describe, it, expect } from 'vitest';
import type { Workflow } from '@videoflow/shared';
import { toFlow, fromFlow } from '../src/flow/mapping';

const wf: Workflow = {
  id: 'w1',
  name: 'demo',
  nodes: [
    { id: 't1', type: 'text', position: { x: 0, y: 0 }, config: { content: 'hi' } },
    { id: 'v1', type: 'video', position: { x: 200, y: 0 }, config: {} },
  ],
  edges: [{ id: 'e1', source: { nodeId: 't1', port: 'out' }, target: { nodeId: 'v1', port: 'in' } }],
};

describe('mapping', () => {
  it('round-trips workflow → flow → workflow', () => {
    const { nodes, edges } = toFlow(wf);
    expect(fromFlow('w1', 'demo', nodes, edges)).toEqual(wf);
  });

  it('toFlow maps ports to handles', () => {
    const { edges } = toFlow(wf);
    expect(edges[0]).toMatchObject({ source: 't1', sourceHandle: 'out', target: 'v1', targetHandle: 'in' });
  });

  it('fromFlow defaults missing handles to out/in', () => {
    const edge = { id: 'e2', source: 't1', target: 'v1' };
    const result = fromFlow('w1', 'demo', [], [edge]);
    expect(result.edges[0].source.port).toBe('out');
    expect(result.edges[0].target.port).toBe('in');
  });
});
