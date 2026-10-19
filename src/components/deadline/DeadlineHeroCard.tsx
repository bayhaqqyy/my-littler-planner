import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import {
  addDays, deadlineOccurrences, dueLabel, hms, overdueDeadlines, toDateStr, urgencyOf, URGENCY_LABEL, wallToDate,
  type DeadlineView, type Occurrence, type Task,
} from '@/domain';
import { useStore } from '@/store/store';
import { colors, fonts, radius, urgencyColors } from '@/theme/theme';
import { Button, Card, css, Row, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { MiniAzza } from '@/components/illustrations';
import { completeWithFx } from '@/components/task/useComplete';
import { CountdownBadge } from './CountdownBadge';
import { useCountdownNow } from './useCountdown';

const pad = (n: number) => String(n).padStart(2, '0');

function TimeBox({ value, unit }: { value: number; unit: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 10, alignItems: 'center' }}>
      <T style={{ fontFamily: fonts.bold, fontSize: 30, color: colors.accent, fontVariant: ['tabular-nums'] }}>{pad(value)}</T>
      <T v="muted">{unit}</T>
    </View>
  );
}

/** Home: nearest deadline (next 7 days) with a live countdown, plus up to two after it. */
export function DeadlineHeroCard({ tasks, occs }: { tasks: Task[]; occs: Record<string, Occurrence> }) {
  const startTimer = useStore((s) => s.startTimer);
  const equipped = useStore((s) => s.wardrobe.equipped);
  const today = toDateStr(new Date());
  const upcoming = useMemo(
    () => deadlineOccurrences(tasks, occs, today, addDays(today, 7)).filter((v) => !v.done),
    [tasks, occs, today],
  );
  const now = useCountdownNow([], true);
  const future = upcoming.filter((v) => wallToDate(v.dueAt).getTime() >= now);
  const lateCount = useMemo(() => overdueDeadlines(tasks, occs, new Date(now)).length, [tasks, occs, Math.floor(now / 60_000)]); // eslint-disable-line react-hooks/exhaustive-deps
  const [hero, ...rest] = future;

  return (
    <Card
      title="Deadline terdekat"
      right={
        <Pressable accessibilityRole="link" onPress={() => router.navigate({ pathname: '/tasks', params: { tab: 'deadline' } })}
          style={[{ minHeight: 32, justifyContent: 'center' }, css({ cursor: 'pointer' })]}>
          <T v="small" style={[{ color: colors.accent }, css({ textDecorationLine: 'underline' })]}>Lihat semua</T>
        </Pressable>
      }
    >
      <View style={{ gap: 10 }}>
        {lateCount > 0 && (
          <Pressable accessibilityRole="link" accessibilityLabel={`${lateCount} deadline terlewat, lihat`}
            onPress={() => router.navigate({ pathname: '/tasks', params: { tab: 'deadline' } })}
            style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: urgencyColors.terlewat.bg, borderRadius: 14, paddingHorizontal: 12, minHeight: 40 }, css({ cursor: 'pointer' })]}>
            <Icon name="flag" size={16} color={urgencyColors.terlewat.text} />
            <T v="small" style={{ color: urgencyColors.terlewat.text, flex: 1 }}>{lateCount} deadline terlewat</T>
            <Icon name="chevron-right" size={16} color={urgencyColors.terlewat.text} />
          </Pressable>
        )}
        {hero ? <Hero v={hero} now={now} today={today} onFocus={() => { startTimer(hero.key, 'pomodoro'); router.navigate('/timer'); }} /> : (
          <Row gap={12} style={{ paddingVertical: 4 }}>
            <MiniAzza size={64} pose="happy" equipped={equipped} showPet={false} />
            <View style={{ flex: 1 }}>
              <T v="cardTitle">Tidak ada deadline minggu ini</T>
              <T v="muted">Santai dulu, atau catat tugas berbatas waktu di tab Deadline 🌷</T>
            </View>
          </Row>
        )}
        {rest.slice(0, 2).map((v, i) => (
          <Pressable key={v.key} accessibilityRole="button" accessibilityLabel={`${v.task.title}, ${dueLabel(v.dueAt, today)}`}
            onPress={() => router.push({ pathname: '/task/[id]', params: { id: v.task.id, date: v.date } })}
            style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, borderTopWidth: i === 0 && !hero ? 0 : 1, borderColor: colors.line, paddingTop: 8 }, css({ cursor: 'pointer' })]}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: urgencyColors[urgencyOf(wallToDate(v.dueAt).getTime(), now)].dot }} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <T v="body" numberOfLines={1} style={{ fontFamily: fonts.semibold }}>{v.task.title}</T>
              <T v="muted">{dueLabel(v.dueAt, today)}</T>
            </View>
            <CountdownBadge dueMs={wallToDate(v.dueAt).getTime()} nowMs={now} compact />
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

function Hero({ v, now, today, onFocus }: { v: DeadlineView; now: number; today: string; onFocus: () => void }) {
  const dueMs = wallToDate(v.dueAt).getTime();
  const u = urgencyOf(dueMs, now);
  const t = hms(dueMs, now);
  const col = urgencyColors[u];
  const boxes = t.days >= 1
    ? [{ value: t.days, unit: 'hari' }, { value: t.hours % 24, unit: 'jam' }, { value: t.minutes, unit: 'menit' }]
    : [{ value: t.hours, unit: 'jam' }, { value: t.minutes, unit: 'menit' }, { value: t.seconds, unit: 'detik' }];
  return (
    <View style={{ backgroundColor: '#FFEFF4', borderRadius: radius.card, padding: 14, gap: 12 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Buka detail ${v.task.title}`}
        onPress={() => router.push({ pathname: '/task/[id]', params: { id: v.task.id, date: v.date } })}
        style={[{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, css({ cursor: 'pointer' })]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <T v="cardTitle" style={{ fontSize: 17 }} numberOfLines={2}>{v.task.title}</T>
          <T v="muted">{dueLabel(v.dueAt, today)}</T>
        </View>
        <View style={{ backgroundColor: col.bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, borderWidth: u === 'mendesak' ? 1 : 0, borderColor: '#fff' }}>
          <T v="chip" style={{ color: col.text }}>{URGENCY_LABEL[u]}</T>
        </View>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 8 }} accessibilityRole="timer"
        accessibilityLabel={`Sisa ${boxes.map((b) => `${b.value} ${b.unit}`).join(' ')}`}>
        {boxes.map((b) => <TimeBox key={b.unit} value={b.value} unit={b.unit} />)}
      </View>
      <Row gap={8}>
        <Button label="Mulai fokus" icon={<Icon name="play" size={14} color="#fff" />} style={{ flex: 1 }} onPress={onFocus} />
        <Button kind="outline" label="Tandai selesai" style={{ flex: 1 }} onPress={() => completeWithFx(v.key)} />
      </Row>
    </View>
  );
}
