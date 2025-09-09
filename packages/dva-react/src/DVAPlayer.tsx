// SPDX-License-Identifier: AGPL-3.0-or-later
import React from 'react';
import { computeActiveTransforms, applyTransforms } from '@dva/core';
import type { DVAFile } from '@dva/core';

export function DVARenderer({ dva, t }: { dva: DVAFile; t: number }) {
  const { viewport = {} as any, scene = { objects: [] }, timeline = [] } = (dva || {}) as any;
  const width = viewport.width || 640;
  const height = viewport.height || 360;
  const bg = viewport.background || '#111';

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ background: bg }}>
        {scene.objects?.map((obj: any) => {
          const active = computeActiveTransforms(timeline as any, obj.id, t);
          const { transform, fill, opacity } = applyTransforms(obj, active as any, t);
          const common: any = { transform, opacity };
          switch (obj.type) {
            case 'circle':
              return <circle key={obj.id} cx={obj.cx} cy={obj.cy} r={obj.r} fill={fill || obj.fill || '#fff'} {...common} />;
            case 'rect':
              return <rect key={obj.id} x={obj.x} y={obj.y} width={obj.width} height={obj.height} rx={obj.rx||0} fill={fill || obj.fill || '#fff'} {...common} />;
            case 'path':
              return <path key={obj.id} d={obj.d} fill={obj.fill||'none'} stroke={obj.stroke||fill||'#fff'} strokeWidth={obj.strokeWidth||2} {...common} />;
            case 'text':
              return <text key={obj.id} x={obj.x} y={obj.y} fill={fill || obj.fill || '#fff'} fontSize={obj.fontSize||16} {...common}>{obj.value}</text>;
            default:
              return null;
          }
        })}
      </svg>
    </div>
  );
}
