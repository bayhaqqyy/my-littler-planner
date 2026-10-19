import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { colors, linear } from '@/theme/theme';
import { css } from './ui/primitives';
import { useReduceMotion } from '@/store/hooks';

/**
 * Loading screen shown while the app boots. It mirrors the HTML splash in public/index.html
 * (same icon, size, gradient, bobbing) so the hand-over from HTML to React is seamless.
 * Uses the system font on purpose: it may show before Quicksand is ready.
 */
const bob = css({
  animationKeyframes: [{ '0%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' }, '100%': { transform: 'translateY(0)' } }],
  animationDuration: '1.6s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
});
const dot = (delay: number) => css({
  animationKeyframes: [{ '0%': { opacity: 0.25, transform: 'scale(0.8)' }, '40%': { opacity: 1, transform: 'scale(1)' }, '80%': { opacity: 0.25, transform: 'scale(0.8)' }, '100%': { opacity: 0.25, transform: 'scale(0.8)' } }],
  animationDuration: '1.2s', animationIterationCount: 'infinite', animationDelay: `${delay}ms`,
});

export function LoadingScreen({ message }: { message?: string }) {
  // Only explain when it takes a while; a quick load just shows the bouncing icon.
  const reduce = useReduceMotion();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? 'Memuat My Little Planner'}
      style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }, css({ minHeight: '100vh', backgroundImage: linear(colors.bgGradient) })]}
    >
      <View style={[{ borderRadius: 28 }, css({ boxShadow: '0 6px 14px rgba(194,69,122,.18)' }), reduce ? null : bob]}>
        <Image source={{ uri: '/icons/icon.svg' }} style={{ width: 120, height: 120, borderRadius: 28 }} accessibilityIgnoresInvertColors />
      </View>
      <Text style={[{ color: colors.accent, fontSize: 16, fontWeight: '700' }, css({ fontFamily: 'system-ui, -apple-system, sans-serif' })]}>My Little Planner</Text>
      <View style={{ flexDirection: 'row', gap: 6, height: 10, alignItems: 'center' }} aria-hidden>
        {[0, 150, 300].map((d) => <View key={d} style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F7A8C4' }, reduce ? { opacity: 0.6 } : dot(d)]} />)}
      </View>
      <Text style={[{ color: colors.muted, fontSize: 13, minHeight: 18, textAlign: 'center', opacity: slow ? 1 : 0 }, css({ fontFamily: 'system-ui, -apple-system, sans-serif', transitionDuration: '300ms' })]}>
        {message ?? 'Sebentar ya…'}
      </Text>
    </View>
  );
}
