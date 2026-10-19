import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { addDays, dueAtOf, dueLabel, fromMinutes, isDeadline, toDateStr, toMinutes, wall, wallDate, wallTime, type Task } from '@/domain';
import { useStore } from '@/store/store';
import { useUi } from '@/store/ui';
import { colors } from '@/theme/theme';
import { Sheet } from '@/components/ui/Overlays';
import { Button, Chip, Label, Row, T } from '@/components/ui/primitives';
import { WebDateTimeInput } from './WebDateTimeInput';
import { fmtDate } from './schedule';

/** Move one occurrence to another date/time. Repeating tasks: only this occurrence moves. */
export function RescheduleSheet(props: { visible: boolean; onClose: () => void; task: Task; date: string; onDone?: (newDate: string) => void }) {
  return isDeadline(props.task) ? <DeadlineReschedule {...props} /> : <ScheduledReschedule {...props} />;
}

/** Deadline task: new due date + time for this occurrence only (store.rescheduleDeadline). */
function DeadlineReschedule({ visible, onClose, task, date, onDone }: { visible: boolean; onClose: () => void; task: Task; date: string; onDone?: (newDate: string) => void }) {
  const rescheduleDeadline = useStore((s) => s.rescheduleDeadline);
  const occ = useStore((s) => s.occurrences[`${task.id}@${date}`]);
  const current = dueAtOf(task, date, occ);
  // Never suggest a day in the past: start from tomorrow if the deadline has gone by.
  const base = wallDate(current) < toDateStr(new Date()) ? toDateStr(new Date()) : wallDate(current);
  const [to, setTo] = useState(addDays(base, 1));
  const [time, setTime] = useState(wallTime(current));
  const [err, setErr] = useState<string>();
  useEffect(() => { if (visible) { setTo(addDays(base, 1)); setTime(wallTime(current)); setErr(undefined); } }, [visible, base, current]);
  const save = () => {
    if (!to) return setErr('Pilih tanggal deadline baru');
    if (!time) return setErr('Pilih jam deadline baru');
    const dueAt = wall(to, time);
    rescheduleDeadline(`${task.id}@${date}`, dueAt);
    useUi.getState().pushToast('info', `Deadline dipindah ke ${dueLabel(dueAt, toDateStr(new Date()))} 🚩`);
    onClose();
    onDone?.(date);
  };
  return (
    <Sheet visible={visible} onClose={onClose} title="Jadwalkan ulang deadline"
      footer={<Row style={{ justifyContent: 'flex-end' }}><Button kind="outline" label="Batal" onPress={onClose} /><Button label="Simpan deadline" onPress={save} /></Row>}>
      <T v="muted">Deadline sekarang: {dueLabel(current, toDateStr(new Date()))}</T>
      <View style={{ backgroundColor: colors.accentSoft, borderRadius: 14, padding: 12 }}>
        <T v="small">{task.repeat !== 'none' ? '🔁 Ini tugas rutin. Hanya kejadian ini yang berubah; deadline rutin lainnya tetap.' : 'Hanya deadline kejadian ini yang berubah.'}</T>
      </View>
      <Row wrap>
        <Chip label="Besok" selected={to === addDays(base, 1)} onPress={() => setTo(addDays(base, 1))} />
        <Chip label="Lusa" selected={to === addDays(base, 2)} onPress={() => setTo(addDays(base, 2))} />
        <Chip label="Minggu depan" selected={to === addDays(base, 7)} onPress={() => setTo(addDays(base, 7))} />
      </Row>
      <Row gap={12} wrap style={{ alignItems: 'flex-start' }}>
        <View style={{ flexGrow: 1, flexBasis: 150 }}><Label required>Tanggal deadline</Label><WebDateTimeInput type="date" label="Tanggal deadline baru" value={to} onChange={setTo} /></View>
        <View style={{ flexGrow: 1, flexBasis: 120 }}><Label required>Jam deadline</Label><WebDateTimeInput type="time" label="Jam deadline baru" value={time} onChange={setTime} placeholder="--.--" /></View>
      </Row>
      <Row wrap>
        {['23:59', '12:00'].map((t) => <Chip key={t} label={t.replace(':', '.')} selected={time === t} onPress={() => setTime(t)} />)}
      </Row>
      <T v="muted">Bonus selesai lebih awal tetap dihitung dari deadline asli.</T>
      {err ? <T v="small" style={{ color: colors.danger }} accessibilityLiveRegion="polite">{err}</T> : null}
    </Sheet>
  );
}

function ScheduledReschedule({ visible, onClose, task, date, onDone }: { visible: boolean; onClose: () => void; task: Task; date: string; onDone?: (newDate: string) => void }) {
  const rescheduleOcc = useStore((s) => s.rescheduleOcc);
  const [to, setTo] = useState(addDays(date, 1));
  const [start, setStart] = useState(task.start ?? '');
  const [end, setEnd] = useState(task.end ?? '');
  const [err, setErr] = useState<string>();
  useEffect(() => { if (visible) { setTo(addDays(date, 1)); setStart(task.start ?? ''); setEnd(task.end ?? ''); setErr(undefined); } }, [visible, date, task.start, task.end]);

  const onStart = (s: string) => {
    if (s && start && end) setEnd(fromMinutes(Math.min(toMinutes(s) + toMinutes(end) - toMinutes(start), 1439)));
    setStart(s);
  };
  const save = () => {
    if (!to) return setErr('Pilih tanggal tujuan');
    if (start && end && toMinutes(end) <= toMinutes(start)) return setErr('Jam selesai harus setelah jam mulai');
    rescheduleOcc(`${task.id}@${date}`, to, { start: start || undefined, end: start && end ? end : undefined });
    useUi.getState().pushToast('info', `Dipindah ke ${fmtDate(to, 'EEE, d MMM')} 📅`);
    onClose();
    onDone?.(to);
  };
  return (
    <Sheet visible={visible} onClose={onClose} title="Jadwalkan ulang"
      footer={<Row style={{ justifyContent: 'flex-end' }}><Button kind="outline" label="Batal" onPress={onClose} /><Button label="Pindahkan" onPress={save} /></Row>}>
      <T v="muted">Dari {fmtDate(date)}</T>
      {task.repeat !== 'none' && (
        <View style={{ backgroundColor: colors.accentSoft, borderRadius: 14, padding: 12 }}>
          <T v="small">🔁 Ini tugas rutin. Hanya kejadian tanggal ini yang dipindah; jadwal rutin lainnya tetap.</T>
        </View>
      )}
      <Row wrap>
        <Chip label="Besok" selected={to === addDays(date, 1)} onPress={() => setTo(addDays(date, 1))} />
        <Chip label="Lusa" selected={to === addDays(date, 2)} onPress={() => setTo(addDays(date, 2))} />
        <Chip label="Minggu depan" selected={to === addDays(date, 7)} onPress={() => setTo(addDays(date, 7))} />
      </Row>
      <View>
        <Label required>Tanggal tujuan</Label>
        <WebDateTimeInput type="date" label="Tanggal tujuan" value={to} onChange={setTo} />
      </View>
      <Row gap={12} wrap>
        <View style={{ flexGrow: 1, flexBasis: 120 }}><Label>Jam mulai</Label><WebDateTimeInput type="time" label="Jam mulai" value={start} onChange={onStart} placeholder="--.--" clearable /></View>
        <View style={{ flexGrow: 1, flexBasis: 120 }}><Label>Jam selesai</Label><WebDateTimeInput type="time" label="Jam selesai" value={end} onChange={setEnd} placeholder="--.--" clearable /></View>
      </Row>
      {err ? <T v="small" style={{ color: colors.danger }} accessibilityLiveRegion="polite">{err}</T> : null}
    </Sheet>
  );
}
