import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { ITEM_BY_ID, type ItemLook, type Wardrobe } from '@/domain';
import { Extra, Glasses, HairItem, Outfit, OutfitBack } from '../avatar/wear';
import { PetArt } from '../avatar/pets';
import { HamsterArt } from '../avatar/friends';
import { Heart, LN } from '../avatar/shapes';
import { ButterflyShape } from './Critters';

export type Pose = 'happy' | 'study' | 'rest' | 'surprised' | 'dance';

const SKIN = '#FFE3D2';
const SKIN_LINE = '#E8BFA8';
const HAIR = '#6B4232';
const HAIR_LINE = '#4E2E22';

interface Props {
  size?: number;
  pose?: Pose;
  equipped?: Partial<Wardrobe['equipped']>;
  /** Show the companion pet next to her. */
  showPet?: boolean;
  /** Head only (for avatars / toasts / app icon). */
  faceOnly?: boolean;
}

const lookOf = (id?: string): ItemLook | undefined => (id ? ITEM_BY_ID[id]?.look : undefined);

function HairBack() {
  return <Path d="M22 58 C20 26 38 12 60 12 C82 12 100 26 98 58 C99 74 96 88 90 96 L30 96 C24 88 21 74 22 58Z" fill={HAIR} stroke={HAIR_LINE} strokeWidth={1.3} />;
}

function Bangs() {
  return (
    <G>
      <Path d="M30 54 C29 30 42 18 60 18 C78 18 91 30 90 54 C86 44 79 40 72 42 C68 32 63 31 60 39 C57 31 52 32 48 42 C41 40 34 44 30 54Z" fill={HAIR} stroke={HAIR_LINE} strokeWidth={1.2} strokeLinejoin="round" />
      <Path d="M42 27 Q51 21 60 22" stroke="#8C5A44" strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </G>
  );
}

function Eye({ cx, cy, big, down }: { cx: number; cy: number; big?: boolean; down?: boolean }) {
  const rx = big ? 5.4 : 4.7, ry = big ? 7 : 6.1;
  const y = down ? cy + 1.5 : cy;
  return (
    <G>
      <Ellipse cx={cx} cy={y} rx={rx} ry={ry} fill="#3B2722" />
      <Ellipse cx={cx} cy={y + ry * 0.45} rx={rx * 0.68} ry={ry * 0.38} fill="#8A5A44" />
      <Circle cx={cx + rx * 0.3} cy={y - ry * 0.35} r={rx * 0.42} fill="#fff" />
      <Circle cx={cx - rx * 0.4} cy={y + ry * 0.35} r={rx * 0.2} fill="#fff" />
    </G>
  );
}

function Face({ pose }: { pose: Pose }) {
  return (
    <G>
      {pose === 'rest' ? (
        <G>
          <Path d="M44 61 Q49 65 54 61 M66 61 Q71 65 76 61" stroke="#3B2722" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        </G>
      ) : (
        <G>
          <Eye cx={49} cy={61} big={pose === 'surprised'} down={pose === 'study'} />
          <Eye cx={71} cy={61} big={pose === 'surprised'} down={pose === 'study'} />
        </G>
      )}
      <Ellipse cx={41} cy={71} rx={5.6} ry={3.3} fill="#FFA3BC" opacity={0.85} />
      <Ellipse cx={79} cy={71} rx={5.6} ry={3.3} fill="#FFA3BC" opacity={0.85} />
      {pose === 'surprised' ? (
        <Ellipse cx={60} cy={73} rx={2.8} ry={3.4} fill="#E8607E" stroke={LN} strokeWidth={1} />
      ) : pose === 'dance' || pose === 'happy' ? (
        <Path d="M55.5 70.5 Q60 77 64.5 70.5Z" fill="#FF7A9E" stroke={LN} strokeWidth={1.1} strokeLinejoin="round" />
      ) : (
        <Path d="M56.5 71 Q60 74 63.5 71" stroke={LN} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      )}
    </G>
  );
}

function Head({ pose, equipped }: { pose: Pose; equipped: Partial<Wardrobe['equipped']> }) {
  return (
    <G>
      <Ellipse cx={60} cy={59} rx={29} ry={27} fill={SKIN} stroke={SKIN_LINE} strokeWidth={1.2} />
      <Face pose={pose} />
      <Bangs />
      <HairItem look={lookOf(equipped.hair)} />
      <Glasses look={lookOf(equipped.glasses)} />
    </G>
  );
}

function Props({ pose }: { pose: Pose }) {
  if (pose === 'study') {
    return (
      <G>
        <Path d="M36 104 L60 110 L84 104 L84 122 L60 128 L36 122Z" fill="#9CD3F5" stroke="#6FB2DE" strokeWidth={1.2} strokeLinejoin="round" />
        <Path d="M39 106 L59 111 L59 125 L39 120Z M81 106 L61 111 L61 125 L81 120Z" fill="#fff" />
        <Path d="M43 111 L55 114 M43 115 L55 118 M65 114 L77 111 M65 118 L77 115" stroke="#C3B0EE" strokeWidth={1} />
      </G>
    );
  }
  if (pose === 'rest') {
    return (
      <G>
        <Path d="M50 104 h20 v10 q0 8 -10 8 q-10 0 -10 -8z" fill="#fff" stroke="#E7C4A0" strokeWidth={1.2} />
        <Path d="M70 107 q6 0 6 4 q0 4 -6 4" stroke="#E7C4A0" strokeWidth={1.6} fill="none" />
        <Path d="M56 100 q-2 -4 0 -7 M61 100 q2 -4 0 -7 M65 100 q-2 -4 0 -6" stroke="#E7D9E2" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        <Heart cx={60} cy={113} s={3} color="#FFB3C7" stroke={false} />
      </G>
    );
  }
  return null;
}

/** Mini <username>: the chibi dress-up character, drawn from the equipped items' looks. */
export function MiniAzza({ size = 120, pose = 'happy', equipped = {}, showPet = true, faceOnly }: Props) {
  const outfit = lookOf(equipped.outfit ?? 'outfit-kaos-pink') ?? { k: 'kaos', a: '#FFB6CF', b: 'hati' };
  if (faceOnly) {
    return (
      <Svg width={size} height={size} viewBox="8 -20 104 108" aria-hidden>
        <OutfitBack look={outfit} />
        <HairBack />
        <Head pose={pose} equipped={equipped} />
      </Svg>
    );
  }
  const pet = showPet ? lookOf(equipped.pet) : undefined;
  const w = pet ? 124 : 120;
  return (
    <Svg width={size * (w / 120)} height={size * (152 / 120)} viewBox={`0 -12 ${w} 152`} aria-hidden>
      <Extra look={lookOf(equipped.extra)} layer="back" />
      <OutfitBack look={outfit} />
      <HairBack />
      <Outfit look={outfit} pose={pose} />
      <Props pose={pose} />
      <Head pose={pose} equipped={equipped} />
      <Extra look={lookOf(equipped.extra)} layer="front" />
      {pet && (pet.k === 'hamster' ? <HamsterArt x={84} y={98} s={0.6} /> : <PetArt look={pet} x={84} y={96} s={0.62} />)}
    </Svg>
  );
}

export { ButterflyShape };
