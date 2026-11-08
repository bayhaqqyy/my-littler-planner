import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { ItemLook } from '@/domain';
import { Bloom, Heart, LN, shade } from './shapes';

const WOOD = '#D9A066', WOOD2 = '#B97F48', LEAF = '#6FC46A', LEAF2 = '#9BDB7A';
const lw = { stroke: LN, strokeWidth: 1.4 };

/** A garden decoration drawn in a 60×60 box, standing on y ≈ 54. */
export function GardenArt({ look }: { look: ItemLook }) {
  const a = look.a ?? '#FF9EC2';
  switch (look.k) {
    case 'bangku':
      return <G>
        {[12, 44].map((x) => <Rect key={x} x={x} y={40} width={5} height={14} rx={2} fill={WOOD2} {...lw} />)}
        {[22, 29].map((y) => <Rect key={y} x={6} y={y} width={48} height={6} rx={3} fill={WOOD} {...lw} />)}
        <Rect x={4} y={37} width={52} height={7} rx={3} fill={WOOD} {...lw} />
      </G>;
    case 'pagar':
      return <G>
        <Rect x={2} y={30} width={56} height={5} fill="#fff" {...lw} /><Rect x={2} y={42} width={56} height={5} fill="#fff" {...lw} />
        {[4, 16, 28, 40, 52].map((x) => <Path key={x} d={`M${x} 22 L${x + 4} 16 L${x + 8} 22 V54 H${x}Z`} transform={`translate(${-4} 0)`} fill="#fff" {...lw} />)}
      </G>;
    case 'pot':
      return <G>
        {[[20, '#FF9EC2'], [30, '#FFD45E'], [40, '#B79CFF']].map(([x, c]) => <G key={x as number}><Rect x={(x as number) - 1} y={18} width={2} height={16} fill={LEAF} /><Bloom cx={x as number} cy={16} r={7} color={c as string} /></G>)}
        <Path d="M14 34 H46 L41 54 H19Z" fill={a} {...lw} />
        <Rect x={12} y={31} width={36} height={7} rx={2} fill={shade(a, -0.08)} {...lw} />
      </G>;
    case 'tulip':
      return <G>
        {[[18, 30], [30, 22], [42, 30]].map(([x, top]) => <G key={x}>
          <Path d={`M${x} 54 V${top + 8}`} stroke={LEAF} strokeWidth={2.4} />
          <Path d={`M${x - 6} ${top + 2} Q${x - 6} ${top + 12} ${x} ${top + 12} Q${x + 6} ${top + 12} ${x + 6} ${top + 2} L${x + 3} ${top + 6} L${x} ${top} L${x - 3} ${top + 6}Z`} fill={a} stroke={shade(a, -0.3)} strokeWidth={1.2} />
        </G>)}
        <Path d="M16 54 Q12 44 18 40 Q20 48 22 54Z M44 54 Q48 44 42 40 Q40 48 38 54Z" fill={LEAF2} stroke={LEAF} strokeWidth={1} />
      </G>;
    case 'mawar':
    case 'semak': {
      const flower = look.k === 'mawar' ? a : look.a;
      return <G>
        {[[16, 40, 14], [30, 34, 16], [44, 40, 14], [30, 46, 14]].map(([x, y, r], i) => <Circle key={i} cx={x} cy={y} r={r} fill={i % 2 ? '#7FCB5B' : '#6FBF4F'} stroke="#4E9E4A" strokeWidth={1.2} />)}
        {flower && [[14, 36], [28, 26], [42, 34], [24, 44], [38, 46]].map(([x, y], i) => (
          look.k === 'mawar'
            ? <G key={i}><Circle cx={x} cy={y} r={4.4} fill={flower} stroke={shade(flower, -0.3)} strokeWidth={0.9} /><Path d={`M${x - 2} ${y} a2 2 0 1 1 2 2`} stroke={shade(flower, -0.3)} strokeWidth={0.8} fill="none" /></G>
            : <Bloom key={i} cx={x} cy={y} r={4} color={flower} />
        ))}
      </G>;
    }
    case 'batu':
      return <G>{[[6, 46, 18], [22, 40, 20], [38, 47, 18], [30, 32, 13]].map(([x, y, w], i) => <Ellipse key={i} cx={x + w / 2} cy={y + 4} rx={w / 2} ry={w * 0.3} fill="#DAD6E2" {...lw} />)}<Bloom cx={10} cy={36} r={5} color="#FFD45E" /></G>;
    case 'tikar':
      return <G>
        <Path d="M4 50 L14 34 H52 L58 50Z" fill="#FFD3E2" {...lw} />
        {[18, 28, 38, 48].map((x) => <Path key={x} d={`M${x - 2} 34 L${x - 6} 50`} stroke="#FF8FB8" strokeWidth={2.4} />)}
        <Path d="M24 28 H38 L36 38 H26Z M27 28 Q31 20 35 28" fill="#E7B97F" stroke={LN} strokeWidth={1.2} />
      </G>;
    case 'rumahburung':
      return <G>
        <Rect x={27} y={36} width={6} height={18} fill={WOOD2} {...lw} />
        <Rect x={16} y={18} width={28} height={20} rx={3} fill="#FFB3C9" {...lw} />
        <Path d="M12 20 L30 6 L48 20Z" fill="#FF5E7E" {...lw} strokeLinejoin="round" />
        <Circle cx={30} cy={27} r={4.4} fill={LN} />
      </G>;
    case 'ember':
      return <G>
        <Path d="M18 24 Q30 10 42 24" stroke={LN} strokeWidth={1.6} fill="none" />
        <Path d="M16 26 H44 L40 54 H20Z" fill={a} {...lw} />
        <Path d="M18 34 H42" stroke="#fff" strokeWidth={2} opacity={0.6} />
        <Bloom cx={30} cy={44} r={5} color="#fff" center={a} outline={false} />
      </G>;
    case 'papan':
      return <G>
        <Rect x={27} y={34} width={6} height={20} fill={WOOD2} {...lw} />
        <Rect x={8} y={14} width={44} height={22} rx={4} fill={WOOD} {...lw} />
        <Heart cx={30} cy={25} s={6} color="#FF7FAF" />
        <Bloom cx={10} cy={14} r={5} color="#FFD45E" />
      </G>;
    case 'kotaksurat':
      return <G>
        <Rect x={27} y={34} width={6} height={20} fill={WOOD2} {...lw} />
        <Path d="M12 36 V24 Q12 14 24 14 H48 V36Z" fill="#7CC8FF" {...lw} />
        <Path d="M24 14 Q12 14 12 24 V36 H24 V24 Q24 14 24 14Z" fill="#5EA9E0" {...lw} />
        <Path d="M48 18 V8 H56 V12 H48" fill="#FF5E7E" stroke={LN} strokeWidth={1.1} />
        <Rect x={30} y={22} width={12} height={8} rx={1} fill="#fff" {...lw} />
      </G>;
    case 'wortel':
      return <G>
        <Rect x={4} y={44} width={52} height={10} rx={5} fill="#C99A6E" {...lw} />
        {[14, 30, 46].map((x) => <G key={x}>
          <Path d={`M${x - 5} 46 L${x} 34 L${x + 5} 46Z`} fill="#FF9A3C" stroke="#D9701E" strokeWidth={1} transform={`rotate(180 ${x} 44)`} />
          <Path d={`M${x} 40 Q${x - 6} 28 ${x - 4} 26 M${x} 40 Q${x} 26 ${x + 2} 24 M${x} 40 Q${x + 6} 30 ${x + 7} 28`} stroke={LEAF} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        </G>)}
      </G>;
    case 'kursi':
      return <G>
        <Rect x={16} y={12} width={28} height={22} rx={6} fill={WOOD} {...lw} />
        <Rect x={12} y={32} width={36} height={8} rx={3} fill={WOOD} {...lw} />
        {[14, 42].map((x) => <Rect key={x} x={x} y={40} width={4} height={14} rx={2} fill={WOOD2} {...lw} />)}
        <Heart cx={30} cy={22} s={5} color="#FF9EC2" />
      </G>;
    case 'bungamatahari':
      return <G>
        <Path d="M30 54 V24" stroke={LEAF} strokeWidth={3} />
        <Path d="M30 42 Q40 34 46 40 Q38 46 30 42Z M30 46 Q20 38 14 44 Q22 50 30 46Z" fill={LEAF2} stroke={LEAF} strokeWidth={1} />
        {Array.from({ length: 12 }, (_, i) => { const t = (i * 30 * Math.PI) / 180; return <Ellipse key={i} cx={30 + 11 * Math.cos(t)} cy={18 + 11 * Math.sin(t)} rx={5.4} ry={3.2} fill="#FFCE3A" stroke="#E0A800" strokeWidth={0.9} transform={`rotate(${i * 30} ${30 + 11 * Math.cos(t)} ${18 + 11 * Math.sin(t)})`} />; })}
        <Circle cx={30} cy={18} r={8} fill="#8A5A3C" {...lw} />
      </G>;
    case 'jamur':
      return <G>
        {[[20, 1], [40, 0.8]].map(([x, k]) => <G key={x}>
          <Rect x={x - 5 * k} y={54 - 18 * k} width={10 * k} height={18 * k} rx={3} fill="#FFF1DC" {...lw} />
          <Path d={`M${x - 16 * k} ${54 - 16 * k} Q${x - 16 * k} ${54 - 34 * k} ${x} ${54 - 34 * k} Q${x + 16 * k} ${54 - 34 * k} ${x + 16 * k} ${54 - 16 * k}Z`} fill="#FF5E57" {...lw} />
          <Circle cx={x - 6 * k} cy={54 - 24 * k} r={3 * k} fill="#fff" /><Circle cx={x + 6 * k} cy={54 - 26 * k} r={2.4 * k} fill="#fff" />
        </G>)}
      </G>;
    case 'kaktus':
      return <G>
        <Path d="M18 42 H42 L39 54 H21Z" fill="#E58F65" {...lw} />
        <Path d="M24 42 V16 Q24 10 30 10 Q36 10 36 16 V42Z" fill="#7FCB5B" {...lw} />
        <Path d="M24 30 H18 Q14 30 14 26 V20" stroke="#7FCB5B" strokeWidth={6} fill="none" strokeLinecap="round" />
        <Path d="M36 26 H42 Q46 26 46 22 V18" stroke="#7FCB5B" strokeWidth={6} fill="none" strokeLinecap="round" />
        <Bloom cx={30} cy={10} r={5} color="#FF9EC2" />
      </G>;
    case 'kolam':
      return <G>
        <Ellipse cx={30} cy={42} rx={27} ry={12} fill="#9FD8F5" {...lw} />
        <Ellipse cx={22} cy={42} rx={7} ry={3.6} fill="#7FCB5B" stroke="#4E9E4A" strokeWidth={1} />
        <Bloom cx={38} cy={40} r={6} color="#FF9EC2" />
        <Path d="M12 48 Q18 46 24 48" stroke="#fff" strokeWidth={1.6} fill="none" />
      </G>;
    case 'lampu':
      return <G>
        <Circle cx={30} cy={16} r={14} fill="#FFF2B3" opacity={0.7} />
        <Rect x={28} y={24} width={4} height={30} rx={2} fill="#7A8C6E" {...lw} />
        <Path d="M22 10 H38 L40 26 H20Z" fill="#FFD45E" {...lw} />
        <Path d="M18 10 L30 2 L42 10Z" fill="#7A8C6E" {...lw} />
      </G>;
    case 'ayunan':
      return <G>
        <Path d="M6 54 L14 6 H46 L54 54" stroke={WOOD2} strokeWidth={3.4} fill="none" strokeLinecap="round" />
        <Path d="M22 6 V38 M38 6 V38" stroke={LN} strokeWidth={1.2} />
        <Rect x={18} y={37} width={24} height={6} rx={3} fill="#FF8FB8" {...lw} />
      </G>;
    case 'pohon':
      return <G>
        <Rect x={26} y={34} width={8} height={20} rx={3} fill={WOOD2} {...lw} />
        {[[16, 24, 14], [30, 14, 15], [44, 24, 14], [30, 28, 14]].map(([x, y, r], i) => <Circle key={i} cx={x} cy={y} r={r} fill={a === '#FFB3D0' ? (i % 2 ? '#FFC9DC' : '#FFB3D0') : (i % 2 ? '#7FCB5B' : '#6FBF4F')} stroke={a === '#FFB3D0' ? '#E58FB0' : '#4E9E4A'} strokeWidth={1.2} />)}
        {a !== '#FFB3D0' && [[18, 20], [34, 12], [42, 28], [26, 30], [30, 20]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={3.4} fill={a} stroke={shade(a, -0.3)} strokeWidth={0.9} />)}
        {a === '#FFB3D0' && [[18, 20], [34, 10], [44, 26], [24, 30]].map(([x, y], i) => <Bloom key={i} cx={x} cy={y} r={3.4} color="#fff" center="#FF8FB8" outline={false} />)}
      </G>;
    case 'meja':
      return <G>
        <Rect x={6} y={28} width={48} height={7} rx={2} fill={WOOD} {...lw} />
        <Path d="M12 35 L8 54 M48 35 L52 54 M4 44 H56" stroke={WOOD2} strokeWidth={3} strokeLinecap="round" />
        <Path d="M16 28 L22 20 H38 L44 28" fill="#FFD3E2" stroke={LN} strokeWidth={1} />
        <Circle cx={30} cy={22} r={4} fill="#FF6B7A" stroke={LN} strokeWidth={1} />
      </G>;
    case 'gerobak':
      return <G>
        {[[16, '#FF9EC2'], [26, '#FFD45E'], [36, '#B79CFF'], [44, '#FF7F9E']].map(([x, c]) => <Bloom key={x as number} cx={x as number} cy={20} r={6} color={c as string} />)}
        <Path d="M8 24 H52 L48 42 H12Z" fill={WOOD} {...lw} />
        <Circle cx={18} cy={46} r={7} fill="#fff" {...lw} /><Circle cx={42} cy={46} r={7} fill="#fff" {...lw} />
        <Path d="M52 26 L58 18" stroke={WOOD2} strokeWidth={3} strokeLinecap="round" />
      </G>;
    case 'orangsawah':
      return <G>
        <Path d="M30 54 V20 M14 30 H46" stroke={WOOD2} strokeWidth={3.4} strokeLinecap="round" />
        <Path d="M20 28 H40 L42 44 H18Z" fill="#9CC9F0" {...lw} />
        <Circle cx={30} cy={16} r={8} fill="#F7D488" {...lw} />
        <Ellipse cx={30} cy={9} rx={14} ry={3.4} fill="#F3C66B" {...lw} />
        <Circle cx={27} cy={16} r={1} fill={LN} /><Circle cx={33} cy={16} r={1} fill={LN} />
        <Path d="M27 19 Q30 21 33 19" stroke={LN} strokeWidth={1} fill="none" />
      </G>;
    case 'rumahlebah':
      return <G>
        <Rect x={27} y={40} width={6} height={14} fill={WOOD2} {...lw} />
        {[[14, 34, 32], [16, 26, 28], [18, 18, 24]].map(([x, y, w]) => <Rect key={y} x={x} y={y} width={w} height={9} rx={4} fill="#FFD45E" {...lw} />)}
        <Path d="M22 18 Q30 6 38 18Z" fill="#FFCE3A" {...lw} />
        <Circle cx={30} cy={32} r={2.4} fill={LN} />
        <Ellipse cx={48} cy={14} rx={3.4} ry={2.4} fill="#FFD45E" stroke={LN} strokeWidth={0.8} />
      </G>;
    case 'lampion':
      return <G>
        <Path d="M30 4 V12" stroke={LN} strokeWidth={1.2} />
        <Ellipse cx={30} cy={28} rx={14} ry={16} fill={a} {...lw} />
        {[22, 30, 38].map((x) => <Path key={x} d={`M${x} 13 Q${x + (x - 30) * 0.6} 28 ${x} 43`} stroke={shade(a, -0.25)} strokeWidth={1} fill="none" />)}
        <Rect x={24} y={10} width={12} height={4} rx={1} fill="#FFD45E" stroke={LN} strokeWidth={1} />
        <Rect x={24} y={42} width={12} height={4} rx={1} fill="#FFD45E" stroke={LN} strokeWidth={1} />
        <Path d="M30 46 V54" stroke="#FFD45E" strokeWidth={1.6} />
      </G>;
    case 'payungtaman':
      return <G>
        <Path d="M30 54 V12" stroke={LN} strokeWidth={2} />
        <Path d="M4 22 Q30 -4 56 22Z" fill="#FF8FB8" {...lw} />
        {[17, 30, 43].map((x) => <Path key={x} d={`M30 4 L${x} 22`} stroke="#fff" strokeWidth={1.4} />)}
        <Ellipse cx={30} cy={53} rx={14} ry={2.6} fill="#9CBF7E" />
      </G>;
    case 'jembatan':
      return <G>
        <Ellipse cx={30} cy={52} rx={28} ry={5} fill="#9FD8F5" />
        <Path d="M2 46 Q30 24 58 46" stroke={WOOD} strokeWidth={8} fill="none" />
        <Path d="M2 38 Q30 16 58 38" stroke={WOOD2} strokeWidth={2.4} fill="none" />
        {[10, 20, 30, 40, 50].map((x) => <Path key={x} d={`M${x} ${x === 30 ? 24 : x === 20 || x === 40 ? 27 : 34} V${x === 30 ? 36 : x === 20 || x === 40 ? 38 : 44}`} stroke={WOOD2} strokeWidth={2} />)}
      </G>;
    case 'tenda':
      return <G>
        <Path d="M4 54 L30 10 L56 54Z" fill="#FFB38A" {...lw} strokeLinejoin="round" />
        <Path d="M30 10 L22 54 H38Z" fill="#FFE3D2" stroke={LN} strokeWidth={1.2} />
        <Path d="M30 10 L30 4" stroke={LN} strokeWidth={1.4} />
        <Path d="M30 4 L38 7 L30 9Z" fill="#FF5E7E" />
      </G>;
    case 'sepeda':
      return <G>
        <Circle cx={14} cy={42} r={10} fill="none" {...lw} /><Circle cx={46} cy={42} r={10} fill="none" {...lw} />
        <Path d="M14 42 L24 26 H40 L46 42 M24 26 L30 42 L40 26 M38 20 H44" stroke="#7CC8FF" strokeWidth={2.4} fill="none" strokeLinejoin="round" />
        <Path d="M8 22 H22 L20 30 H10Z" fill="#E7B97F" stroke={LN} strokeWidth={1} />
        <Bloom cx={13} cy={20} r={4} color="#FF9EC2" /><Bloom cx={19} cy={20} r={4} color="#FFD45E" />
      </G>;
    case 'kincir':
      return <G>
        <Path d="M22 54 L26 24 H34 L38 54Z" fill="#FFF1DC" {...lw} />
        <Path d="M28 54 V44 Q30 41 32 44 V54Z" fill={WOOD} stroke={LN} strokeWidth={1} />
        {[0, 90, 180, 270].map((d, i) => <Path key={d} d="M30 20 L26 -2 L34 -2Z" fill={['#B79CFF', '#FF8FB8', '#7CC8FF', '#FFD45E'][i]} stroke={LN} strokeWidth={1.1} transform={`rotate(${d + 20} 30 20)`} />)}
        <Circle cx={30} cy={20} r={3} fill="#fff" {...lw} />
      </G>;
    case 'rumahjamur':
      return <G>
        <Rect x={16} y={28} width={28} height={26} rx={6} fill="#FFF1DC" {...lw} />
        <Path d="M25 54 V42 Q30 36 35 42 V54Z" fill={WOOD} stroke={LN} strokeWidth={1.1} />
        <Circle cx={22} cy={36} r={3} fill="#9FD8F5" stroke={LN} strokeWidth={1} />
        <Path d="M2 30 Q4 4 30 4 Q56 4 58 30Z" fill="#FF5E57" {...lw} />
        {[[14, 18, 5], [30, 10, 6], [46, 20, 4.5]].map(([x, y, r]) => <Circle key={x} cx={x} cy={y} r={r} fill="#fff" />)}
      </G>;
    case 'airmancur':
      return <G>
        <Ellipse cx={30} cy={48} rx={26} ry={7} fill="#DAD6E2" {...lw} />
        <Ellipse cx={30} cy={46} rx={20} ry={4} fill="#9FD8F5" />
        <Rect x={26} y={24} width={8} height={22} fill="#DAD6E2" {...lw} />
        <Ellipse cx={30} cy={24} rx={12} ry={4} fill="#DAD6E2" {...lw} />
        <Path d="M30 20 Q24 6 16 22 M30 20 Q36 6 44 22 M30 20 V4" stroke="#7CC8FF" strokeWidth={2} fill="none" strokeLinecap="round" />
      </G>;
    case 'gazebo':
      return <G>
        <Path d="M4 22 L30 4 L56 22Z" fill="#FF8FB8" {...lw} strokeLinejoin="round" />
        <Rect x={6} y={22} width={48} height={5} fill="#fff" {...lw} />
        {[10, 26, 34, 50].map((x) => <Rect key={x} x={x - 2} y={27} width={4} height={25} fill="#fff" {...lw} />)}
        <Rect x={4} y={50} width={52} height={5} rx={2} fill={WOOD} {...lw} />
        <Path d="M10 36 Q30 44 50 36" stroke={LEAF} strokeWidth={2} fill="none" />
        {[16, 30, 44].map((x) => <Bloom key={x} cx={x} cy={39} r={3.4} color="#FFD45E" />)}
      </G>;
    case 'balonudara':
      return <G>
        <Path d="M30 2 C46 2 52 14 50 24 C48 32 38 38 34 42 H26 C22 38 12 32 10 24 C8 14 14 2 30 2Z" fill="#FF8FB8" {...lw} />
        <Path d="M30 2 C24 10 24 32 27 42 M30 2 C36 10 36 32 33 42" stroke="#FFD45E" strokeWidth={3} fill="none" />
        <Path d="M26 42 L24 48 M34 42 L36 48" stroke={LN} strokeWidth={1} />
        <Rect x={22} y={47} width={16} height={9} rx={2} fill={WOOD} {...lw} />
      </G>;
    default:
      return <Bloom cx={30} cy={34} r={12} color={a} />;
  }
}
