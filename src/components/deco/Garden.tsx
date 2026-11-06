import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

/** Garden scenery pieces shared by the background, the home hero and empty states. */

export const PETALS = ['#FF9EC2', '#FFCE3A', '#B79CFF', '#FFB38A', '#8EC9FF'] as const;
const LINE = '#7A5848';

/** Five-petal flower centered in a 24×24 box. */
export function FlowerShape({ x = 0, y = 0, s = 1, color = '#FF9EC2', center = '#FFCE3A', outline = true }: {
  x?: number; y?: number; s?: number; color?: string; center?: string; outline?: boolean;
}) {
  const petals = [0, 72, 144, 216, 288].map((deg) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return { cx: 12 + 6.2 * Math.cos(a), cy: 12 + 6.2 * Math.sin(a) };
  });
  const stroke = outline ? { stroke: LINE, strokeWidth: 1.3 } : {};
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {petals.map((p, i) => <Circle key={i} cx={p.cx} cy={p.cy} r={5} fill={color} {...stroke} />)}
      <Circle cx={12} cy={12} r={4.2} fill={center} {...stroke} />
    </G>
  );
}

/** Flower on a stem, standing on y = 60 in a 24×60 box. */
export function StemFlower({ color = '#FF9EC2', height = 40 }: { color?: string; height?: number }) {
  const top = 60 - height;
  return (
    <G>
      <Path d={`M12 60 V${top + 10}`} stroke="#5BBF63" strokeWidth={3} strokeLinecap="round" />
      <Path d={`M12 ${top + height * 0.55} Q20 ${top + height * 0.4} 23 ${top + height * 0.5} Q18 ${top + height * 0.62} 12 ${top + height * 0.55} Z`} fill="#5BBF63" stroke={LINE} strokeWidth={1.1} />
      <FlowerShape x={0} y={top} color={color} />
    </G>
  );
}

/** Little sprout (a task that hasn't bloomed yet), standing on y = 60. */
export function Sprout() {
  return (
    <G>
      <Path d="M12 60 V44" stroke="#5BBF63" strokeWidth={3} strokeLinecap="round" />
      <Path d="M12 47 Q4 36 0 44 Q6 50 12 47 Z" fill="#5BBF63" stroke={LINE} strokeWidth={1.1} />
      <Path d="M12 45 Q20 34 24 42 Q18 48 12 45 Z" fill="#8FDB7A" stroke={LINE} strokeWidth={1.1} />
    </G>
  );
}

export function LeafShape({ x = 0, y = 0, s = 1, color = '#9BDB7A', rotate = 0 }: { x?: number; y?: number; s?: number; color?: string; rotate?: number }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${rotate} 10 6) scale(${s})`}>
      <Path d="M0 10 Q8 -2 20 2 Q12 14 0 10 Z" fill={color} stroke={LINE} strokeWidth={1.1} />
      <Path d="M1 10 L14 5" stroke={LINE} strokeWidth={0.9} opacity={0.6} />
    </G>
  );
}

/** Sunflower badge (used for the streak). 64×64. */
export function Sunflower({ value }: { value?: string }) {
  const petals = Array.from({ length: 12 }, (_, i) => (i * 30 * Math.PI) / 180);
  return (
    <G>
      {petals.map((a, i) => <Ellipse key={i} cx={32 + 21 * Math.cos(a)} cy={32 + 21 * Math.sin(a)} rx={9} ry={9} fill="#FFCE3A" stroke={LINE} strokeWidth={1.3} />)}
      <Circle cx={32} cy={32} r={19} fill="#8A5A3C" stroke={LINE} strokeWidth={1.4} />
      {value === undefined && [0, 1, 2, 3, 4, 5].map((i) => <Circle key={i} cx={32 + 10 * Math.cos(i)} cy={32 + 10 * Math.sin(i)} r={1.6} fill="#6E4530" />)}
    </G>
  );
}

/** Rolling hills with grass tufts and flowers. Drawn in a 400×120 box; stretch horizontally. */
export function Hills({ flowers = true }: { flowers?: boolean }) {
  return (
    <G>
      <Ellipse cx={90} cy={150} rx={210} ry={120} fill="#BFE8A0" />
      <Ellipse cx={330} cy={145} rx={220} ry={125} fill="#A4DC7E" />
      {[40, 130, 250, 350].map((gx) => <Path key={gx} d={`M${gx} 52 l3 -8 l3 8 m0 0 l4 -7 l3 7`} stroke="#6FBF4F" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
      {flowers && [[22, 70, 0], [96, 58, 1], [190, 66, 2], [290, 52, 3], [372, 62, 0], [150, 84, 4]].map(([fx, fy, c]) => (
        <FlowerShape key={fx} x={fx} y={fy} s={0.8} color={PETALS[c]} />
      ))}
    </G>
  );
}

export function GardenCloud({ color = '#FFFFFF' }: { color?: string }) {
  return (
    <G>
      <Ellipse cx={22} cy={27} rx={22} ry={13} fill={color} />
      <Ellipse cx={36} cy={19} rx={20} ry={19} fill={color} />
      <Ellipse cx={59} cy={25} rx={19} ry={15} fill={color} />
    </G>
  );
}

export function Hill({ width, height, flowers = true }: { width: number | string; height: number; flowers?: boolean }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 400 120" preserveAspectRatio="none">
      <Hills flowers={flowers} />
    </Svg>
  );
}
