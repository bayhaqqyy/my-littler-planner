import { useEffect, useRef } from 'react';
import { Animated, Pressable, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import type { Category } from '@/domain';
import { categoryColors } from '@/theme/theme';
import { useReduceMotion } from '@/store/hooks';
import { css } from '@/components/ui/primitives';

/** Round checkbox in the category color; blooms into a flower when checked (700 ms). */
export function FlowerCheck({ done, category, onToggle, label }: { done: boolean; category: Category; onToggle: (e: GestureResponderEvent) => void; label: string }) {
  const c = categoryColors[category];
  const reduce = useReduceMotion();
  const a = useRef(new Animated.Value(done ? 1 : 0)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; a.setValue(done ? 1 : 0); return; }
    if (reduce || !done) { a.setValue(done ? 1 : 0); return; }
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: false }).start();
  }, [done, reduce, a]);
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={label}
      onPress={onToggle}
      hitSlop={6}
      style={[{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, css({ cursor: 'pointer' })]}
    >
      {!done && <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2.5, borderColor: c.dot, backgroundColor: '#fff' }} />}
      {done && (
        <Animated.View style={{
          transform: [
            { scale: a.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1.25, 1] }) },
            { rotate: a.interpolate({ inputRange: [0, 1], outputRange: ['-120deg', '0deg'] }) },
          ],
        }}>
          <Svg width={34} height={34} viewBox="0 0 40 40">
            {Array.from({ length: 6 }, (_, i) => <Ellipse key={i} cx={20} cy={10} rx={6} ry={8.5} fill={c.dot} transform={`rotate(${i * 60} 20 20)`} />)}
            <Circle cx={20} cy={20} r={7} fill="#FFE27A" />
            <Path d="M16.5 20 L19 22.5 L24 17.5" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Animated.View>
      )}
    </Pressable>
  );
}
