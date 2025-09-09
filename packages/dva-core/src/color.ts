// SPDX-License-Identifier: AGPL-3.0-or-later
export function parseColor(input?: string) {
  if (!input) return { r: 255, g: 255, b: 255 };
  const s = String(input).trim();
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
  }
  const m = s.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  return { r: 255, g: 255, b: 255 };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// FIX shadowing: parameter renamed to colorB
export function lerpColor(a: string, colorB: string, t: number) {
  const ca = parseColor(a), cb = parseColor(colorB);
  const r = Math.round(lerp(ca.r, cb.r, t));
  const g = Math.round(lerp(ca.g, cb.g, t));
  const b = Math.round(lerp(ca.b, cb.b, t));
  return `rgb(${r},${g},${b})`;
}
