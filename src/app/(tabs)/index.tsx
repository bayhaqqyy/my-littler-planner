import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { conflictingIds, currentStreak, daySummary, occurrencesOn, overdue } from '@/domain';
import { useStore } from '@/store/store';
import { useLayout, useTaskList, useToday } from '@/store/hooks';
import { colors } from '@/theme/theme';
import { HeaderActions, Page } from '@/components/AppShell';
import { Button, Card, css, Row, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { TaskRow } from '@/components/task/TaskRow';
import { InstallBanner } from '@/components/InstallCard';
import { DeadlineHeroCard } from '@/components/deadline/DeadlineHeroCard';
import { GiftCard, GreetingCard, QuotePanel, StatCards, TimerPanel, UpcomingPanel, WeekWidget } from '@/components/home/HomeCards';

export default function Home() {
  const today = useToday();
  const tasks = useTaskList();
  const occs = useStore((s) => s.occurrences);
  const logs = useStore((s) => s.completionLogs);
  const { isDesktop, isTablet } = useLayout();

  const list = useMemo(() => occurrencesOn(tasks, today, occs), [tasks, today, occs]);
  const summary = useMemo(() => daySummary(tasks, today, occs), [tasks, today, occs]);
  const late = useMemo(() => overdue(tasks, today, occs), [tasks, today, occs]);
  const conflicts = useMemo(() => conflictingIds(tasks, today, occs), [tasks, today, occs]);
  const streak = useMemo(() => currentStreak(Object.values(logs), today), [logs, today]);

  const todayCard = (
    <Card title="Tugas hari ini" right={<Pressable accessibilityRole="link" onPress={() => router.navigate('/tasks')} style={[{ minHeight: 32, justifyContent: 'center' }, css({ cursor: 'pointer' })]}><T v="small" style={{ color: colors.accent }}>Lihat semua</T></Pressable>}>
      {late.length > 0 && (
        <Pressable accessibilityRole="link" accessibilityLabel={`Ada ${late.length} tugas terlewat, lihat`} onPress={() => router.navigate({ pathname: '/tasks', params: { tab: 'terlewat' } })}
          style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF0F4', borderRadius: 14, paddingHorizontal: 12, minHeight: 40, marginBottom: 10 }, css({ cursor: 'pointer' })]}>
          <Icon name="flag" size={16} color={colors.danger} />
          <T v="small" style={{ color: colors.danger, flex: 1 }}>Ada {late.length} tugas terlewat</T>
          <Icon name="chevron-right" size={16} color={colors.danger} />
        </Pressable>
      )}
      {list.length === 0 ? (
        <EmptyState title="Hari ini masih kosong" sub="Tambahkan tugas pertamamu yuk!">
          <Button small label="Tambah tugas" onPress={() => router.push({ pathname: '/task/new', params: { date: today } })} style={{ marginTop: 6 }} />
        </EmptyState>
      ) : (
        <View style={{ gap: 8 }}>
          {list.map((v) => <TaskRow key={v.key} v={v} conflict={!v.done && conflicts.has(v.task.id)} />)}
        </View>
      )}
    </Card>
  );

  const deadlineCard = <DeadlineHeroCard tasks={tasks} occs={occs} />;
  const side = (
    <>
      <TimerPanel />
      <UpcomingPanel tasks={tasks} occs={occs} today={today} />
    </>
  );
  const extra = (
    <>
      <WeekWidget tasks={tasks} occs={occs} today={today} />
      <GiftCard streak={streak} />
      <QuotePanel today={today} />
    </>
  );

  return (
    <Page title="My Little Planner" actions={<HeaderActions addDate={today} />}>
      <InstallBanner />
      <GreetingCard />
      <StatCards total={summary.total} done={summary.done} pending={summary.pending} streak={streak} pct={summary.pct} />
      {isDesktop ? (
        <Row gap={14} style={{ alignItems: 'flex-start' }}>
          <View style={{ flex: 1.3, gap: 14, minWidth: 0 }}>{deadlineCard}{todayCard}</View>
          <View style={{ flex: 1, gap: 14, minWidth: 0 }}>{side}</View>
          <View style={{ flex: 1, gap: 14, minWidth: 0 }}>{extra}</View>
        </Row>
      ) : isTablet ? (
        <Row gap={14} style={{ alignItems: 'flex-start' }}>
          <View style={{ flex: 1, gap: 14, minWidth: 0 }}>{deadlineCard}{todayCard}<WeekWidget tasks={tasks} occs={occs} today={today} /></View>
          <View style={{ flex: 1, gap: 14, minWidth: 0 }}>{side}<GiftCard streak={streak} /><QuotePanel today={today} /></View>
        </Row>
      ) : (
        <View style={{ gap: 14 }}>
          {deadlineCard}
          <TimerPanel />
          {todayCard}
          <UpcomingPanel tasks={tasks} occs={occs} today={today} />
          {extra}
        </View>
      )}
    </Page>
  );
}
