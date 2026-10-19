import { Pressable, View } from 'react-native';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { DEADLINE_REMINDER_OPTIONS, deadlineReminderTimes, REMINDER_OFFSET_LABEL, wallToDate } from '@/domain';
import { colors, radius } from '@/theme/theme';
import { css, Row, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';

/** "Min, 18 Okt 23.59" */
const fmtWall = (w: string) => format(wallToDate(w), 'EEE, d MMM HH.mm', { locale: localeId });

/**
 * Multi-select deadline reminder chips (with a check when on). With `dueAt`, lists when each
 * notification will fire underneath; ones already in the past are shown as not sent.
 */
export function ReminderChips({ value, onChange, dueAt, label = 'Ingatkan aku' }: {
  value: number[]; onChange: (v: number[]) => void; dueAt?: string; label?: string;
}) {
  const toggle = (m: number) => onChange(value.includes(m) ? value.filter((x) => x !== m) : [...value, m].sort((a, b) => b - a));
  const now = new Date();
  const all = dueAt ? deadlineReminderTimes(dueAt, value) : [];
  return (
    <View style={{ gap: 8 }}>
      <T v="small" style={{ color: colors.muted }}>{label}</T>
      <Row wrap gap={8}>
        {DEADLINE_REMINDER_OPTIONS.map((m) => {
          const on = value.includes(m);
          return (
            <Pressable
              key={m}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              aria-checked={on}
              accessibilityLabel={REMINDER_OFFSET_LABEL[m]}
              onPress={() => toggle(m)}
              style={[
                { minHeight: 44, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
                on ? { backgroundColor: colors.accentSoft, borderColor: '#F7A8C4' } : { backgroundColor: '#fff', borderColor: colors.line },
                css({ cursor: 'pointer' }),
              ]}
            >
              {on && <Icon name="check" size={15} color={colors.accent} />}
              <T v="small" style={{ color: on ? colors.accent : colors.text }}>{REMINDER_OFFSET_LABEL[m]}</T>
            </Pressable>
          );
        })}
      </Row>
      {dueAt && (
        <View style={{ gap: 4, marginTop: 2 }} accessibilityLabel="Jadwal notifikasi">
          {all.length === 0 ? (
            <T v="muted">Tidak ada pengingat yang dipilih.</T>
          ) : (
            all.map((r) => {
              const past = wallToDate(r.at).getTime() < now.getTime() - 60_000;
              return (
                <Row key={r.offset} gap={8}>
                  <Icon name="bell" size={14} color={past ? '#B9A9BF' : colors.accent} />
                  <T v="small" style={{ color: past ? '#A897AD' : colors.text, textTransform: 'capitalize' }}>
                    {fmtWall(r.at)} <T v="muted" style={{ textTransform: 'none' }}>({REMINDER_OFFSET_LABEL[r.offset].toLowerCase()}){past ? ' · sudah lewat, tidak dikirim' : ''}</T>
                  </T>
                </Row>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}
