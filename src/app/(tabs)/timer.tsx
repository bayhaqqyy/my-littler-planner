import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  CATEGORY_EMOJI, dueAtOf, dueLabel, isDeadline, occurrencesOn, remainingSec, splitOccKey, wallToDate, type PomodoroConfig,
} from '@/domain';
import { useStore } from '@/store/store';
import { useLayout, useNow, useTaskList, useToday, useCharacterName } from '@/store/hooks';
import { Page, HeaderActions } from '@/components/AppShell';
import { Button, Card, CategoryPill, Row, Segmented, Switch, T, css } from '@/components/ui/primitives';
import { ConfirmDialog, Sheet } from '@/components/ui/Overlays';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { MiniAzza } from '@/components/illustrations';
import { FlowerTimer } from '@/components/timer/FlowerTimer';
import { PomodoroPicker } from '@/components/timer/PomodoroPicker';
import { TonePicker } from '@/components/settings/TonePicker';
import { RescheduleSheet } from '@/components/timer/RescheduleSheet';
import { completeWithFx } from '@/components/task/useComplete';
import { CountdownBadge } from '@/components/deadline/CountdownBadge';
import { timeLabel } from '@/components/task/TaskRow';
import { unlockAudio } from '@/services/audio';
import { colors, fonts, shadow } from '@/theme/theme';

const PHASE_LABEL = { focus: 'Fokus', 'short-break': 'Istirahat pendek', 'long-break': 'Istirahat panjang' } as const;

export default function TimerScreen() {
  const { occ } = useLocalSearchParams<{ occ?: string }>();
  const timer = useStore((s) => s.timer);
  const tasks = useStore((s) => s.tasks);
  const settings = useStore((s) => s.settings);
  const st = useStore.getState;
  const now = useNow(500);
  const { isDesktop } = useLayout();
  const { character } = useCharacterName();
  const equipped = useStore((s) => s.wardrobe.equipped);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [pomo, setPomo] = useState<PomodoroConfig>(settings.pomodoro);
  const [dismissed, setDismissed] = useState(false);

  // Deep link: /timer?occ=<key> starts a timer for that occurrence (unless one is running).
  useEffect(() => {
    if (!occ) return;
    const s = st();
    if (!s.tasks[splitOccKey(occ).taskId]) return;
    if (s.timer?.occurrenceKey !== occ && s.timer?.state !== 'running') s.startTimer(occ, s.settings.defaultTimerMode);
    router.setParams({ occ: undefined });
  }, [occ, st]);

  useEffect(() => { if (timer?.pomodoro) setPomo(timer.pomodoro); }, [timer?.pomodoro]);

  const task = timer ? tasks[splitOccKey(timer.occurrenceKey).taskId] : undefined;
  const occurrences = useStore((s) => s.occurrences);
  const today = useToday();
  /** Deadline of the timed occurrence (deadline tasks only). */
  const deadlineDue = timer && task && isDeadline(task) ? dueAtOf(task, splitOccKey(timer.occurrenceKey).date, occurrences[timer.occurrenceKey]) : undefined;
  const rem = timer ? remainingSec(timer, now.getTime()) : 0;
  const isBreak = timer?.phase !== 'focus';
  const running = timer?.state === 'running';
  const restLook = !!timer && (isBreak || timer.state === 'paused');
  const cfg = timer?.pomodoro;
  const nextBreak = cfg && timer && timer.completedSessions >= cfg.sessionsBeforeLong ? 'long-break' : 'short-break';

  // Optional: auto-start the next Pomodoro phase.
  useEffect(() => {
    if (!timer || timer.state !== 'finished' || timer.mode !== 'pomodoro' || !timer.pomodoro?.autoStartNext) return;
    st().timerNextPhase(timer.phase === 'focus' ? nextBreak : 'focus', true);
  }, [timer, nextBreak, st]);

  const toggle = () => {
    if (!timer) return;
    unlockAudio();
    if (running) st().timerPause();
    else if (timer.state !== 'finished') st().timerPlay();
  };
  const done = () => {
    if (!timer) return;
    st().timerTick(true);
    completeWithFx(timer.occurrenceKey, undefined, { timed: true });
  };
  const setMode = (m: 'task' | 'pomodoro') => {
    if (!timer || timer.state !== 'idle') return;
    st().startTimer(timer.occurrenceKey, m, m === 'pomodoro' ? pomo : undefined);
  };

  const finishedPrompt = timer?.state === 'finished' && !(timer.mode === 'pomodoro' && timer.pomodoro?.autoStartNext);
  // Re-show the prompt whenever a new phase finishes.
  useEffect(() => { if (timer?.state !== 'finished') setDismissed(false); }, [timer?.state]);
  const pose = !timer ? 'happy' : timer.state === 'finished' ? 'surprised' : restLook ? 'rest' : running ? 'study' : 'happy';

  const main = (
    <View style={{ flex: isDesktop ? 2 : undefined, gap: 14, minWidth: 0 }}>
      {!timer || !task ? (
        <NoTimer />
      ) : (
        <Card style={[{ alignItems: 'center', gap: 12, paddingVertical: 22 }, css({ backgroundImage: restLook ? 'linear-gradient(160deg,#F0FAF3,#FFFFFF)' : 'linear-gradient(160deg,#FFF3F7,#FFFFFF)' })]}>
          <Row gap={8} wrap style={{ justifyContent: 'center' }}>
            <CategoryPill c={task.category} />
            <T v="cardTitle" style={{ textAlign: 'center' }}>{CATEGORY_EMOJI[task.category]} {task.title}</T>
          </Row>
          {deadlineDue && (
            <Row gap={8} wrap style={{ justifyContent: 'center' }}>
              <Row gap={4}><Icon name="flag" size={14} color={colors.accent} /><T v="small">Deadline {dueLabel(deadlineDue, today)}</T></Row>
              <CountdownBadge dueMs={wallToDate(deadlineDue).getTime()} nowMs={now.getTime()} compact />
            </Row>
          )}
          <T v="muted">{timer.mode === 'pomodoro' ? `Pomodoro · ${PHASE_LABEL[timer.phase]}` : 'Sesuai durasi tugas'}{timer.state === 'paused' ? ' · dijeda' : ''}</T>
          <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: 'center', gap: 16 }}>
            <FlowerTimer hideButton remaining={rem} total={timer.totalSec} rest={restLook} running={running} onToggle={toggle} size={isDesktop ? 320 : 280}
              caption={timer.state === 'finished' ? 'Waktu habis!' : running ? (isBreak ? 'Santai dulu ☕' : 'Fokus ya ✨') : 'Siap?'} />
            <View style={{ alignItems: 'center' }}>
              <MiniAzza size={isDesktop ? 120 : 96} pose={pose} equipped={equipped} />
              <T v="muted">{restLook ? `${character} lagi minum teh 🍵` : running ? `${character} ikut belajar 📖` : `${character} siap menemani`}</T>
            </View>
          </View>
          {timer.mode === 'pomodoro' && cfg && (
            <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="image" accessibilityLabel={`${timer.completedSessions} dari ${cfg.sessionsBeforeLong} sesi selesai`}>
              {Array.from({ length: cfg.sessionsBeforeLong }, (_, i) => (
                <T key={i} style={{ fontSize: 20, opacity: i < timer.completedSessions ? 1 : 0.25 }} aria-hidden>🍅</T>
              ))}
            </View>
          )}
          {finishedPrompt && dismissed && <Button label="Waktu habis — pilih langkah berikutnya" onPress={() => setDismissed(false)} />}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: isDesktop ? 34 : 26, width: '100%' }}>
            <RoundControl label="Ulang" icon="reset" onPress={() => st().timerReset()} />
            <RoundControl big label={running ? 'Jeda' : timer.state === 'paused' ? 'Lanjut' : 'Mulai'} icon={running ? 'pause' : 'play'} onPress={toggle} disabled={timer.state === 'finished'} />
            <RoundControl label="Selesai" icon="check" onPress={done} />
          </View>
          <Row gap={8} wrap style={{ justifyContent: 'center' }}>
            <Button small kind="outline" label="+5 menit" onPress={() => st().timerAdd(5)} />
            <Button small kind="danger" label="Batalkan timer" onPress={() => setConfirmCancel(true)} />
          </Row>
        </Card>
      )}
    </View>
  );

  const side = (
    <View style={{ flex: isDesktop ? 1 : undefined, gap: 14, minWidth: 0 }}>
      {timer && task && !isDeadline(task) && (
        <Card title="Pengingat">
          <Switch label="Ingatkan saat mulai" value={task.remindAtStart} onValueChange={(v) => st().saveTask({ ...task, remindAtStart: v })} />
          <Switch label="Ingatkan saat selesai" value={task.remindAtEnd} onValueChange={(v) => st().saveTask({ ...task, remindAtEnd: v })} />
        </Card>
      )}
      <Card title="Mode belajar">
        <View style={{ gap: 10 }}>
          {/* Deadline tasks have no duration of their own: Pomodoro (or custom) only (PRD). */}
          {task && isDeadline(task) ? (
            <T v="muted">Tugas deadline memakai mode Pomodoro. Pilih preset atau Custom di bawah.</T>
          ) : (
            <Segmented label="Mode timer" value={timer?.mode ?? settings.defaultTimerMode}
              items={[{ key: 'task', label: 'Sesuai tugas' }, { key: 'pomodoro', label: 'Pomodoro' }]}
              onChange={(m) => (timer ? setMode(m) : st().updateSettings({ defaultTimerMode: m }))} />
          )}
          {((task && isDeadline(task)) || (timer?.mode ?? settings.defaultTimerMode) === 'pomodoro') && (
            <PomodoroPicker value={pomo} disabled={!!timer && timer.state !== 'idle'}
              onChange={(c) => { setPomo(c); if (timer) st().setTimerPomodoro(c); else st().updateSettings({ pomodoro: c }); }} />
          )}
          {timer && timer.state !== 'idle' && <T v="muted">Mode bisa diganti setelah timer di-reset.</T>}
        </View>
      </Card>
      <Card title="Notifikasi timer"><TonePicker events={['break', 'back', 'end']} toggles /></Card>
    </View>
  );

  return (
    <Page title="Fokus" subtitle="Satu tugas, satu fokus 🌷" actions={<HeaderActions />}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 14, alignItems: isDesktop ? 'flex-start' : 'stretch' }}>
        {main}
        {side}
      </View>

      <Sheet visible={!!finishedPrompt && !dismissed} onClose={() => setDismissed(true)} title={timer?.mode === 'pomodoro' ? (timer.phase === 'focus' ? 'Sesi fokus selesai! 🍅' : 'Istirahat selesai 🌷') : 'Sudah selesai?'}>
        <View style={{ alignItems: 'center' }}><MiniAzza size={100} pose="surprised" equipped={equipped} /></View>
        {timer?.mode === 'pomodoro' && timer.phase === 'focus' && (
          <>
            <T style={{ textAlign: 'center' }}>{nextBreak === 'long-break' ? `Hebat! Waktunya istirahat panjang ${cfg?.longBreakMin} menit.` : `Istirahat pendek ${cfg?.shortBreakMin} menit dulu, yuk.`}</T>
            <Button label="Mulai istirahat" onPress={() => st().timerNextPhase(nextBreak, true)} />
            <Button kind="soft" label="Lanjut fokus" onPress={() => st().timerNextPhase('focus', true)} />
            <Button kind="outline" label="Tugas selesai" onPress={done} />
          </>
        )}
        {timer?.mode === 'pomodoro' && timer.phase !== 'focus' && (
          <>
            <T style={{ textAlign: 'center' }}>Segar lagi? Ayo lanjut fokus!</T>
            <Button label="Mulai fokus lagi" onPress={() => st().timerNextPhase('focus', true)} />
            <Button kind="outline" label="Tugas selesai" onPress={done} />
          </>
        )}
        {timer?.mode === 'task' && (
          <>
            <T style={{ textAlign: 'center' }}>Waktu untuk {task?.title} sudah habis.</T>
            <Button label="Sudah selesai" onPress={done} />
            <Row>
              <Button kind="soft" label="+5 menit" style={{ flex: 1 }} onPress={() => st().timerAdd(5)} />
              <Button kind="soft" label="+15 menit" style={{ flex: 1 }} onPress={() => st().timerAdd(15)} />
            </Row>
            <Button kind="outline" label="Jadwalkan ulang" onPress={() => setRescheduleOpen(true)} />
          </>
        )}
      </Sheet>

      {timer && (
        <RescheduleSheet visible={rescheduleOpen} onClose={() => setRescheduleOpen(false)}
          onPick={(d) => { st().timerTick(true); st().rescheduleOcc(timer.occurrenceKey, d); st().timerCancel(); setRescheduleOpen(false); }} />
      )}
      <ConfirmDialog visible={confirmCancel} title="Batalkan timer?" message="Waktu fokus yang sudah berjalan tetap tersimpan." confirmLabel="Batalkan timer"
        onCancel={() => setConfirmCancel(false)} onConfirm={() => { st().timerCancel(); setConfirmCancel(false); }} />
    </Page>
  );
}

function NoTimer() {
  const tasks = useTaskList();
  const occs = useStore((s) => s.occurrences);
  const mode = useStore((s) => s.settings.defaultTimerMode);
  const start = useStore((s) => s.startTimer);
  const today = useToday();
  const list = useMemo(() => occurrencesOn(tasks, today, occs).filter((v) => !v.done), [tasks, today, occs]);
  return (
    <Card title="Pilih tugas untuk fokus">
      {list.length === 0 ? (
        <EmptyState title="Belum ada tugas hari ini" sub="Tambahkan tugas dulu, lalu mulai timer di sini.">
          <Button small label="Tambah tugas" onPress={() => router.push('/task/new')} />
        </EmptyState>
      ) : (
        <View style={{ gap: 8 }}>
          {list.map((v) => (
            <Row key={v.key} style={{ justifyContent: 'space-between', borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 10, backgroundColor: '#fff' }}>
              <View style={{ flex: 1, gap: 2 }}>
                <T v="body" style={{ fontFamily: fonts.bold }}>{CATEGORY_EMOJI[v.task.category]} {v.task.title}</T>
                <T v="muted">{timeLabel(v)}</T>
              </View>
              <Button small label="Mulai" icon={<Icon name="play" size={14} color="#fff" />} onPress={() => { unlockAudio(); start(v.key, mode); }} />
            </Row>
          ))}
        </View>
      )}
    </Card>
  );
}

/** Round timer control with its label underneath; the big one is the main play/pause. */
function RoundControl({ label, icon, onPress, big, disabled }: { label: string; icon: 'play' | 'pause' | 'reset' | 'check'; onPress: () => void; big?: boolean; disabled?: boolean }) {
  const sz = big ? 76 : 56;
  return (
    <View style={{ alignItems: 'center', gap: 6, width: big ? 92 : 72 }}>
      <View style={{ height: 80, justifyContent: 'center' }}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} disabled={disabled}
        style={({ pressed }) => [
          { width: sz, height: sz, borderRadius: sz / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: big ? 0 : 2, borderColor: colors.line, opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] },
          css(big ? { backgroundImage: `linear-gradient(160deg, ${colors.accentGradient.join(', ')})`, ...shadow.button, cursor: 'pointer' } : { ...shadow.card, cursor: 'pointer' }),
        ]}>
        <Icon name={icon} size={big ? 32 : 24} color={big ? '#fff' : colors.text} fill={big && icon === 'pause' ? 'none' : undefined} />
      </Pressable>
      </View>
      <T v="small" style={{ fontFamily: fonts.bold, color: big ? colors.accent : colors.text }}>{label}</T>
    </View>
  );
}
