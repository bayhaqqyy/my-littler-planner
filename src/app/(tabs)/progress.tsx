import { useMemo, useState } from 'react';
import { View } from 'react-native';
import Svg from 'react-native-svg';
import { format, formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  addDays, CATEGORY_EMOJI, CATEGORY_LABEL, categoryMinutes, completionsOn, currentStreak, daySummary, last4Weeks, last7,
  levelOf, longestStreak, mostProductiveWeekday, overdue, parseDate, range, startOfWeek, weeklyCompletion,
} from '@/domain';
import { useStore } from '@/store/store';
import { useLayout, useTaskList, useToday } from '@/store/hooks';
import { categoryColors, colors, data, fonts, linear } from '@/theme/theme';
import { HeaderActions, Page } from '@/components/AppShell';
import { Card, css, Row, Segmented, T } from '@/components/ui/primitives';
import { BarChart, Donut, ProgressBar } from '@/components/ui/Charts';
import { BearArt, Flame, SheepArt } from '@/components/illustrations';

const WEEKDAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} j ${m % 60} m` : `${m} m`);

function Stat({ label, value, sub, grad, valueColor }: { label: string; value: string; sub?: string; grad: string[]; valueColor?: string }) {
  return (
    <View style={[{ flex: 1, minWidth: 140, borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 2 }, css({ backgroundImage: linear(grad), boxShadow: '0 2px 10px rgba(200,140,170,.08)' })]}
      accessibilityLabel={`${label}: ${value}${sub ? `, ${sub}` : ''}`}>
      <T v="small" style={{ color: colors.muted }}>{label}</T>
      <T v="greeting" style={{ fontSize: 26, color: valueColor ?? colors.text, fontVariant: ['tabular-nums'] }}>{value}</T>
      {sub ? <T v="muted">{sub}</T> : null}
    </View>
  );
}

export default function ProgressScreen() {
  const today = useToday();
  const tasks = useTaskList();
  const occs = useStore((s) => s.occurrences);
  const logsRec = useStore((s) => s.completionLogs);
  const focusRec = useStore((s) => s.focusLogs);
  const { isDesktop, isMobile } = useLayout();
  const [period, setPeriod] = useState<'7' | '4w'>('7');
  const [metric, setMetric] = useState<'tasks' | 'focus'>('tasks');

  const logs = useMemo(() => Object.values(logsRec), [logsRec]);
  const focus = useMemo(() => Object.values(focusRec), [focusRec]);
  const weekStart = startOfWeek(today);

  const weekDays = range(weekStart, 7);
  const doneThisWeek = weekDays.reduce((s, d) => s + completionsOn(logs, d), 0);
  const todaySum = daySummary(tasks, today, occs);
  const overdueCount = overdue(tasks, today, occs).length;
  const pending = overdueCount + todaySum.pending;
  const weekly = weeklyCompletion(tasks, today, occs);
  const days7 = last7(logs, focus, today);
  const focus7 = days7.reduce((s, d) => s + d.focusMin, 0);
  const weeks4 = last4Weeks(logs, focus, today);
  const cats = categoryMinutes(logs, focus, addDays(today, -29));
  const catTotal = cats.reduce((s, c) => s + c.minutes, 0);
  const streak = currentStreak(logs, today);
  const best = longestStreak(logs);
  const productive = mostProductiveWeekday(logs);
  const level = levelOf(logs, focus);
  const bestDay = weekDays.reduce((b, d) => (completionsOn(logs, d) > completionsOn(logs, b) ? d : b), weekDays[0]);
  const bestDayCount = completionsOn(logs, bestDay);
  const recent = [...logs].sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1)).slice(0, 10);

  const chartItems = period === '7'
    ? days7.map((d) => ({ label: format(parseDate(d.date), 'EEEEEE', { locale: localeId }), value: metric === 'tasks' ? d.done : d.focusMin, highlight: d.date === today }))
    : weeks4.map((w, i) => ({ label: i === 3 ? 'Minggu ini' : format(parseDate(w.start), 'd/M'), value: metric === 'tasks' ? w.done : w.focusMin, highlight: i === 3 }));

  const stats = (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      <Stat label="Tugas selesai" value={String(doneThisWeek)} sub="minggu ini" grad={data.stat.done} />
      <Stat label="Tugas tertunda" value={String(pending)} sub={overdueCount ? `${overdueCount} terlewat` : 'hari ini'} grad={data.stat.pending} />
      <Stat label="Waktu belajar" value={fmtMin(focus7)} sub="7 hari terakhir" grad={data.stat.progress} />
      <Stat label="Streak" value={`${streak} hari`} sub={`terpanjang ${best} hari`} grad={data.stat.streak} valueColor={data.streakNumber} />
    </View>
  );

  const chart = (
    <Card title="Grafik progres" style={{ flexGrow: 1 }}>
      <Row wrap gap={8} style={{ marginBottom: 12 }}>
        <Segmented<'7' | '4w'> label="Periode grafik" value={period} onChange={setPeriod} items={[{ key: '7', label: '7 hari' }, { key: '4w', label: '4 minggu' }]} />
        <Segmented<'tasks' | 'focus'> label="Data grafik" value={metric} onChange={setMetric} items={[{ key: 'tasks', label: 'Tugas' }, { key: 'focus', label: 'Menit fokus' }]} />
      </Row>
      <BarChart items={chartItems} unit={metric === 'focus' ? 'm' : ''} height={isMobile ? 120 : 150} />
    </Card>
  );

  const donut = (
    <Card title="Penyelesaian minggu ini" style={{ flexGrow: 1 }}>
      <View style={{ alignItems: 'center', gap: 8, paddingVertical: 6 }}>
        <Donut ratio={weekly.ratio} size={150} sub={`${weekly.done}/${weekly.total} tugas`} />
        <T v="muted" style={{ textAlign: 'center' }}>
          {weekly.total === 0 ? 'Belum ada tugas minggu ini' : weekly.ratio >= 0.7 ? 'Keren! Target 70% tercapai 🎉' : 'Sedikit lagi menuju 70% 💪'}
        </T>
      </View>
    </Card>
  );

  const categories = (
    <Card title="Kategori waktu" right={<T v="muted">30 hari · {fmtMin(catTotal)}</T>}>
      {catTotal === 0 ? <T v="muted">Belum ada waktu tercatat. Selesaikan tugas atau pakai timer ya!</T> : (
        <View style={{ gap: 10 }}>
          {cats.map((c) => (
            <View key={c.category} style={{ gap: 4 }} accessibilityLabel={`${CATEGORY_LABEL[c.category]}: ${c.minutes} menit, ${c.pct} persen`}>
              <Row style={{ justifyContent: 'space-between' }}>
                <T v="small">{CATEGORY_EMOJI[c.category]} {CATEGORY_LABEL[c.category]}</T>
                <T v="muted">{fmtMin(c.minutes)} · {c.pct}%</T>
              </Row>
              <View style={{ height: 10, borderRadius: 10, backgroundColor: categoryColors[c.category].bg, overflow: 'hidden' }}>
                <View style={{ height: 10, borderRadius: 10, width: `${c.pct}%`, backgroundColor: categoryColors[c.category].dot }} />
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );

  const achievements = (
    <Card title="Achievements">
      <View style={{ gap: 10 }}>
        <Row gap={10}>
          <Flame size={42} active={streak > 0} />
          <View style={{ flex: 1 }}>
            <T v="cardTitle" style={{ color: data.streakNumber }}>Streak {streak} hari</T>
            <T v="muted">Terpanjang: {best} hari</T>
          </View>
        </Row>
        <View style={{ height: 1, backgroundColor: colors.line }} />
        <Row style={{ justifyContent: 'space-between' }}><T v="body">Hari ini</T><T v="small">{todaySum.done}/{todaySum.total} tugas · {todaySum.pct}%</T></Row>
        <Row style={{ justifyContent: 'space-between' }}><T v="body">Minggu ini</T><T v="small">{doneThisWeek} tugas · {fmtMin(weekDays.reduce((s, d) => s + (days7.find((x) => x.date === d)?.focusMin ?? 0), 0))} fokus</T></Row>
        <Row style={{ justifyContent: 'space-between' }}><T v="body">Hari terbaik minggu ini</T><T v="small">{bestDayCount ? `${format(parseDate(bestDay), 'EEEE', { locale: localeId })} (${bestDayCount})` : '–'}</T></Row>
        <Row style={{ justifyContent: 'space-between' }}><T v="body">Hari paling produktif</T><T v="small" style={{ color: colors.accent }}>{productive === undefined ? '–' : WEEKDAY_NAMES[productive]}</T></Row>
      </View>
    </Card>
  );

  const levelCard = (
    <Card>
      <Row gap={12}>
        <Svg width={58} height={52} viewBox="0 0 60 54" aria-hidden><BearArt /></Svg>
        <View style={{ flex: 1, gap: 2 }}>
          <T v="muted">Level {level.level}</T>
          <T v="cardTitle" style={{ fontSize: 18, color: colors.accent }}>{level.title}</T>
          <T v="muted">{level.points} poin{level.next ? ` · ${level.next.min - level.points} lagi ke ${level.next.title}` : ' · level tertinggi! 👑'}</T>
        </View>
      </Row>
      <View style={{ marginTop: 12 }}>
        <ProgressBar value={level.progress} label={`Progres level ${Math.round(level.progress * 100)} persen`} />
      </View>
    </Card>
  );

  const history = (
    <Card title="Riwayat terbaru" right={<Svg width={36} height={35} viewBox="0 0 60 58" aria-hidden><SheepArt /></Svg>}>
      {recent.length === 0 ? <T v="muted">Belum ada tugas selesai. Centang tugas pertamamu! 🌷</T> : (
        <View>
          {recent.map((l) => (
            <Row key={l.id} gap={10} style={{ minHeight: 44, borderBottomWidth: 1, borderColor: colors.line, paddingVertical: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: categoryColors[l.category].dot }} />
              {/* Time sits on the meta line so long titles can't push the row past the card. */}
              <View style={{ flex: 1, minWidth: 0 }}>
                <T v="body" numberOfLines={1} style={{ fontFamily: fonts.semibold }}>{l.title}</T>
                <T v="muted" numberOfLines={1}>
                  {CATEGORY_LABEL[l.category]}{l.durationMin > 0 ? ` · ${l.durationMin} mnt` : ''}{l.timed ? ' · ⏱' : ''} · {formatDistanceToNow(new Date(l.completedAt), { addSuffix: true, locale: localeId })}
                </T>
              </View>
            </Row>
          ))}
        </View>
      )}
    </Card>
  );

  return (
    <Page title="Progress" subtitle="Lihat seberapa jauh kamu sudah melangkah ✨" actions={<HeaderActions />}>
      {stats}
      {isDesktop ? (
        <>
          {/* Row children get the flex share; cards inside only grow vertically (flex on a stacked card squeezes its height). */}
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'stretch' }}>
            <View style={{ flex: 1.6, minWidth: 0 }}>{chart}</View>
            <View style={{ flex: 1, minWidth: 0 }}>{donut}</View>
          </View>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
            <View style={{ flex: 1, minWidth: 0, gap: 14 }}>{categories}{levelCard}</View>
            <View style={{ flex: 1, minWidth: 0, gap: 14 }}>{achievements}</View>
            <View style={{ flex: 1, minWidth: 0, gap: 14 }}>{history}</View>
          </View>
        </>
      ) : (
        <View style={{ gap: 14 }}>{donut}{chart}{levelCard}{achievements}{categories}{history}</View>
      )}
    </Page>
  );
}
