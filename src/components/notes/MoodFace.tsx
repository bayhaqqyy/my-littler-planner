import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import type { Mood } from '@/domain';

const INK = '#5B4560';

export const MOOD_COLORS: Record<Mood, { face: string; line: string }> = {
  senang: { face: '#FFE27A', line: '#F2C94C' },
  biasa: { face: '#C5E6FA', line: '#9CD3F5' },
  sedih: { face: '#D6C5F4', line: '#B49BE8' },
  capek: { face: '#F2E2C9', line: '#E2C9A3' },
  semangat: { face: '#FFB6CF', line: '#F48FB1' },
};

/** Small kawaii face for each mood. */
export function MoodFace({ mood, size = 40 }: { mood: Mood; size?: number }) {
  const c = MOOD_COLORS[mood];
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <Circle cx={20} cy={20} r={17} fill={c.face} stroke={c.line} strokeWidth={1.5} />
      <G opacity={0.7}>
        <Ellipse cx={10.5} cy={24} rx={3} ry={1.9} fill="#FF9EC2" />
        <Ellipse cx={29.5} cy={24} rx={3} ry={1.9} fill="#FF9EC2" />
      </G>
      {mood === 'senang' && (
        <G>
          <Path d="M12 18 Q14.5 15 17 18 M23 18 Q25.5 15 28 18" stroke={INK} strokeWidth={1.8} fill="none" strokeLinecap="round" />
          <Path d="M14.5 23 Q20 30 25.5 23 Z" fill="#E86A8C" stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
        </G>
      )}
      {mood === 'biasa' && (
        <G>
          <Circle cx={14.5} cy={18} r={2.2} fill={INK} />
          <Circle cx={25.5} cy={18} r={2.2} fill={INK} />
          <Path d="M16 26 H24" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
        </G>
      )}
      {mood === 'sedih' && (
        <G>
          <Circle cx={14.5} cy={18.5} r={2.2} fill={INK} />
          <Circle cx={25.5} cy={18.5} r={2.2} fill={INK} />
          <Path d="M15.5 27.5 Q20 23.5 24.5 27.5" stroke={INK} strokeWidth={1.8} fill="none" strokeLinecap="round" />
          <Path d="M12.5 21.5 q-1.2 2.5 0 3.4 q1.2 -0.9 0 -3.4z" fill="#7CC4F0" />
        </G>
      )}
      {mood === 'capek' && (
        <G>
          <Path d="M11.5 18.5 H17 M23 18.5 H28.5" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
          <Ellipse cx={20} cy={26.5} rx={2.4} ry={1.8} fill={INK} />
          <Path d="M29 8 h4 l-4 4 h4" stroke="#B49BE8" strokeWidth={1.3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </G>
      )}
      {mood === 'semangat' && (
        <G>
          <Path d="M14.5 14.5 l1.1 2.4 2.5.3 -1.9 1.7 .5 2.5 -2.2 -1.3 -2.2 1.3 .5 -2.5 -1.9 -1.7 2.5 -.3z" fill={INK} />
          <Path d="M25.5 14.5 l1.1 2.4 2.5.3 -1.9 1.7 .5 2.5 -2.2 -1.3 -2.2 1.3 .5 -2.5 -1.9 -1.7 2.5 -.3z" fill={INK} />
          <Path d="M13.5 23.5 Q20 32 26.5 23.5 Z" fill="#E86A8C" stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
        </G>
      )}
    </Svg>
  );
}
