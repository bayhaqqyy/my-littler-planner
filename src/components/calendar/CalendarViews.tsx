import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  addDays, CATEGORY_EMOJI, conflictingIds, fromMinutes, layoutColumns, occurrencesOn, parseDate, range, slotOf,
  startOfWeek, toMinutes, urgencyOf, wallTime, wallToDate, type OccView, type Occurrence, type Task, type Urgency,
} from '@/domain';
import { categoryColors, colors, fonts, radius, urgencyColors } from '@/theme/theme';
import { css, Row, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { useNow } from '@/store/hooks';

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export const dayLabel = (d: string, pattern = 'EEEE, d MMMM yyyy') => format(parseDate(d), pattern, { locale: localeId });

/** Deadline occurrences among a day's views (they carry `dueAt`). */
export const deadlineViews = (views: OccView[]) => views.filter((v) => v.dueAt);
export const scheduledViews = (views: OccView[]) => views.filter((v) => !v.dueAt);

const URGENCY_RANK: Urgency[] = ['terlewat', 'mendesak', 'dekat', 'aman', 'selesai'];

/** Urgency of the most urgent not-done deadline that day ('selesai' when all are done). */
export function dayDeadlineUrgency(views: OccView[], nowMs: number): Urgency | undefined {
  const dl = deadlineViews(views);
  if (!dl.length) return undefined;
  const levels = dl.map((v) => urgencyOf(wallToDate(v.dueAt!).getTime(), nowMs, v.done));
  return URGENCY_RANK.find((u) => levels.includes(u));
}

const flagColor = (u: Urgency) => (u === 'selesai' ? urgencyColors.selesai.text : urgencyColors[u].text);
const dueText = (v: OccView) => wallTime(v.dueAt!).replace(':', '.');

const openTask = (v: OccView) => router.push({ pathname: '/task/[id]', params: { id: v.task.id, date: v.date } });

/** Month grid (Monday first, 6 rows) with category dots and deadline markers. */
export function MonthGrid({ selected, today, tasks, occs, onSelect, compact }: {
  selected: string; today: string; tasks: Task[]; occs: Record<string, Occurrence>; onSelect: (d: string) => void; compact: boolean;
}) {
  const nowMs = useNow(60_000).getTime();
  const first = `${selected.slice(0, 7)}-01`;
  const days = range(startOfWeek(first), 42);
  const month = selected.slice(0, 7);
  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((w) => (
          <View key={w} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 6 }}>
            <T v="chip" style={{ color: colors.muted }}>{w}</T>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {days.map((d) => {
          const all = occurrencesOn(tasks, d, occs);
          const views = scheduledViews(all);
          const deadlines = deadlineViews(all);
          const urg = dayDeadlineUrgency(all, nowMs);
          const inMonth = d.startsWith(month);
          const isToday = d === today;
          const isSel = d === selected;
          const dots = views.slice(0, compact ? 3 : 4);
          const more = views.length - dots.length;
          return (
            <Pressable
              key={d}
              onPress={() => onSelect(d)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSel }}
              accessibilityLabel={`${dayLabel(d)}, ${views.length} kegiatan${deadlines.length ? `, ${deadlines.length} deadline` : ''}`}
              style={[
                { width: `${100 / 7}%`, minHeight: compact ? 54 : 74, alignItems: 'center', paddingVertical: 5, gap: 4, borderRadius: 14, backgroundColor: isSel ? colors.accentSoft : 'transparent' },
                css({ cursor: 'pointer' }),
              ]}
            >
              <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: isToday ? 2 : 0, borderColor: '#F48FB1', backgroundColor: isToday ? '#FFF0F5' : 'transparent' }}>
                <T v="small" style={{ fontFamily: isToday || isSel ? fonts.bold : fonts.semibold, color: inMonth ? (isToday ? colors.accent : colors.text) : '#C4B5C9' }}>{Number(d.slice(8))}</T>
              </View>
              <Row gap={3} style={{ flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 2 }}>
                {dots.map((v) => <View key={v.key} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: categoryColors[v.task.category].dot, opacity: v.done ? 0.45 : 1 }} />)}
                {more > 0 && <T v="chip" style={{ fontSize: 9.5, color: colors.muted }}>+{more}</T>}
              </Row>
              {urg && <Icon name="flag" size={13} color={flagColor(urg)} fill={urg === 'selesai' ? undefined : urgencyColors[urg].dot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Week: 7 columns on wide screens, a stacked list of days on phones. */
export function WeekView({ selected, today, tasks, occs, onSelect, stacked }: {
  selected: string; today: string; tasks: Task[]; occs: Record<string, Occurrence>; onSelect: (d: string) => void; stacked: boolean;
}) {
  const days = range(startOfWeek(selected), 7);
  const nowMs = useNow(60_000).getTime();
  return (
    <View style={{ flexDirection: stacked ? 'column' : 'row', gap: 6 }}>
      {days.map((d, i) => {
        const all = occurrencesOn(tasks, d, occs);
        const views = scheduledViews(all);
        const isSel = d === selected;
        const isToday = d === today;
        const deadlines = deadlineViews(all);
        return (
          <View key={d} style={[{ flex: stacked ? undefined : 1, minWidth: 0, borderRadius: 16, borderWidth: 1, borderColor: isSel ? '#F7A8C4' : colors.line, backgroundColor: isSel ? '#FFF6F9' : '#fff', padding: 6, gap: 4 }, stacked ? { flexDirection: 'row', alignItems: 'flex-start', gap: 10 } : { minHeight: 200 }]}>
            <Pressable
              onPress={() => onSelect(d)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSel }}
              accessibilityLabel={`${dayLabel(d)}, ${views.length} kegiatan`}
              style={[{ alignItems: 'center', minHeight: 44, minWidth: 44, justifyContent: 'center', borderRadius: 12 }, css({ cursor: 'pointer' })]}
            >
              <T v="chip" style={{ color: colors.muted }}>{WEEKDAYS[i]}</T>
              <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: isToday ? 2 : 0, borderColor: '#F48FB1' }}>
                <T v="cardTitle" style={{ color: isToday ? colors.accent : colors.text }}>{Number(d.slice(8))}</T>
              </View>
            </Pressable>
            <View style={{ flex: stacked ? 1 : undefined, gap: 4, paddingVertical: stacked ? 4 : 0 }}>
              {views.length === 0 && deadlines.length === 0 && <T v="chip" style={{ color: '#B3A3B8', textAlign: stacked ? 'left' : 'center', paddingTop: stacked ? 12 : 0 }}>—</T>}
              {views.map((v) => {
                const c = categoryColors[v.task.category];
                return (
                  <Pressable key={v.key} onPress={() => openTask(v)} accessibilityRole="button" accessibilityLabel={`${v.task.title}${v.task.start ? `, ${v.task.start}` : ''}${v.done ? ', selesai' : ''}`}
                    style={[{ backgroundColor: c.bg, borderLeftWidth: 3, borderLeftColor: c.dot, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4, opacity: v.done ? 0.55 : 1 }, css({ cursor: 'pointer' })]}>
                    {v.task.start ? <T v="chip" style={{ color: c.text, fontSize: 10.5 }}>{v.task.start}</T> : null}
                    <T v="chip" numberOfLines={2} style={[{ color: c.text }, v.done ? css({ textDecorationLine: 'line-through' }) : null]}>{v.task.title}</T>
                  </Pressable>
                );
              })}
              {deadlines.map((v) => {
                const u = urgencyOf(wallToDate(v.dueAt!).getTime(), nowMs, v.done);
                const col = urgencyColors[u];
                return (
                  <Pressable key={v.key} onPress={() => openTask(v)} accessibilityRole="button" accessibilityLabel={`Deadline ${v.task.title}, ${dueText(v)}${v.done ? ', selesai' : ''}`}
                    style={[{ backgroundColor: u === 'selesai' ? '#F4F1F5' : col.bg, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4, opacity: v.done ? 0.6 : 1 }, css({ cursor: 'pointer' })]}>
                    <Row gap={3}><Icon name="flag" size={11} color={col.text} /><T v="chip" style={{ color: col.text, fontSize: 10.5 }}>{dueText(v)}</T></Row>
                    <T v="chip" numberOfLines={2} style={[{ color: col.text }, v.done ? css({ textDecorationLine: 'line-through' }) : null]}>{v.task.title}</T>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const HOUR_H = 56;
const LABEL_W = 50;

/** Day: hourly timeline, overlapping events side by side, conflicts dashed red, a "now" line. */
export function DayTimeline({ date, today, tasks, occs }: { date: string; today: string; tasks: Task[]; occs: Record<string, Occurrence> }) {
  const now = useNow(60_000);
  const all = occurrencesOn(tasks, date, occs);
  const views = scheduledViews(all);
  const deadlines = deadlineViews(all);
  const timed = views.filter((v) => slotOf(v.task)).map((v) => ({ v, slot: slotOf(v.task)! }));
  const untimed = views.filter((v) => !slotOf(v.task));
  const conflicts = conflictingIds(tasks, date, occs);
  let startH = 6, endH = 23;
  for (const { slot } of timed) {
    startH = Math.min(startH, Math.floor(slot.start / 60));
    endH = Math.max(endH, Math.ceil(slot.end / 60));
  }
  for (const v of deadlines) {
    const m = toMinutes(wallTime(v.dueAt!));
    startH = Math.min(startH, Math.floor(m / 60));
    endH = Math.max(endH, Math.floor(m / 60) + 1);
  }
  endH = Math.min(endH, 24);
  const hours = Array.from({ length: endH - startH }, (_, i) => startH + i);
  const laid = layoutColumns(timed);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const showNow = date === today && nowMin >= startH * 60 && nowMin <= endH * 60;

  return (
    <View style={{ gap: 10 }}>
      {untimed.length > 0 && (
        <View style={{ gap: 6 }}>
          <T v="muted">Tanpa jam</T>
          <Row wrap gap={6}>
            {untimed.map((v) => {
              const c = categoryColors[v.task.category];
              return (
                <Pressable key={v.key} onPress={() => openTask(v)} accessibilityRole="button" accessibilityLabel={v.task.title}
                  style={[{ backgroundColor: c.bg, borderRadius: radius.pill, paddingHorizontal: 12, minHeight: 36, justifyContent: 'center', opacity: v.done ? 0.55 : 1 }, css({ cursor: 'pointer' })]}>
                  <T v="small" style={{ color: c.text }}>{CATEGORY_EMOJI[v.task.category]} {v.task.title}</T>
                </Pressable>
              );
            })}
          </Row>
        </View>
      )}
      <View style={{ position: 'relative', height: hours.length * HOUR_H }}>
        {hours.map((h, i) => (
          <Pressable
            key={h}
            onPress={() => router.push({ pathname: '/task/new', params: { date, start: fromMinutes(h * 60) } })}
            accessibilityRole="button"
            accessibilityLabel={`Tambah tugas pukul ${fromMinutes(h * 60)}`}
            style={[{ position: 'absolute', top: i * HOUR_H, left: 0, right: 0, height: HOUR_H, flexDirection: 'row', borderTopWidth: 1, borderColor: colors.line }, css({ cursor: 'pointer' })]}
          >
            <T v="chip" style={{ width: LABEL_W, color: colors.muted, marginTop: -8, backgroundColor: 'transparent' }}>{fromMinutes(h * 60)}</T>
          </Pressable>
        ))}
        <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, bottom: 0, left: LABEL_W, right: 4 }}>
          {laid.map(({ v, slot, col, cols }) => {
            const c = categoryColors[v.task.category];
            const clash = conflicts.has(v.task.id);
            const top = ((slot.start - startH * 60) / 60) * HOUR_H;
            const height = Math.max(26, ((Math.min(slot.end, endH * 60) - slot.start) / 60) * HOUR_H - 2);
            return (
              <Pressable
                key={v.key}
                onPress={() => openTask(v)}
                accessibilityRole="button"
                accessibilityLabel={`${v.task.title}, ${fromMinutes(slot.start)} sampai ${fromMinutes(slot.end)}${clash ? ', bentrok' : ''}${v.done ? ', selesai' : ''}`}
                style={[
                  {
                    position: 'absolute', top, height, left: `${(col / cols) * 100}%`, width: `${100 / cols}%`, paddingHorizontal: 2,
                  },
                  css({ cursor: 'pointer' }),
                ]}
              >
                <View style={[
                  { flex: 1, backgroundColor: c.bg, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: c.dot, paddingHorizontal: 6, paddingVertical: 3, overflow: 'hidden', opacity: v.done ? 0.6 : 1 },
                  clash ? css({ borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.danger, borderLeftWidth: 4, borderLeftColor: c.dot }) : null,
                ]}>
                  <T v="chip" numberOfLines={height > 40 ? 2 : 1} style={[{ color: c.text, fontFamily: fonts.bold }, v.done ? css({ textDecorationLine: 'line-through' }) : null]}>{v.task.title}</T>
                  {height > 40 && <T v="chip" style={{ color: c.text, fontSize: 10.5 }}>{fromMinutes(slot.start)}–{fromMinutes(slot.end)}{clash ? ' · Bentrok' : ''}</T>}
                </View>
              </Pressable>
            );
          })}
        </View>
        {/* Deadlines: a thin marker at the due time, not a block (never a conflict). */}
        {deadlines.map((v) => {
          const m = toMinutes(wallTime(v.dueAt!));
          const u = urgencyOf(wallToDate(v.dueAt!).getTime(), now.getTime(), v.done);
          const col = urgencyColors[u];
          return (
            <Pressable key={v.key} onPress={() => openTask(v)} accessibilityRole="button"
              accessibilityLabel={`Deadline ${v.task.title}, pukul ${dueText(v)}${v.done ? ', selesai' : ''}`}
              style={[{ position: 'absolute', left: LABEL_W - 4, right: 0, top: ((m - startH * 60) / 60) * HOUR_H - 11, height: 22, flexDirection: 'row', alignItems: 'center', zIndex: 2 }, css({ cursor: 'pointer' })]}>
              <View style={{ position: 'absolute', left: 0, right: 0, top: 10, height: 2, backgroundColor: col.text, opacity: 0.55 }} />
              <Row gap={4} style={{ backgroundColor: u === 'selesai' ? '#F4F1F5' : col.bg, borderRadius: 999, paddingHorizontal: 8, height: 22, marginLeft: 8, maxWidth: '90%', opacity: v.done ? 0.7 : 1 }}>
                <Icon name="flag" size={12} color={col.text} />
                <T v="chip" numberOfLines={1} style={[{ color: col.text, flexShrink: 1 }, v.done ? css({ textDecorationLine: 'line-through' }) : null]}>{dueText(v)} · {v.task.title}</T>
              </Row>
            </Pressable>
          );
        })}
        {showNow && (
          <View pointerEvents="none" style={{ position: 'absolute', left: LABEL_W - 6, right: 0, top: ((nowMin - startH * 60) / 60) * HOUR_H - 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent }} />
            <View style={{ flex: 1, height: 2, backgroundColor: colors.accent }} />
          </View>
        )}
      </View>
    </View>
  );
}

export function sortByStart(a: OccView, b: OccView) {
  return (a.task.start ? toMinutes(a.task.start) : 1e9) - (b.task.start ? toMinutes(b.task.start) : 1e9);
}

export { addDays };
