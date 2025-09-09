import { describe, it, expect } from 'vitest';
import { compileExpr } from '../src/expr';

describe('compileExpr (safe AST)', () => {
  it('sin(pi/2) ≈ 1', () => { const f = compileExpr('sin(t)'); expect(f(Math.PI/2)).toBeCloseTo(1, 3); });
  it('constants PI and E', () => { const f = compileExpr('PI + E'); expect(f(0)).toBeCloseTo(Math.PI + Math.E, 9); });
  it('power operator ^', () => { const f = compileExpr('2^3'); expect(f(0)).toBe(8); });
  it('min/max variadic', () => { const f = compileExpr('max(1,2,3)-min(1,2,3)'); expect(f(0)).toBe(2); });
  it('mix(a,b,t)', () => { const f = compileExpr('mix(0,10,0.25)'); expect(f(0)).toBeCloseTo(2.5, 6); });
  it('clamp(x,lo,hi)', () => { const f = compileExpr('clamp(-1,0,1) + clamp(2,0,1)'); expect(f(0)).toBe(0 + 1); });
  it('easeInOutQuad(x)', () => { const f = compileExpr('easeInOutQuad(0.5)'); expect(f(0)).toBeCloseTo(0.5, 6); });

  // security: unknown identifiers/functions → 0 (no throw)
  it('unknown ident → 0', () => { const f = compileExpr('window'); expect(f(0)).toBe(0); });
  it('unknown function → 0', () => { const f = compileExpr('evil(1)'); expect(f(0)).toBe(0); });
  it('division by zero → 0', () => { const f = compileExpr('1/(t-t)'); expect(f(1)).toBe(0); });
});
