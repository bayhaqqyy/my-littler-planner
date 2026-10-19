import { Pressable, View } from 'react-native';
import type { TaskKind } from '@/domain';
import { colors, shadow } from '@/theme/theme';
import { css, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';

const OPTIONS: { key: TaskKind; label: string; icon: 'clock' | 'flag'; help: string }[] = [
  { key: 'scheduled', label: 'Terjadwal', icon: 'clock', help: 'Punya jam mulai dan selesai, cocok untuk kelas atau sesi belajar.' },
  { key: 'deadline', label: 'Deadline', icon: 'flag', help: 'Satu batas waktu tanpa jam mulai dan selesai. Cocok untuk tugas yang harus dikumpulkan.' },
];

/** Two-option segment: Terjadwal | Deadline, with a line explaining the chosen kind. */
export function TaskKindToggle({ value, onChange }: { value: TaskKind; onChange: (k: TaskKind) => void }) {
  const help = OPTIONS.find((o) => o.key === value)!.help;
  return (
    <View style={{ gap: 8 }}>
      <View accessibilityRole="radiogroup" accessibilityLabel="Jenis tugas" style={{ flexDirection: 'row', backgroundColor: '#FBEFF4', borderRadius: 999, padding: 4, gap: 4 }}>
        {OPTIONS.map((o) => {
          const on = o.key === value;
          return (
            <Pressable
              key={o.key}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              aria-checked={on}
              accessibilityLabel={o.label}
              onPress={() => onChange(o.key)}
              style={[
                { flex: 1, minHeight: 44, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: on ? '#fff' : 'transparent' },
                on ? css(shadow.card) : null,
                css({ cursor: 'pointer', transitionDuration: '150ms' }),
              ]}
            >
              <Icon name={o.icon} size={18} color={on ? colors.accent : colors.muted} />
              <T v="body" style={{ fontFamily: 'Quicksand_700Bold', color: on ? colors.accent : colors.muted }}>{o.label}</T>
            </Pressable>
          );
        })}
      </View>
      <T v="muted">{help}</T>
    </View>
  );
}
