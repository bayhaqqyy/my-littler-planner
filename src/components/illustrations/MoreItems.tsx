/**
 * Art for the extra wardrobe items (biasa / langka / super / legenda added after v1).
 * Same coordinate space as MiniAzza: viewBox 0 -8 120 148, head centre (60, 56), hands at
 * (37, 113) and (83, 113). Pets are drawn in a 60×60 box and placed by MiniAzza.
 */
import { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Cheeks, CloudShape, Eye, HeartShape, Smile, SparkleShape, StarShape } from './Critters';

const INK = '#5B4560';
const RAINBOW = ['#FF9EC2', '#FFC48F', '#FFE27A', '#9EE0B5', '#9CD3F5', '#C3B0EE'];

/** Hair items that cover the default pink bow on the bun. */
export const HIDES_DEFAULT_BOW = new Set(['hair-pita-biru', 'hair-topi-penyihir', 'hair-tiara', 'hair-mahkota-legenda', 'hair-earmuff']);

/* ---------------- hair ---------------- */

export function MoreHairItem({ id }: { id?: string }) {
  switch (id) {
    case 'hair-jepit-hati':
      return <HeartShape x={74} y={26} s={0.7} color="#FF7FAF" />;
    case 'hair-pita-biru':
      return (
        <G>
          <Path d="M60 5 L44 -3 L46 13Z M60 5 L76 -3 L74 13Z" fill="#9CD3F5" stroke="#5FA8E0" strokeWidth={1} strokeLinejoin="round" />
          <Circle cx={60} cy={5} r={3.6} fill="#5FA8E0" />
        </G>
      );
    case 'hair-bando-polkadot':
      return (
        <G>
          <Path d="M30 38 Q60 12 90 38" stroke="#F7A8C4" strokeWidth={5} fill="none" strokeLinecap="round" />
          {[[36, 30], [46, 23], [58, 20], [70, 21], [81, 27]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={1.3} fill="#fff" />)}
        </G>
      );
    case 'hair-earmuff':
      return (
        <G>
          <Path d="M28 50 Q28 16 60 14 Q92 16 92 50" stroke="#C3B0EE" strokeWidth={4} fill="none" strokeLinecap="round" />
          {[27, 93].map((x) => (
            <G key={x}>
              <Circle cx={x} cy={56} r={10} fill="#FFD1E0" stroke="#fff" strokeWidth={2} />
              <Circle cx={x} cy={56} r={5} fill="#FFE6EE" />
            </G>
          ))}
        </G>
      );
    case 'hair-topi-penyihir':
      return (
        <G>
          <Ellipse cx={60} cy={26} rx={36} ry={7} fill="#B49BE8" />
          <Path d="M40 26 L62 -8 Q66 -10 68 -4 L80 26Z" fill="#C3B0EE" stroke="#A88BEE" strokeWidth={1} strokeLinejoin="round" />
          <Path d="M44 20 Q60 24 77 20" stroke="#FF9EC2" strokeWidth={3} fill="none" />
          <StarShape x={57} y={4} s={0.55} color="#FFE27A" />
        </G>
      );
    case 'hair-tiara':
      return (
        <G>
          <Path d="M38 26 L44 14 L50 22 L60 8 L70 22 L76 14 L82 26 Q60 20 38 26Z" fill="#E9EEF7" stroke="#AEB6C4" strokeWidth={1.2} strokeLinejoin="round" />
          <Circle cx={60} cy={13} r={3} fill="#9CD3F5" stroke="#fff" strokeWidth={1} />
          <Circle cx={45} cy={19} r={2} fill="#FF9EC2" />
          <Circle cx={75} cy={19} r={2} fill="#C3B0EE" />
          <SparkleShape x={80} y={0} s={0.5} color="#FFFFFF" />
        </G>
      );
    case 'hair-mahkota-legenda':
      return (
        <G>
          <Ellipse cx={60} cy={12} rx={34} ry={14} fill="#FFE9A8" opacity={0.45} />
          <Path d="M34 28 L38 2 L48 16 L60 -6 L72 16 L82 2 L86 28 Q60 22 34 28Z" fill="#FFD45E" stroke="#C98A0B" strokeWidth={1.4} strokeLinejoin="round" />
          <Path d="M36 28 Q60 22 84 28 L84 32 Q60 26 36 32Z" fill="#E9AE22" />
          <Circle cx={60} cy={6} r={3.6} fill="#FF7FAF" stroke="#fff" strokeWidth={1} />
          <Circle cx={40} cy={10} r={2.4} fill="#9CD3F5" />
          <Circle cx={80} cy={10} r={2.4} fill="#C3B0EE" />
          <Circle cx={60} cy={26} r={2} fill="#9EE0B5" />
          <SparkleShape x={88} y={-6} s={0.6} color="#FFFFFF" />
          <SparkleShape x={20} y={4} s={0.45} color="#FFE27A" />
        </G>
      );
    default:
      return null;
  }
}

/* ---------------- glasses ---------------- */

export function MoreGlasses({ id }: { id?: string }) {
  switch (id) {
    case 'glasses-kotak':
      return (
        <G stroke="#6E4434" strokeWidth={1.8} fill="rgba(255,255,255,0.25)">
          <Rect x={39} y={49} width={18} height={14} rx={3} />
          <Rect x={63} y={49} width={18} height={14} rx={3} />
          <Path d="M57 55 L63 55" fill="none" />
        </G>
      );
    case 'glasses-hitam':
      return (
        <G>
          <Path d="M38 50 H58 Q58 64 48 64 Q38 64 38 50Z" fill="#3D3550" />
          <Path d="M62 50 H82 Q82 64 72 64 Q62 64 62 50Z" fill="#3D3550" />
          <Path d="M58 52 Q60 50 62 52" stroke="#3D3550" strokeWidth={2} fill="none" />
          <Path d="M42 53 L47 53 M66 53 L71 53" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" opacity={0.7} />
        </G>
      );
    case 'glasses-pelangi':
      return (
        <G fill="rgba(255,255,255,0.2)">
          {[48, 72].map((cx) => RAINBOW.map((c, i) => <Circle key={`${cx}${c}`} cx={cx} cy={56} r={9 - i * 0.6} stroke={c} strokeWidth={0.9} fill="none" />))}
          <Path d="M57 55 Q60 52 63 55" stroke="#C3B0EE" strokeWidth={1.6} fill="none" />
        </G>
      );
    case 'glasses-berlian':
      return (
        <G>
          {[48, 72].map((cx) => (
            <G key={cx}>
              <Path d={`M${cx} 45 L${cx + 10} 56 L${cx} 67 L${cx - 10} 56Z`} fill="#D6EFFF" stroke="#7FB8E6" strokeWidth={1.4} strokeLinejoin="round" opacity={0.9} />
              <Path d={`M${cx - 10} 56 H${cx + 10} M${cx} 45 V67`} stroke="#fff" strokeWidth={0.8} opacity={0.8} />
            </G>
          ))}
          <Path d="M58 56 H62" stroke="#7FB8E6" strokeWidth={1.6} />
          <SparkleShape x={78} y={40} s={0.4} color="#FFFFFF" />
        </G>
      );
    default:
      return null;
  }
}

/* ---------------- outfits ---------------- */

export const MORE_OUTFITS: Record<string, { main: string; trim: string; skirt?: boolean }> = {
  'outfit-kaos-kuning': { main: '#FFE27A', trim: '#F2C94C' },
  'outfit-cardigan-krem': { main: '#F3E2C7', trim: '#D9BF94' },
  'outfit-kaos-stroberi': { main: '#FFC9D6', trim: '#F48FB1' },
  'outfit-jaket-jeans': { main: '#8DB8E8', trim: '#5F8FC8' },
  'outfit-sweater-rajut': { main: '#F7A8C4', trim: '#E07FA3' },
  'outfit-gaun-pesta': { main: '#E7D5FF', trim: '#B49BE8', skirt: true },
  'outfit-jubah-galaksi': { main: '#4B4590', trim: '#2F2A63', skirt: true },
};

/** Decorations drawn on top of the torso. */
export function MoreOutfitDeco({ id }: { id: string }) {
  switch (id) {
    case 'outfit-kaos-kuning':
      return <StarShape x={55} y={98} s={0.5} color="#fff" />;
    case 'outfit-cardigan-krem':
      return (
        <G>
          <Path d="M60 88 L60 120" stroke="#D9BF94" strokeWidth={1.4} />
          {[96, 104, 112].map((y) => <Circle key={y} cx={63} cy={y} r={1.4} fill="#B7925F" />)}
        </G>
      );
    case 'outfit-kaos-stroberi':
      return (
        <G>
          <Path d="M54 100 C54 95 66 95 66 100 C66 108 60 112 60 112 C60 112 54 108 54 100Z" fill="#FF7F9E" />
          <Path d="M55 97 l5 -3 l5 3" fill="#8CCB9F" />
          {[[57, 101], [62, 103], [59, 106]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={0.7} fill="#FFE27A" />)}
        </G>
      );
    case 'outfit-jaket-jeans':
      return (
        <G>
          <Path d="M52 86 L58 98 L60 92 L62 98 L68 86" stroke="#5F8FC8" strokeWidth={1.6} fill="#A9CCF0" strokeLinejoin="round" />
          <Rect x={47} y={104} width={9} height={6} rx={1.5} fill="none" stroke="#5F8FC8" strokeWidth={1} />
          <Rect x={64} y={104} width={9} height={6} rx={1.5} fill="none" stroke="#5F8FC8" strokeWidth={1} />
          <Path d="M60 98 V120" stroke="#5F8FC8" strokeWidth={1} strokeDasharray="2 2" />
        </G>
      );
    case 'outfit-sweater-rajut':
      return (
        <G stroke="#fff" strokeWidth={1} fill="none" opacity={0.75}>
          {[96, 104, 112].map((y) => <Path key={y} d={`M46 ${y} l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3`} />)}
        </G>
      );
    case 'outfit-gaun-pesta':
      return (
        <G>
          {[[46, 112], [56, 104], [66, 116], [74, 108], [52, 118]].map(([x, y], i) => <SparkleShape key={i} x={x} y={y} s={0.35} color={i % 2 ? '#FFE27A' : '#FFFFFF'} />)}
          <Path d="M46 98 Q60 104 74 98" stroke="#FF9EC2" strokeWidth={2.4} fill="none" />
        </G>
      );
    case 'outfit-jubah-galaksi':
      return (
        <G>
          {[[44, 110], [52, 100], [64, 114], [72, 104], [58, 120], [76, 118]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={i % 2 ? 0.9 : 1.3} fill="#FFFFFF" />)}
          <StarShape x={58} y={102} s={0.45} color="#FFE27A" />
          <Path d="M70 112 A5 5 0 1 0 74 106 A3.5 3.5 0 1 1 70 112Z" fill="#FFE27A" />
          <Path d="M52 86 Q60 92 68 86" stroke="#FFD45E" strokeWidth={2} fill="none" />
        </G>
      );
    default:
      return null;
  }
}

/** Behind-the-body part of an outfit (the galaxy cloak). */
export function MoreOutfitBack({ id }: { id: string }) {
  if (id !== 'outfit-jubah-galaksi') return null;
  return <Path d="M42 88 Q26 112 30 130 L90 130 Q94 112 78 88Z" fill="#2F2A63" opacity={0.9} />;
}

/* ---------------- extras ---------------- */

export function MoreExtra({ id, layer }: { id?: string; layer: 'back' | 'front' }) {
  if (!id) return null;
  if (layer === 'back') {
    switch (id) {
      case 'extra-ransel':
        return (
          <G>
            <Rect x={36} y={88} width={48} height={34} rx={12} fill="#FFC1D6" stroke="#F48FB1" strokeWidth={1.2} />
            <Path d="M44 88 C40 72 46 70 48 80 M76 88 C80 72 74 70 72 80" stroke="#FFC1D6" strokeWidth={5} strokeLinecap="round" fill="none" />
          </G>
        );
      case 'extra-sayap-malaikat':
        return (
          <G>
            {[-1, 1].map((d) => (
              <G key={d} transform={d < 0 ? undefined : 'translate(120 0) scale(-1 1)'}>
                <Path d="M46 94 C26 76 4 78 6 92 C2 100 12 104 18 102 C10 110 22 116 30 110 C28 118 40 120 46 108Z" fill="#FFFFFF" stroke="#E6DDF0" strokeWidth={1.4} />
                <Path d="M14 92 Q30 92 42 98 M20 104 Q32 102 44 104" stroke="#E6DDF0" strokeWidth={1} fill="none" />
              </G>
            ))}
          </G>
        );
      default:
        return null;
    }
  }
  switch (id) {
    case 'extra-pensil':
      return (
        <G transform="rotate(-25 84 112)">
          <Rect x={80} y={84} width={8} height={32} rx={1.5} fill="#FFD45E" stroke="#E9AE22" strokeWidth={1} />
          <Rect x={80} y={84} width={8} height={5} rx={1.5} fill="#FF9EC2" />
          <Path d="M80 116 L84 124 L88 116Z" fill="#F3E2C7" />
          <Path d="M83 121 L84 124 L85 121Z" fill={INK} />
        </G>
      );
    case 'extra-bunga':
      return (
        <G>
          <Path d="M30 108 L37 118 L44 108Z" fill="#C8E6D3" stroke="#8CCB9F" strokeWidth={1} />
          {[[33, 104, '#FF9EC2'], [40, 102, '#FFE27A'], [37, 97, '#C3B0EE']].map(([x, y, c], i) => (
            <G key={i}>
              {[0, 72, 144, 216, 288].map((a) => <Ellipse key={a} cx={x as number} cy={(y as number) - 2.4} rx={1.8} ry={2.5} fill={c as string} transform={`rotate(${a} ${x} ${y})`} />)}
              <Circle cx={x as number} cy={y as number} r={1.3} fill="#fff" />
            </G>
          ))}
        </G>
      );
    case 'extra-payung':
      return (
        <G>
          <Path d="M84 112 L92 60" stroke="#9C8AA8" strokeWidth={1.6} />
          <Path d="M70 62 Q92 36 114 62 Q108 58 103 62 Q97 57 92 62 Q86 57 81 62 Q76 58 70 62Z" fill="#9CD3F5" stroke="#5FA8E0" strokeWidth={1} />
          {[[80, 54], [92, 48], [104, 54]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={1.8} fill="#fff" />)}
        </G>
      );
    case 'extra-pelangi':
      return (
        <G fill="none" strokeLinecap="round">
          {RAINBOW.map((c, i) => <Path key={c} d={`M${72 + i * 2} 30 A${18 - i * 2} ${18 - i * 2} 0 0 1 ${108 - i * 2} 30`} stroke={c} strokeWidth={2} />)}
          <CloudShape x={66} y={24} s={0.3} color="#FFFFFF" />
          <CloudShape x={98} y={24} s={0.3} color="#FFFFFF" />
        </G>
      );
    case 'extra-bintang-jatuh':
      return (
        <G>
          <Path d="M4 6 Q12 10 18 18" stroke="#FFE27A" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
          <Path d="M8 2 Q16 8 20 14" stroke="#FFC1D6" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
          <StarShape x={14} y={12} s={0.8} color="#FFD45E" />
        </G>
      );
    case 'extra-halo':
      return (
        <G>
          <Ellipse cx={60} cy={-2} rx={22} ry={5} fill="none" stroke="#FFE9A8" strokeWidth={6} opacity={0.6} />
          <Ellipse cx={60} cy={-2} rx={22} ry={5} fill="none" stroke="#FFD45E" strokeWidth={2.6} />
        </G>
      );
    case 'extra-tongkat-bintang':
      return (
        <G>
          <Defs>
            <LinearGradient id="mlpWand" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFE27A" />
              <Stop offset="1" stopColor="#FF9EC2" />
            </LinearGradient>
          </Defs>
          <Path d="M84 114 L98 76" stroke="#C3B0EE" strokeWidth={2.4} strokeLinecap="round" />
          <StarShape x={90} y={62} s={1} color="url(#mlpWand)" />
          <SparkleShape x={108} y={58} s={0.45} color="#FFFFFF" />
          <SparkleShape x={86} y={56} s={0.3} color="#FFE27A" />
        </G>
      );
    default:
      return null;
  }
}

/* ---------------- pets (60×60 box) ---------------- */

export function DuckArt({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Ellipse cx={32} cy={42} rx={18} ry={13} fill="#FFE27A" stroke="#F2C94C" strokeWidth={1.2} />
      <Circle cx={24} cy={24} r={12} fill="#FFE27A" stroke="#F2C94C" strokeWidth={1.2} />
      <Path d="M8 24 Q12 20 15 24 Q12 28 8 24Z" fill="#FFA36C" />
      <Eye x={21} y={22} r={1.8} />
      <Cheeks lx={18} rx={30} y={27} r={2} />
      <Path d="M36 40 Q44 36 46 42" stroke="#F2C94C" strokeWidth={1.4} fill="none" />
    </G>
  );
}

export function PenguinArt({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Ellipse cx={30} cy={34} rx={17} ry={21} fill="#5B6B8A" />
      <Ellipse cx={30} cy={38} rx={12} ry={16} fill="#FFFFFF" />
      <Eye x={25} y={26} r={2} />
      <Eye x={35} y={26} r={2} />
      <Cheeks lx={22} rx={38} y={31} r={2.2} />
      <Path d="M27.5 30 L32.5 30 L30 33Z" fill="#FFA36C" />
      <Ellipse cx={24} cy={55} rx={5} ry={2} fill="#FFA36C" />
      <Ellipse cx={36} cy={55} rx={5} ry={2} fill="#FFA36C" />
      <Path d="M44 22 l5 -3 l1 5 l-5 0Z" fill="#9CD3F5" />
    </G>
  );
}

export function PuppyArt({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Ellipse cx={14} cy={28} rx={6} ry={12} fill="#C99A6B" transform="rotate(20 14 28)" />
      <Ellipse cx={46} cy={28} rx={6} ry={12} fill="#C99A6B" transform="rotate(-20 46 28)" />
      <Ellipse cx={30} cy={32} rx={17} ry={15} fill="#F3E2C7" stroke="#D9BF94" strokeWidth={1.2} />
      <Ellipse cx={22} cy={28} rx={5} ry={4} fill="#E8C9A0" />
      <Eye x={23} y={30} r={2.2} />
      <Eye x={37} y={30} r={2.2} />
      <Cheeks lx={19} rx={41} y={36} r={2.4} />
      <Ellipse cx={30} cy={36} rx={2.6} ry={1.8} fill={INK} />
      <Smile x={30} y={39} w={3.2} />
      <Path d="M24 46 Q30 50 36 46" stroke="#FF9EC2" strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </G>
  );
}

export function UnicornArt({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M30 6 L34 22 L26 22Z" fill="#FFE27A" stroke="#F2C94C" strokeWidth={1} strokeLinejoin="round" />
      <Path d="M16 22 C10 30 12 40 18 44 M14 26 C6 32 8 42 14 46" stroke="#C3B0EE" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M18 22 C14 28 15 36 20 40" stroke="#FF9EC2" strokeWidth={3} fill="none" strokeLinecap="round" />
      <Ellipse cx={32} cy={34} rx={16} ry={14} fill="#FFFFFF" stroke="#E6DDF0" strokeWidth={1.2} />
      <Path d="M22 20 L18 12 L27 18Z M40 18 L46 12 L42 22Z" fill="#FFFFFF" stroke="#E6DDF0" strokeWidth={1} />
      <Eye x={27} y={32} r={2} closed />
      <Eye x={38} y={32} r={2} closed />
      <Cheeks lx={24} rx={41} y={37} r={2.2} />
      <Smile x={33} y={39} w={3} />
      <SparkleShape x={44} y={2} s={0.4} color="#FFE27A" />
    </G>
  );
}

export function DragonArt({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M10 30 C2 18 8 12 16 20 Z M50 30 C58 18 52 12 44 20Z" fill="#C3B0EE" stroke="#A88BEE" strokeWidth={1} />
      <Path d="M44 46 Q56 50 54 40" stroke="#9EE0B5" strokeWidth={5} fill="none" strokeLinecap="round" />
      <Ellipse cx={30} cy={34} rx={17} ry={16} fill="#9EE0B5" stroke="#6CC596" strokeWidth={1.2} />
      <Path d="M22 18 L20 10 L26 16Z M38 18 L40 10 L34 16Z" fill="#FFE27A" />
      <Ellipse cx={30} cy={40} rx={9} ry={7} fill="#D9F2E4" />
      <Eye x={24} y={31} r={2.2} />
      <Eye x={36} y={31} r={2.2} />
      <Cheeks lx={20} rx={40} y={36} r={2.4} />
      <Smile x={30} y={40} w={3.4} />
      <Path d="M27 50 l3 -4 l3 4" fill="#FFC48F" />
      <SparkleShape x={48} y={6} s={0.45} color="#FFE27A" />
    </G>
  );
}

export function PhoenixArt({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M30 40 C18 52 10 56 4 54 C12 50 16 46 18 40Z" fill="#FFC48F" />
      <Path d="M30 40 C42 52 50 56 56 54 C48 50 44 46 42 40Z" fill="#FF9EC2" />
      <Path d="M30 44 C28 52 30 58 34 60 C34 54 34 50 32 44Z" fill="#FFE27A" />
      <Ellipse cx={30} cy={32} rx={13} ry={14} fill="#FF8FA8" stroke="#E86A8C" strokeWidth={1.2} />
      <Path d="M26 16 C24 10 28 6 30 12 C32 6 36 10 34 16 C32 12 30 14 30 16 C30 14 28 12 26 16Z" fill="#FFC48F" />
      <Eye x={26} y={30} r={2} />
      <Eye x={34} y={30} r={2} />
      <Cheeks lx={22} rx={38} y={35} r={2.2} />
      <Path d="M28 35 L32 35 L30 38Z" fill="#FFE27A" />
      <SparkleShape x={44} y={14} s={0.45} color="#FFE27A" />
    </G>
  );
}

export const MORE_PETS: Record<string, (p: { x?: number; y?: number; s?: number }) => React.JSX.Element> = {
  'pet-bebek': DuckArt,
  'pet-penguin': PenguinArt,
  'pet-anjing': PuppyArt,
  'pet-unicorn': UnicornArt,
  'pet-naga': DragonArt,
  'pet-burung-api': PhoenixArt,
};
