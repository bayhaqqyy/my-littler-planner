import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, radius } from '@/theme/theme';
import { css, T } from '@/components/ui/primitives';

/** "Daftar | Kalender" toggle shared by the Tugas list and calendar pages. */
export function ViewSwitch({ value }: { value: 'list' | 'calendar' }) {
  const items = [{ key: 'list', label: 'Daftar', href: '/tasks' }, { key: 'calendar', label: 'Kalender', href: '/calendar' }] as const;
  return (
    <View accessibilityRole="tablist" accessibilityLabel="Tampilan tugas"
      style={{ flexDirection: 'row', backgroundColor: '#E3F1D8', borderRadius: radius.pill, padding: 4, height: 44 }}>
      {items.map((it) => {
        const on = it.key === value;
        return (
          <Pressable key={it.key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={it.label}
            onPress={() => { if (!on) router.navigate(it.href); }}
            style={[{ paddingHorizontal: 14, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: on ? '#fff' : 'transparent' }, css({ cursor: 'pointer', boxShadow: on ? '0 2px 6px rgba(80,130,60,.15)' : 'none' })]}>
            <T v="small" style={{ fontFamily: on ? fonts.bold : fonts.semibold, color: on ? colors.text : colors.muted, fontSize: 13.5 }}>{it.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}
