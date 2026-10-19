import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/** Shared kawaii bits */
const INK = '#5B4560';
const BLUSH = '#FFB3C7';

type P = { size?: number };

export function Eye({ x, y, r = 3.2, closed }: { x: number; y: number; r?: number; closed?: boolean }) {
  if (closed) return <Path d={`M${x - r} ${y} Q${x} ${y + r * 1.1} ${x + r} ${y}`} stroke={INK} strokeWidth={1.6} fill="none" strokeLinecap="round" />;
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={r} ry={r * 1.15} fill={INK} />
      <Circle cx={x + r * 0.35} cy={y - r * 0.4} r={r * 0.38} fill="#fff" />
      <Circle cx={x - r * 0.35} cy={y + r * 0.45} r={r * 0.16} fill="#fff" />
    </G>
  );
}

export function Cheeks({ lx, rx, y, r = 3.4 }: { lx: number; rx: number; y: number; r?: number }) {
  return (
    <G opacity={0.75}>
      <Ellipse cx={lx} cy={y} rx={r} ry={r * 0.62} fill={BLUSH} />
      <Ellipse cx={rx} cy={y} rx={r} ry={r * 0.62} fill={BLUSH} />
    </G>
  );
}

export function Smile({ x, y, w = 4 }: { x: number; y: number; w?: number }) {
  return <Path d={`M${x - w / 2} ${y} Q${x - w / 4} ${y + w / 2.2} ${x} ${y} Q${x + w / 4} ${y + w / 2.2} ${x + w / 2} ${y}`} stroke={INK} strokeWidth={1.4} fill="none" strokeLinecap="round" />;
}

export function BunnyArt({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M22 22 C16 4 22 -2 26 4 C29 9 28 16 27 22Z" fill="#fff" stroke="#EBD7DF" strokeWidth={1.2} />
      <Path d="M24 18 C21 8 23 4 25 7 C27 10 26 15 26 19Z" fill="#FFD3E0" />
      <Path d="M34 22 C40 12 50 10 50 15 C50 19 42 22 37 25Z" fill="#fff" stroke="#EBD7DF" strokeWidth={1.2} />
      <Path d="M39 13 l4 -3 l1 5 l-5 0Z" fill="#F48FB1" />
      <Ellipse cx={30} cy={36} rx={17} ry={15} fill="#fff" stroke="#EBD7DF" strokeWidth={1.2} />
      <Eye x={24} y={35} r={2.4} />
      <Eye x={36} y={35} r={2.4} />
      <Cheeks lx={20} rx={40} y={40} r={2.8} />
      <Path d="M28.5 39 h3 l-1.5 1.6z" fill="#F48FB1" />
      <Smile x={30} y={41.5} w={3.4} />
      <Ellipse cx={30} cy={54} rx={12} ry={6} fill="#fff" stroke="#EBD7DF" strokeWidth={1.2} />
      <Circle cx={30} cy={49} r={4} fill="#FF9EC2" />
      <Circle cx={27.5} cy={47.5} r={2} fill="#FFC1D6" />
      <Path d="M30 52 v4" stroke="#8CCB9F" strokeWidth={1.4} />
    </G>
  );
}

export function KittyArt({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M13 26 L15 9 L26 18Z" fill="#F6E7CF" stroke="#E5CFAE" strokeWidth={1.2} strokeLinejoin="round" />
      <Path d="M47 26 L45 9 L34 18Z" fill="#F6E7CF" stroke="#E5CFAE" strokeWidth={1.2} strokeLinejoin="round" />
      <Path d="M16 20 L17 13 L22 18Z" fill="#FFD3E0" />
      <Path d="M44 9 l4 2 l-3 3z" fill="#F48FB1" />
      <Ellipse cx={30} cy={34} rx={19} ry={15.5} fill="#F6E7CF" stroke="#E5CFAE" strokeWidth={1.2} />
      <Eye x={23} y={33} r={2.4} closed />
      <Eye x={37} y={33} r={2.4} closed />
      <Cheeks lx={19} rx={41} y={38} r={2.8} />
      <Path d="M28.5 37 h3 l-1.5 1.5z" fill="#E8A0AE" />
      <Smile x={30} y={39.3} w={3.4} />
      <Path d="M10 35 h6 M10 38 l6 -1 M50 35 h-6 M50 38 l-6 -1" stroke="#D9C2A0" strokeWidth={0.9} strokeLinecap="round" />
    </G>
  );
}

export function BearArt({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Circle cx={15} cy={18} r={7} fill="#E7C4A0" stroke="#D3AB84" strokeWidth={1.2} />
      <Circle cx={45} cy={18} r={7} fill="#E7C4A0" stroke="#D3AB84" strokeWidth={1.2} />
      <Circle cx={15} cy={18} r={3.5} fill="#F5DCC4" />
      <G transform="translate(45 13)">
        {[0, 72, 144, 216, 288].map((a) => <Ellipse key={a} cx={0} cy={-3} rx={2.2} ry={3} fill="#FFB3C7" transform={`rotate(${a})`} />)}
        <Circle r={1.8} fill="#FFE27A" />
      </G>
      <Ellipse cx={30} cy={33} rx={18} ry={16} fill="#E7C4A0" stroke="#D3AB84" strokeWidth={1.2} />
      <Ellipse cx={30} cy={39} rx={7.5} ry={5.5} fill="#F5DCC4" />
      <Eye x={23} y={31} r={2.3} />
      <Eye x={37} y={31} r={2.3} />
      <Cheeks lx={19} rx={41} y={37} r={2.6} />
      <Ellipse cx={30} cy={37} rx={2} ry={1.4} fill={INK} />
      <Smile x={30} y={40} w={3.2} />
    </G>
  );
}

export function ChickArt({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M30 8 c2 -4 5 -3 4 0 M30 8 c-2 -5 -6 -3 -3 1" stroke="#F2C94C" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <Ellipse cx={30} cy={28} rx={15} ry={15} fill="#FFE27A" stroke="#F2C94C" strokeWidth={1.2} />
      <Eye x={24.5} y={26} r={2.2} />
      <Eye x={35.5} y={26} r={2.2} />
      <Cheeks lx={21} rx={39} y={31} r={2.5} />
      <Path d="M27.5 30 L32.5 30 L30 33.5Z" fill="#FFA36C" />
      <Path d="M12 38 L17 33 L22 38 L27 33 L32 38 L37 33 L42 38 L47 33 L49 38 C49 52 42 56 30 56 C18 56 11 52 12 38Z" fill="#FFFDF7" stroke="#EADFCB" strokeWidth={1.2} strokeLinejoin="round" />
      <Circle cx={21} cy={46} r={2} fill="#C3B0EE" />
      <Circle cx={37} cy={49} r={2.4} fill="#9CD3F5" />
      <Circle cx={30} cy={44} r={1.5} fill="#F7A8C4" />
    </G>
  );
}

export function SheepArt({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  const puffs = [[16, 26], [22, 18], [30, 15], [38, 18], [44, 26], [44, 36], [38, 44], [30, 46], [22, 44], [16, 36]];
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {puffs.map(([cx, cy], i) => <Circle key={i} cx={cx} cy={cy} r={8} fill="#fff" stroke="#E7E3EE" strokeWidth={1.2} />)}
      <Ellipse cx={30} cy={31} rx={15} ry={14} fill="#fff" />
      <Ellipse cx={30} cy={33} rx={10} ry={9.5} fill="#F7E9E0" stroke="#E8D5C8" strokeWidth={1} />
      <Ellipse cx={18} cy={30} rx={4} ry={2.4} fill="#F7E9E0" transform="rotate(-25 18 30)" />
      <Ellipse cx={42} cy={30} rx={4} ry={2.4} fill="#F7E9E0" transform="rotate(25 42 30)" />
      <Eye x={26} y={32} r={1.9} />
      <Eye x={34} y={32} r={1.9} />
      <Cheeks lx={23} rx={37} y={36} r={2.1} />
      <Smile x={30} y={37} w={2.8} />
      <Path d="M36 17 l4 -3 l1 4 l4 -1 l-3 4z" fill="#F48FB1" />
    </G>
  );
}

export function TulipArt({ x = 0, y = 0, s = 1, color = '#FF9EC2', face = true }: { x?: number; y?: number; s?: number; color?: string; face?: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M20 30 C20 40 20 48 20 58" stroke="#8CCB9F" strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M20 50 C12 46 8 40 9 36 C15 38 19 43 20 50Z" fill="#A8DABD" />
      <Path d="M20 46 C27 42 31 37 31 33 C25 35 21 40 20 46Z" fill="#A8DABD" />
      <Path d="M8 12 L14 18 L20 8 L26 18 L32 12 C33 26 28 32 20 32 C12 32 7 26 8 12Z" fill={color} stroke="#fff" strokeOpacity={0.6} strokeWidth={1} />
      {face && (
        <G>
          <Eye x={16.5} y={22} r={1.4} closed />
          <Eye x={23.5} y={22} r={1.4} closed />
          <Cheeks lx={14} rx={26} y={25} r={1.7} />
          <Smile x={20} y={25.5} w={2.4} />
        </G>
      )}
    </G>
  );
}

export function DaisyArt({ x = 0, y = 0, s = 1, center = '#FFE27A' }: { x?: number; y?: number; s?: number; center?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {Array.from({ length: 8 }, (_, i) => <Ellipse key={i} cx={20} cy={11} rx={4.2} ry={7.5} fill="#fff" stroke="#F3E1E8" strokeWidth={0.8} transform={`rotate(${i * 45} 20 20)`} />)}
      <Circle cx={20} cy={20} r={6.5} fill={center} />
      <Eye x={17.8} y={19.5} r={1} closed />
      <Eye x={22.2} y={19.5} r={1} closed />
      <Smile x={20} y={22} w={2} />
    </G>
  );
}

export function HeartShape({ x = 0, y = 0, s = 1, color = '#FFB3C7' }: { x?: number; y?: number; s?: number; color?: string }) {
  return <Path transform={`translate(${x} ${y}) scale(${s})`} d="M10 17 C2 11 0 7 2 4 C4 0 9 1 10 5 C11 1 16 0 18 4 C20 7 18 11 10 17Z" fill={color} />;
}

export function StarShape({ x = 0, y = 0, s = 1, color = '#FFE27A' }: { x?: number; y?: number; s?: number; color?: string }) {
  return <Path transform={`translate(${x} ${y}) scale(${s})`} d="M10 1 L12.6 7 L19 7.6 L14.2 11.8 L15.7 18.2 L10 14.8 L4.3 18.2 L5.8 11.8 L1 7.6 L7.4 7Z" fill={color} strokeLinejoin="round" />;
}

export function SparkleShape({ x = 0, y = 0, s = 1, color = '#FFFFFF' }: { x?: number; y?: number; s?: number; color?: string }) {
  return <Path transform={`translate(${x} ${y}) scale(${s})`} d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0Z" fill={color} />;
}

export function CloudShape({ x = 0, y = 0, s = 1, color = '#FFFFFF' }: { x?: number; y?: number; s?: number; color?: string }) {
  return <Path transform={`translate(${x} ${y}) scale(${s})`} d="M10 30 C2 30 0 22 6 19 C5 11 14 7 19 12 C22 4 35 4 37 13 C45 11 50 19 46 24 C51 27 48 30 44 30Z" fill={color} />;
}

export function ButterflyShape({ x = 0, y = 0, s = 1, a = '#D6C5F4', b = '#FFC1D6' }: { x?: number; y?: number; s?: number; a?: string; b?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Ellipse cx={8} cy={8} rx={7} ry={6} fill={a} transform="rotate(-25 8 8)" />
      <Ellipse cx={22} cy={8} rx={7} ry={6} fill={a} transform="rotate(25 22 8)" />
      <Ellipse cx={9} cy={17} rx={5} ry={4} fill={b} />
      <Ellipse cx={21} cy={17} rx={5} ry={4} fill={b} />
      <Rect x={14} y={5} width={2} height={16} rx={1} fill={INK} />
    </G>
  );
}

export function Bunny({ size = 60 }: P) {
  return <Svg width={size} height={size} viewBox="0 0 60 62" aria-hidden><BunnyArt /></Svg>;
}
export function Kitty({ size = 60 }: P) {
  return <Svg width={size} height={size} viewBox="0 0 60 56" aria-hidden><KittyArt /></Svg>;
}
export function Bear({ size = 60 }: P) {
  return <Svg width={size} height={size} viewBox="0 0 60 54" aria-hidden><BearArt /></Svg>;
}
export function Chick({ size = 60 }: P) {
  return <Svg width={size} height={size} viewBox="0 0 60 60" aria-hidden><ChickArt /></Svg>;
}
export function Sheep({ size = 60 }: P) {
  return <Svg width={size} height={size} viewBox="0 0 60 58" aria-hidden><SheepArt /></Svg>;
}
export function Tulip({ size = 40, color }: P & { color?: string }) {
  return <Svg width={size * 0.67} height={size} viewBox="0 0 40 60" aria-hidden><TulipArt color={color} /></Svg>;
}
export function Daisy({ size = 40 }: P) {
  return <Svg width={size} height={size} viewBox="0 0 40 40" aria-hidden><DaisyArt /></Svg>;
}

export function Flame({ size = 40, active = true }: P & { active?: boolean }) {
  const outer = active ? '#FF9A76' : '#D5CFD8';
  const inner = active ? '#FFC48F' : '#E7E2EA';
  const core = active ? '#FFE27A' : '#F2EFF4';
  return (
    <Svg width={size} height={size} viewBox="0 0 40 44" aria-hidden>
      <Path d="M20 2 C24 10 34 14 34 27 C34 36 28 42 20 42 C12 42 6 36 6 27 C6 20 10 16 13 12 C14 18 16 20 18 20 C17 12 18 7 20 2Z" fill={outer} />
      <Path d="M20 14 C23 20 29 23 29 30 C29 36 25 39 20 39 C15 39 11 36 11 30 C11 25 15 22 20 14Z" fill={inner} />
      <Path d="M20 24 C22 28 25 30 25 33 C25 36 23 38 20 38 C17 38 15 36 15 33 C15 30 18 28 20 24Z" fill={core} />
      <Eye x={16.5} y={30} r={1.5} closed={!active} />
      <Eye x={23.5} y={30} r={1.5} closed={!active} />
      {active && <Cheeks lx={14} rx={26} y={33} r={1.6} />}
      <Smile x={20} y={33.5} w={2.4} />
    </Svg>
  );
}
