import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { ItemLook } from '@/domain';
import { Bloom, Butterfly, Cloud, Heart, LN, RAINBOW, Star, Strawberry, shade } from './shapes';

/*
 * Mini's layers, drawn in the avatar's 120-wide box: head centered at (60, 58), eyes at y 61,
 * hair top near y 14, torso y 86–122, hands at (37, 113) and (83, 113).
 */

const TOP = 'M45 86 L75 86 Q80 86 80 92 L81 121 Q60 125 39 121 L40 92 Q40 86 45 86Z';
const SKIRT = 'M47 86 L73 86 Q76 86 77 90 L88 121 Q60 128 32 121 L43 90 Q44 86 47 86Z';
const SKIRT_SPOTS: [number, number][] = [[52, 98], [67, 97], [59, 108], [45, 115], [74, 113], [60, 120], [83, 119], [37, 119]];
const TOP_SPOTS: [number, number][] = [[50, 98], [69, 97], [59, 108], [47, 115], [72, 114]];

const isSkirt = (k: string) => k === 'dress' || k === 'kimono' || k === 'tutu';

/* ───────── Outfit ───────── */

function Motif({ kind, x, y, s, base }: { kind?: string; x: number; y: number; s: number; base: string }) {
  switch (kind) {
    case 'hati': return <Heart cx={x} cy={y} s={s} color="#fff" stroke={false} />;
    case 'bintang': return <Star cx={x} cy={y} r={s} color="#FFE27A" />;
    case 'stroberi': return <Strawberry cx={x} cy={y} s={s * 0.9} />;
    case 'bunga': return <Bloom cx={x} cy={y} r={s} color="#fff" center="#FFD45E" outline={false} />;
    case 'sakura': return <Bloom cx={x} cy={y} r={s * 0.9} color="#fff" center="#FF9EC2" outline={false} />;
    case 'dots': return <Circle cx={x} cy={y} r={s * 0.55} fill="#fff" />;
    case 'matahari': return <Bloom cx={x} cy={y} r={s} color="#FFB627" center="#8A5A3C" outline={false} />;
    case 'awan': return <Cloud cx={x} cy={y} s={s * 0.9} />;
    case 'kilau': return <Star cx={x} cy={y} r={s * 0.8} color="#fff" stroke={false} inner={0.3} />;
    case 'galaksi': return <Star cx={x} cy={y} r={s * 0.7} color="#FFE27A" stroke={false} />;
    case 'domba': return <G>{[[-1, 0], [1, 0], [0, -0.9], [0, 0.6]].map(([dx, dy], i) => <Circle key={i} cx={x + dx * s * 0.6} cy={y + dy * s * 0.5} r={s * 0.55} fill="#fff" />)}</G>;
    default: return base ? null : null;
  }
}

/** Behind the head: hoods and their ears. */
export function OutfitBack({ look }: { look: ItemLook }) {
  if (look.k === 'hoodie') {
    const c = look.a ?? '#F2E2C9';
    const ears = look.b;
    return (
      <G>
        <Path d="M24 64 C20 30 38 10 60 10 C82 10 100 30 96 64 L96 90 L24 90Z" fill={c} stroke={shade(c, -0.25)} strokeWidth={1.4} />
        {ears === 'kucing' && <Path d="M30 30 L28 6 L48 18Z M90 30 L92 6 L72 18Z" fill={c} stroke={shade(c, -0.25)} strokeWidth={1.4} strokeLinejoin="round" />}
        {ears === 'kelinci' && <G>
          <Ellipse cx={42} cy={2} rx={7} ry={18} fill={c} stroke={shade(c, -0.25)} strokeWidth={1.4} transform="rotate(-12 42 2)" />
          <Ellipse cx={78} cy={2} rx={7} ry={18} fill={c} stroke={shade(c, -0.25)} strokeWidth={1.4} transform="rotate(12 78 2)" />
          <Ellipse cx={42} cy={4} rx={3} ry={12} fill="#FFC2D6" transform="rotate(-12 42 4)" />
          <Ellipse cx={78} cy={4} rx={3} ry={12} fill="#FFC2D6" transform="rotate(12 78 4)" />
        </G>}
        {ears === 'beruang' && <G>
          <Circle cx={32} cy={18} r={9} fill={c} stroke={shade(c, -0.25)} strokeWidth={1.4} /><Circle cx={32} cy={18} r={4.5} fill="#F2C9A6" />
          <Circle cx={88} cy={18} r={9} fill={c} stroke={shade(c, -0.25)} strokeWidth={1.4} /><Circle cx={88} cy={18} r={4.5} fill="#F2C9A6" />
        </G>}
        {ears === 'kodok' && <G>
          <Circle cx={40} cy={10} r={9} fill={c} stroke={shade(c, -0.25)} strokeWidth={1.4} /><Circle cx={40} cy={10} r={4.5} fill="#fff" /><Circle cx={40} cy={10} r={2.2} fill={LN} />
          <Circle cx={80} cy={10} r={9} fill={c} stroke={shade(c, -0.25)} strokeWidth={1.4} /><Circle cx={80} cy={10} r={4.5} fill="#fff" /><Circle cx={80} cy={10} r={2.2} fill={LN} />
        </G>}
      </G>
    );
  }
  if (look.k === 'jashujan') {
    const c = look.a ?? '#FFE15A';
    return <Path d="M24 64 C20 30 38 10 60 10 C82 10 100 30 96 64 L96 90 L24 90Z" fill={c} stroke={shade(c, -0.25)} strokeWidth={1.4} />;
  }
  return null;
}

export function Outfit({ look, pose }: { look: ItemLook; pose: string }) {
  const a = look.a ?? '#FFB6CF';
  const line = shade(a === '#FFFFFF' ? '#E6E0EA' : a, -0.28);
  const k = look.k;
  const sleeve = k === 'overall' || k === 'apron' || k === 'cardigan' || k === 'pelaut' || k === 'tutu' ? '#FFFFFF' : a;
  const armL = pose === 'dance' ? 'M41 94 Q29 84 27 74' : 'M41 94 Q32 104 36 112';
  const armR = pose === 'dance' ? 'M79 94 Q91 84 93 74' : 'M79 94 Q88 104 84 112';
  const handL: [number, number] = pose === 'dance' ? [27, 73] : [37, 113];
  const handR: [number, number] = pose === 'dance' ? [93, 73] : [83, 113];
  const body = isSkirt(k) && k !== 'tutu' ? SKIRT : TOP;
  return (
    <G>
      {/* legs + shoes */}
      <Rect x={50} y={118} width={7.5} height={14} rx={3.7} fill="#FFE3D2" stroke="#E8BFA8" strokeWidth={1} />
      <Rect x={62.5} y={118} width={7.5} height={14} rx={3.7} fill="#FFE3D2" stroke="#E8BFA8" strokeWidth={1} />
      <Ellipse cx={53.5} cy={133} rx={6.4} ry={3.6} fill="#FF7A9E" stroke={LN} strokeWidth={1} />
      <Ellipse cx={66.5} cy={133} rx={6.4} ry={3.6} fill="#FF7A9E" stroke={LN} strokeWidth={1} />
      {/* arms (outline then sleeve) */}
      <Path d={armL} stroke={shade(sleeve === '#FFFFFF' ? '#E6E0EA' : sleeve, -0.28)} strokeWidth={10} fill="none" strokeLinecap="round" />
      <Path d={armR} stroke={shade(sleeve === '#FFFFFF' ? '#E6E0EA' : sleeve, -0.28)} strokeWidth={10} fill="none" strokeLinecap="round" />
      <Path d={armL} stroke={sleeve} strokeWidth={7.6} fill="none" strokeLinecap="round" />
      <Path d={armR} stroke={sleeve} strokeWidth={7.6} fill="none" strokeLinecap="round" />
      {/* torso */}
      <Path d={body} fill={k === 'overall' || k === 'apron' || k === 'cardigan' || k === 'pelaut' || k === 'tutu' ? '#FFFFFF' : a} stroke={k === 'overall' || k === 'apron' || k === 'cardigan' || k === 'pelaut' || k === 'tutu' ? '#D9D2DE' : line} strokeWidth={1.3} strokeLinejoin="round" />
      <OutfitDetail look={look} line={line} />
      <Circle cx={handL[0]} cy={handL[1]} r={4.3} fill="#FFE3D2" stroke="#E8BFA8" strokeWidth={1} />
      <Circle cx={handR[0]} cy={handR[1]} r={4.3} fill="#FFE3D2" stroke="#E8BFA8" strokeWidth={1} />
    </G>
  );
}

function OutfitDetail({ look, line }: { look: ItemLook; line: string }) {
  const a = look.a ?? '#FFB6CF';
  switch (look.k) {
    case 'kaos':
      return (
        <G>
          <Path d="M52 86 Q60 92 68 86" stroke={line} strokeWidth={1.6} fill="none" strokeLinecap="round" />
          {look.b === 'garis' && [96, 104, 112].map((y) => <Path key={y} d={`M40.5 ${y} H79.5`} stroke="#fff" strokeWidth={3} />)}
          {look.b === 'pelangi' && RAINBOW.slice(0, 4).map((c, i) => <Path key={c} d={`M48 ${112 - i * 3} Q60 ${100 - i * 3} 72 ${112 - i * 3}`} stroke={c} strokeWidth={2.6} fill="none" />)}
          {look.b && !['garis', 'pelangi'].includes(look.b) && <Motif kind={look.b} x={60} y={103} s={6} base={a} />}
        </G>
      );
    case 'sweater':
      return (
        <G>
          <Path d="M50 86 Q60 93 70 86" stroke={line} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <Path d="M40 116 Q60 120 80.5 116 L81 121 Q60 125 39 121Z" fill={shade(a, -0.08)} />
          {look.b === 'rajut'
            ? [50, 60, 70].map((x) => <Path key={x} d={`M${x} 92 q2 3 0 6 q-2 3 0 6 q2 3 0 6 q-2 3 0 5`} stroke={line} strokeWidth={1.2} fill="none" />)
            : <Path d="M44 104 H76" stroke={shade(a, -0.12)} strokeWidth={2} />}
        </G>
      );
    case 'overall':
      return (
        <G>
          <Path d="M44 98 H76 L77 121 Q60 124 43 121Z" fill={a} stroke={line} strokeWidth={1.3} />
          <Rect x={48} y={86} width={4} height={13} fill={a} stroke={line} strokeWidth={0.9} />
          <Rect x={68} y={86} width={4} height={13} fill={a} stroke={line} strokeWidth={0.9} />
          <Circle cx={50} cy={97} r={1.6} fill="#fff" /><Circle cx={70} cy={97} r={1.6} fill="#fff" />
          <Path d="M54 104 h12 v8 q0 2 -2 2 h-8 q-2 0 -2 -2z" fill={shade(a, 0.3)} stroke={line} strokeWidth={0.9} />
          <Heart cx={60} cy={108.5} s={2.6} color="#FF7FAF" stroke={false} />
        </G>
      );
    case 'dress':
    case 'kimono':
      return (
        <G>
          {look.k === 'dress' && <Path d="M52 86 Q60 93 68 86 L66 90 Q60 95 54 90Z" fill="#fff" stroke={line} strokeWidth={1} />}
          {look.k === 'kimono' && <G>
            <Path d="M50 86 L60 102 L70 86" stroke="#FF9EC2" strokeWidth={2.6} fill="none" />
            <Rect x={42.5} y={100} width={35} height={7} fill="#FF9EC2" stroke={LN} strokeWidth={0.9} />
            {[[50, 113], [68, 116], [59, 121], [77, 109]].map(([x, y], i) => <Bloom key={i} cx={x} cy={y} r={3.4} color="#FFC2D6" center="#fff" outline={false} />)}
          </G>}
          {look.k === 'dress' && look.b === 'pelangi' && RAINBOW.map((c, i) => <Path key={c} d={`M${41 - i * 1.2} ${96 + i * 4.4} H${79 + i * 1.2}`} stroke={c} strokeWidth={3.4} />)}
          {look.k === 'dress' && look.b && look.b !== 'pelangi' && SKIRT_SPOTS.map(([x, y], i) => (
            <Motif key={i} kind={look.b} x={x} y={y} s={look.b === 'dots' ? 4.2 : look.b === 'awan' ? 4 : 3.6} base={a} />
          ))}
        </G>
      );
    case 'hoodie':
      return (
        <G>
          <Path d="M50 108 h20 v8 q0 3 -3 3 h-14 q-3 0 -3 -3z" fill={shade(a, -0.06)} stroke={line} strokeWidth={1} />
          <Path d="M55 88 v8 M65 88 v8" stroke={line} strokeWidth={1.2} strokeLinecap="round" />
          {look.b === 'kucing' && <G><Circle cx={56} cy={112} r={0.9} fill={LN} /><Circle cx={64} cy={112} r={0.9} fill={LN} /></G>}
          {look.b === 'kodok' && <Path d="M55 112 Q60 116 65 112" stroke={LN} strokeWidth={1} fill="none" />}
        </G>
      );
    case 'cardigan':
      return (
        <G>
          <Path d="M45 86 L57 86 L58 122 Q48 124 39 121 L40 92 Q40 86 45 86Z" fill={a} stroke={line} strokeWidth={1.2} />
          <Path d="M75 86 L63 86 L62 122 Q72 124 81 121 L80 92 Q80 86 75 86Z" fill={a} stroke={line} strokeWidth={1.2} />
          {[96, 105, 114].map((y) => <Circle key={y} cx={55} cy={y} r={1.3} fill="#fff" stroke={line} strokeWidth={0.6} />)}
        </G>
      );
    case 'jaket':
      return (
        <G>
          <Path d="M60 88 V121" stroke={line} strokeWidth={1.2} />
          <Path d="M48 86 L56 96 L60 88 L64 96 L72 86" fill={shade(a, -0.08)} stroke={line} strokeWidth={1.1} strokeLinejoin="round" />
          <Rect x={44} y={102} width={10} height={7} rx={1.5} fill="none" stroke={line} strokeWidth={1} />
          <Rect x={66} y={102} width={10} height={7} rx={1.5} fill="none" stroke={line} strokeWidth={1} />
          <Circle cx={63} cy={100} r={1} fill="#F2D27A" /><Circle cx={63} cy={110} r={1} fill="#F2D27A" />
        </G>
      );
    case 'pelaut':
      return (
        <G>
          <Path d="M46 86 L74 86 L78 98 Q60 104 42 98Z" fill="#6E87D6" stroke={LN} strokeWidth={1} />
          <Path d="M45 94 Q60 99 75 94" stroke="#fff" strokeWidth={1.4} fill="none" />
          <Path d="M60 100 L53 96 L53 104Z M60 100 L67 96 L67 104Z" fill="#FF6B7A" stroke="#D9485A" strokeWidth={0.8} />
          <Circle cx={60} cy={100} r={1.8} fill="#FF6B7A" />
          <Path d="M41 116 H80" stroke="#6E87D6" strokeWidth={2.4} />
        </G>
      );
    case 'jashujan':
      return (
        <G>
          <Path d="M60 88 V122" stroke={line} strokeWidth={1.2} />
          {[96, 104, 112].map((y) => <Circle key={y} cx={64} cy={y} r={1.8} fill="#fff" stroke={line} strokeWidth={0.7} />)}
          <Path d="M52 86 Q60 92 68 86" stroke={line} strokeWidth={1.6} fill="none" />
        </G>
      );
    case 'piyama':
      return (
        <G>
          <Path d="M50 86 L60 96 L70 86" stroke="#fff" strokeWidth={2} fill="none" />
          <Path d="M60 96 V121" stroke="#fff" strokeWidth={1.4} />
          {TOP_SPOTS.map(([x, y], i) => <Motif key={i} kind={look.b} x={x} y={y} s={3.2} base={a} />)}
        </G>
      );
    case 'apron':
      return (
        <G>
          <Path d="M47 94 H73 L75 121 Q60 124 45 121Z" fill={a} stroke={line} strokeWidth={1.2} />
          <Path d="M47 94 L44 86 M73 94 L76 86" stroke={a} strokeWidth={2.4} />
          <Path d="M53 104 h14 v7 q0 3 -3 3 h-8 q-3 0 -3 -3z" fill="#fff" stroke={line} strokeWidth={0.9} />
          <Heart cx={60} cy={108} s={2.6} color="#FF7FAF" stroke={false} />
          <Path d="M45 114 Q52 118 60 114 Q68 118 75 114" stroke="#fff" strokeWidth={1.4} fill="none" />
        </G>
      );
    case 'tutu':
      return (
        <G>
          <Path d="M52 86 Q60 92 68 86" stroke="#D9D2DE" strokeWidth={1.6} fill="none" />
          {[34, 42, 50, 58, 66, 74, 82].map((x, i) => <Circle key={x} cx={x + 2} cy={113 + (i % 2) * 2} r={6.5} fill={a} stroke={line} strokeWidth={1} />)}
          {[40, 50, 60, 70, 80].map((x) => <Circle key={x} cx={x} cy={108} r={5.6} fill={shade(a, 0.25)} />)}
          <Star cx={60} cy={98} r={3} color="#FFE27A" />
        </G>
      );
    default:
      return null;
  }
}

/* ───────── Hair items (headwear) ───────── */

export function HairItem({ look }: { look?: ItemLook }) {
  if (!look || look.k === 'none') return <Bloom cx={84} cy={30} r={7} color="#FF9EC2" />;
  const a = look.a ?? '#FFB6CF';
  const line = shade(a === '#FFFFFF' ? '#E6E0EA' : a, -0.3);
  switch (look.k) {
    case 'pita':
      return (
        <G>
          <Path d="M82 28 L71 20 L72 36Z M82 28 L93 20 L92 36Z" fill={a} stroke={line} strokeWidth={1.2} strokeLinejoin="round" />
          <Circle cx={82} cy={28} r={3.6} fill={shade(a, -0.12)} stroke={line} strokeWidth={1} />
        </G>
      );
    case 'pitabesar':
      return (
        <G>
          <Path d="M60 14 L40 2 L42 28Z M60 14 L80 2 L78 28Z" fill={a} stroke={line} strokeWidth={1.4} strokeLinejoin="round" />
          <Path d="M56 18 L50 34 M64 18 L70 34" stroke={a} strokeWidth={4} strokeLinecap="round" />
          <Circle cx={60} cy={14} r={5} fill={shade(a, -0.12)} stroke={line} strokeWidth={1.2} />
        </G>
      );
    case 'jepit': {
      const x = 83, y = 29;
      switch (look.b) {
        case 'bintang': return <Star cx={x} cy={y} r={7.5} color={a} />;
        case 'hati': return <Heart cx={x} cy={y} s={7} color={a} />;
        case 'stroberi': return <Strawberry cx={x} cy={y} s={6.5} />;
        case 'kupu': return <Butterfly cx={x} cy={y} s={6} a={a} b="#FFE27A" />;
        default: return <Bloom cx={x} cy={y} r={8} color={a} />;
      }
    }
    case 'bando':
      return (
        <G>
          <Path d="M28 46 Q34 16 60 14 Q86 16 92 46" stroke={line} strokeWidth={7} fill="none" strokeLinecap="round" />
          <Path d="M28 46 Q34 16 60 14 Q86 16 92 46" stroke={a} strokeWidth={5} fill="none" strokeLinecap="round" />
          {look.b === 'dots' && [[34, 30], [46, 19], [60, 15], [74, 19], [86, 30]].map(([x, y]) => <Circle key={x} cx={x} cy={y} r={1.3} fill="#fff" />)}
          {look.b === 'garis' && [[38, 25], [50, 17], [62, 15], [74, 18], [84, 26]].map(([x, y]) => <Path key={x} d={`M${x} ${y - 2.5} L${x + 2} ${y + 2.5}`} stroke="#fff" strokeWidth={1.4} />)}
        </G>
      );
    case 'telinga': {
      const band = <Path d="M28 46 Q34 16 60 14 Q86 16 92 46" stroke={look.b === 'rusa' ? '#B97F48' : '#FF9EC2'} strokeWidth={4} fill="none" strokeLinecap="round" />;
      if (look.b === 'kelinci') {
        return (
          <G>
            <Ellipse cx={44} cy={2} rx={7} ry={18} fill="#fff" stroke="#E6D3DC" strokeWidth={1.4} transform="rotate(-10 44 2)" />
            <Ellipse cx={76} cy={2} rx={7} ry={18} fill="#fff" stroke="#E6D3DC" strokeWidth={1.4} transform="rotate(10 76 2)" />
            <Ellipse cx={44} cy={4} rx={3} ry={12} fill="#FFC2D6" transform="rotate(-10 44 4)" />
            <Ellipse cx={76} cy={4} rx={3} ry={12} fill="#FFC2D6" transform="rotate(10 76 4)" />
            {band}
          </G>
        );
      }
      if (look.b === 'beruang') {
        return <G>{band}<Circle cx={36} cy={18} r={8} fill={a} stroke={line} strokeWidth={1.3} /><Circle cx={36} cy={18} r={4} fill="#F2C9A6" /><Circle cx={84} cy={18} r={8} fill={a} stroke={line} strokeWidth={1.3} /><Circle cx={84} cy={18} r={4} fill="#F2C9A6" /></G>;
      }
      if (look.b === 'kucing') {
        return <G>{band}<Path d="M34 26 L36 4 L52 18Z M86 26 L84 4 L68 18Z" fill={a} stroke={line} strokeWidth={1.3} strokeLinejoin="round" /><Path d="M38 20 L39 10 L46 17Z M82 20 L81 10 L74 17Z" fill="#FFC2D6" /></G>;
      }
      return (
        <G>
          {band}
          <Path d="M38 22 L32 4 M34 10 L26 6 M35 14 L42 6 M82 22 L88 4 M86 10 L94 6 M85 14 L78 6" stroke={shade(a, -0.15)} strokeWidth={3.4} strokeLinecap="round" fill="none" />
          <Bloom cx={60} cy={14} r={5} color="#FF9EC2" />
        </G>
      );
    }
    case 'pelangi':
      return <G>{RAINBOW.map((c, i) => <Path key={c} d={`M${28 + i * 1.5} 46 Q34 ${16 + i * 1.6} 60 ${13 + i * 1.6} Q86 ${16 + i * 1.6} ${92 - i * 1.5} 46`} stroke={c} strokeWidth={1.9} fill="none" strokeLinecap="round" />)}</G>;
    case 'baret':
      return (
        <G>
          <Ellipse cx={56} cy={20} rx={33} ry={12} fill={a} stroke={line} strokeWidth={1.3} transform="rotate(-8 56 20)" />
          <Path d="M54 8 q1 -4 4 -4" stroke={line} strokeWidth={2} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'jerami':
      return (
        <G>
          <Ellipse cx={60} cy={26} rx={47} ry={10} fill="#F7D488" stroke="#C99A4A" strokeWidth={1.3} />
          <Path d="M36 26 Q38 4 60 4 Q82 4 84 26Z" fill="#F3C66B" stroke="#C99A4A" strokeWidth={1.3} />
          <Path d="M37 20 Q60 25 83 20 L84 26 Q60 30 36 26Z" fill="#FF8FB8" />
          <Bloom cx={78} cy={21} r={7} color="#fff" />
        </G>
      );
    case 'matahari':
      return (
        <G>
          {Array.from({ length: 12 }, (_, i) => {
            const t = (i * 30 * Math.PI) / 180;
            return <Ellipse key={i} cx={60 + 40 * Math.cos(t)} cy={22 + 10 * Math.sin(t)} rx={9} ry={5} fill="#FFCE3A" stroke="#E0A800" strokeWidth={1} transform={`rotate(${(i * 30) % 180} ${60 + 40 * Math.cos(t)} ${22 + 10 * Math.sin(t)})`} />;
          })}
          <Path d="M36 24 Q38 2 60 2 Q82 2 84 24Z" fill="#8A5A3C" stroke={LN} strokeWidth={1.3} />
          {[46, 56, 66, 74].map((x, i) => <Circle key={x} cx={x} cy={12 + (i % 2) * 5} r={1.4} fill="#6E4530" />)}
        </G>
      );
    case 'kodok':
      return (
        <G>
          <Path d="M28 40 Q28 8 60 8 Q92 8 92 40 Q60 30 28 40Z" fill="#8EDB6A" stroke="#4E9E4A" strokeWidth={1.4} />
          {[42, 78].map((x) => <G key={x}><Circle cx={x} cy={8} r={8} fill="#8EDB6A" stroke="#4E9E4A" strokeWidth={1.3} /><Circle cx={x} cy={8} r={4.6} fill="#fff" /><Circle cx={x} cy={8.5} r={2.4} fill={LN} /></G>)}
          <Ellipse cx={46} cy={24} rx={4} ry={2.4} fill="#FFA3BC" /><Ellipse cx={74} cy={24} rx={4} ry={2.4} fill="#FFA3BC" />
        </G>
      );
    case 'jamur':
      return (
        <G>
          <Path d="M24 34 Q26 2 60 2 Q94 2 96 34 Q60 26 24 34Z" fill="#FF5E57" stroke="#C93A3A" strokeWidth={1.4} />
          {[[38, 20, 6], [58, 10, 7], [78, 18, 5.5], [48, 28, 3.6], [70, 28, 3.6]].map(([x, y, r]) => <Circle key={x} cx={x} cy={y} r={r} fill="#fff" />)}
        </G>
      );
    case 'stroberi':
      return (
        <G>
          <Path d="M26 38 Q26 6 60 6 Q94 6 94 38 Q60 30 26 38Z" fill="#FF6B7A" stroke="#D9485A" strokeWidth={1.4} />
          {[[40, 22], [52, 14], [66, 14], [78, 22], [46, 30], [60, 24], [74, 30]].map(([x, y], i) => <Ellipse key={i} cx={x} cy={y} rx={1.3} ry={1.9} fill="#FFE27A" />)}
          <Path d="M44 8 L52 10 L56 0 L60 9 L64 0 L68 10 L76 8 L70 14 H50Z" fill="#6FC46A" stroke="#4E9E4A" strokeWidth={1.1} strokeLinejoin="round" />
        </G>
      );
    case 'pesta':
      return (
        <G>
          <Path d="M48 24 L62 -6 L76 22Z" fill={a} stroke={line} strokeWidth={1.3} strokeLinejoin="round" transform="rotate(12 62 10)" />
          <Path d="M56 14 L70 12 M52 20 L74 17" stroke="#fff" strokeWidth={2.4} transform="rotate(12 62 10)" />
          <Circle cx={66} cy={-6} r={4} fill="#FFE27A" stroke="#E0A800" strokeWidth={1} />
        </G>
      );
    case 'penyihir':
      return (
        <G>
          <Ellipse cx={60} cy={24} rx={42} ry={8} fill={a} stroke={line} strokeWidth={1.3} />
          <Path d="M38 24 Q50 14 56 -2 Q60 -10 72 -6 Q64 -2 66 8 Q72 18 82 24Z" fill={a} stroke={line} strokeWidth={1.3} strokeLinejoin="round" />
          <Path d="M40 20 Q60 25 80 20" stroke="#FFE27A" strokeWidth={2.6} fill="none" />
          <Star cx={64} cy={10} r={4} color="#FFE27A" />
        </G>
      );
    case 'mahkotabunga': {
      const roses = look.b === 'mawar';
      const cols = roses ? ['#FF5E7E', '#FF9EC2', '#FF5E7E', '#FF9EC2', '#FF5E7E', '#FF9EC2'] : ['#FF9EC2', '#FFE27A', '#C3B0EE', '#9CD3F5', '#FF9EC2', '#A8DABD'];
      return (
        <G>
          <Path d="M30 40 Q34 18 60 16 Q86 18 90 40" stroke="#6FC46A" strokeWidth={3} fill="none" strokeLinecap="round" />
          {[[32, 36], [42, 25], [54, 19], [66, 19], [78, 25], [88, 36]].map(([x, y], i) => (
            roses
              ? <G key={i}><Circle cx={x} cy={y} r={5.4} fill={cols[i]} stroke={shade(cols[i], -0.3)} strokeWidth={0.9} /><Path d={`M${x - 2.6} ${y} a2.6 2.6 0 1 1 2.6 2.6`} stroke={shade(cols[i], -0.3)} strokeWidth={0.9} fill="none" /></G>
              : <Bloom key={i} cx={x} cy={y} r={6} color={cols[i]} />
          ))}
        </G>
      );
    }
    case 'mahkota': {
      const gems = look.b === 'permata';
      return (
        <G>
          <Path d="M40 26 L42 6 L51 16 L60 0 L69 16 L78 6 L80 26Z" fill={a} stroke="#D9A520" strokeWidth={1.4} strokeLinejoin="round" />
          <Rect x={40} y={22} width={40} height={6} rx={2} fill={shade(a, -0.08)} stroke="#D9A520" strokeWidth={1.1} />
          <Circle cx={60} cy={25} r={gems ? 3 : 2} fill="#FF5E7E" />
          <Circle cx={49} cy={25} r={gems ? 2.4 : 1.6} fill="#7CC8FF" />
          <Circle cx={71} cy={25} r={gems ? 2.4 : 1.6} fill="#7FCB5B" />
          {gems && <G><Circle cx={60} cy={2} r={2.6} fill="#fff" /><Circle cx={42} cy={6} r={2} fill="#FF9EC2" /><Circle cx={78} cy={6} r={2} fill="#C3B0EE" /></G>}
        </G>
      );
    }
    case 'mahkotabulan':
      return (
        <G>
          <Path d="M42 26 L46 8 L53 18 L60 4 L67 18 L74 8 L78 26Z" fill="#FFE08A" stroke="#EDB52F" strokeWidth={1.3} strokeLinejoin="round" />
          <Path d="M63 10 A5 5 0 1 1 57 4 A3.6 3.6 0 1 0 63 10Z" fill="#fff" />
          <Circle cx={50} cy={22} r={1.8} fill="#C3B0EE" /><Circle cx={70} cy={22} r={1.8} fill="#9CD3F5" />
        </G>
      );
    case 'tiara':
      return (
        <G>
          <Path d="M36 30 Q60 18 84 30" stroke="#C9D6EA" strokeWidth={3} fill="none" />
          <Path d="M50 24 L54 12 L60 20 L66 12 L70 24" fill="#E8F3FF" stroke="#9CB4D8" strokeWidth={1.2} strokeLinejoin="round" />
          <Path d="M60 6 L64 12 L60 18 L56 12Z" fill="#B9E3FC" stroke="#7FB0D8" strokeWidth={1} />
          <Circle cx={44} cy={26} r={1.8} fill="#FFC2D6" /><Circle cx={76} cy={26} r={1.8} fill="#FFC2D6" />
        </G>
      );
    case 'earmuff':
      return (
        <G>
          <Path d="M27 52 Q30 12 60 12 Q90 12 93 52" stroke="#B9AFC6" strokeWidth={3.4} fill="none" />
          {[27, 93].map((x) => <G key={x}><Circle cx={x} cy={54} r={10} fill={a} stroke={line} strokeWidth={1.3} />{[0, 60, 120, 180, 240, 300].map((d) => <Circle key={d} cx={x + 6 * Math.cos((d * Math.PI) / 180)} cy={54 + 6 * Math.sin((d * Math.PI) / 180)} r={2.4} fill={shade(a, 0.35)} />)}</G>)}
        </G>
      );
    case 'beanie':
      return (
        <G>
          <Path d="M28 36 Q28 4 60 4 Q92 4 92 36Z" fill={a} stroke={line} strokeWidth={1.4} />
          <Rect x={26} y={30} width={68} height={10} rx={5} fill={shade(a, -0.1)} stroke={line} strokeWidth={1.2} />
          {[36, 46, 56, 66, 76, 86].map((x) => <Path key={x} d={`M${x} 31 V39`} stroke={line} strokeWidth={0.9} opacity={0.6} />)}
          <Circle cx={60} cy={2} r={6} fill="#fff" stroke="#E6D3DC" strokeWidth={1.2} />
        </G>
      );
    case 'bucket':
      return (
        <G>
          <Path d="M26 32 L36 10 Q60 2 84 10 L94 32Z" fill={a} stroke={line} strokeWidth={1.4} strokeLinejoin="round" />
          <Path d="M20 34 Q60 22 100 34 Q60 42 20 34Z" fill={shade(a, -0.08)} stroke={line} strokeWidth={1.3} />
          <Bloom cx={80} cy={20} r={5} color="#fff" />
        </G>
      );
    case 'awan':
      return <G><Cloud cx={60} cy={12} s={20} /><Circle cx={50} cy={10} r={1.4} fill={LN} /><Circle cx={66} cy={10} r={1.4} fill={LN} /><Path d="M55 15 Q58 18 61 15" stroke={LN} strokeWidth={1} fill="none" /></G>;
    default:
      return null;
  }
}

/** Hair items that sit on top of the head hide the default flower clip. */
export function hidesClip(look?: ItemLook) {
  return !!look && look.k !== 'none';
}

/* ───────── Glasses ───────── */

export function Glasses({ look }: { look?: ItemLook }) {
  if (!look) return null;
  const a = look.a ?? '#8A6E5C';
  const L = [49, 61], R = [71, 61];
  const bridge = <Path d="M56.5 60 Q60 57 63.5 60" stroke={a} strokeWidth={1.6} fill="none" />;
  switch (look.k) {
    case 'bulat':
      return <G fill="rgba(255,255,255,0.22)" stroke={a} strokeWidth={1.8}><Circle cx={L[0]} cy={L[1]} r={8} /><Circle cx={R[0]} cy={R[1]} r={8} />{bridge}</G>;
    case 'oval':
      return <G fill="rgba(255,255,255,0.22)" stroke={a} strokeWidth={1.8}><Ellipse cx={L[0]} cy={L[1]} rx={8.6} ry={6.6} /><Ellipse cx={R[0]} cy={R[1]} rx={8.6} ry={6.6} />{bridge}</G>;
    case 'kotak':
      return <G fill="rgba(255,255,255,0.22)" stroke={a} strokeWidth={1.8}><Rect x={41} y={54} width={16} height={13} rx={3} /><Rect x={63} y={54} width={16} height={13} rx={3} />{bridge}</G>;
    case 'hati':
      return <G opacity={0.9}><Heart cx={L[0]} cy={L[1]} s={9} color={a} /><Heart cx={R[0]} cy={R[1]} s={9} color={a} />{bridge}</G>;
    case 'bintang':
      return <G opacity={0.92}><Star cx={L[0]} cy={L[1]} r={10} color={a} /><Star cx={R[0]} cy={R[1]} r={10} color={a} />{bridge}</G>;
    case 'hitam':
      return (
        <G>
          <Path d="M40 55 H58 Q58 68 49 68 Q40 68 40 55Z M62 55 H80 Q80 68 71 68 Q62 68 62 55Z" fill={a} stroke={shade(a, -0.3)} strokeWidth={1.2} />
          <Path d="M43 58 L48 58" stroke="#fff" strokeWidth={1.4} opacity={0.6} /><Path d="M65 58 L70 58" stroke="#fff" strokeWidth={1.4} opacity={0.6} />
          {bridge}
        </G>
      );
    case 'pelangi':
      return <G fill="rgba(255,255,255,0.2)">{RAINBOW.map((c, i) => <G key={c}><Circle cx={L[0]} cy={L[1]} r={8.6 - i * 0.6} stroke={c} strokeWidth={0.7} /><Circle cx={R[0]} cy={R[1]} r={8.6 - i * 0.6} stroke={c} strokeWidth={0.7} /></G>)}<Path d="M57 60 Q60 57 63 60" stroke="#C3B0EE" strokeWidth={1.6} fill="none" /></G>;
    case 'berlian':
      return <G>{[L, R].map(([x, y]) => <Path key={x} d={`M${x - 9} ${y - 2} L${x - 5} ${y - 8} L${x + 5} ${y - 8} L${x + 9} ${y - 2} L${x} ${y + 8}Z`} fill="rgba(185,227,252,0.75)" stroke="#5FA8D8" strokeWidth={1.3} strokeLinejoin="round" />)}<Path d="M58 58 L62 58" stroke="#5FA8D8" strokeWidth={1.6} /><Star cx={83} cy={52} r={3} color="#fff" stroke={false} inner={0.3} /></G>;
    case 'kupu':
      return <G opacity={0.92}>{[[L[0], -1], [R[0], 1]].map(([x, d]) => <G key={x}><Ellipse cx={x + d * 1} cy={57} rx={9} ry={7} fill={a} stroke={shade(a, -0.3)} strokeWidth={1.1} /><Ellipse cx={x + d * 2} cy={66} rx={6} ry={4.4} fill="#FFE27A" stroke="#E0B030" strokeWidth={1} /></G>)}{bridge}</G>;
    case 'bunga':
      return <G>{[L, R].map(([x, y]) => <G key={x}>{[0, 60, 120, 180, 240, 300].map((d) => <Circle key={d} cx={x + 8.6 * Math.cos((d * Math.PI) / 180)} cy={y + 8.6 * Math.sin((d * Math.PI) / 180)} r={3.2} fill={a} stroke={shade(a, -0.3)} strokeWidth={0.8} />)}<Circle cx={x} cy={y} r={7} fill="rgba(255,255,255,0.25)" stroke={shade(a, -0.3)} strokeWidth={1.2} /></G>)}{bridge}</G>;
    case 'matahari':
      return <G>{[L, R].map(([x, y]) => <G key={x}>{Array.from({ length: 10 }, (_, i) => <Ellipse key={i} cx={x + 10 * Math.cos((i * 36 * Math.PI) / 180)} cy={y + 10 * Math.sin((i * 36 * Math.PI) / 180)} rx={3} ry={1.8} fill="#FFCE3A" transform={`rotate(${i * 36} ${x + 10 * Math.cos((i * 36 * Math.PI) / 180)} ${y + 10 * Math.sin((i * 36 * Math.PI) / 180)})`} />)}<Circle cx={x} cy={y} r={7.6} fill="rgba(255,255,255,0.22)" stroke="#C98A1E" strokeWidth={1.6} /></G>)}<Path d="M56.5 60 Q60 57 63.5 60" stroke="#C98A1E" strokeWidth={1.6} fill="none" /></G>;
    case 'bulan':
      return <G>{[L, R].map(([x, y]) => <Path key={x} d={`M${x + 4} ${y - 8} A8.6 8.6 0 1 0 ${x + 6} ${y + 6} A6.6 6.6 0 1 1 ${x + 4} ${y - 8}Z`} fill={a} stroke={shade(a, -0.3)} strokeWidth={1.1} />)}<Circle cx={L[0] + 1} cy={L[1]} r={6} fill="rgba(255,255,255,0.18)" stroke={shade(a, -0.3)} strokeWidth={0.8} /><Circle cx={R[0] + 1} cy={R[1]} r={6} fill="rgba(255,255,255,0.18)" stroke={shade(a, -0.3)} strokeWidth={0.8} />{bridge}</G>;
    default:
      return null;
  }
}

/* ───────── Spesial (extras) ───────── */

const BACK_KINDS = new Set(['sayapkupu', 'sayapperi', 'sayapmalaikat', 'halo', 'pelangi', 'ransel']);

export function Extra({ look, layer }: { look?: ItemLook; layer: 'back' | 'front' }) {
  if (!look) return null;
  const back = BACK_KINDS.has(look.k);
  if (look.k === 'ransel') return layer === 'back' ? <Ransel a={look.a ?? '#FFB6CF'} /> : <RanselStraps a={look.a ?? '#FFB6CF'} />;
  if (back !== (layer === 'back')) return null;
  const a = look.a ?? '#FF7FAF';
  switch (look.k) {
    case 'sayapkupu':
      return (
        <G opacity={0.95}>
          <Path d="M46 96 C20 66 4 82 12 100 C4 114 24 126 46 108Z" fill={a} stroke={shade(a, -0.28)} strokeWidth={1.2} />
          <Path d="M74 96 C100 66 116 82 108 100 C116 114 96 126 74 108Z" fill={a} stroke={shade(a, -0.28)} strokeWidth={1.2} />
          <Circle cx={22} cy={92} r={4.4} fill="#FFC1D6" /><Circle cx={98} cy={92} r={4.4} fill="#FFC1D6" />
          <Circle cx={24} cy={110} r={3} fill="#FFE27A" /><Circle cx={96} cy={110} r={3} fill="#FFE27A" />
        </G>
      );
    case 'sayapperi':
      return (
        <G opacity={0.9}>
          {[[-1, 0], [1, 0]].map(([d]) => (
            <G key={d}>
              <Ellipse cx={60 + d * 30} cy={88} rx={18} ry={11} fill="#D7F2FF" stroke="#8CC8EA" strokeWidth={1.1} transform={`rotate(${d * -30} ${60 + d * 30} 88)`} />
              <Ellipse cx={60 + d * 26} cy={108} rx={12} ry={8} fill="#E9DFFF" stroke="#B9A3F0" strokeWidth={1.1} transform={`rotate(${d * 30} ${60 + d * 26} 108)`} />
            </G>
          ))}
          <Star cx={30} cy={80} r={2.4} color="#fff" stroke={false} /><Star cx={92} cy={82} r={2.4} color="#fff" stroke={false} />
        </G>
      );
    case 'sayapmalaikat':
      return (
        <G>
          {[[-1], [1]].map(([d]) => (
            <G key={d}>
              {[0, 1, 2, 3].map((i) => <Ellipse key={i} cx={60 + d * (24 + i * 7)} cy={92 + i * 6} rx={10 - i} ry={6} fill="#fff" stroke="#D9D2E6" strokeWidth={1.1} transform={`rotate(${d * (-20 + i * 14)} ${60 + d * (24 + i * 7)} ${92 + i * 6})`} />)}
            </G>
          ))}
        </G>
      );
    case 'halo':
      return <Ellipse cx={60} cy={4} rx={20} ry={5} fill="none" stroke="#FFD45E" strokeWidth={3.4} />;
    case 'pelangi':
      return <G opacity={0.85}>{RAINBOW.map((c, i) => <Path key={c} d={`M${6 + i * 3} 112 A${54 - i * 3} ${60 - i * 3} 0 0 1 ${114 - i * 3} 112`} stroke={c} strokeWidth={3} fill="none" />)}</G>;
    case 'balon':
      return <G><Path d="M37 112 Q24 90 22 70" stroke="#B9AFC6" strokeWidth={1} fill="none" /><Heart cx={20} cy={58} s={12} color={a} /><Path d="M14 54 q2 -3 5 -3" stroke="#fff" strokeWidth={1.6} fill="none" strokeLinecap="round" /></G>;
    case 'tas':
      return (
        <G>
          <Path d="M72 90 Q86 98 90 108" stroke={shade(a, -0.3)} strokeWidth={1.6} fill="none" />
          {look.b === 'stroberi'
            ? <Strawberry cx={92} cy={114} s={8.5} />
            : <G><Path d="M82 108 Q82 102 92 102 Q102 102 102 108 L102 120 Q92 124 82 120Z" fill={a} stroke={shade(a, -0.3)} strokeWidth={1.1} /><Circle cx={88} cy={110} r={2.2} fill="#fff" /><Circle cx={96} cy={110} r={2.2} fill="#fff" /><Circle cx={88} cy={110} r={1.1} fill={LN} /><Circle cx={96} cy={110} r={1.1} fill={LN} /><Path d="M88 116 Q92 119 96 116" stroke={LN} strokeWidth={1} fill="none" /></G>}
        </G>
      );
    case 'awan':
      return <G><Cloud cx={96} cy={14} s={11} /><Circle cx={92} cy={13} r={1} fill={LN} /><Circle cx={100} cy={13} r={1} fill={LN} /></G>;
    case 'pensil':
      return <G transform="rotate(-30 86 104)"><Rect x={83} y={78} width={7} height={34} fill="#FFD45E" stroke="#D9A520" strokeWidth={1} /><Path d="M83 112 L86.5 120 L90 112Z" fill="#F2D3A8" stroke="#D9A520" strokeWidth={1} /><Rect x={83} y={74} width={7} height={5} rx={1} fill="#FF9EC2" /></G>;
    case 'buket':
      return <G><Path d="M52 118 L60 104 L68 118Z" fill="#C9E8B5" stroke="#7FB55F" strokeWidth={1} />{[[54, 102, '#FF9EC2'], [62, 98, '#FFE27A'], [68, 104, '#C3B0EE'], [58, 108, '#FF7F9E']].map(([x, y, c]) => <Bloom key={c as string} cx={x as number} cy={y as number} r={5} color={c as string} />)}</G>;
    case 'payung': {
      const dots = look.b === 'dots';
      return (
        <G>
          <Path d="M84 112 V50" stroke={LN} strokeWidth={1.6} />
          <Path d="M58 54 Q84 20 110 54 Q103 49 97 54 Q90 49 84 54 Q78 49 71 54 Q65 49 58 54Z" fill={a} stroke={shade(a, -0.3)} strokeWidth={1.2} />
          {dots && [[70, 44], [84, 36], [98, 44], [78, 48], [92, 48]].map(([x, y]) => <Circle key={x} cx={x} cy={y} r={2} fill="#fff" />)}
        </G>
      );
    }
    case 'bintangjatuh':
      return <G><Path d="M104 4 Q86 14 72 30" stroke="#FFE27A" strokeWidth={3} strokeLinecap="round" opacity={0.7} /><Star cx={106} cy={2} r={7} color="#FFD45E" /></G>;
    case 'tongkat':
      return <G><Path d="M84 114 L98 76" stroke="#C3B0EE" strokeWidth={2.6} strokeLinecap="round" /><Star cx={99} cy={72} r={8} color="#FFD45E" /><Star cx={108} cy={84} r={2.4} color="#fff" stroke={false} /></G>;
    case 'boba':
      return <G><Path d="M78 100 H92 L90 120 Q85 122 80 120Z" fill="#F2D3B8" stroke="#C99A6E" strokeWidth={1} /><Path d="M77 100 Q85 94 93 100Z" fill="#fff" stroke="#C99A6E" strokeWidth={1} /><Path d="M87 98 L90 86" stroke="#FF9EC2" strokeWidth={2.4} strokeLinecap="round" />{[[81, 116], [85, 118], [88, 115], [83, 113]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={1.4} fill="#5A3A2E" />)}</G>;
    case 'eskrim':
      return <G><Path d="M80 106 L86 124 L92 106Z" fill="#F2C27A" stroke="#C99A4A" strokeWidth={1} /><Circle cx={86} cy={102} r={7} fill="#FFB6CF" stroke="#E2799E" strokeWidth={1} /><Circle cx={86} cy={95} r={2.4} fill="#FF5E57" /></G>;
    case 'buku':
      return <G><Rect x={78} y={102} width={18} height={22} rx={2} fill={a} stroke={shade(a, -0.3)} strokeWidth={1.1} transform="rotate(-10 87 113)" /><Path d="M82 108 H92 M82 112 H90" stroke="#fff" strokeWidth={1.2} transform="rotate(-10 87 113)" /><Heart cx={88} cy={118} s={2.6} color="#fff" stroke={false} /></G>;
    case 'keranjang':
      return <G><Path d="M22 112 Q32 96 42 112" stroke="#C99A6E" strokeWidth={2} fill="none" />{[[26, 110, '#FF9EC2'], [33, 107, '#FFE27A'], [39, 110, '#C3B0EE']].map(([x, y, c]) => <Bloom key={c as string} cx={x as number} cy={y as number} r={4.6} color={c as string} />)}<Path d="M20 112 H44 L41 124 H23Z" fill="#E7B97F" stroke="#C99A6E" strokeWidth={1.1} /></G>;
    case 'penyiram':
      return <G><Path d="M80 108 H96 V122 Q96 124 94 124 H82 Q80 124 80 122Z" fill={a} stroke={shade(a, -0.3)} strokeWidth={1.1} /><Path d="M96 112 L106 104" stroke={shade(a, -0.3)} strokeWidth={2.4} strokeLinecap="round" /><Path d="M80 112 Q74 112 76 118" stroke={shade(a, -0.3)} strokeWidth={1.6} fill="none" /><Bloom cx={88} cy={116} r={3.6} color="#fff" center={a} outline={false} /></G>;
    case 'kalung':
      return <G><Path d="M46 88 Q60 104 74 88" stroke="#6FC46A" strokeWidth={1.4} fill="none" />{[[47, 90, '#FF9EC2'], [52, 96, '#FFE27A'], [60, 99, '#C3B0EE'], [68, 96, '#FFE27A'], [73, 90, '#FF9EC2']].map(([x, y, c], i) => <Bloom key={i} cx={x as number} cy={y as number} r={3.4} color={c as string} />)}</G>;
    case 'layangan':
      return <G><Path d="M37 112 Q30 70 18 40" stroke="#B9AFC6" strokeWidth={0.9} fill="none" /><Path d="M18 18 L30 32 L18 48 L6 32Z" fill={a} stroke={shade(a, -0.3)} strokeWidth={1.1} /><Path d="M18 18 V48 M6 32 H30" stroke="#fff" strokeWidth={1} /><Path d="M18 48 q-4 6 0 10 q4 4 0 8" stroke="#FFE27A" strokeWidth={1.6} fill="none" /></G>;
    case 'gelembung':
      return <G fill="rgba(200,235,255,0.35)" stroke="#9CCFF0" strokeWidth={1}>{[[96, 70, 7], [106, 54, 5], [92, 44, 4], [18, 62, 6], [24, 46, 4]].map(([x, y, r]) => <Circle key={x} cx={x} cy={y} r={r} />)}</G>;
    case 'gulali':
      return <G><Path d="M84 114 L90 84" stroke="#E7D9C8" strokeWidth={2} strokeLinecap="round" /><Circle cx={88} cy={80} r={9} fill="#FFC2D6" /><Circle cx={94} cy={74} r={6} fill="#D6C5F4" /><Circle cx={84} cy={73} r={6} fill="#FFD3E0" /></G>;
    case 'lentera':
      return <G><Path d="M84 112 V100" stroke={LN} strokeWidth={1.2} /><Circle cx={88} cy={104} r={12} fill="#FFF2B3" opacity={0.5} /><Rect x={82} y={98} width={12} height={14} rx={3} fill="#FFD45E" stroke="#D9A520" strokeWidth={1.1} /><Path d="M82 98 L88 93 L94 98Z" fill="#C99A6E" /></G>;
    case 'kamera':
      return <G><Path d="M46 88 L58 104 M74 88 L62 104" stroke={LN} strokeWidth={1} /><Rect x={51} y={102} width={18} height={12} rx={3} fill={a} stroke={shade(a, -0.3)} strokeWidth={1.1} /><Circle cx={60} cy={108} r={3.6} fill="#fff" stroke={LN} strokeWidth={1} /><Circle cx={60} cy={108} r={1.6} fill={LN} /></G>;
    case 'kupu':
      return <G><Butterfly cx={100} cy={46} s={6} a="#FFB3D0" b="#C9B5FF" /><Butterfly cx={18} cy={78} s={5} a="#9CD3F5" b="#FFE27A" /></G>;
    case 'kelopak':
      return <G>{[[14, 40], [104, 30], [96, 74], [22, 92], [108, 108], [10, 120], [30, 18]].map(([x, y], i) => <Ellipse key={i} cx={x} cy={y} rx={3.4} ry={2.2} fill={i % 2 ? '#FFC2D6' : '#FFE3EE'} stroke="#F2A0BE" strokeWidth={0.6} transform={`rotate(${i * 40} ${x} ${y})`} />)}</G>;
    case 'bulan':
      return <G><Path d="M22 6 A12 12 0 1 0 30 26 A9 9 0 1 1 22 6Z" fill="#FFE27A" stroke="#E0B030" strokeWidth={1.1} /><Star cx={34} cy={8} r={2.4} color="#fff" stroke={false} /></G>;
    case 'kunang':
      return <G>{[[14, 50], [104, 40], [100, 86], [20, 96], [8, 72]].map(([x, y], i) => <G key={i}><Circle cx={x} cy={y} r={5} fill="#FFF6B3" opacity={0.6} /><Circle cx={x} cy={y} r={2} fill="#FFE27A" /></G>)}</G>;
    default:
      return null;
  }
}

function Ransel({ a }: { a: string }) {
  return <G><Rect x={36} y={88} width={48} height={32} rx={10} fill={a} stroke={shade(a, -0.3)} strokeWidth={1.2} /><Ellipse cx={42} cy={86} rx={4} ry={8} fill="#fff" stroke="#E6D3DC" strokeWidth={1} /><Ellipse cx={78} cy={86} rx={4} ry={8} fill="#fff" stroke="#E6D3DC" strokeWidth={1} /></G>;
}
function RanselStraps({ a }: { a: string }) {
  return <G><Path d="M46 87 Q44 100 46 112 M74 87 Q76 100 74 112" stroke={shade(a, -0.15)} strokeWidth={3} fill="none" strokeLinecap="round" /></G>;
}
