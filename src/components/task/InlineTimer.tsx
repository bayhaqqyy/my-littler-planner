import { View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { durationOf, isDeadline, remainingSec, type OccView } from '@/domain';
import { useStore } from '@/store/store';
import { useNow } from '@/store/hooks';
import { checklist, data } from '@/theme/theme';
import { Button, Row, T, css } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { unlockAudio } from '@/services/audio';
import { completeWithFx } from './useComplete';

export const fmtClock = (sec: number) => {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/** "25 mnt" / "1 jam 5 mnt" for the focus time already banked on an occurrence. */
export const focusText = (sec: number) => {
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} mnt`;
  return `${Math.floor(min / 60)} jam${min % 60 ? ` ${min % 60} mnt` : ''}`;
};

/** Solid brick-peach so white labels stay readable (4.5:1+). */
const peach = [{ backgroundColor: checklist.accent }, css({ backgroundImage: 'none' })];

/** Small progress ring used inside the task row (the big FlowerTimer lives on the Timer tab). */
function Ring({ remaining, total, rest }: { remaining: number; total: number; rest: boolean }) {
  const r = 34, c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  return (
    <View style={{ width: 84, height: 84, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={84} height={84} viewBox="0 0 84 84" style={{ position: 'absolute' }} aria-hidden>
        <Circle cx={42} cy={42} r={r} stroke={rest ? '#E3F4EA' : checklist.track} strokeWidth={9} fill="none" />
        {frac > 0 && <Circle cx={42} cy={42} r={r} stroke={rest ? data.timer.restRing : checklist.ring} strokeWidth={9} fill="none" strokeLinecap="round"
          strokeDasharray={`${c * frac} ${c}`} transform="rotate(-90 42 42)" />}
      </Svg>
      <T v="cardTitle" accessibilityRole="timer" accessibilityLabel={`Sisa waktu ${fmtClock(remaining)}`}
        style={{ fontSize: 17, fontVariant: ['tabular-nums'], color: rest ? '#2E6B4A' : checklist.ink }}>{fmtClock(remaining)}</T>
    </View>
  );
}

/**
 * Timer panel that opens under a task row. Drives the same global timer as the Timer tab
 * (one timer at a time); starting here switches the timer to this task.
 */
export function InlineTimer({ v }: { v: OccView }) {
  const timer = useStore((s) => s.timer);
  const settings = useStore((s) => s.settings);
  const focusSec = useStore((s) => s.occurrences[v.key]?.focusSec ?? 0);
  const st = useStore.getState;
  const now = useNow(500);

  const active = timer?.occurrenceKey === v.key ? timer : undefined;
  const other = !!timer && !active && timer.state !== 'idle';
  const pomodoroMode = isDeadline(v.task) || settings.defaultTimerMode === 'pomodoro';
  const previewSec = (pomodoroMode ? settings.pomodoro.focusMin : durationOf(v.task)) * 60;

  const rem = active ? remainingSec(active, now.getTime()) : previewSec;
  const total = active ? active.totalSec : previewSec;
  const rest = !!active && active.phase !== 'focus';
  const running = active?.state === 'running';
  const finished = active?.state === 'finished';
  const cfg = active?.pomodoro;
  const nextBreak = cfg && active && active.completedSessions >= cfg.sessionsBeforeLong ? 'long-break' : 'short-break';

  const start = () => {
    unlockAudio();
    if (timer && !active) st().timerTick(true); // bank the other task's focus time first
    st().startTimer(v.key, pomodoroMode ? 'pomodoro' : 'task');
    st().timerPlay();
  };
  const toggle = () => {
    unlockAudio();
    if (!active) return start();
    if (running) st().timerPause();
    else if (!finished) st().timerPlay();
  };
  const done = () => {
    if (active) st().timerTick(true);
    completeWithFx(v.key, undefined, { timed: true });
  };

  const status = !active
    ? other ? 'Timer tugas lain sedang jalan. Mulai di sini untuk pindah.' : `Siap fokus ${Math.round(previewSec / 60)} menit${pomodoroMode ? ' (Pomodoro)' : ''}`
    : finished
      ? active.mode === 'pomodoro' ? (active.phase === 'focus' ? 'Sesi fokus selesai! Istirahat dulu?' : 'Istirahat selesai, lanjut fokus?') : 'Waktunya habis. Sudah selesai?'
      : rest ? 'Istirahat dulu, minum air ya' : running ? 'Lagi fokus, semangat!' : 'Timer dijeda';

  return (
    <View style={{ backgroundColor: checklist.paper, borderRadius: 16, padding: 12, gap: 10 }}>
      <Row gap={14} style={{ alignItems: 'center' }}>
        <Ring remaining={rem} total={total} rest={rest} />
        <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
          <T v="small" style={{ color: checklist.inkSoft }}>{status}</T>
          {focusSec >= 60 && <T v="muted" style={{ color: checklist.inkSoft }}>Total fokus: {focusText(focusSec)}</T>}
          {!finished && (
            <Row gap={8} style={{ maxWidth: 360 }}>
              <Button small label={running ? 'Jeda' : active && active.state === 'paused' ? 'Lanjut' : 'Mulai fokus'} style={[{ flex: 1 }, ...peach]}
                icon={<Icon name={running ? 'pause' : 'play'} size={15} color="#fff" />} onPress={toggle} />
              {active && (
                <Button small kind="outline" label="Ulang" accessibilityLabel="Ulang timer" icon={<Icon name="reset" size={15} color={checklist.accent} />}
                  onPress={() => st().timerReset()} />
              )}
            </Row>
          )}
        </View>
      </Row>

      {finished && active && (
        <Row wrap gap={8}>
          {active.mode === 'pomodoro' && active.phase === 'focus' && (
            <>
              <Button small style={peach} label={nextBreak === 'long-break' ? `Istirahat ${cfg?.longBreakMin} mnt` : `Istirahat ${cfg?.shortBreakMin} mnt`} onPress={() => st().timerNextPhase(nextBreak, true)} />
              <Button small kind="soft" label="Lanjut fokus" onPress={() => st().timerNextPhase('focus', true)} />
            </>
          )}
          {active.mode === 'pomodoro' && active.phase !== 'focus' && (
            <Button small style={peach} label="Fokus lagi" onPress={() => st().timerNextPhase('focus', true)} />
          )}
          {active.mode === 'task' && <Button small kind="soft" label="+5 menit" onPress={() => st().timerAdd(5)} />}
          <Button small kind="outline" label="Tugas selesai" icon={<Icon name="check" size={15} color={checklist.accent} />} onPress={done} />
        </Row>
      )}

      {active && (
        <Row style={{ justifyContent: 'space-between' }}>
          {cfg ? <T v="muted" style={{ color: checklist.inkSoft }}>Sesi {active.completedSessions}/{cfg.sessionsBeforeLong}</T> : <View />}
          <T v="small" accessibilityRole="link" onPress={() => router.navigate('/timer')}
            style={[{ color: checklist.accent, paddingVertical: 6 }, css({ cursor: 'pointer', textDecorationLine: 'underline' })]}>
            Buka layar timer
          </T>
        </Row>
      )}
    </View>
  );
}
