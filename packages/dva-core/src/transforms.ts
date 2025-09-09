// SPDX-License-Identifier: AGPL-3.0-or-later
import { lerpColor } from './color';
import { compileExpr } from './expr';
import type { DVATransformRange } from './types';

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function parseTransformString(s: string) {
  const m = s.trim().match(/^(\w+)\s*\((.*)\)$/);
  if (!m) return null as any;
  const name = m[1];
  const argsRaw = m[2];

  if (name === 'color') {
    const parts = argsRaw.split(',');
    if (parts.length >= 2) { const from = parts[0].trim(); const to = parts[1].trim(); return { kind: 'color', from, to } as const; }
    return null as any;
  }
  if (name === 'fade') {
    const alphaExpr = argsRaw.trim();
    return { kind: 'fade', alpha: compileExpr(alphaExpr) } as const;
  }
  const parts = argsRaw.split(',').map(p => p.trim()).filter(Boolean);
  const compiled = parts.map(compileExpr);
  return { kind: name, args: compiled } as const;
}

export function computeActiveTransforms(timeline: DVATransformRange[], objectId: string, t: number) {
  const active = timeline.filter(tr => tr.object === objectId && t >= tr.time_start && t <= tr.time_end);
  return active.map(tr => {
    const span = Math.max(1e-6, tr.time_end - tr.time_start);
    const tau = clamp01((t - tr.time_start) / span);
    return { ...tr, tau, parsed: (parseTransformString(tr.transform) as any) };
  }).filter(x => x.parsed);
}

export function applyTransforms(base: any, transforms: any[], t: number) {
  let tx = 0, ty = 0, sx = 1, sy = 1, angle = 0;
  let fill = base.fill ?? base.color ?? undefined;
  let opacity = base.opacity ?? 1;

  for (const tr of transforms) {
    const p = tr.parsed; const localT = tr.tau; if (!p) continue;
    switch (p.kind) {
      case 'translate': { const x = p.args[0]?.(t) ?? 0; const y = p.args[1]?.(t) ?? 0; tx += x; ty += y; break; }
      case 'scale': { const s1 = p.args[0]?.(t) ?? 1; const s2 = p.args[1]?.(t) ?? s1; sx *= s1; sy *= s2; break; }
      case 'rotate': { const a = p.args[0]?.(t) ?? 0; angle += a; break; }
      case 'fade': { const a = p.alpha?.(t) ?? 1; opacity = Math.max(0, Math.min(1, a)); break; }
      case 'color': { fill = lerpColor(p.from, p.to, localT); break; }
      default: break;
    }
  }
  const transform = `translate(${tx},${ty}) rotate(${angle}) scale(${sx},${sy})`;
  return { transform, fill, opacity };
}
