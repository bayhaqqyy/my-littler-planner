import { Circle, Ellipse, G, Path } from 'react-native-svg';
import type { ItemLook } from '@/domain';
import { LN, Star, shade } from './shapes';

/** A companion animal drawn in a 60×60 box (body centered near (30, 36)). */
export function PetArt({ look, x = 0, y = 0, s = 1 }: { look: ItemLook; x?: number; y?: number; s?: number }) {
  const k = look.k;
  const a = look.a ?? '#FFFFFF';
  const line = shade(a === '#FFFFFF' || a === '#F4F4FA' ? '#D9D2E6' : a, -0.3);
  const st = { stroke: line, strokeWidth: 1.4 };
  const dark = k === 'kucing' && a === '#5A5268';
  const eyeColor = dark ? '#FFE27A' : LN;

  const body = () => {
    switch (k) {
      case 'paus':
        return <G>
          <Path d="M8 38 Q8 20 30 20 Q50 20 52 34 L58 26 L58 44 L52 40 Q48 52 30 52 Q8 52 8 38Z" fill={a} {...st} />
          <Path d="M12 42 Q30 50 48 42 Q40 50 30 50 Q18 50 12 42Z" fill="#E8F4FF" />
          <Path d="M26 14 q-2 -6 2 -8 M30 14 q0 -6 0 -9 M34 14 q2 -6 -2 -8" stroke="#9CCFF0" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </G>;
      case 'domba':
        return <G>
          {[[14, 30], [22, 20], [38, 20], [46, 30], [16, 44], [44, 44], [30, 50], [30, 18]].map(([cx, cy], i) => <Circle key={i} cx={cx} cy={cy} r={9} fill={a} {...st} />)}
          <Circle cx={30} cy={34} r={14} fill={a} />
          <Ellipse cx={30} cy={36} rx={10} ry={11} fill="#5E5468" />
        </G>;
      case 'penguin':
        return <G>
          <Ellipse cx={30} cy={36} rx={17} ry={18} fill={a} {...st} />
          <Ellipse cx={30} cy={40} rx={11} ry={13} fill="#fff" />
          <Ellipse cx={13} cy={40} rx={4} ry={8} fill={a} transform="rotate(20 13 40)" />
          <Ellipse cx={47} cy={40} rx={4} ry={8} fill={a} transform="rotate(-20 47 40)" />
        </G>;
      case 'landak':
        return <G>
          <Path d="M8 42 L4 30 L12 30 L8 18 L18 24 L20 10 L28 20 L34 8 L38 20 L46 12 L46 26 L56 22 L50 34 L58 40 Z" fill={shade(a, -0.25)} stroke={shade(a, -0.4)} strokeWidth={1.2} strokeLinejoin="round" />
          <Ellipse cx={30} cy={38} rx={16} ry={14} fill="#F6E1C8" {...st} />
        </G>;
      case 'tupai':
        return <G>
          <Path d="M42 50 C60 46 60 20 46 14 C40 12 38 20 44 24 C52 30 46 42 40 44Z" fill={shade(a, 0.1)} {...st} />
          <Ellipse cx={28} cy={36} rx={16} ry={16} fill={a} {...st} />
          <Ellipse cx={28} cy={42} rx={9} ry={8} fill="#FBE6CF" />
        </G>;
      case 'rubah':
        return <G>
          <Path d="M42 48 C60 48 60 30 50 26 C52 36 46 42 38 44Z" fill={a} {...st} />
          <Path d="M50 30 C52 34 50 38 46 40" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" />
          <Ellipse cx={28} cy={36} rx={17} ry={16} fill={a} {...st} />
          <Path d="M14 38 Q28 54 42 38 Q36 50 28 50 Q20 50 14 38Z" fill="#fff" />
        </G>;
      default: {
        const big = k === 'koala' || k === 'hamster' || k === 'singa';
        return <G>
          {k === 'singa' && <Circle cx={30} cy={34} r={22} fill="#E8A040" stroke="#C07A28" strokeWidth={1.4} />}
          <Ellipse cx={30} cy={36} rx={big ? 18 : 17} ry={big ? 17 : 16} fill={a} {...st} />
          {(k === 'hamster' || k === 'ayam' || k === 'bebek' || k === 'beruang') && <Ellipse cx={30} cy={43} rx={10} ry={8} fill={shade(a, 0.45)} />}
        </G>;
      }
    }
  };

  const ears = () => {
    switch (k) {
      case 'kelinci': case 'unicorn':
        if (k === 'unicorn') return <G>
          <Path d="M17 24 L16 12 L25 20Z M43 24 L44 12 L35 20Z" fill={a} {...st} />
          <Path d="M27 20 L30 2 L33 20Z" fill="#FFE27A" stroke="#E0B030" strokeWidth={1.1} />
          <Path d="M34 18 Q46 12 50 22 Q46 20 44 26 Q42 20 36 22Z" fill="#FFB3D0" />
          <Path d="M36 22 Q48 22 48 32 Q44 28 40 30Z" fill="#C3B0EE" />
        </G>;
        return <G>
          <Ellipse cx={22} cy={12} rx={5} ry={13} fill={a} {...st} transform="rotate(-8 22 12)" />
          <Ellipse cx={38} cy={12} rx={5} ry={13} fill={a} {...st} transform="rotate(8 38 12)" />
          <Ellipse cx={22} cy={13} rx={2.2} ry={9} fill="#FFC2D6" transform="rotate(-8 22 13)" />
          <Ellipse cx={38} cy={13} rx={2.2} ry={9} fill="#FFC2D6" transform="rotate(8 38 13)" />
        </G>;
      case 'kucing': case 'rubah': case 'babi':
        return <G>
          <Path d={k === 'babi' ? 'M15 26 L14 14 L25 21Z M45 26 L46 14 L35 21Z' : 'M14 28 L13 10 L27 20Z M46 28 L47 10 L33 20Z'} fill={a} {...st} strokeLinejoin="round" />
          <Path d={k === 'babi' ? 'M17 23 L17 17 L22 21Z M43 23 L43 17 L38 21Z' : 'M17 24 L17 15 L24 20Z M43 24 L43 15 L36 20Z'} fill={k === 'rubah' ? LN : '#FFC2D6'} opacity={k === 'rubah' ? 0.7 : 1} />
        </G>;
      case 'beruang': case 'hamster': case 'tupai': case 'singa':
        return <G>
          <Circle cx={k === 'tupai' ? 18 : 16} cy={22} r={k === 'hamster' ? 5.5 : 7} fill={a} {...st} />
          <Circle cx={k === 'tupai' ? 38 : 44} cy={22} r={k === 'hamster' ? 5.5 : 7} fill={a} {...st} />
          <Circle cx={k === 'tupai' ? 18 : 16} cy={22} r={3.4} fill="#FFC9C9" />
          <Circle cx={k === 'tupai' ? 38 : 44} cy={22} r={3.4} fill="#FFC9C9" />
        </G>;
      case 'koala':
        return <G>
          <Circle cx={12} cy={24} r={10} fill={a} {...st} /><Circle cx={12} cy={24} r={5.5} fill="#F2EEF6" />
          <Circle cx={48} cy={24} r={10} fill={a} {...st} /><Circle cx={48} cy={24} r={5.5} fill="#F2EEF6" />
        </G>;
      case 'anjing':
        return <G>
          <Ellipse cx={14} cy={32} rx={6} ry={11} fill={shade(a, -0.18)} {...st} transform="rotate(18 14 32)" />
          <Ellipse cx={46} cy={32} rx={6} ry={11} fill={shade(a, -0.18)} {...st} transform="rotate(-18 46 32)" />
        </G>;
      case 'rusa':
        return <G>
          <Path d="M20 22 L14 6 M16 12 L8 10 M17 16 L24 8 M40 22 L46 6 M44 12 L52 10 M43 16 L36 8" stroke="#B97F48" strokeWidth={2.6} strokeLinecap="round" fill="none" />
          <Ellipse cx={14} cy={26} rx={6} ry={3.5} fill={a} {...st} /><Ellipse cx={46} cy={26} rx={6} ry={3.5} fill={a} {...st} />
        </G>;
      case 'naga':
        return <G>
          <Path d="M8 36 Q0 22 10 18 Q10 28 16 30Z M52 36 Q60 22 50 18 Q50 28 44 30Z" fill="#C3E8B0" stroke={line} strokeWidth={1.2} />
          <Path d="M20 22 L18 10 L26 20Z M40 22 L42 10 L34 20Z" fill="#FFE27A" stroke="#E0B030" strokeWidth={1.1} />
        </G>;
      case 'burungapi':
        return <G>
          <Path d="M26 20 Q24 8 30 2 Q32 10 36 6 Q36 14 34 20Z" fill="#FFD45E" stroke="#E08A00" strokeWidth={1.1} />
          <Path d="M10 40 Q0 32 4 22 Q10 30 16 32Z M50 40 Q60 32 56 22 Q50 30 44 32Z" fill="#FFB347" stroke="#E07020" strokeWidth={1.1} />
        </G>;
      case 'lebah':
        return <G>
          <Ellipse cx={18} cy={16} rx={8} ry={10} fill="#E9F7FF" stroke="#9CCFF0" strokeWidth={1.1} />
          <Ellipse cx={42} cy={16} rx={8} ry={10} fill="#E9F7FF" stroke="#9CCFF0" strokeWidth={1.1} />
          <Path d="M24 22 Q22 12 18 10 M36 22 Q38 12 42 10" stroke={LN} strokeWidth={1.3} fill="none" />
          <Circle cx={18} cy={10} r={2} fill={LN} /><Circle cx={42} cy={10} r={2} fill={LN} />
        </G>;
      case 'kodok':
        return <G>
          {[18, 42].map((cx) => <G key={cx}><Circle cx={cx} cy={22} r={8} fill={a} {...st} /><Circle cx={cx} cy={22} r={4.6} fill="#fff" /></G>)}
        </G>;
      case 'ayam':
        return <Path d="M26 22 Q27 14 30 18 Q32 12 34 20" stroke={line} strokeWidth={1.4} fill="none" strokeLinecap="round" />;
      case 'bebek':
        return <Path d="M28 20 Q30 14 32 20" stroke={line} strokeWidth={1.4} fill="none" strokeLinecap="round" />;
      default:
        return null;
    }
  };

  const face = () => {
    const ey = k === 'paus' ? 34 : k === 'domba' ? 34 : k === 'kodok' ? 22 : 34;
    const ex = k === 'kodok' ? [18, 42] : k === 'paus' ? [20, 34] : [23, 37];
    const eyeFill = k === 'domba' ? '#fff' : eyeColor;
    return (
      <G>
        {ex.map((cx) => <G key={cx}>
          <Ellipse cx={cx} cy={ey} rx={2.6} ry={3.2} fill={eyeFill} />
          {k !== 'domba' && <Circle cx={cx + 0.8} cy={ey - 1} r={0.9} fill="#fff" />}
        </G>)}
        {k !== 'domba' && <G>
          <Ellipse cx={k === 'kodok' ? 16 : 18} cy={k === 'kodok' ? 36 : 41} rx={3.4} ry={2} fill="#FFA3BC" opacity={0.85} />
          <Ellipse cx={k === 'kodok' ? 44 : 42} cy={k === 'kodok' ? 36 : 41} rx={3.4} ry={2} fill="#FFA3BC" opacity={0.85} />
        </G>}
        {k === 'ayam' && <Path d="M27 39 L33 39 L30 43Z" fill="#FF9A3C" stroke="#D9701E" strokeWidth={0.9} strokeLinejoin="round" />}
        {k === 'bebek' && <Ellipse cx={30} cy={40} rx={5} ry={2.4} fill="#FF9A3C" stroke="#D9701E" strokeWidth={0.9} />}
        {k === 'penguin' && <Path d="M27 39 L33 39 L30 43Z" fill="#FFB347" />}
        {k === 'burungapi' && <Path d="M27 39 L33 39 L30 44Z" fill="#FFD45E" stroke="#E08A00" strokeWidth={0.9} />}
        {k === 'babi' && <G><Ellipse cx={30} cy={41} rx={5.4} ry={3.8} fill="#FF9EB5" stroke={line} strokeWidth={1} /><Circle cx={28} cy={41} r={1} fill={LN} /><Circle cx={32} cy={41} r={1} fill={LN} /></G>}
        {k === 'koala' && <Ellipse cx={30} cy={40} rx={4} ry={5} fill="#4A4458" />}
        {(k === 'beruang' || k === 'anjing' || k === 'singa' || k === 'rusa') && <G><Ellipse cx={30} cy={41} rx={6.4} ry={4.6} fill={shade(a, 0.4)} stroke={line} strokeWidth={0.9} /><Ellipse cx={30} cy={39.5} rx={2.4} ry={1.7} fill={LN} /></G>}
        {(k === 'kucing' || k === 'rubah' || k === 'kelinci' || k === 'unicorn' || k === 'hamster' || k === 'tupai' || k === 'landak' || k === 'lebah' || k === 'naga') && <G>
          <Path d="M29 39 L31 39 L30 40.4Z" fill={k === 'naga' ? '#4E9E4A' : '#FF8FA8'} />
          <Path d="M27 42 Q28.5 43.6 30 42 Q31.5 43.6 33 42" stroke={dark ? '#FFE27A' : LN} strokeWidth={1} fill="none" strokeLinecap="round" />
        </G>}
        {k === 'kucing' && <Path d="M10 38 L18 39 M10 42 L18 41 M50 38 L42 39 M50 42 L42 41" stroke={dark ? '#C9C2D6' : LN} strokeWidth={0.8} />}
        {(k === 'kodok' || k === 'paus') && <Path d={k === 'kodok' ? 'M22 40 Q30 46 38 40' : 'M24 42 Q27 44 30 42'} stroke={LN} strokeWidth={1.2} fill="none" strokeLinecap="round" />}
        {k === 'domba' && <Path d="M27 42 Q30 44 33 42" stroke="#fff" strokeWidth={1} fill="none" />}
        {k === 'lebah' && <G>{[22, 36].map((x0) => <Path key={x0} d={`M${x0 - 6} 48 Q${x0} 52 ${x0 + 6} 48`} stroke={LN} strokeWidth={3} fill="none" opacity={0.85} />)}</G>}
        {k === 'naga' && <Path d="M24 46 L27 50 L30 46 L33 50 L36 46" stroke="#C3E8B0" strokeWidth={1.4} fill="none" />}
        {k === 'unicorn' && <Star cx={46} cy={46} r={2.6} color="#FFE27A" />}
        {k === 'anjing' && <Ellipse cx={38} cy={30} rx={4} ry={3} fill={shade(a, -0.18)} opacity={0.8} />}
        {k === 'rusa' && <G><Circle cx={18} cy={46} r={1.4} fill="#fff" /><Circle cx={42} cy={47} r={1.4} fill="#fff" /><Circle cx={22} cy={50} r={1.1} fill="#fff" /></G>}
      </G>
    );
  };

  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {ears()}
      {body()}
      {face()}
    </G>
  );
}

