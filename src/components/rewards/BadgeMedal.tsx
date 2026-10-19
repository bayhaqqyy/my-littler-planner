import { Text, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { useReduceMotion } from '@/store/hooks';
import { css } from '@/components/ui/primitives';

export const RANK_LABEL = ['Perunggu', 'Perak', 'Emas', 'Mawar', 'Kristal', 'Pelangi', 'Legenda'];

/** Fill/rim colors per rank (0..6). Ranks 5–6 use the rainbow gradient for the rim. */
const STYLE = [
  { rim: '#D9A27A', rim2: '#F3C9A6', face: '#FDEBDD' },   // perunggu
  { rim: '#AEB6C4', rim2: '#E4E8EF', face: '#F6F8FB' },   // perak
  { rim: '#E9AE22', rim2: '#FFE08A', face: '#FFF6D6' },   // emas
  { rim: '#E8879F', rim2: '#FFC1D6', face: '#FFF0F5' },   // mawar
  { rim: '#8F9CF0', rim2: '#C5E6FA', face: '#F4F6FF' },   // kristal
  { rim: 'url(#mlpRainbow)', rim2: '#FFFFFF', face: '#FFFDF6' }, // pelangi
  { rim: 'url(#mlpRainbow)', rim2: '#FFE08A', face: '#FFF8E1' }, // legenda
];

/** Points of a regular star / sunburst polygon around (cx, cy). */
function starPath(cx: number, cy: number, points: number, outer: number, inner: number) {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  }
  return d + 'Z';
}

/** Scalloped rosette edge. */
function scallopPath(cx: number, cy: number, bumps: number, r: number, depth: number) {
  let d = '';
  const steps = bumps * 8;
  for (let i = 0; i <= steps; i++) {
    const a = (2 * Math.PI * i) / steps;
    const rr = r + depth * Math.cos(a * bumps);
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`;
  }
  return d + 'Z';
}

const Sparkle = ({ x, y, s, c = '#FFFFFF' }: { x: number; y: number; s: number; c?: string }) => (
  <Path d={`M${x} ${y - s} C${x + s * 0.15} ${y - s * 0.15} ${x + s * 0.15} ${y - s * 0.15} ${x + s} ${y} C${x + s * 0.15} ${y + s * 0.15} ${x + s * 0.15} ${y + s * 0.15} ${x} ${y + s} C${x - s * 0.15} ${y + s * 0.15} ${x - s * 0.15} ${y + s * 0.15} ${x - s} ${y} C${x - s * 0.15} ${y - s * 0.15} ${x - s * 0.15} ${y - s * 0.15} ${x} ${y - s}Z`} fill={c} />
);

/**
 * Medal for a badge. Higher ranks get fancier shapes and decorations, so the art itself
 * shows how hard a badge was — not only its name.
 */
export function BadgeMedal({ rank, emoji, earned, size = 64 }: { rank: number; emoji: string; earned: boolean; size?: number }) {
  const reduce = useReduceMotion();
  const r = Math.max(0, Math.min(6, rank));
  const st = STYLE[r];
  const cx = 50, cy = 50;
  const shimmer = earned && r >= 5 && !reduce
    ? css({ animationKeyframes: [{ '0%': { filter: 'drop-shadow(0 0 2px rgba(255,214,120,.5))' }, '50%': { filter: 'drop-shadow(0 0 7px rgba(255,170,210,.9))' }, '100%': { filter: 'drop-shadow(0 0 2px rgba(255,214,120,.5))' } }], animationDuration: '2.4s', animationIterationCount: 'infinite' })
    : null;
  return (
    <View style={[{ width: size, height: size }, earned ? null : css({ filter: 'grayscale(1)', opacity: 0.45 }), shimmer]} aria-hidden>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="mlpRainbow" x1="0" y1="0" x2="1" y2="1">
            {['#FF9EC2', '#FFC48F', '#FFE27A', '#9EE0B5', '#9CD3F5', '#C3B0EE'].map((c, i) => <Stop key={c} offset={i / 5} stopColor={c} />)}
          </LinearGradient>
          <RadialGradient id={`mlpFace${r}`} cx="0.4" cy="0.35" r="0.75">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor={st.face} />
          </RadialGradient>
          <RadialGradient id="mlpGlow" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#FFE9A8" stopOpacity="0.9" />
            <Stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* glow behind legend */}
        {r >= 6 && <Circle cx={cx} cy={cy} r={50} fill="url(#mlpGlow)" />}

        {/* wings (pelangi, legenda) */}
        {r >= 5 && (
          <G opacity={0.95}>
            <Path d="M22 52 C6 44 2 30 8 22 C14 30 20 34 28 36 C16 38 12 46 22 52Z" fill="#E7DEFF" stroke="#C3B0EE" strokeWidth={1.2} />
            <Path d="M78 52 C94 44 98 30 92 22 C86 30 80 34 72 36 C84 38 88 46 78 52Z" fill="#E7DEFF" stroke="#C3B0EE" strokeWidth={1.2} />
          </G>
        )}

        {/* ribbons (emas and up) */}
        {r >= 2 && (
          <G>
            <Path d="M38 70 L30 96 L38 90 L44 98 L48 74Z" fill={r >= 5 ? '#C3B0EE' : '#F7A8C4'} />
            <Path d="M62 70 L70 96 L62 90 L56 98 L52 74Z" fill={r >= 5 ? '#9CD3F5' : '#C3B0EE'} />
          </G>
        )}

        {/* body shape by rank */}
        {r <= 2 && <Circle cx={cx} cy={cy} r={33} fill={st.rim} />}
        {r === 3 && <Path d={scallopPath(cx, cy, 12, 33, 3)} fill={st.rim} />}
        {r >= 4 && <Path d={starPath(cx, cy, r >= 5 ? 12 : 8, 38, 30)} fill={st.rim} />}
        <Circle cx={cx} cy={cy} r={r >= 4 ? 27 : 28} fill={st.rim2} />
        <Circle cx={cx} cy={cy} r={r >= 4 ? 24 : 25} fill={`url(#mlpFace${r})`} />
        {r === 1 && <Circle cx={cx} cy={cy} r={21.5} fill="none" stroke="#C9CED8" strokeWidth={1.4} strokeDasharray="1.5 3" />}
        {r >= 3 && <Circle cx={cx} cy={cy} r={21.5} fill="none" stroke={r >= 5 ? 'url(#mlpRainbow)' : st.rim} strokeWidth={1.2} opacity={0.7} />}

        {/* crown (legenda) */}
        {r >= 6 && (
          <G>
            <Path d="M36 22 L39 8 L45 16 L50 4 L55 16 L61 8 L64 22Z" fill="#FFD45E" stroke="#E9AE22" strokeWidth={1.2} strokeLinejoin="round" />
            <Circle cx={50} cy={4} r={2.2} fill="#FF9EC2" />
            <Circle cx={39} cy={8} r={1.6} fill="#9CD3F5" />
            <Circle cx={61} cy={8} r={1.6} fill="#C3B0EE" />
          </G>
        )}

        {/* sparkles (kristal and up) */}
        {r >= 4 && <Sparkle x={80} y={20} s={5} c="#FFFFFF" />}
        {r >= 4 && <Sparkle x={19} y={78} s={3.5} c="#FFFFFF" />}
        {r >= 5 && <Sparkle x={84} y={74} s={4} c="#FFE27A" />}
        {r >= 6 && <Sparkle x={14} y={30} s={4} c="#FFE27A" />}
        {/* highlight */}
        <Path d="M33 40 A20 20 0 0 1 48 28" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8} />
      </Svg>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: size * 0.3, lineHeight: size * 0.36 }}>{emoji}</Text>
      </View>
    </View>
  );
}
