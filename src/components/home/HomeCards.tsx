import { FEATURES } from '@/config/features';
import { disabledLook, GiftsDisabledNote } from '@/components/rewards/GiftsDisabled';
import { useMemo, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import Svg from 'react-native-svg';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  addDays, CATEGORY_EMOJI, deadlineOccurrences, greeting, occurrencesInRange, quoteOfDay, remainingSec, routineDots, splitOccKey, startOfWeek,
  toMinutes, urgencyOf, wallDate, wallToDate, weekDots, type DotStatus, type Occurrence, type Task, type Urgency,
} from '@/domain';
import { useStore } from '@/store/store';
import { useCharacterName, useLayout, useNow } from '@/store/hooks';
import { categoryColors, colors, data, fonts, linear, radius, shadow, urgencyColors } from '@/theme/theme';
import { Button, Card, css, Row, T } from '@/components/ui/primitives';
import { ProgressBar } from '@/components/ui/Charts';
import { Icon } from '@/components/ui/Icon';
import { BearArt, BunnyArt, ChickArt, Flame, GiftBoxArt, KittyArt, MiniAzza, TulipArt, DaisyArt } from '@/components/illustrations';
import { GardenCloud, Hill, Sprout, StemFlower, Sunflower } from '@/components/deco/Garden';
import { timeLabel } from '@/components/task/TaskRow';

/** Home hero: Mini on a hill next to a flower bed that blooms one flower per finished task. */
export function GreetingCard({ done = 0, total = 0, streak = 0 }: { done?: number; total?: number; streak?: number }) {
  const now = useNow(30_000);
  const { username } = useCharacterName();
  const { isDesktop, isMobile } = useLayout();
  const equipped = useStore((s) => s.wardrobe.equipped);
  const h = now.getHours();
  const sub = h < 11 ? 'Semoga harimu manis dan penuh semangat 🌸' : h < 15 ? 'Jangan lupa minum dan istirahat sebentar ya 🍓' : h < 19 ? 'Sedikit lagi, kamu hebat hari ini ✨' : 'Saatnya santai dan menulis catatan harian 🌙';
  const slots = Math.max(5, Math.min(8, total));
  const bloom = Math.min(done, slots);
  const left = Math.max(0, total - done);
  const bubble = total === 0 ? 'Tanam tugas pertamamu yuk!' : left === 0 ? 'Semua bunga mekar! 🎉' : `${left} lagi biar penuh!`;
  const colorsBed = ['#FF9EC2', '#B79CFF', '#FFCE3A', '#FFB38A', '#8EC9FF', '#FF9EC2', '#B79CFF', '#FFCE3A'];
  const bedW = isMobile ? 210 : 300;
  const heroH = isMobile ? 300 : 280;
  return (
    <View accessibilityLabel={`${greeting(h)}, ${username}. ${done} dari ${total} tugas selesai hari ini. Streak ${streak} hari.`}
      style={[
        { borderRadius: radius.greeting, borderWidth: 2, borderColor: '#fff', overflow: 'hidden', minHeight: heroH },
        css({ backgroundImage: linear(['#BFE4FF', '#E4F4FF', '#F4FBEA'], 180), ...shadow.card }),
      ]}>
      <View aria-hidden style={{ position: 'absolute', top: 18, right: isMobile ? 100 : '30%' }}><Svg width={90} height={45} viewBox="0 0 80 40"><GardenCloud /></Svg></View>
      <View aria-hidden style={{ position: 'absolute', top: isMobile ? 120 : 70, left: isMobile ? -20 : '45%' }}><Svg width={70} height={35} viewBox="0 0 80 40"><GardenCloud /></Svg></View>
      <View aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}><Hill width="100%" height={isMobile ? 150 : 140} flowers={false} /></View>

      <View style={{ padding: isMobile ? 18 : 24, paddingRight: isMobile ? 96 : 24, gap: 2, maxWidth: isDesktop ? 460 : undefined }}>
        <T v="greeting" accessibilityRole="header" style={{ fontSize: isMobile ? 23 : 28, lineHeight: isMobile ? 30 : 36 }}>{greeting(h)}, {username}!</T>
        <T v="muted" style={{ fontSize: 13.5 }}>{sub}</T>
        <T v="small" style={{ marginTop: 2, color: colors.text }}>{format(now, 'EEEE, d MMMM yyyy', { locale: localeId })}</T>
      </View>

      <Pressable accessibilityRole="link" accessibilityLabel={`Streak ${streak} hari, lihat progres`} onPress={() => router.navigate('/progress')}
        style={[{ position: 'absolute', top: isMobile ? 14 : 18, right: isMobile ? 14 : 22, alignItems: 'center' }, css({ cursor: 'pointer' })]}>
        <View>
          <Svg width={isMobile ? 70 : 80} height={isMobile ? 70 : 80} viewBox="0 0 64 64"><Sunflower value={String(streak)} /></Svg>
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <T style={{ fontFamily: fonts.display, fontSize: isMobile ? 20 : 23, color: '#fff', lineHeight: isMobile ? 24 : 28 }}>{streak}</T>
          </View>
        </View>
        <T v="chip" style={{ color: colors.text, fontFamily: fonts.bold }}>hari beruntun</T>
      </Pressable>

      <View style={{ position: 'absolute', left: isMobile ? 8 : 28, bottom: isMobile ? 8 : 10 }}>
        <MiniAzza size={isMobile ? 128 : 150} pose={left === 0 && total > 0 ? 'dance' : 'happy'} equipped={equipped} showPet={false} />
      </View>

      <View style={{ position: 'absolute', right: isMobile ? 12 : 28, bottom: isMobile ? 20 : 22, width: bedW, alignItems: 'center' }}>
        <View style={[{ backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 6, borderWidth: 2, borderColor: colors.line }, css(shadow.card)]}>
          <T v="small" style={{ color: colors.text, fontFamily: fonts.bold }}>{total ? `${done} dari ${total} selesai.` : 'Kebunmu masih kosong.'}</T>
          <T v="chip" style={{ color: colors.muted }}>{bubble}</T>
        </View>
        <View aria-hidden style={{ flexDirection: 'row', justifyContent: 'space-around', width: bedW - 20, marginBottom: -12, zIndex: 1 }}>
          {Array.from({ length: slots }, (_, i) => (
            <Svg key={i} width={isMobile ? 22 : 28} height={isMobile ? 52 : 64} viewBox="0 0 24 60">
              {i < bloom ? <StemFlower color={colorsBed[i]} height={34 + (i % 2) * 8} /> : <Sprout />}
            </Svg>
          ))}
        </View>
        <View aria-hidden style={{ width: bedW, height: 26, borderRadius: 13, backgroundColor: '#C99A6E', borderWidth: 2, borderColor: '#6B4E3D' }} />
      </View>
    </View>
  );
}

export function StatCard({ label, value, stops, children, valueColor }: { label: string; value: string; stops: string[]; children?: ReactNode; valueColor?: string }) {
  return (
    <View accessibilityLabel={`${label}: ${value}`} style={[
      { flexGrow: 1, flexBasis: 140, minWidth: 130, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 4 },
      css({ backgroundImage: linear(stops, 160), ...shadow.card }),
    ]}>
      <T v="muted">{label}</T>
      <Row gap={6} style={{ justifyContent: 'space-between' }}>
        <T style={{ fontFamily: fonts.bold, fontSize: 28, color: valueColor ?? colors.text, fontVariant: ['tabular-nums'] }}>{value}</T>
        {children}
      </Row>
    </View>
  );
}

export function StatCards({ total, done, pending, streak, pct }: { total: number; done: number; pending: number; streak: number; pct: number }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      <StatCard label="Total tugas" value={String(total)} stops={data.stat.total}><T style={{ fontSize: 22 }} aria-hidden>📋</T></StatCard>
      <StatCard label="Selesai" value={String(done)} stops={data.stat.done}><T style={{ fontSize: 22 }} aria-hidden>🌼</T></StatCard>
      <StatCard label="Belum selesai" value={String(pending)} stops={data.stat.pending}><T style={{ fontSize: 22 }} aria-hidden>📝</T></StatCard>
      <StatCard label="Streak" value={`${streak} hari`} stops={data.stat.streak} valueColor={data.streakNumber}><Flame size={34} active={streak > 0} /></StatCard>
      <View accessibilityLabel={`Progres hari ini: ${pct} persen`} style={[
        { flexGrow: 2, flexBasis: 220, minWidth: 200, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 8 },
        css({ backgroundImage: linear(data.stat.progress, 160), boxShadow: '0 2px 10px rgba(200,140,170,.08)' }),
      ]}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T v="muted">Progres hari ini</T>
          <T style={{ fontFamily: fonts.bold, fontSize: 22, color: '#2B6A94', fontVariant: ['tabular-nums'] }}>{pct}%</T>
        </Row>
        <ProgressBar value={pct / 100} label="Progres hari ini" />
        <T v="muted">{total === 0 ? 'Belum ada tugas hari ini' : pct === 100 ? 'Semua selesai! 🎉' : `${done} dari ${total} tugas`}</T>
      </View>
    </View>
  );
}

export function TimerPanel() {
  const timer = useStore((s) => s.timer);
  const task = useStore((s) => (s.timer ? s.tasks[splitOccKey(s.timer.occurrenceKey).taskId] : undefined));
  const equipped = useStore((s) => s.wardrobe.equipped);
  const now = useNow(1000);
  if (!timer || !task) {
    return (
      <Card title="Timer saat ini">
        <Row gap={12}>
          <Svg width={52} height={48} viewBox="0 0 60 56" aria-hidden><KittyArt /></Svg>
          <View style={{ flex: 1, gap: 2 }}>
            <T v="body">Belum ada timer berjalan</T>
            <T v="muted">Pilih tugas lalu tekan Mulai timer, atau langsung pakai Pomodoro.</T>
          </View>
        </Row>
        <Button small kind="soft" label="Buka Fokus" style={{ marginTop: 12, alignSelf: 'flex-start' }} onPress={() => router.navigate('/timer')} />
      </Card>
    );
  }
  const rem = remainingSec(timer, now.getTime());
  const mm = String(Math.floor(rem / 60)).padStart(2, '0');
  const ss = String(rem % 60).padStart(2, '0');
  const state = timer.state === 'running' ? 'Berjalan' : timer.state === 'paused' ? 'Dijeda' : timer.state === 'finished' ? 'Waktu habis' : 'Siap';
  const focus = timer.phase === 'focus';
  return (
    <Card title="Timer saat ini">
      <Row gap={12}>
        <MiniAzza faceOnly size={54} pose={timer.state === 'paused' ? 'rest' : 'study'} equipped={equipped} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <T v="body" numberOfLines={1} style={{ fontFamily: fonts.bold }}>{CATEGORY_EMOJI[task.category]} {task.title}</T>
          <T v="muted">{focus ? 'Fokus' : 'Istirahat'} · {state}{timer.mode === 'pomodoro' ? ` · 🍅 ${timer.completedSessions}` : ''}</T>
        </View>
        <T style={{ fontFamily: fonts.bold, fontSize: 30, color: focus ? colors.accent : '#2E6B4A', fontVariant: ['tabular-nums'] }} accessibilityLabel={`Sisa ${mm} menit ${ss} detik`}>{mm}:{ss}</T>
      </Row>
      <ProgressBar value={timer.totalSec ? 1 - rem / timer.totalSec : 0} height={8} label="Progres timer" />
      <Button small label="Buka timer" style={{ marginTop: 12, alignSelf: 'flex-start' }} onPress={() => router.navigate('/timer')} />
    </Card>
  );
}

/** Next (max 5) timed, not-done activities in the next 7 days, from now. */
export function UpcomingPanel({ tasks, occs, today }: { tasks: Task[]; occs: Record<string, Occurrence>; today: string }) {
  const now = useNow(30_000);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const items = occurrencesInRange(tasks, today, 7, occs)
    .filter((v) => v.task.start && !v.done && (v.date > today || toMinutes(v.task.end ?? v.task.start) >= nowMin))
    .slice(0, 5);
  return (
    <Card title="Jadwal terdekat">
      {items.length === 0 ? (
        <Row gap={10}>
          <Svg width={40} height={40} viewBox="0 0 60 60" aria-hidden><ChickArt /></Svg>
          <T v="muted" style={{ flex: 1 }}>Tidak ada jadwal ber-jam dalam 7 hari ke depan.</T>
        </Row>
      ) : (
        <View style={{ gap: 8 }}>
          {items.map((v) => (
            <Pressable key={v.key} accessibilityRole="button" accessibilityLabel={`${v.task.title}, ${v.date === today ? 'hari ini' : format(new Date(v.date + 'T00:00'), 'EEEE d MMM', { locale: localeId })} ${timeLabel(v)}`}
              onPress={() => router.push({ pathname: '/task/[id]', params: { id: v.task.id, date: v.date } })}
              style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }, css({ cursor: 'pointer' })]}>
              <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, backgroundColor: categoryColors[v.task.category].dot }} />
              <View style={{ width: 54 }}>
                <T v="small" style={{ color: colors.accent }}>{v.date === today ? 'Hari ini' : v.date === addDays(today, 1) ? 'Besok' : format(new Date(v.date + 'T00:00'), 'EEE d', { locale: localeId })}</T>
                <T v="small" style={{ fontVariant: ['tabular-nums'] }}>{v.task.start}</T>
              </View>
              <T v="body" numberOfLines={1} style={{ flex: 1 }}>{CATEGORY_EMOJI[v.task.category]} {v.task.title}</T>
            </Pressable>
          ))}
        </View>
      )}
    </Card>
  );
}

export function QuotePanel({ today }: { today: string }) {
  const q = quoteOfDay(today);
  const { character } = useCharacterName();
  return (
    <Card title="Kutipan hari ini">
      <Row gap={12} style={{ alignItems: 'flex-start' }}>
        <Svg width={54} height={50} viewBox="0 0 60 54" aria-hidden><BearArt /></Svg>
        <View style={{ flex: 1, gap: 4 }}>
          <T v="body" style={{ fontFamily: fonts.semibold, fontStyle: 'italic' }}>“{q.text}”</T>
          <T v="muted">— {q.author === 'Mini Azza' ? character : q.author}</T>
        </View>
      </Row>
    </Card>
  );
}

const DOT: Record<DotStatus, { bg: string; border?: string; label: string }> = {
  done: { bg: '#A8DABD', label: 'Selesai' },
  partial: { bg: '#F7CF82', label: 'Sebagian' },
  missed: { bg: '#F7A8C4', label: 'Terlewat' },
  pending: { bg: '#fff', border: '#C3B0EE', label: 'Belum' },
  empty: { bg: '#F3EEF5', label: 'Kosong' },
  skipped: { bg: '#E7E2EA', label: 'Dilewati' },
  off: { bg: 'transparent', label: 'Tidak dijadwalkan' },
};
const DAY_LETTERS = ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'];

function DotCell({ status, today, date }: { status: DotStatus; today: boolean; date: string }) {
  const d = DOT[status];
  return (
    <View style={{ flex: 1, alignItems: 'center' }} accessibilityLabel={`${format(new Date(date + 'T00:00'), 'EEEE', { locale: localeId })}: ${d.label}`}>
      <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: d.bg, borderWidth: status === 'off' ? 0 : d.border ? 2 : 0, borderColor: d.border, outlineWidth: today ? 2 : 0, outlineColor: colors.accent, outlineOffset: 2 } as object}>
        {status === 'done' && <Icon name="check" size={18} color="#fff" />}
        {status === 'off' && <View style={{ width: 6, height: 2, backgroundColor: '#E5DCE8', alignSelf: 'center', marginTop: 8 }} />}
      </View>
    </View>
  );
}

export function WeekWidget({ tasks, occs, today }: { tasks: Task[]; occs: Record<string, Occurrence>; today: string }) {
  const ws = startOfWeek(today);
  const all = weekDots(tasks, ws, today, occs);
  const routines = tasks.filter((t) => t.repeat !== 'none').slice(0, 6);
  // Flag under each day with an unfinished deadline, colored by its most urgent one.
  const flags = useMemo(() => {
    const now = Date.now();
    const rank: Urgency[] = ['terlewat', 'mendesak', 'dekat', 'aman'];
    const m = new Map<string, Urgency>();
    for (const v of deadlineOccurrences(tasks, occs, ws, addDays(ws, 6))) {
      if (v.done) continue;
      const u = urgencyOf(wallToDate(v.dueAt).getTime(), now);
      const d = wallDate(v.dueAt);
      const prev = m.get(d);
      if (!prev || rank.indexOf(u) < rank.indexOf(prev)) m.set(d, u);
    }
    return m;
  }, [tasks, occs, ws]);
  return (
    <Card title="Minggu ini">
      <View style={{ gap: 10 }}>
        <Row gap={6}>
          <View style={{ width: 92 }} />
          {all.map((d, i) => <T key={d.date} v="chip" style={{ flex: 1, textAlign: 'center', color: d.date === today ? colors.accent : colors.muted }}>{DAY_LETTERS[i]}</T>)}
        </Row>
        <Row gap={6}>
          <T v="small" style={{ width: 92 }} numberOfLines={1}>Semua tugas</T>
          {all.map((d) => <DotCell key={d.date} status={d.status} date={d.date} today={d.date === today} />)}
        </Row>
        {flags.size > 0 && (
          <Row gap={6}>
            <T v="small" style={{ width: 92 }} numberOfLines={1}>🚩 Deadline</T>
            {all.map((d) => {
              const u = flags.get(d.date);
              return (
                <View key={d.date} style={{ flex: 1, alignItems: 'center' }} accessibilityLabel={u ? `${format(new Date(d.date + 'T00:00'), 'EEEE', { locale: localeId })}: ada deadline` : undefined}>
                  {u ? <Icon name="flag" size={16} color={urgencyColors[u].text} /> : <View style={{ height: 16 }} />}
                </View>
              );
            })}
          </Row>
        )}
        {routines.map((t) => (
          <Row key={t.id} gap={6}>
            <T v="small" style={{ width: 92, color: categoryColors[t.category].text }} numberOfLines={1}>{CATEGORY_EMOJI[t.category]} {t.title}</T>
            {routineDots(t, ws, today, occs).map((d) => <DotCell key={d.date} status={d.status} date={d.date} today={d.date === today} />)}
          </Row>
        ))}
        <Row wrap gap={10} style={{ marginTop: 2 }}>
          {(['done', 'partial', 'missed', 'pending'] as DotStatus[]).map((s) => (
            <Row key={s} gap={4}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: DOT[s].bg, borderWidth: DOT[s].border ? 1.5 : 0, borderColor: DOT[s].border }} />
              <T v="chip" style={{ color: colors.muted }}>{DOT[s].label}</T>
            </Row>
          ))}
        </Row>
      </View>
    </Card>
  );
}

export function GiftCard({ streak }: { streak: number }) {
  const giftBoxes = useStore((s) => s.giftBoxes);
  const gifts = useMemo(() => Object.values(giftBoxes), [giftBoxes]);
  const top = gifts.find((g) => g.rarity === 'streak') ?? gifts.find((g) => g.rarity === 'super') ?? gifts.find((g) => g.rarity === 'langka') ?? gifts[0];
  return (
    <Card title="Kado kamu">
      {!FEATURES.gifts && <View style={{ marginBottom: 10 }}><GiftsDisabledNote /></View>}
      <Row gap={12} style={FEATURES.gifts ? undefined : disabledLook}>
        {top ? <GiftBoxArt size={60} rarity={top.rarity} /> : <Svg width={44} height={44} viewBox="0 0 40 40" aria-hidden><DaisyArt /></Svg>}
        <View style={{ flex: 1, gap: 2 }}>
          <T v="body" style={{ fontFamily: fonts.bold }}>{gifts.length ? `${gifts.length} kado belum dibuka` : 'Belum ada kado baru'}</T>
          <Row gap={4}><Flame size={18} active={streak > 0} /><T v="muted">Streak {streak} hari</T></Row>
          {!gifts.length && <T v="muted">{FEATURES.gifts ? 'Selesaikan tugas untuk dapat kado 🎁' : 'Untuk sementara tugas yang selesai tidak memberi kado.'}</T>}
        </View>
      </Row>
      <Button small disabled={!FEATURES.gifts} label={gifts.length ? 'Buka kado' : 'Lihat lemari'} style={{ marginTop: 12, alignSelf: 'flex-start' }} onPress={() => router.navigate('/rewards')} />
    </Card>
  );
}
