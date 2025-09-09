import React, { useMemo, useRef, useEffect, useState } from 'react';
import { DVARenderer } from '@dva/react';
import type { DVAFile } from '@dva/core';

const defaultDVA: DVAFile = {
  format: 'DVA',
  version: '0.1',
  metadata: { title: 'Przykładowa animacja', author: 'Demo' },
  viewport: { width: 640, height: 360, background: '#0b1220' },
  scene: {
    objects: [
      { id: 'circle1', type: 'circle', cx: 80, cy: 180, r: 30, fill: '#ff4d4d' },
      { id: 'rect1', type: 'rect', x: 260, y: 140, width: 80, height: 80, rx: 12, fill: '#44ccff' },
      { id: 'text1', type: 'text', x: 40, y: 40, value: 'DVA demo', fill: '#e0e4ff', fontSize: 24 },
      { id: 'path1', type: 'path', d: 'M500,260 C520,240 560,240 580,260 S640,280 620,300', stroke: '#c2ff66', strokeWidth: 3, fill: 'none' }
    ]
  },
  timeline: [
    { object: 'circle1', time_start: 0, time_end: 6, transform: 'translate(40*t, 40*sin(t))' },
    { object: 'circle1', time_start: 2, time_end: 6, transform: 'scale(1+0.2*sin(2*t))' },
    { object: 'rect1', time_start: 0, time_end: 4, transform: 'rotate(45+10*sin(2*t))' },
    { object: 'rect1', time_start: 4, time_end: 8, transform: 'translate(120*(t-4), 0)' },
    { object: 'rect1', time_start: 4, time_end: 8, transform: 'color(#44ccff,#ffb347)' },
    { object: 'text1', time_start: 0, time_end: 8, transform: 'fade(0.6+0.4*sin(t*0.5))' },
    { object: 'path1', time_start: 0, time_end: 8, transform: 'translate(0, -40*sin(t*0.6))' }
  ]
};

export function App() {
  const [dva, setDva] = useState<DVAFile>(defaultDVA);
  const [jsonText, setJsonText] = useState(JSON.stringify(defaultDVA, null, 2));
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);

  const duration = useMemo(() => (dva.timeline || []).reduce((m, tr) => Math.max(m, tr.time_end || 0), 0), [dva]);
  const lastRef = useRef(performance.now());
  useEffect(() => {
    let raf = 0;
    function loop(ts: number) { const last = lastRef.current; const dt = Math.min(0.05, (ts - last) / 1000); lastRef.current = ts; if (playing) setTime(t => (t + dt) % Math.max(0.0001, duration || 8)); raf = requestAnimationFrame(loop); }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration]);

  function handleApply() { try { setDva(JSON.parse(jsonText)); setTime(0); } catch (e) { alert('Błąd JSON: ' + e); } }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 24 }}>
      <div>
        <h2>DVA Player</h2>
        <DVARenderer dva={dva} t={time} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <button onClick={() => setPlaying(p => !p)}>{playing ? 'Pauza' : 'Odtwarzaj'}</button>
          <input type="range" min={0} max={duration || 8} step={0.01} value={time}
                 onChange={e => setTime(parseFloat(e.target.value))} style={{ flex: 1 }} />
          <div style={{ width: 120, textAlign: 'right' }}>{time.toFixed(2)}s / {(duration || 8).toFixed(2)}s</div>
        </div>
      </div>
      <div>
        <h2>Scenariusz DVA (JSON)</h2>
        <textarea value={jsonText} onChange={e => setJsonText(e.target.value)}
                  style={{ width: '100%', height: 420, fontFamily: 'monospace' }} />
        <div style={{ marginTop: 8 }}>
          <button onClick={handleApply}>Zastosuj</button>
        </div>
        <p style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
          Dozwolone funkcje: sin, cos, tan, asin, acos, atan, atan2, sqrt, abs, floor, ceil, round, min, max, pow, exp,
          log, log10, log2, sinh, cosh, tanh, trunc, hypot, <strong>clamp</strong>, <strong>mix</strong>, <strong>easeInOutQuad</strong>. Stałe: PI, E.
        </p>
      </div>
    </div>
  );
}
