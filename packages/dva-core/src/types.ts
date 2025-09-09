// SPDX-License-Identifier: AGPL-3.0-or-later
export type DVAObject =
  | { id: string; type: 'circle'; cx: number; cy: number; r: number; fill?: string; opacity?: number }
  | { id: string; type: 'rect'; x: number; y: number; width: number; height: number; rx?: number; fill?: string; opacity?: number }
  | { id: string; type: 'path'; d: string; stroke?: string; strokeWidth?: number; fill?: string; opacity?: number }
  | { id: string; type: 'text'; x: number; y: number; value: string; fill?: string; fontSize?: number; opacity?: number };

export interface DVAScene { objects: DVAObject[] }
export interface DVAViewport { width: number; height: number; background?: string }
export interface DVATransformRange {
  object: string;
  time_start: number;
  time_end: number;
  transform: string; // e.g. translate(10*t,0)
}
export interface DVAFile {
  format: 'DVA';
  version: string;
  metadata?: Record<string, unknown>;
  viewport?: DVAViewport;
  scene: DVAScene;
  timeline: DVATransformRange[];
}
