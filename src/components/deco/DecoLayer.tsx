import { View, type DimensionValue, type ViewStyle } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { ButterflyShape } from '@/components/illustrations';
import { useLayout, useReduceMotion } from '@/store/hooks';
import { css } from '@/components/ui/primitives';
import { FlowerShape, GardenCloud, LeafShape, PETALS } from './Garden';

const float = (dur: number, delay = 0, dist = 10): ViewStyle =>
  css({ animationKeyframes: [{ '0%': { transform: 'translateY(0)' }, '50%': { transform: `translateY(-${dist}px)` }, '100%': { transform: 'translateY(0)' } }], animationDuration: `${dur}s`, animationDelay: `${delay}s`, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' });
const drift = (dur: number, delay = 0): ViewStyle =>
  css({ animationKeyframes: [{ '0%': { transform: 'translateX(0)' }, '50%': { transform: 'translateX(24px)' }, '100%': { transform: 'translateX(0)' } }], animationDuration: `${dur}s`, animationDelay: `${delay}s`, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' });

type Pos = { top?: DimensionValue; bottom?: DimensionValue; left?: DimensionValue; right?: DimensionValue };

function Bit({ pos, w, h, vb, anim, children }: { pos: Pos; w: number; h: number; vb: string; anim?: ViewStyle | null; children: React.ReactNode }) {
  return (
    <View style={[{ position: 'absolute' }, pos, anim]}>
      <Svg width={w} height={h} viewBox={vb}>{children}</Svg>
    </View>
  );
}

/** Small flowers and leaves tucked along the screen edges (pos, kind, color index, size). */
const SPRINKLES: [Pos, 'flower' | 'leaf', number, number][] = [
  [{ top: '16%', left: 6 }, 'flower', 0, 16],
  [{ top: '24%', right: 8 }, 'leaf', 0, 20],
  [{ top: '33%', left: 10 }, 'leaf', 0, 18],
  [{ top: '41%', right: 6 }, 'flower', 1, 18],
  [{ top: '52%', left: 4 }, 'flower', 2, 14],
  [{ top: '60%', right: 10 }, 'leaf', 0, 18],
  [{ top: '69%', left: 8 }, 'flower', 3, 16],
  [{ top: '74%', right: 4 }, 'flower', 4, 14],
];
const DESKTOP_SPRINKLES: [Pos, 'flower' | 'leaf', number, number][] = [
  [{ top: '12%', left: '34%' }, 'flower', 1, 14],
  [{ top: '30%', right: '18%' }, 'flower', 0, 16],
  [{ top: '47%', left: '46%' }, 'leaf', 0, 18],
  [{ top: '58%', right: '30%' }, 'flower', 2, 14],
  [{ top: '20%', left: '62%' }, 'leaf', 0, 16],
];

/** Garden background: sky, drifting clouds, edge flowers, butterflies and hills. Decorative only. */
export function DecoLayer() {
  const { isMobile, isDesktop } = useLayout();
  const reduce = useReduceMotion();
  const hillH = isMobile ? 120 : 170;
  const flowersOnHill = isMobile ? [8, 24, 46, 66, 86] : [4, 14, 27, 40, 55, 68, 80, 92];
  return (
    <View pointerEvents="none" aria-hidden
      style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden' }, css({ position: 'fixed' })]}>
      <Bit pos={{ top: 18, right: '6%' }} w={isMobile ? 96 : 140} h={isMobile ? 48 : 70} vb="0 0 80 40" anim={reduce ? null : drift(26)}><GardenCloud /></Bit>
      <Bit pos={{ top: isMobile ? 150 : 120, left: -24 }} w={isMobile ? 80 : 120} h={isMobile ? 40 : 60} vb="0 0 80 40" anim={reduce ? null : drift(30, 4)}><GardenCloud /></Bit>
      <Bit pos={{ top: '46%', right: -20 }} w={isMobile ? 70 : 110} h={isMobile ? 35 : 55} vb="0 0 80 40" anim={reduce ? null : drift(34, 8)}><GardenCloud color="#F4FAFF" /></Bit>
      {isDesktop && <Bit pos={{ top: 60, left: '38%' }} w={110} h={55} vb="0 0 80 40" anim={reduce ? null : drift(28, 2)}><GardenCloud /></Bit>}

      {[...SPRINKLES, ...(isDesktop ? DESKTOP_SPRINKLES : [])].map(([pos, kind, c, size], i) => (
        <Bit key={i} pos={pos} w={size} h={size} vb="0 0 24 24" anim={reduce ? null : float(7 + (i % 4), i * 0.7, 4)}>
          {kind === 'flower' ? <FlowerShape color={PETALS[c]} outline={false} /> : <LeafShape x={2} y={6} rotate={i * 37} />}
        </Bit>
      ))}

      <Bit pos={{ top: isMobile ? 96 : 140, right: isMobile ? 18 : '24%' }} w={30} h={24} vb="0 0 30 24" anim={reduce ? null : float(6, 0, 12)}><ButterflyShape a="#FFC1D6" b="#D6C5F4" /></Bit>
      {!isMobile && <Bit pos={{ top: '58%', left: '22%' }} w={26} h={22} vb="0 0 30 24" anim={reduce ? null : float(8, 2, 12)}><ButterflyShape a="#C5E6FA" b="#FFE5AE" /></Bit>}

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: hillH }}>
        <Svg width="100%" height={hillH} viewBox="0 0 400 120" preserveAspectRatio="none">
          <Ellipse cx={90} cy={150} rx={210} ry={120} fill="#BFE8A0" />
          <Ellipse cx={330} cy={145} rx={220} ry={125} fill="#A4DC7E" />
        </Svg>
        {flowersOnHill.map((pct, i) => (
          <View key={pct} style={{ position: 'absolute', left: `${pct}%`, top: (isMobile ? 34 : 50) + ((i * 13) % 26) }}>
            <Svg width={isMobile ? 16 : 20} height={isMobile ? 16 : 20} viewBox="0 0 24 24"><FlowerShape color={PETALS[i % PETALS.length]} /></Svg>
          </View>
        ))}
        {flowersOnHill.map((pct, i) => (
          <View key={`g${pct}`} style={{ position: 'absolute', left: `${pct + 5}%`, top: (isMobile ? 46 : 64) + ((i * 7) % 18) }}>
            <Svg width={14} height={10} viewBox="0 0 14 10"><Path d="M1 9 L4 1 L7 9 M7 9 L10 2 L13 9" stroke="#6FBF4F" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></Svg>
          </View>
        ))}
      </View>
    </View>
  );
}
