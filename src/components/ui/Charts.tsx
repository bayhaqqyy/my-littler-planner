import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { data } from '@/theme/theme';
import { css, T } from './primitives';
import { useReduceMotion } from '@/store/hooks';

const STRIPES = 'repeating-linear-gradient(45deg, rgba(255,255,255,.4) 0 8px, transparent 8px 16px)';

/** Rainbow progress bar with moving candy stripes. */
export function ProgressBar({ value, height = 12, label }: { value: number; height?: number; label: string }) {
  const reduce = useReduceMotion();
  const w = useRef(new Animated.Value(0)).current;
  const pct = Math.max(0, Math.min(1, value));
  useEffect(() => {
    if (reduce) { w.setValue(pct); return; }
    Animated.timing(w, { toValue: pct, duration: 800, useNativeDriver: false }).start();
  }, [pct, reduce, w]);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={{ height, borderRadius: height, backgroundColor: '#FBEAF1', overflow: 'hidden' }}
    >
      <Animated.View
        style={[
          { height, borderRadius: height, width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          css({ backgroundImage: `${STRIPES}, linear-gradient(90deg, ${data.rainbow.join(', ')})`, backgroundSize: '22.6px 22.6px, 100% 100%' }),
          reduce ? null : css({ animationKeyframes: [{ from: { backgroundPosition: '0 0, 0 0' }, to: { backgroundPosition: '22.6px 0, 0 0' } }], animationDuration: '1.4s', animationIterationCount: 'infinite', animationTimingFunction: 'linear' }),
        ]}
      />
    </View>
  );
}

/** Weekly completion donut. */
export function Donut({ ratio, size = 120, label, sub }: { ratio: number; size?: number; label?: string; sub?: string }) {
  const r = 44, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, ratio));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityRole="image" accessibilityLabel={`${Math.round(pct * 100)} persen selesai`}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="donut" x1="0" y1="0" x2="1" y2="1">
            {data.donutFill.map((s, i) => <Stop key={s} offset={i / (data.donutFill.length - 1)} stopColor={s} />)}
          </LinearGradient>
        </Defs>
        <Circle cx={50} cy={50} r={r} stroke={data.donutTrack} strokeWidth={10} fill="none" />
        {pct > 0 && <Circle cx={50} cy={50} r={r} stroke="url(#donut)" strokeWidth={10} fill="none" strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90 50 50)" />}
      </Svg>
      <T v="greeting" style={{ fontVariant: ['tabular-nums'] }}>{label ?? `${Math.round(pct * 100)}%`}</T>
      {sub ? <T v="muted">{sub}</T> : null}
    </View>
  );
}

/** Colorful bar chart. */
export function BarChart({ items, height = 140, unit = '' }: { items: { label: string; value: number; highlight?: boolean }[]; height?: number; unit?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: height + 40 }} accessibilityRole="image"
      accessibilityLabel={items.map((i) => `${i.label}: ${i.value}${unit}`).join(', ')}>
      {items.map((it, i) => (
        <View key={it.label + i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <T v="chip" style={{ color: '#76627C' }}>{it.value}{unit}</T>
          <View style={[{ width: '70%', maxWidth: 34, height: Math.max(6, (it.value / max) * height), borderRadius: 10, backgroundColor: data.bars[i % data.bars.length] }, it.highlight ? { borderWidth: 2, borderColor: '#C2457A' } : null]} />
          <T v="chip" style={{ color: it.highlight ? '#C2457A' : '#76627C' }}>{it.label}</T>
        </View>
      ))}
    </View>
  );
}
