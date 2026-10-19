import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Svg from 'react-native-svg';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { addDays, conflictingIds, deadlineOccurrences, dueLabel, isValidDate, occurrencesInRange, occurrencesOn, parseDate, startOfWeek, toDateStr, urgencyOf, wallToDate } from '@/domain';
import { useStore } from '@/store/store';
import { useLayout, useTaskList, useToday } from '@/store/hooks';
import '@/store/devtools';
import { colors, urgencyColors } from '@/theme/theme';
import { CountdownBadge } from '@/components/deadline/CountdownBadge';
import { useCountdownNow } from '@/components/deadline/useCountdown';
import { HeaderActions, Page } from '@/components/AppShell';
import { Button, Card, IconButton, Row, Segmented, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { TaskRow } from '@/components/task/TaskRow';
import { BearArt } from '@/components/illustrations';
import { DayTimeline, dayLabel, MonthGrid, WeekView } from '@/components/calendar/CalendarViews';

type View_ = 'month' | 'week' | 'day';

function shift(date: string, view: View_, dir: 1 | -1): string {
  if (view === 'day') return addDays(date, dir);
  if (view === 'week') return addDays(date, dir * 7);
  const d = parseDate(date);
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + dir, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, last));
  return toDateStr(target);
}

export default function CalendarScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const today = useToday();
  const tasks = useTaskList();
  const occs = useStore((s) => s.occurrences);
  const { isDesktop, isMobile } = useLayout();
  const [view, setView] = useState<View_>('month');
  const [selected, setSelected] = useState(isValidDate(params.date) ? params.date : today);
  useEffect(() => { if (isValidDate(params.date)) setSelected(params.date); }, [params.date]);

  const title = view === 'month'
    ? format(parseDate(selected), 'MMMM yyyy', { locale: localeId })
    : view === 'week'
      ? `${format(parseDate(startOfWeek(selected)), 'd MMM', { locale: localeId })} – ${format(parseDate(addDays(startOfWeek(selected), 6)), 'd MMM yyyy', { locale: localeId })}`
      : dayLabel(selected);
  const unit = view === 'month' ? 'bulan' : view === 'week' ? 'minggu' : 'hari';

  const daySchedule = useMemo(() => occurrencesOn(tasks, selected, occs), [tasks, selected, occs]);
  const dayConflicts = useMemo(() => conflictingIds(tasks, selected, occs), [tasks, selected, occs]);
  const upcoming = useMemo(() => occurrencesInRange(tasks, addDays(today, 1), 7, occs).filter((v) => !v.done).slice(0, 8), [tasks, today, occs]);
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const deadlines = useMemo(() => deadlineOccurrences(tasks, occs, weekStart, weekEnd), [tasks, occs, weekStart, weekEnd]);
  const nowMs = useCountdownNow(deadlines.filter((v) => !v.done).map((v) => wallToDate(v.dueAt).getTime()));

  const calendar = (
    <Card>
      <View style={{ gap: 12 }}>
        <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <Segmented<View_> label="Tampilan kalender" value={view} onChange={setView}
            items={[{ key: 'month', label: 'Bulan' }, { key: 'week', label: 'Minggu' }, { key: 'day', label: 'Hari' }]} />
          <Row gap={6}>
            <IconButton label={`${unit[0].toUpperCase()}${unit.slice(1)} sebelumnya`} onPress={() => setSelected(shift(selected, view, -1))}><Icon name="chevron-left" /></IconButton>
            <Button small kind="soft" label="Hari ini" onPress={() => setSelected(today)} />
            <IconButton label={`${unit[0].toUpperCase()}${unit.slice(1)} berikutnya`} onPress={() => setSelected(shift(selected, view, 1))}><Icon name="chevron-right" /></IconButton>
          </Row>
        </Row>
        <T v="cardTitle" accessibilityRole="header" accessibilityLiveRegion="polite" style={{ fontSize: 18, textTransform: 'capitalize' }}>{title}</T>
        {view === 'month' && <MonthGrid selected={selected} today={today} tasks={tasks} occs={occs} onSelect={setSelected} compact={isMobile} />}
        {view === 'week' && <WeekView selected={selected} today={today} tasks={tasks} occs={occs} onSelect={(d) => { setSelected(d); }} stacked={isMobile} />}
        {view === 'day' && <DayTimeline date={selected} today={today} tasks={tasks} occs={occs} />}
        <Row gap={14} wrap>
          <Row gap={4}><View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#F48FB1' }} /><T v="muted">Hari ini</T></Row>
          <Row gap={4}><Icon name="flag" size={13} color={urgencyColors.mendesak.text} fill={urgencyColors.mendesak.dot} /><T v="muted">Deadline (warna = urgensi)</T></Row>
          {view === 'day' && <Row gap={4}><View style={{ width: 16, height: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.danger, borderRadius: 3 }} /><T v="muted">Bentrok</T></Row>}
        </Row>
      </View>
    </Card>
  );

  const side = (
    <View style={{ gap: 14 }}>
      <Card
        title={selected === today ? 'Jadwal hari ini' : `Jadwal ${format(parseDate(selected), 'EEE, d MMM', { locale: localeId })}`}
        right={<Button small kind="soft" label="Tambah" icon={<Icon name="plus" size={16} color={colors.accent} />} accessibilityLabel="Tambah di tanggal ini"
          onPress={() => router.push({ pathname: '/task/new', params: { date: selected } })} />}
      >
        {daySchedule.length === 0 ? (
          <EmptyState title="Belum ada jadwal" sub="Hari yang santai 🌷" />
        ) : (
          <View style={{ gap: 8 }}>
            {daySchedule.map((v) => <TaskRow key={v.key} v={v} conflict={dayConflicts.has(v.task.id)} />)}
          </View>
        )}
      </Card>
      <Card title="Kegiatan mendatang (7 hari)">
        {upcoming.length === 0 ? <T v="muted">Tidak ada kegiatan dalam 7 hari ke depan.</T> : (
          <View style={{ gap: 8 }}>{upcoming.map((v) => <TaskRow key={v.key} v={v} showDate />)}</View>
        )}
      </Card>
      <Card title="Deadline minggu ini" right={<Svg width={40} height={36} viewBox="0 0 60 54" aria-hidden><BearArt /></Svg>}>
        {deadlines.length === 0 ? <T v="muted">Tidak ada deadline minggu ini 🎉</T> : (
          <View style={{ gap: 6 }}>
            {deadlines.map((v) => {
              const dueMs = wallToDate(v.dueAt).getTime();
              const u = urgencyOf(dueMs, nowMs, v.done);
              return (
                <Row key={v.key} gap={8} style={{ minHeight: 44, borderBottomWidth: 1, borderColor: colors.line, paddingVertical: 4 }}>
                  <Icon name="flag" size={16} color={urgencyColors[u].text} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <T v="body" numberOfLines={1} accessibilityRole="link" onPress={() => router.push({ pathname: '/task/[id]', params: { id: v.task.id, date: v.date } })}
                      style={v.done ? { textDecorationLine: 'line-through', color: colors.muted } : undefined}>{v.task.title}</T>
                    <T v="muted">{dueLabel(v.dueAt, today)}</T>
                  </View>
                  {v.done ? <T v="small" style={{ color: urgencyColors.selesai.text }}>Selesai ✓</T> : <CountdownBadge dueMs={dueMs} nowMs={nowMs} compact />}
                </Row>
              );
            })}
          </View>
        )}
      </Card>
    </View>
  );

  return (
    <Page title="Calendar" subtitle="Lihat semua jadwal dan deadline-mu" actions={<HeaderActions addDate={selected} />}>
      {isDesktop ? (
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
          <View style={{ flex: 1.7, minWidth: 0 }}>{calendar}</View>
          <View style={{ flex: 1, minWidth: 300 }}>{side}</View>
        </View>
      ) : (
        <View style={{ gap: 14 }}>{calendar}{side}</View>
      )}
    </Page>
  );
}
