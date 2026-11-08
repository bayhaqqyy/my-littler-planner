import { Circle, Ellipse, G, Path } from 'react-native-svg';

/** Shared outline color for the chibi style. */
export const LN = '#7A5848';

/** Darken (amt < 0) or lighten (amt > 0) a #rrggbb color. */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1, 7), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function starPath(cx: number, cy: number, r: number, points = 5, inner = 0.45) {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const rad = ((i * Math.PI) / points) - Math.PI / 2;
    const rr = i % 2 ? r * inner : r;
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(rad)).toFixed(2)} ${(cy + rr * Math.sin(rad)).toFixed(2)} `;
  }
  return `${d}Z`;
}

/** Heart centered on (cx, cy), width ≈ 2s. */
export function heartPath(cx: number, cy: number, s: number) {
  const k = s / 10;
  const p = (x: number, y: number) => `${(cx + (x - 12) * k).toFixed(2)} ${(cy + (y - 12) * k).toFixed(2)}`;
  return `M${p(12, 21)} C${p(12, 21)} ${p(2, 15)} ${p(2, 8.5)} C${p(2, 5.5)} ${p(4.5, 3)} ${p(7.5, 3)} C${p(9.5, 3)} ${p(11, 4)} ${p(12, 5.5)} C${p(13, 4)} ${p(14.5, 3)} ${p(16.5, 3)} C${p(19.5, 3)} ${p(22, 5.5)} ${p(22, 8.5)} C${p(22, 15)} ${p(12, 21)} ${p(12, 21)}Z`;
}

export function Star({ cx, cy, r, color = '#FFD45E', stroke = true, inner }: { cx: number; cy: number; r: number; color?: string; stroke?: boolean; inner?: number }) {
  return <Path d={starPath(cx, cy, r, 5, inner)} fill={color} stroke={stroke ? shade(color, -0.3) : 'none'} strokeWidth={r > 4 ? 1 : 0.6} strokeLinejoin="round" />;
}

export function Heart({ cx, cy, s, color = '#FF7FAF', stroke = true }: { cx: number; cy: number; s: number; color?: string; stroke?: boolean }) {
  return <Path d={heartPath(cx, cy, s)} fill={color} stroke={stroke ? shade(color, -0.3) : 'none'} strokeWidth={s > 4 ? 1 : 0.6} />;
}

/** Five-petal flower. */
export function Bloom({ cx, cy, r, color = '#FF9EC2', center = '#FFD45E', outline = true }: { cx: number; cy: number; r: number; color?: string; center?: string; outline?: boolean }) {
  const st = outline ? { stroke: shade(color, -0.3), strokeWidth: Math.max(0.5, r * 0.12) } : {};
  return (
    <G>
      {[0, 72, 144, 216, 288].map((deg) => {
        const a = ((deg - 90) * Math.PI) / 180;
        return <Circle key={deg} cx={cx + r * 0.62 * Math.cos(a)} cy={cy + r * 0.62 * Math.sin(a)} r={r * 0.48} fill={color} {...st} />;
      })}
      <Circle cx={cx} cy={cy} r={r * 0.4} fill={center} />
    </G>
  );
}

export function Strawberry({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return (
    <G>
      <Path d={`M${cx - s} ${cy - s * 0.4} Q${cx} ${cy - s * 1.1} ${cx + s} ${cy - s * 0.4} Q${cx + s * 0.8} ${cy + s * 0.8} ${cx} ${cy + s * 1.2} Q${cx - s * 0.8} ${cy + s * 0.8} ${cx - s} ${cy - s * 0.4}Z`} fill="#FF6B7A" stroke="#D9485A" strokeWidth={0.6} />
      <Path d={`M${cx - s * 0.7} ${cy - s * 0.6} L${cx - s * 0.2} ${cy - s * 0.3} L${cx} ${cy - s * 0.8} L${cx + s * 0.2} ${cy - s * 0.3} L${cx + s * 0.7} ${cy - s * 0.6}`} fill="#6FC46A" stroke="#4E9E4A" strokeWidth={0.5} />
      {[[-0.4, 0], [0.35, 0.05], [0, 0.45], [-0.2, 0.75], [0.3, 0.6]].map(([dx, dy], i) => <Ellipse key={i} cx={cx + dx * s} cy={cy + dy * s} rx={s * 0.08} ry={s * 0.12} fill="#FFE27A" />)}
    </G>
  );
}

export function Butterfly({ cx, cy, s, a = '#FFB3D0', b = '#C9B5FF' }: { cx: number; cy: number; s: number; a?: string; b?: string }) {
  return (
    <G>
      <Ellipse cx={cx - s * 0.55} cy={cy - s * 0.3} rx={s * 0.55} ry={s * 0.6} fill={a} stroke={shade(a, -0.3)} strokeWidth={0.7} />
      <Ellipse cx={cx + s * 0.55} cy={cy - s * 0.3} rx={s * 0.55} ry={s * 0.6} fill={a} stroke={shade(a, -0.3)} strokeWidth={0.7} />
      <Ellipse cx={cx - s * 0.45} cy={cy + s * 0.45} rx={s * 0.4} ry={s * 0.4} fill={b} stroke={shade(b, -0.3)} strokeWidth={0.7} />
      <Ellipse cx={cx + s * 0.45} cy={cy + s * 0.45} rx={s * 0.4} ry={s * 0.4} fill={b} stroke={shade(b, -0.3)} strokeWidth={0.7} />
      <Ellipse cx={cx} cy={cy} rx={s * 0.14} ry={s * 0.75} fill={LN} />
    </G>
  );
}

export function Cloud({ cx, cy, s, color = '#FFFFFF' }: { cx: number; cy: number; s: number; color?: string }) {
  const st = { stroke: '#D6E6F2', strokeWidth: 0.8 };
  return (
    <G>
      <Ellipse cx={cx - s * 0.5} cy={cy + s * 0.12} rx={s * 0.5} ry={s * 0.32} fill={color} {...st} />
      <Ellipse cx={cx + s * 0.5} cy={cy + s * 0.12} rx={s * 0.48} ry={s * 0.34} fill={color} {...st} />
      <Ellipse cx={cx} cy={cy - s * 0.1} rx={s * 0.5} ry={s * 0.48} fill={color} {...st} />
      <Ellipse cx={cx} cy={cy + s * 0.22} rx={s * 0.8} ry={s * 0.22} fill={color} />
    </G>
  );
}

export const RAINBOW = ['#FF8A8A', '#FFC48F', '#FFE27A', '#9EE0B5', '#9CD3F5', '#C3B0EE'];
