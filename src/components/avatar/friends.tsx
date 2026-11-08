import Svg from 'react-native-svg';
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

/** A garden friend in its own SVG (60×60 art). */
export function Friend({ kind, size = 48 }: { kind: FriendKind; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 60 60" aria-hidden><PetArt look={LOOK[kind]} /></Svg>;
}

/** The same art as an SVG group, for use inside a larger <Svg>. */
export function FriendArt({ kind, x = 0, y = 0, s = 1 }: { kind: FriendKind; x?: number; y?: number; s?: number }) {
  return <PetArt look={LOOK[kind]} x={x} y={y} s={s} />;
}

/** A single flower in its own SVG. */
export function Flower({ size = 24, color = '#FF9EC2' }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" aria-hidden><Bloom cx={12} cy={12} r={10} color={color} /></Svg>;
}
