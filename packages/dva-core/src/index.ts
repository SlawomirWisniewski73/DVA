// SPDX-License-Identifier: AGPL-3.0-or-later
export * from './types';
export * from './color';
export * from './expr';
export * from './transforms';
packages/dva-core/tests/color.test.ts
import { describe, it, expect } from 'vitest';
import { parseColor, lerp, lerpColor } from '../src/color';

describe('color utils', () => {
  it('parseColor #abc', () => { expect(parseColor('#abc')).toEqual({ r: 170, g: 187, b: 204 }); });
  it('parseColor #aabbcc', () => { expect(parseColor('#aabbcc')).toEqual({ r: 170, g: 187, b: 204 }); });
  it('parseColor rgb(10,20,30)', () => { expect(parseColor('rgb(10,20,30)')).toEqual({ r: 10, g: 20, b: 30 }); });
  it('lerp 0→10 @0.25', () => { expect(lerp(0, 10, 0.25)).toBeCloseTo(2.5); });
  it('lerpColor #000→#fff @0.5', () => { expect(lerpColor('#000000', '#ffffff', 0.5)).toBe('rgb(128,128,128)'); });
});
