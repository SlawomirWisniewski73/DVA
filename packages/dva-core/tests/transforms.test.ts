import { describe, it, expect } from 'vitest';
import { parseTransformString, computeActiveTransforms } from '../src/transforms';

describe('transforms', () => {
  it('parse translate(10*t,0) @t=2', () => {
    const p: any = parseTransformString('translate(10*t,0)');
    expect(p.kind).toBe('translate');
    expect(p.args[0](2)).toBe(20);
    expect(p.args[1](2)).toBe(0);
  });
  it('parse scale with clamp/easeInOutQuad', () => {
    const p: any = parseTransformString('scale(clamp(easeInOutQuad(t),0.5,1.5))');
    const v = p.args[0](0.5); // within [0.5,1.5]
    expect(v).toBeGreaterThanOrEqual(0.5);
    expect(v).toBeLessThanOrEqual(1.5);
  });
  it('computeActiveTransforms filters by time', () => {
    const tl = [
      { object: 'a', time_start: 0, time_end: 1, transform: 'translate(1,0)' },
      { object: 'a', time_start: 1, time_end: 2, transform: 'translate(2,0)' },
      { object: 'b', time_start: 0, time_end: 2, transform: 'scale(2)' }
    ];
    const act = computeActiveTransforms(tl as any, 'a', 0.5);
    expect(act.length).toBe(1);
  });
});
