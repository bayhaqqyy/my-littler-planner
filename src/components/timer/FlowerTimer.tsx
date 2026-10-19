import { Pressable, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Stop } from 'react-native-svg';
import { data, colors } from '@/theme/theme';
import { css, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';

const fmt = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(r).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};
export const formatClock = fmt;

/** Flower-shaped timer: petals around a gradient progress ring, big time, round play/pause in the middle. */
export function FlowerTimer({ remaining, total, rest, running, onToggle, size = 300, caption }: {
  remaining: number; total: number; rest: boolean; running: boolean; onToggle: () => void; size?: number; caption?: string;
}) {
  const petal = rest ? data.timer.restPetal : data.timer.petal;
  const r = 70, c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const timeSize = size >= 300 ? 46 : 38;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 200 200" style={{ position: 'absolute' }} aria-hidden>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            {data.timer.ring.map((s, i) => <Stop key={s} offset={i / (data.timer.ring.length - 1)} stopColor={s} />)}
          </LinearGradient>
        </Defs>
        {Array.from({ length: 12 }, (_, i) => (
          <Ellipse key={i} cx={100} cy={22} rx={20} ry={26} fill={petal} stroke="#fff" strokeWidth={2} transform={`rotate(${i * 30} 100 100)`} />
        ))}
        <Circle cx={100} cy={100} r={80} fill="#fff" />
        <Circle cx={100} cy={100} r={r} stroke={rest ? '#E3F4EA' : '#FBE1EC'} strokeWidth={10} fill="none" />
        {frac > 0 && <Circle cx={100} cy={100} r={r} stroke={rest ? data.timer.restRing : 'url(#ringGrad)'} strokeWidth={10} fill="none" strokeLinecap="round"
          strokeDasharray={`${c * frac} ${c}`} transform="rotate(-90 100 100)" />}
      </Svg>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <T v="greeting" accessibilityRole="timer" accessibilityLabel={`Sisa waktu ${fmt(remaining)}`}
          style={{ fontSize: timeSize, fontVariant: ['tabular-nums'], color: rest ? '#2E6B4A' : colors.text }}>{fmt(remaining)}</T>
        {caption ? <T v="muted">{caption}</T> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={running ? 'Pause' : 'Start'}
          onPress={onToggle}
          style={({ pressed }) => [
            { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.94 : 1 }] },
            css({ backgroundImage: rest ? 'linear-gradient(135deg,#7CCFA4,#4FAF84)' : `linear-gradient(135deg, ${colors.accentGradient.join(', ')})`, boxShadow: '0 6px 14px rgba(194,69,122,.25)', cursor: 'pointer' }),
          ]}
        >
          <Icon name={running ? 'pause' : 'play'} size={26} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
