import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { Wardrobe } from '@/domain';
import { HIDES_DEFAULT_BOW, MORE_OUTFITS, MORE_PETS, MoreExtra, MoreGlasses, MoreHairItem, MoreOutfitBack, MoreOutfitDeco } from './MoreItems';
import { BearArt, BunnyArt, ButterflyShape, ChickArt, CloudShape, Eye, Cheeks, HeartShape, KittyArt, SheepArt, StarShape } from './Critters';

export type Pose = 'happy' | 'study' | 'rest' | 'surprised' | 'dance';

const SKIN = '#FFE6D8';
const SKIN_LINE = '#EDC2AE';
const HAIR = '#8B5A3C';
const HAIR_DARK = '#74492F';
const INK = '#5B4560';

const OUTFIT: Record<string, { main: string; trim: string; skirt?: boolean }> = {
  'outfit-kaos-pink': { main: '#FFB6CF', trim: '#F48FB1' },
  'outfit-sweater-mint': { main: '#BDE8D0', trim: '#8CCB9F' },
  'outfit-overall-biru': { main: '#9CC9F0', trim: '#fff' },
  'outfit-dress-lavender': { main: '#D6C5F4', trim: '#B49BE8', skirt: true },
  'outfit-hoodie-kucing': { main: '#F2E2C9', trim: '#E2C9A3' },
  'outfit-gaun-bintang': { main: '#B9C6F5', trim: '#FFE27A', skirt: true },
  'outfit-gaun-sakura': { main: '#FFC9DA', trim: '#FF9EC2', skirt: true },
};

interface Props {
  size?: number;
  pose?: Pose;
  equipped?: Partial<Wardrobe['equipped']>;
  /** Show the companion pet next to her. */
  showPet?: boolean;
  /** Head only (for avatars / toasts / app icon). */
  faceOnly?: boolean;
}

function Face({ pose }: { pose: Pose }) {
  const closed = pose === 'rest';
  const big = pose === 'surprised';
  return (
    <G>
      <Eye x={48} y={56} r={big ? 4.6 : 4} closed={closed} />
      <Eye x={72} y={56} r={big ? 4.6 : 4} closed={closed} />
      <Cheeks lx={41} rx={79} y={65} r={4.4} />
      {big ? (
        <Ellipse cx={60} cy={68} rx={3} ry={3.6} fill="#E86A8C" />
      ) : pose === 'dance' || pose === 'happy' ? (
        <Path d="M54.5 65 Q60 72 65.5 65 Z" fill="#E86A8C" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      ) : (
        <Path d="M56 66 Q60 69.5 64 66" stroke={INK} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      )}
    </G>
  );
}

function HairBack() {
  return <Path d="M26 54 C24 30 40 18 60 18 C80 18 96 30 94 54 C95 66 92 76 88 82 L32 82 C28 76 25 66 26 54Z" fill={HAIR} />;
}

function HairFront({ hair }: { hair?: string }) {
  return (
    <G>
      {/* bun */}
      <Circle cx={60} cy={14} r={11} fill={HAIR} />
      <Path d="M53 10 Q60 6 67 10" stroke={HAIR_DARK} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      {/* bangs */}
      <Path d="M28 50 C30 30 44 22 60 22 C76 22 90 30 92 50 C86 44 80 40 74 42 C72 36 66 34 62 40 C58 34 50 34 47 41 C40 38 33 42 28 50Z" fill={HAIR} />
      <Path d="M44 30 Q52 26 58 28" stroke="#A9714F" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.7} />
      {hair !== 'hair-pita-pink' && hair !== 'hair-bando-kelinci' && !HIDES_DEFAULT_BOW.has(hair ?? '') && (
        <G>
          <Path d="M60 22 L52 17 L52 27Z M60 22 L68 17 L68 27Z" fill="#FF9EC2" stroke="#F06A9B" strokeWidth={0.8} strokeLinejoin="round" />
          <Circle cx={60} cy={22} r={2.4} fill="#F06A9B" />
        </G>
      )}
    </G>
  );
}

function HairItem({ id }: { id?: string }) {
  switch (id) {
    case 'hair-pita-pink':
      return (
        <G>
          <Path d="M60 5 L44 -3 L46 13Z M60 5 L76 -3 L74 13Z" fill="#FF7FAF" stroke="#E2588F" strokeWidth={1} strokeLinejoin="round" />
          <Circle cx={60} cy={5} r={3.6} fill="#E2588F" />
        </G>
      );
    case 'hair-jepit-bintang':
      return <StarShape x={78} y={28} s={0.8} color="#FFD45E" />;
    case 'hair-bando-kelinci':
      return (
        <G>
          <Path d="M38 30 C30 6 34 -6 40 -2 C46 2 46 16 46 28Z" fill="#fff" stroke="#EBD7DF" strokeWidth={1.2} />
          <Path d="M82 30 C90 6 86 -6 80 -2 C74 2 74 16 74 28Z" fill="#fff" stroke="#EBD7DF" strokeWidth={1.2} />
          <Path d="M40 24 C36 10 38 3 41 5 C44 8 44 16 44 24Z M80 24 C84 10 82 3 79 5 C76 8 76 16 76 24Z" fill="#FFD3E0" />
          <Path d="M30 36 Q60 14 90 36" stroke="#FF9EC2" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'hair-baret':
      return (
        <G>
          <Ellipse cx={56} cy={22} rx={30} ry={11} fill="#C3B0EE" transform="rotate(-8 56 22)" />
          <Circle cx={54} cy={11} r={3} fill="#A88BEE" />
        </G>
      );
    case 'hair-mahkota-bunga':
      return (
        <G>
          {[[34, 34, '#FF9EC2'], [44, 26, '#FFE27A'], [56, 22, '#C3B0EE'], [68, 23, '#9CD3F5'], [79, 27, '#FF9EC2'], [87, 35, '#A8DABD']].map(([x, y, c], i) => (
            <G key={i}>
              {[0, 72, 144, 216, 288].map((a) => <Ellipse key={a} cx={x as number} cy={(y as number) - 3.2} rx={2.6} ry={3.4} fill={c as string} transform={`rotate(${a} ${x} ${y})`} />)}
              <Circle cx={x as number} cy={y as number} r={1.9} fill="#fff" />
            </G>
          ))}
        </G>
      );
    case 'hair-bando-pelangi':
      return (
        <G fill="none" strokeLinecap="round">
          {['#FF9EC2', '#FFC48F', '#FFE27A', '#9EE0B5', '#9CD3F5', '#C3B0EE'].map((c, i) => (
            <Path key={c} d={`M${30 + i * 1.5} 38 Q60 ${10 + i * 1.6} ${90 - i * 1.5} 38`} stroke={c} strokeWidth={1.8} />
          ))}
        </G>
      );
    case 'hair-mahkota-bulan':
      return (
        <G>
          <Path d="M42 24 L46 8 L53 18 L60 4 L67 18 L74 8 L78 24Z" fill="#FFE08A" stroke="#EDB52F" strokeWidth={1.2} strokeLinejoin="round" />
          <Path d="M62 9 A4 4 0 1 1 58 4 A3 3 0 1 0 62 9Z" fill="#fff" />
          <Circle cx={50} cy={20} r={1.6} fill="#C3B0EE" />
          <Circle cx={70} cy={20} r={1.6} fill="#9CD3F5" />
        </G>
      );
    default:
      return <MoreHairItem id={id} />;
  }
}

function Glasses({ id }: { id?: string }) {
  switch (id) {
    case 'glasses-bulat':
      return (
        <G stroke="#8A6E5C" strokeWidth={1.6} fill="rgba(255,255,255,0.25)">
          <Circle cx={48} cy={56} r={8} />
          <Circle cx={72} cy={56} r={8} />
          <Path d="M56 55 Q60 52 64 55" fill="none" />
        </G>
      );
    case 'glasses-hati':
      return (
        <G opacity={0.85}>
          <HeartShape x={38} y={47} s={1} color="#FF7FAF" />
          <HeartShape x={62} y={47} s={1} color="#FF7FAF" />
          <Path d="M57 53 L63 53" stroke="#E2588F" strokeWidth={1.6} />
        </G>
      );
    case 'glasses-bintang':
      return (
        <G opacity={0.9}>
          <StarShape x={37} y={45} s={1.1} color="#FFD45E" />
          <StarShape x={61} y={45} s={1.1} color="#FFD45E" />
          <Path d="M58 55 L62 55" stroke="#EDB52F" strokeWidth={1.6} />
        </G>
      );
    default:
      return <MoreGlasses id={id} />;
  }
}

function Body({ outfit, pose }: { outfit: string; pose: Pose }) {
  const o = OUTFIT[outfit] ?? MORE_OUTFITS[outfit] ?? OUTFIT['outfit-kaos-pink'];
  const armL = pose === 'dance' ? 'M40 96 Q28 84 26 74' : 'M40 96 Q32 104 36 112';
  const armR = pose === 'dance' ? 'M80 96 Q92 84 94 74' : 'M80 96 Q88 104 84 112';
  const handL = pose === 'dance' ? [26, 73] : [37, 113];
  const handR = pose === 'dance' ? [94, 73] : [83, 113];
  return (
    <G>
      <MoreOutfitBack id={outfit} />
      {/* legs */}
      <Rect x={49} y={118} width={8} height={12} rx={4} fill={SKIN} stroke={SKIN_LINE} strokeWidth={1} />
      <Rect x={63} y={118} width={8} height={12} rx={4} fill={SKIN} stroke={SKIN_LINE} strokeWidth={1} />
      <Ellipse cx={53} cy={131} rx={6} ry={3.4} fill="#F48FB1" />
      <Ellipse cx={67} cy={131} rx={6} ry={3.4} fill="#F48FB1" />
      {/* torso */}
      {o.skirt ? (
        <Path d="M46 86 L74 86 L86 122 Q60 128 34 122Z" fill={o.main} stroke={o.trim} strokeWidth={1.2} strokeLinejoin="round" />
      ) : (
        <Path d="M44 86 L76 86 Q80 104 78 120 L42 120 Q40 104 44 86Z" fill={o.main} stroke={o.trim} strokeWidth={1.2} strokeLinejoin="round" />
      )}
      {outfit === 'outfit-overall-biru' && (
        <G>
          <Path d="M44 86 L76 86 L75 96 L45 96Z" fill="#fff" />
          <Rect x={49} y={86} width={3} height={12} fill="#7AB0DE" />
          <Rect x={68} y={86} width={3} height={12} fill="#7AB0DE" />
          <Rect x={54} y={100} width={12} height={8} rx={2} fill="#7AB0DE" />
        </G>
      )}
      {outfit === 'outfit-hoodie-kucing' && (
        <G>
          <Path d="M52 104 h16 v8 h-16z" fill="#E8D3B1" />
          <Eye x={57} y={108} r={0.9} closed />
          <Eye x={63} y={108} r={0.9} closed />
        </G>
      )}
      {outfit === 'outfit-gaun-bintang' && (
        <G>
          <StarShape x={48} y={104} s={0.4} color="#FFE27A" />
          <StarShape x={64} y={110} s={0.35} color="#fff" />
          <StarShape x={70} y={98} s={0.3} color="#FFE27A" />
        </G>
      )}
      {outfit === 'outfit-gaun-sakura' && (
        <G>
          {[[48, 106], [60, 112], [72, 104], [55, 96], [66, 118]].map(([x, y], i) => (
            <G key={i}>{[0, 72, 144, 216, 288].map((a) => <Ellipse key={a} cx={x} cy={y - 1.6} rx={1.3} ry={1.8} fill="#fff" transform={`rotate(${a} ${x} ${y})`} />)}</G>
          ))}
        </G>
      )}
      {outfit === 'outfit-kaos-pink' && <HeartShape x={55} y={98} s={0.5} color="#fff" />}
      {outfit === 'outfit-sweater-mint' && <Path d="M44 112 Q60 116 76 112" stroke="#8CCB9F" strokeWidth={2} fill="none" />}
      <MoreOutfitDeco id={outfit} />
      {/* collar */}
      <Path d="M52 86 Q60 92 68 86" stroke={o.trim} strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* arms */}
      <Path d={armL} stroke={o.main} strokeWidth={8} fill="none" strokeLinecap="round" />
      <Path d={armR} stroke={o.main} strokeWidth={8} fill="none" strokeLinecap="round" />
      <Circle cx={handL[0]} cy={handL[1]} r={4.2} fill={SKIN} stroke={SKIN_LINE} strokeWidth={1} />
      <Circle cx={handR[0]} cy={handR[1]} r={4.2} fill={SKIN} stroke={SKIN_LINE} strokeWidth={1} />
      {pose === 'study' && (
        <G>
          <Path d="M36 104 L60 110 L84 104 L84 122 L60 128 L36 122Z" fill="#9CD3F5" stroke="#6FB2DE" strokeWidth={1.2} strokeLinejoin="round" />
          <Path d="M39 106 L59 111 L59 125 L39 120Z M81 106 L61 111 L61 125 L81 120Z" fill="#fff" />
          <Path d="M43 111 L55 114 M43 115 L55 118 M65 114 L77 111 M65 118 L77 115" stroke="#C3B0EE" strokeWidth={1} />
        </G>
      )}
      {pose === 'rest' && (
        <G>
          <Path d="M50 104 h20 v10 q0 8 -10 8 q-10 0 -10 -8z" fill="#fff" stroke="#E7C4A0" strokeWidth={1.2} />
          <Path d="M70 107 q6 0 6 4 q0 4 -6 4" stroke="#E7C4A0" strokeWidth={1.6} fill="none" />
          <Path d="M52 106 h16" stroke="#D9A779" strokeWidth={2} />
          <Path d="M56 100 q-2 -4 0 -7 M61 100 q2 -4 0 -7 M65 100 q-2 -4 0 -6" stroke="#E7D9E2" strokeWidth={1.4} fill="none" strokeLinecap="round" />
          <HeartShape x={56} y={110} s={0.4} color="#FFB3C7" />
        </G>
      )}
    </G>
  );
}

function Extra({ id, layer }: { id?: string; layer: 'back' | 'front' }) {
  if (!id) return null;
  if (id === 'extra-sayap' && layer === 'back') {
    return (
      <G opacity={0.92}>
        <Path d="M46 96 C20 70 6 84 14 100 C6 112 24 124 46 106Z" fill="#D6C5F4" stroke="#B49BE8" strokeWidth={1.2} />
        <Path d="M74 96 C100 70 114 84 106 100 C114 112 96 124 74 106Z" fill="#D6C5F4" stroke="#B49BE8" strokeWidth={1.2} />
        <Circle cx={24} cy={94} r={4} fill="#FFC1D6" />
        <Circle cx={96} cy={94} r={4} fill="#FFC1D6" />
      </G>
    );
  }
  if (layer === 'back') return <MoreExtra id={id} layer="back" />;
  switch (id) {
    case 'extra-balon':
      return (
        <G>
          <Path d="M20 70 Q24 90 36 112" stroke="#C9B6CF" strokeWidth={1} fill="none" />
          <HeartShape x={4} y={46} s={1.6} color="#FF7FAF" />
          <SparkleShapeMini x={12} y={52} />
        </G>
      );
    case 'extra-tas-stroberi':
      return (
        <G>
          <Path d="M80 92 Q86 100 88 108" stroke="#E2588F" strokeWidth={1.4} fill="none" />
          <Path d="M82 108 C82 102 98 102 98 108 C98 118 90 124 90 124 C90 124 82 118 82 108Z" fill="#FF7F9E" stroke="#E2588F" strokeWidth={1} />
          <Path d="M84 104 l6 -4 l6 4" fill="#8CCB9F" />
          {[[86, 110], [92, 112], [89, 116], [94, 108]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={0.9} fill="#FFE27A" />)}
        </G>
      );
    case 'extra-awan':
      return <CloudShape x={74} y={-2} s={0.7} color="#E2F2FD" />;
    default:
      return <MoreExtra id={id} layer="front" />;
  }
}

function SparkleShapeMini({ x, y }: { x: number; y: number }) {
  return <Path d={`M${x} ${y} l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1 l3 -1z`} fill="#fff" />;
}

function Pet({ id }: { id?: string }) {
  const at = { x: 88, y: 98, s: 0.55 };
  switch (id) {
    case 'pet-kelinci': return <BunnyArt {...at} y={92} />;
    case 'pet-anak-ayam': return <ChickArt {...at} />;
    case 'pet-kucing': return <KittyArt {...at} y={102} />;
    case 'pet-beruang': return <BearArt {...at} y={102} />;
    case 'pet-domba': return <SheepArt {...at} y={98} />;
    default: {
      const Art = id ? MORE_PETS[id] : undefined;
      return Art ? <Art {...at} /> : null;
    }
  }
}

/** Mini <username> — the planner's dress-up character. */
export function MiniAzza({ size = 120, pose = 'happy', equipped = {}, showPet = true, faceOnly }: Props) {
  const outfit = equipped.outfit ?? 'outfit-kaos-pink';
  if (faceOnly) {
    return (
      <Svg width={size} height={size} viewBox="18 -6 84 96" aria-hidden>
        <HairBack />
        <Ellipse cx={60} cy={56} rx={30} ry={28} fill={SKIN} stroke={SKIN_LINE} strokeWidth={1.2} />
        <Face pose={pose} />
        <HairFront hair={equipped.hair} />
        <HairItem id={equipped.hair} />
        <Glasses id={equipped.glasses} />
      </Svg>
    );
  }
  const w = showPet && equipped.pet ? 124 : 120;
  return (
    <Svg width={size * (w / 120)} height={size * (140 / 120)} viewBox={`0 -8 ${w} 148`} aria-hidden>
      <Extra id={equipped.extra} layer="back" />
      <HairBack />
      <Body outfit={outfit} pose={pose} />
      <Ellipse cx={60} cy={56} rx={30} ry={28} fill={SKIN} stroke={SKIN_LINE} strokeWidth={1.2} />
      <Face pose={pose} />
      <HairFront hair={equipped.hair} />
      <HairItem id={equipped.hair} />
      <Glasses id={equipped.glasses} />
      <Extra id={equipped.extra} layer="front" />
      {showPet && <Pet id={equipped.pet} />}
    </Svg>
  );
}

export { ButterflyShape };
