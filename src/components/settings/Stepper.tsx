import { View } from 'react-native';
import { colors } from '@/theme/theme';
import { IconButton, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';

/** − value + stepper with bounds. */
export function Stepper({ label, value, min, max, step = 1, unit = '', onChange, disabled }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void; disabled?: boolean;
}) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 44, opacity: disabled ? 0.5 : 1 }}>
      <T v="body" style={{ flex: 1 }}>{label}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ min, max, now: value }}>
        <IconButton label={`Kurangi ${label}`} size={36} onPress={() => !disabled && set(value - step)}><T v="cardTitle" style={{ color: colors.accent }}>−</T></IconButton>
        <T v="cardTitle" style={{ minWidth: 54, textAlign: 'center', fontVariant: ['tabular-nums'] }}>{value}{unit}</T>
        <IconButton label={`Tambah ${label}`} size={36} onPress={() => !disabled && set(value + step)}><Icon name="plus" size={16} color={colors.accent} /></IconButton>
      </View>
    </View>
  );
}
