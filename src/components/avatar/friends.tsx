import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { PetArt } from './pets';
import { Bloom } from './shapes';

/** The Kebun season's mascots (the previous season used a bunny, chick, kitty, bear and sheep). */
export type FriendKind = 'landak' | 'kodok' | 'lebah' | 'hamster' | 'tupai';
const LOOK: Record<FriendKind, { k: string; a: string }> = {
  landak: { k: 'landak', a: '#C9A07A' },
  kodok: { k: 'kodok', a: '#8EDB6A' },
  lebah: { k: 'lebah', a: '#FFD45E' },
  hamster: { k: 'hamster', a: '#F5B97E' },
  tupai: { k: 'tupai', a: '#D9935A' },
};

const LN = '#7A5848';

/** Mochi the hamster, the Kebun season's main mascot (60×60): round, chubby cheeks, holding a seed. */
export function HamsterArt({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  const fur = '#F7BE84', furDark = '#E39B5C', cream = '#FFF4E6';
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {/* ears */}
      <Ellipse cx={15} cy={14} rx={7} ry={6.5} fill={fur} stroke={LN} strokeWidth={1.3} />
      <Ellipse cx={45} cy={14} rx={7} ry={6.5} fill={fur} stroke={LN} strokeWidth={1.3} />
      <Ellipse cx={15} cy={14.5} rx={3.8} ry={3.4} fill="#FFB8C8" />
      <Ellipse cx={45} cy={14.5} rx={3.8} ry={3.4} fill="#FFB8C8" />
      {/* body: one soft round shape */}
      <Path d="M30 9 C47 9 56 21 56 35 C56 50 45 57 30 57 C15 57 4 50 4 35 C4 21 13 9 30 9 Z" fill={fur} stroke={LN} strokeWidth={1.4} />
      {/* forehead stripe and cream face/tummy */}
      <Path d="M26 11 Q30 9 34 11 L32 20 Q30 21 28 20 Z" fill={furDark} opacity={0.8} />
      <Path d="M30 22 C42 22 49 30 49 40 C49 50 41 55 30 55 C19 55 11 50 11 40 C11 30 18 22 30 22 Z" fill={cream} />
      {/* eyes */}
      <Ellipse cx={21} cy={31} rx={3} ry={3.6} fill="#3B2722" />
      <Ellipse cx={39} cy={31} rx={3} ry={3.6} fill="#3B2722" />
      <Circle cx={22} cy={29.8} r={1.2} fill="#fff" />
      <Circle cx={40} cy={29.8} r={1.2} fill="#fff" />
      {/* chubby cheeks */}
      <Ellipse cx={13.5} cy={38} rx={5.2} ry={3.6} fill="#FFA3BC" opacity={0.85} />
      <Ellipse cx={46.5} cy={38} rx={5.2} ry={3.6} fill="#FFA3BC" opacity={0.85} />
      {/* nose and mouth */}
      <Ellipse cx={30} cy={35.5} rx={1.8} ry={1.3} fill="#FF8FA8" />
      <Path d="M27 38 Q28.5 39.8 30 38 Q31.5 39.8 33 38" stroke={LN} strokeWidth={1.1} fill="none" strokeLinecap="round" />
      {/* paws holding a sunflower seed */}
      <Path d="M30 41 C33 42.5 33 49 30 51 C27 49 27 42.5 30 41 Z" fill="#6B5040" stroke={LN} strokeWidth={0.9} />
      <Path d="M30 43 V49" stroke="#F3E6D8" strokeWidth={1.1} strokeLinecap="round" />
      <Ellipse cx={25.5} cy={46} rx={3.6} ry={2.8} fill={fur} stroke={LN} strokeWidth={1} />
      <Ellipse cx={34.5} cy={46} rx={3.6} ry={2.8} fill={fur} stroke={LN} strokeWidth={1} />
      {/* feet */}
      <Ellipse cx={20} cy={56} rx={5} ry={2.4} fill="#FFC9A8" stroke={LN} strokeWidth={1} />
      <Ellipse cx={40} cy={56} rx={5} ry={2.4} fill="#FFC9A8" stroke={LN} strokeWidth={1} />
    </G>
  );
}

/** A garden friend in its own SVG (60×60 art). */
export function Friend({ kind, size = 48 }: { kind: FriendKind; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 -2 60 62" aria-hidden><FriendArt kind={kind} /></Svg>;
}

/** The same art as an SVG group, for use inside a larger <Svg>. */
export function FriendArt({ kind, x = 0, y = 0, s = 1 }: { kind: FriendKind; x?: number; y?: number; s?: number }) {
  if (kind === 'hamster') return <HamsterArt x={x} y={y} s={s} />;
  return <PetArt look={LOOK[kind]} x={x} y={y} s={s} />;
}

/** A single flower in its own SVG. */
export function Flower({ size = 24, color = '#FF9EC2' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><Bloom cx={12} cy={12} r={10} color={color} /></Svg>;
}
