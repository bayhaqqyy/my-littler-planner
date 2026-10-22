import { FEATURES } from '@/config/features';
import { disabledLook, GiftsDisabledNote } from './GiftsDisabled';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { currentStreak, levelEmoji, levelOf, MAX_LEVEL, nextBadges, POINTS, STREAK_MILESTONES, type Badge } from '@/domain';
import { badgesFromState } from '@/store/selectors';
import { BadgeMedal, RANK_LABEL } from './BadgeMedal';
import { useStore } from '@/store/store';
import { useReduceMotion, useToday } from '@/store/hooks';
import { Button, Card, css, Row, Segmented, T } from '@/components/ui/primitives';
import { ProgressBar } from '@/components/ui/Charts';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bear, Flame } from '@/components/illustrations';
import { colors, data, radius } from '@/theme/theme';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

function useLogs() {
  const c = useStore((s) => s.completionLogs);
  const f = useStore((s) => s.focusLogs);
  return useMemo(() => ({ completions: Object.values(c), focus: Object.values(f) }), [c, f]);
}

export function LevelCard() {
  const { completions, focus } = useLogs();
  const lvl = levelOf(completions, focus);
  return (
    <Card title="Level" right={<T v="muted">maks. Lv. {MAX_LEVEL}</T>}>
      <Row gap={14}>
        <Bear size={72} />
        <View style={{ flex: 1, gap: 6, minWidth: 0 }}>
          <T v="greeting" style={{ color: colors.accent }}>Lv. {lvl.level} · {levelEmoji(lvl.level)} {lvl.title}</T>
          <T v="muted">{lvl.points} poin{lvl.next ? ` · ${lvl.next.min - lvl.points} poin lagi ke Lv. ${lvl.next.level}` : ' · level tertinggi! 👑'}</T>
          <ProgressBar value={lvl.progress} label={`Progres level ${Math.round(lvl.progress * 100)} persen`} />
        </View>
      </Row>
      <View style={{ marginTop: 10, gap: 2 }}>
        <T v="muted">• {POINTS.task} poin per tugas selesai (+{POINTS.timedBonus} kalau pakai timer)</T>
        <T v="muted">• {POINTS.focusPer10Min} poin per 10 menit fokus</T>
        <T v="muted">• Maksimal {POINTS.dailyTaskCap} tugas per hari yang dihitung</T>
      </View>
    </Card>
  );
}

type BadgeFilter = 'all' | 'earned' | 'locked';

function BadgeTile({ b }: { b: Badge }) {
  const pct = Math.min(1, b.current / b.target);
  return (
    <View accessibilityLabel={`${b.name}: ${b.earned ? 'didapat' : `${fmtNum(b.current)} dari ${fmtNum(b.target)}`}. ${b.rule}`}
      style={[{ width: 104, flexGrow: 1, padding: 10, borderRadius: 16, borderWidth: 1, borderColor: b.earned ? '#F7CF82' : colors.line, alignItems: 'center', gap: 4, backgroundColor: b.earned ? '#FFF6E6' : '#F7F4F8' }]}>
      <BadgeMedal rank={b.rank} emoji={b.emoji} earned={b.earned} size={64} />
      <T v="chip" style={{ fontSize: 10, color: b.earned ? RANK_COLOR[b.rank] : colors.muted }}>{RANK_LABEL[b.rank]}</T>
      {/* Legend-rank badges also give a Legenda gift box with a legendary item. */}
      {b.rank === 6 && <T v="chip" style={{ fontSize: 10, color: '#B5751A', textAlign: 'center' }}>🎁 + kado Legenda</T>}
      <T v="small" numberOfLines={2} style={{ color: b.earned ? colors.text : colors.muted, textAlign: 'center' }}>{b.name}</T>
      <T v="chip" numberOfLines={3} style={{ color: colors.muted, textAlign: 'center', fontSize: 10.5 }}>{b.rule}</T>
      {!b.earned && (
        <View style={{ alignSelf: 'stretch', gap: 2, marginTop: 'auto' as never }}>
          <View style={{ height: 5, borderRadius: 3, backgroundColor: '#EADDE3', overflow: 'hidden' }}>
            <View style={{ height: 5, width: `${pct * 100}%`, backgroundColor: '#F7A8C4' }} />
          </View>
          <T v="chip" style={{ fontSize: 10, color: colors.muted, textAlign: 'center' }}>{fmtNum(b.current)}/{fmtNum(b.target)}</T>
        </View>
      )}
    </View>
  );
}

/** Readable text color for each rank label. */
const RANK_COLOR = ['#9A5B2E', '#5F6878', '#946200', '#B23A66', '#4E5BC4', '#7B4BC7', '#B5751A'];

const fmtNum = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function BadgeGrid() {
  // Select only what badges depend on (not the whole store, which changes every timer tick).
  const completionLogs = useStore((s) => s.completionLogs);
  const focusLogs = useStore((s) => s.focusLogs);
  const progress = useStore((s) => s.progress);
  const notes = useStore((s) => s.notes);
  const wardrobe = useStore((s) => s.wardrobe);
  const list = useMemo(
    () => badgesFromState({ completionLogs, focusLogs, progress, notes, wardrobe }),
    [completionLogs, focusLogs, progress, notes, wardrobe],
  );
  const [filter, setFilter] = useState<BadgeFilter>('all');
  const [showAll, setShowAll] = useState(false);
  const earned = list.filter((b) => b.earned).length;
  const almost = nextBadges(list, 3);
  const shown = list.filter((b) => (filter === 'earned' ? b.earned : filter === 'locked' ? !b.earned : true));
  const LIMIT = 18;
  const visible = showAll ? shown : shown.slice(0, LIMIT);
  return (
    <Card title="Badge" right={<T v="muted">{earned}/{list.length}</T>}>
      <View style={{ gap: 12 }}>
        <ProgressBar value={earned / list.length} label={`${earned} dari ${list.length} badge`} height={10} />
        {almost.length > 0 && (
          <View style={{ gap: 8 }}>
            <T v="small" style={{ color: colors.muted }}>Hampir dapat ✨</T>
            {almost.map((b) => (
              <Row key={b.id} gap={10}>
                <BadgeMedal rank={b.rank} emoji={b.emoji} earned size={44} />
                <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <T v="small" numberOfLines={1} style={{ flexShrink: 1 }}>{b.name}</T>
                    <T v="chip" style={{ color: colors.muted }}>{fmtNum(b.current)}/{fmtNum(b.target)}</T>
                  </Row>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: '#EADDE3', overflow: 'hidden' }}>
                    <View style={{ height: 6, width: `${(b.current / b.target) * 100}%`, backgroundColor: '#F7A8C4' }} />
                  </View>
                  <T v="chip" numberOfLines={1} style={{ color: colors.muted }}>{b.rule}</T>
                </View>
              </Row>
            ))}
          </View>
        )}
        <Segmented<BadgeFilter> label="Filter badge" fill value={filter} onChange={(f) => { setFilter(f); setShowAll(false); }}
          items={[{ key: 'all', label: 'Semua', count: list.length }, { key: 'earned', label: 'Didapat', count: earned }, { key: 'locked', label: 'Belum', count: list.length - earned }]} />
        {shown.length === 0 ? (
          <T v="muted" style={{ textAlign: 'center' }}>{filter === 'earned' ? 'Belum ada badge. Selesaikan tugas pertamamu! 🌸' : 'Semua badge sudah didapat! 👑'}</T>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {visible.map((b) => <BadgeTile key={b.id} b={b} />)}
          </View>
        )}
        {shown.length > LIMIT && (
          <Button kind="soft" small label={showAll ? 'Tampilkan lebih sedikit' : `Lihat semua (${shown.length})`} onPress={() => setShowAll(!showAll)} />
        )}
      </View>
    </Card>
  );
}

export function StreakCard() {
  const logs = useStore((s) => s.completionLogs);
  const claimed = useStore((s) => s.progress.streakClaimed);
  const today = useToday();
  const reduce = useReduceMotion();
  const streak = useMemo(() => currentStreak(Object.values(logs), today), [logs, today]);
  const active = streak > 0;
  const wiggle = css({
    animationKeyframes: [{ '0%': { transform: 'rotate(-6deg) scale(1)' }, '50%': { transform: 'rotate(6deg) scale(1.08)' }, '100%': { transform: 'rotate(-6deg) scale(1)' } }],
    animationDuration: '1.8s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
  });
  return (
    <Card title="Streak" style={css({ backgroundImage: `linear-gradient(135deg, ${data.stat.streak.join(', ')})` })}>
      <Row gap={14}>
        <View style={active && !reduce ? wiggle : null}><Flame size={64} active={active} /></View>
        <View style={{ flex: 1 }}>
          <T v="greeting" style={{ color: data.streakNumber, fontSize: 30 }}>{streak} hari</T>
          <T v="muted">{active ? 'Pertahankan! Selesaikan minimal 1 tugas setiap hari.' : 'Selesaikan satu tugas hari ini untuk menyalakan api 🔥'}</T>
        </View>
      </Row>
      {/* Milestones award streak gifts: greyed out while gifts are switched off. */}
      {!FEATURES.gifts && <View style={{ marginTop: 12 }}><GiftsDisabledNote /></View>}
      <Row wrap style={[{ marginTop: 12 }, FEATURES.gifts ? null : disabledLook]}>
        {STREAK_MILESTONES.map((m) => {
          const got = claimed.includes(m);
          return (
            <View key={m} accessibilityLabel={`Milestone ${m} hari ${got ? 'tercapai' : 'belum'}`}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: got ? '#FFC1D6' : 'rgba(255,255,255,.7)', borderWidth: 1, borderColor: got ? '#F07BA3' : colors.line }}>
              <T v="small" style={{ color: got ? '#9C3A63' : colors.muted }}>{got ? '🎁 ' : ''}{m} hari</T>
            </View>
          );
        })}
      </Row>
    </Card>
  );
}
