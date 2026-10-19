import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { CATEGORY_EMOJI, completionText, dueAtOf, dueLabel, durationOf, endOf, fromMinutes, isDeadline, parseDate, toDateStr, wallToDate, type OccView } from '@/domain';
import { CountdownBadge } from '@/components/deadline/CountdownBadge';
import { useCountdownNow } from '@/components/deadline/useCountdown';
import { useStore } from '@/store/store';
import { categoryColors, colors, radius } from '@/theme/theme';
import { CategoryPill, css, PriorityPill, Row, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { FlowerCheck } from './FlowerCheck';
import { completeWithFx } from './useComplete';

export function timeLabel(v: OccView) {
  const t = v.task;
  if (!t.start) return `${durationOf(t)} mnt`;
  const end = endOf(t);
  return `${t.start}${end !== undefined ? `–${fromMinutes(end)}` : ''}`;
}

/** One task occurrence row: flower checkbox, title, time, chips. Tap opens detail. */
export function TaskRow({ v, showDate, conflict }: { v: OccView; showDate?: boolean; conflict?: boolean }) {
  if (v.dueAt || isDeadline(v.task)) return <DeadlineRow v={v} />;
  return <ScheduledRow v={v} showDate={showDate} conflict={conflict} />;
}

/** Deadline occurrence: flag + due label, countdown badge (or completion note), reschedule when overdue. */
function DeadlineRow({ v }: { v: OccView }) {
  const uncomplete = useStore((s) => s.uncomplete);
  const dueAt = v.dueAt ?? dueAtOf(v.task, v.date, v.occ);
  const dueMs = wallToDate(dueAt).getTime();
  const now = useCountdownNow([dueMs]);
  const today = toDateStr(new Date(now));
  const overdueNow = !v.done && dueMs < now;
  const c = categoryColors[v.task.category];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 12, borderRadius: radius.row, borderWidth: 1, borderColor: colors.line, backgroundColor: v.done ? colors.surfaceSoft : '#fff', minHeight: 60 }}>
      <View style={{ width: 4, alignSelf: 'stretch', borderTopLeftRadius: radius.row, borderBottomLeftRadius: radius.row, backgroundColor: c.dot }} />
      <FlowerCheck
        done={v.done}
        category={v.task.category}
        label={`${v.done ? 'Batalkan selesai' : 'Tandai selesai'}: ${v.task.title}`}
        onToggle={(e) => {
          if (v.done) uncomplete(v.key);
          else completeWithFx(v.key, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
        }}
      />
      <View style={{ flex: 1, minWidth: 0, paddingVertical: 10, gap: 4 }}>
        <Pressable
          style={[{ gap: 4 }, css({ cursor: 'pointer' })]}
          accessibilityRole="button"
          accessibilityLabel={`Buka detail ${v.task.title}`}
          onPress={() => router.push({ pathname: '/task/[id]', params: { id: v.task.id, date: v.date } })}
        >
          <T
            v="body"
            numberOfLines={2}
            style={[{ fontFamily: 'Quicksand_700Bold' }, v.done ? css({ textDecorationLine: 'line-through', textDecorationColor: '#F7A8C4', textDecorationThickness: '2px', color: colors.muted }) : null]}
          >
            {v.task.title}
          </T>
          {v.done && v.occ?.doneAt ? (
            <T v="small" style={{ color: '#2E6B4A' }}>{completionText(v.occ.doneAt, dueMs)}</T>
          ) : (
            <Row gap={4}><Icon name="flag" size={13} color={overdueNow ? colors.danger : colors.muted} /><T v="muted">{dueLabel(dueAt, today)}</T></Row>
          )}
          {!v.done && (
            <Row wrap gap={6}>
              <CategoryPill c={v.task.category} />
              {v.task.priority !== 'sedang' && <PriorityPill p={v.task.priority} />}
              {v.task.repeat !== 'none' && <Icon name="repeat" size={13} />}
              {v.task.subtasks.length > 0 && <T v="muted">☑ {v.task.subtasks.filter((s) => s.done).length}/{v.task.subtasks.length}</T>}
            </Row>
          )}
        </Pressable>
        {overdueNow && (
          <Pressable accessibilityRole="link" accessibilityLabel={`Jadwalkan ulang ${v.task.title}`}
            onPress={() => router.push({ pathname: '/task/[id]', params: { id: v.task.id, date: v.date, reschedule: '1' } })}
            style={[{ alignSelf: 'flex-start', minHeight: 32, justifyContent: 'center' }, css({ cursor: 'pointer' })]}>
            <T v="small" style={[{ color: colors.accent }, css({ textDecorationLine: 'underline' })]}>Jadwalkan ulang</T>
          </Pressable>
        )}
      </View>
      <CountdownBadge dueMs={dueMs} nowMs={now} done={v.done} />
    </View>
  );
}

function ScheduledRow({ v, showDate, conflict }: { v: OccView; showDate?: boolean; conflict?: boolean }) {
  const uncomplete = useStore((s) => s.uncomplete);
  const c = categoryColors[v.task.category];
  const subDone = v.task.subtasks.filter((s) => s.done).length;
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 12, borderRadius: radius.row, borderWidth: 1, borderColor: conflict ? colors.danger : colors.line, backgroundColor: v.done ? colors.surfaceSoft : '#fff', minHeight: 60 },
        conflict ? css({ borderStyle: 'dashed' }) : null,
      ]}
    >
      <View style={{ width: 4, alignSelf: 'stretch', borderTopLeftRadius: radius.row, borderBottomLeftRadius: radius.row, backgroundColor: c.dot }} />
      <FlowerCheck
        done={v.done}
        category={v.task.category}
        label={`${v.done ? 'Batalkan selesai' : 'Tandai selesai'}: ${v.task.title}`}
        onToggle={(e) => {
          if (v.done) uncomplete(v.key);
          else completeWithFx(v.key, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
        }}
      />
      <Pressable
        style={[{ flex: 1, paddingVertical: 10, gap: 4 }, css({ cursor: 'pointer' })]}
        accessibilityRole="button"
        accessibilityLabel={`Buka detail ${v.task.title}`}
        onPress={() => router.push({ pathname: '/task/[id]', params: { id: v.task.id, date: v.date } })}
      >
        <T
          v="body"
          numberOfLines={2}
          style={[{ fontFamily: 'Quicksand_700Bold' }, v.done ? css({ textDecorationLine: 'line-through', textDecorationColor: '#F7A8C4', textDecorationThickness: '2px', color: colors.muted }) : null]}
        >
          {CATEGORY_EMOJI[v.task.category]} {v.task.title}
        </T>
        <Row wrap gap={6}>
          <Row gap={3}><Icon name="clock" size={13} /><T v="muted">{showDate ? `${format(parseDate(v.date), 'EEE d MMM', { locale: localeId })} · ` : ''}{timeLabel(v)}</T></Row>
          <CategoryPill c={v.task.category} />
          {v.task.priority !== 'sedang' && <PriorityPill p={v.task.priority} />}
          {v.task.repeat !== 'none' && <Icon name="repeat" size={13} />}
          {v.task.subtasks.length > 0 && <T v="muted">☑ {subDone}/{v.task.subtasks.length}</T>}
          {conflict && <T v="small" style={{ color: colors.danger }}>Bentrok</T>}
        </Row>
      </Pressable>
    </View>
  );
}
