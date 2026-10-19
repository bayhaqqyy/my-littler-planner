import { createElement } from 'react';
import { Pressable, View } from 'react-native';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { parseDate } from '@/domain';
import { colors, fonts, INPUT_FONT_SIZE } from '@/theme/theme';
import { css, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';

/**
 * Native date/time picker with our own look. iOS Safari ignores most styling on these inputs
 * (centred text, odd height, blank when empty, no clear button), so the native control is
 * reset (see `.mlp-dt` in public/index.html) and drawn over with our label, icon and × button.
 * The input still covers the whole field, so a tap anywhere opens the system picker.
 */
export function WebDateTimeInput({ type, value, onChange, label, error, min, max, placeholder, clearable }: {
  type: 'date' | 'time'; value?: string; onChange: (v: string) => void; label: string; error?: string; min?: string; max?: string;
  placeholder?: string; clearable?: boolean;
}) {
  const empty = !value;
  const shown = empty ? placeholder ?? (type === 'date' ? 'Pilih tanggal' : 'Pilih jam')
    : type === 'date' ? format(parseDate(value!), 'EEE, d MMM yyyy', { locale: localeId }) : value!.replace(':', '.');
  return (
    <View>
      <View style={[
        { minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: error ? colors.danger : colors.line, backgroundColor: '#fff', justifyContent: 'center', paddingLeft: 14, paddingRight: clearable && !empty ? 76 : 42 },
        css({ position: 'relative', overflow: 'hidden' }),
      ]}>
        <T numberOfLines={1} style={{ fontFamily: fonts.medium, fontSize: INPUT_FONT_SIZE, color: empty ? '#A897AD' : colors.text, textTransform: type === 'date' && !empty ? 'capitalize' : 'none' }}>
          {shown}
        </T>
        {createElement('input', {
          type,
          className: 'mlp-dt',
          value: value ?? '',
          min,
          max,
          'aria-label': label,
          'aria-invalid': !!error,
          onChange: (e: { target: { value: string } }) => onChange(e.target.value),
          // The input is transparent, so always open the browser's picker on click (desktop);
          // iOS opens its wheel picker on tap by itself.
          onClick: (e: { currentTarget: HTMLInputElement }) => { try { e.currentTarget.showPicker?.(); } catch { /* not allowed here */ } },
          style: { fontFamily: fonts.medium, fontSize: INPUT_FONT_SIZE, color: colors.text },
        })}
        <View pointerEvents="none" style={{ position: 'absolute', right: clearable && !empty ? 44 : 12, top: 0, bottom: 0, justifyContent: 'center' }}>
          <Icon name={type === 'date' ? 'calendar' : 'clock'} size={18} color={empty ? '#A897AD' : colors.accent} />
        </View>
        {clearable && !empty && (
          <Pressable accessibilityRole="button" accessibilityLabel={`Kosongkan ${label}`} onPress={() => onChange('')}
            style={[{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 44, alignItems: 'center', justifyContent: 'center', zIndex: 2, borderLeftWidth: 1, borderColor: colors.line }, css({ cursor: 'pointer' })]}>
            <Icon name="close" size={16} />
          </Pressable>
        )}
      </View>
      {error ? <T v="small" style={{ color: colors.danger, marginTop: 4 }} accessibilityLiveRegion="polite">{error}</T> : null}
    </View>
  );
}
