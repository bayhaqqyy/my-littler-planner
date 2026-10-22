import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { Rarity } from '@/domain';
import { giftColors } from '@/theme/theme';
import { SparkleShape } from './Critters';

export function GiftBoxArt({ size = 64, rarity }: { size?: number; rarity: Exclude<Rarity, 'default'> }) {
  const c = giftColors[rarity];
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <Rect x={8} y={26} width={48} height={32} rx={6} fill={c.box} />
      <Rect x={5} y={18} width={54} height={12} rx={5} fill={c.box} stroke="#fff" strokeWidth={1.5} />
      <Rect x={28} y={18} width={8} height={40} fill="#fff" opacity={0.95} />
      <Rect x={29.5} y={18} width={5} height={40} fill={c.ribbon} opacity={0.45} />
      <Path d="M32 18 C24 6 14 10 18 16 C20 19 28 19 32 18Z" fill="#fff" stroke={c.ribbon} strokeWidth={1.4} />
      <Path d="M32 18 C40 6 50 10 46 16 C44 19 36 19 32 18Z" fill="#fff" stroke={c.ribbon} strokeWidth={1.4} />
      <Circle cx={32} cy={18} r={3.4} fill={c.ribbon} />
      <Circle cx={18} cy={44} r={2} fill="#fff" opacity={0.7} />
      <Circle cx={46} cy={40} r={1.6} fill="#fff" opacity={0.7} />
      {(rarity === 'super' || rarity === 'streak' || rarity === 'legenda') && <SparkleShape x={48} y={2} s={0.6} color="#FFD45E" />}
      {rarity === 'legenda' && <SparkleShape x={2} y={8} s={0.45} color="#FFFFFF" />}
      {rarity === 'legenda' && <Path d="M24 8 L28 0 L32 6 L36 0 L40 8Z" fill="#FFD45E" stroke="#E9AE22" strokeWidth={1} />}
    </Svg>
  );
}
