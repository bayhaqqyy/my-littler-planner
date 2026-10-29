import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { usePathname } from 'expo-router';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  activeDays, addDays, CATEGORY_EMOJI, CATEGORY_LABEL, completionsOn, currentStreak, longestStreak, occurrencesOn, overdue,
  overdueDeadlines, parseDate, range, startOfWeek, studyDetail, toDateStr, type CompletionLog, type OccView,
} from '@/domain';
import { useStore } from '@/store/store';
import { useTaskList } from '@/store/hooks';
import { categoryColors, colors, data, fonts, radius } from '@/theme/theme';
import { Row, T } from '@/components/ui/primitives';
import { Sheet } from '@/components/ui/Overlays';
import { TaskRow } from '@/components/task/TaskRow';
import { Flame } from '@/components/illustrations';

export type StatKind = 'done' | 'pending' | 'study' | 'streak';

const fmt = (d: string, p: string) => format(parseDate(d), p, { locale: localeId });
export const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} j ${m % 60} m` : `${m} m`);
const dayTitle = (d: string, today: string) => (d === today ? 'Hari ini' : d === addDays(today, -1) ? 'Kemarin' : fmt(d, 'EEEE, d MMM'));

function DayHeader({ title, right }: { title: string; right?: string }) {
  return (
    <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
      <T v="small" style={{ fontFamily: fonts.bold, textTransform: 'capitalize' }}>{title}</T>
      {right ? <T v="muted">{right}</T> : null}
    </Row>
  );
}

function Empty({ text }: { text: string }) {
  return <T v="muted" style={{ textAlign: 'center', paddingVertical: 18 }}>{text}</T>;
}

function ItemRow({ title, category, meta }: { title: string; category: CompletionLog['category']; meta: string }) {
  return (
    <Row gap={10} style={{ minHeight: 48, paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.row, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff' }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: categoryColors[category].dot }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <T v="body" numberOfLines={1} style={{ fontFamily: fonts.semibold }}>{title}</T>
        <T v="muted" numberOfLines={1}>{meta}</T>
      </View>
    </Row>
  );
}

/** Tasks completed this week, grouped per day (newest first). */
function DoneDetail({ logs, today }: { logs: (CompletionLog & { id: string })[]; today: string }) {
  const ws = startOfWeek(today);
  const days = range(ws, 7).filter((d) => d <= today).reverse();
  const total = days.reduce((s, d) => s + completionsOn(logs, d), 0);
  if (!total) return <Empty text="Belum ada tugas selesai minggu ini. Yuk centang satu! 🌷" />;
  return (
    <>
      <T v="muted">{total} tugas selesai sejak {fmt(ws, 'EEEE d MMM')}.</T>
      {days.map((d) => {
        const list = logs.filter((l) => toDateStr(new Date(l.completedAt)) === d).sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1));
        if (!list.length) return null;
        return (
          <View key={d} style={{ gap: 6 }}>
            <DayHeader title={dayTitle(d, today)} right={`${list.length} tugas`} />
            {list.map((l) => (
              <ItemRow key={l.id} title={l.title} category={l.category}
                meta={`${CATEGORY_LABEL[l.category]} · selesai ${format(new Date(l.completedAt), 'HH:mm')}${l.durationMin > 0 ? ` · ${l.durationMin} mnt` : ''}${l.timed ? ' · ⏱ timer' : ''}`} />
            ))}
          </View>
        );
      })}
    </>
  );
}

/** Overdue + still-open tasks for today; rows can be checked off or opened right here. */
function PendingDetail({ today }: { today: string }) {
  const tasks = useTaskList();
  const occs = useStore((s) => s.occurrences);
  const late: OccView[] = useMemo(() => {
    const deadlines: OccView[] = overdueDeadlines(tasks, occs, new Date());
    return [...overdue(tasks, today, occs), ...deadlines];
  }, [tasks, occs, today]);
  const todayOpen = useMemo(() => occurrencesOn(tasks, today, occs).filter((v) => !v.done), [tasks, occs, today]);
  if (!late.length && !todayOpen.length) return <Empty text="Tidak ada tugas tertunda. Semua beres! 🎉" />;
  return (
    <>
      {late.length > 0 && (
        <View style={{ gap: 8 }}>
          <DayHeader title={`Terlewat (${late.length})`} />
          {late.map((v) => <TaskRow key={v.key} v={v} showDate />)}
        </View>
      )}
      {todayOpen.length > 0 && (
        <View style={{ gap: 8 }}>
          <DayHeader title={`Hari ini (${todayOpen.length})`} />
          {todayOpen.map((v) => <TaskRow key={v.key} v={v} />)}
        </View>
      )}
    </>
  );
}

/** Study time for the last 7 days: per-day bars, then what made up each day. */
function StudyDetail({ logs, today }: { logs: CompletionLog[]; today: string }) {
  const focus = useStore((s) => s.focusLogs);
  const from = addDays(today, -6);
  const days = useMemo(() => studyDetail(logs, Object.values(focus), from, today), [logs, focus, from, today]);
  const total = days.reduce((s, d) => s + d.total, 0);
  const timer = days.reduce((s, d) => s + d.timerMin, 0);
  const max = Math.max(1, ...days.map((d) => d.total));
  if (!total) return <Empty text="Belum ada waktu belajar 7 hari ini. Pakai timer atau selesaikan tugas Kuliah/Belajar/Tugas ya! 📚" />;
  return (
    <>
      <View style={{ padding: 14, borderRadius: 18, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.line, gap: 4 }}>
        <T v="greeting" style={{ fontSize: 26 }}>{fmtMin(total)}</T>
        <T v="muted">⏱ {fmtMin(timer)} dari timer · ✅ {fmtMin(total - timer)} dari tugas selesai tanpa timer</T>
        <T v="muted" style={{ fontSize: 12 }}>Dihitung dari kategori Kuliah, Belajar, dan Tugas. Tugas tanpa timer memakai durasi rencananya.</T>
      </View>
      <View style={{ gap: 6 }}>
        {range(from, 7).reverse().map((d) => {
          const x = days.find((y) => y.date === d);
          const v = x?.total ?? 0;
          return (
            <Row key={d} gap={8} accessibilityLabel={`${dayTitle(d, today)}: ${fmtMin(v)}`}>
              <T v="muted" style={{ width: 54, textTransform: 'capitalize' }}>{d === today ? 'Hari ini' : fmt(d, 'EEE d')}</T>
              <View style={{ flex: 1, height: 10, borderRadius: 10, backgroundColor: '#F6EEF3', overflow: 'hidden' }}>
                <View style={{ height: 10, borderRadius: 10, width: `${(v / max) * 100}%`, backgroundColor: colors.accent }} />
              </View>
              <T v="small" style={{ width: 64, textAlign: 'right', fontVariant: ['tabular-nums'] }}>{v ? fmtMin(v) : '–'}</T>
            </Row>
          );
        })}
      </View>
      {days.map((d) => (
        <View key={d.date} style={{ gap: 6 }}>
          <DayHeader title={dayTitle(d.date, today)} right={fmtMin(d.total)} />
          {d.items.map((it, i) => (
            <ItemRow key={i} title={it.timed ? `⏱ Sesi timer ${CATEGORY_LABEL[it.category]}` : it.title} category={it.category}
              meta={`${CATEGORY_EMOJI[it.category]} ${CATEGORY_LABEL[it.category]} · ${fmtMin(it.min)}${it.timed ? ' · waktu timer asli' : ' · durasi rencana'}`} />
          ))}
        </View>
      ))}
    </>
  );
}

/** Streak: current/longest + the last 5 weeks as a calendar of active days. */
function StreakDetail({ logs, today }: { logs: CompletionLog[]; today: string }) {
  const streak = currentStreak(logs, today);
  const best = longestStreak(logs);
  const active = activeDays(logs);
  const start = addDays(startOfWeek(today), -28);
  const cells = range(start, 35);
  const doneToday = active.has(today);
  return (
    <>
      <Row gap={14} style={{ padding: 14, borderRadius: 18, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.line }}>
        <Flame size={48} active={streak > 0} />
        <View style={{ flex: 1, gap: 2 }}>
          <T v="cardTitle" style={{ color: data.streakNumber, fontSize: 20 }}>{streak} hari berturut-turut</T>
          <T v="muted">Terpanjang: {best} hari</T>
          <T v="muted">
            {streak === 0 ? 'Selesaikan 1 tugas hari ini untuk mulai streak baru 🔥'
              : doneToday ? 'Hari ini sudah aman! Lanjut besok ya ✨'
                : 'Belum ada tugas selesai hari ini, selesaikan 1 supaya streak tidak putus!'}
          </T>
        </View>
      </Row>
      <View style={{ gap: 6 }}>
        <Row gap={4}>
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => <T key={d} v="muted" style={{ flex: 1, textAlign: 'center', fontSize: 11 }}>{d}</T>)}
        </Row>
        {[0, 1, 2, 3, 4].map((w) => (
          <Row key={w} gap={4}>
            {cells.slice(w * 7, w * 7 + 7).map((d) => {
              const n = completionsOn(logs, d);
              const future = d > today;
              return (
                <View key={d} accessibilityLabel={`${fmt(d, 'd MMMM')}: ${future ? 'belum' : n ? `${n} tugas selesai` : 'tidak ada'}`}
                  style={{ flex: 1, aspectRatio: 1, maxHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: future ? 'transparent' : n ? '#FFD9C2' : '#F6EEF3',
                    borderWidth: d === today ? 2 : 0, borderColor: colors.accent, opacity: future ? 0.35 : 1 }}>
                  <T v="small" style={{ fontSize: 12 }}>{fmt(d, 'd')}</T>
                  {n > 0 && <T style={{ fontSize: 10, lineHeight: 12 }}>🔥{n > 1 ? n : ''}</T>}
                </View>
              );
            })}
          </Row>
        ))}
        <T v="muted" style={{ fontSize: 12 }}>🔥 = ada tugas selesai di hari itu (angka = jumlah tugas).</T>
      </View>
    </>
  );
}

const TITLES: Record<StatKind, string> = { done: 'Tugas selesai minggu ini', pending: 'Tugas tertunda', study: 'Waktu belajar · 7 hari', streak: 'Streak' };

export function StatDetailSheet({ kind, onClose, logs, today }: { kind?: StatKind; onClose: () => void; logs: (CompletionLog & { id: string })[]; today: string }) {
  // Opening a task navigates away: close the sheet so it isn't left over the next screen.
  const path = usePathname();
  useEffect(() => { if (kind) onClose(); }, [path]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Sheet visible={!!kind} onClose={onClose} title={kind ? TITLES[kind] : ''}>
      {kind === 'done' && <DoneDetail logs={logs} today={today} />}
      {kind === 'pending' && <PendingDetail today={today} />}
      {kind === 'study' && <StudyDetail logs={logs} today={today} />}
      {kind === 'streak' && <StreakDetail logs={logs} today={today} />}
    </Sheet>
  );
}
