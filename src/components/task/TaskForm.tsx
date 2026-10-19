import { useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  CATEGORIES, CATEGORY_EMOJI, CATEGORY_LABEL, countdown, DEFAULT_DEADLINE_REMINDERS, DEFAULT_DUE_TIME, fieldErrors, findConflicts,
  fromMinutes, kindOf, PRIORITIES, PRIORITY_LABEL, REMIND_OPTIONS, taskFormSchema, toMinutes, wall, wallToDate,
  type Category, type Priority, type Repeat, type Task, type TaskKind,
} from '@/domain';
import { TaskKindToggle } from '@/components/deadline/TaskKindToggle';
import { ReminderChips } from '@/components/deadline/ReminderChips';
import { useCountdownNow } from '@/components/deadline/useCountdown';
import { Icon } from '@/components/ui/Icon';
import { useStore } from '@/store/store';
import { useTaskList } from '@/store/hooks';
import { categoryColors, colors, priorityColors } from '@/theme/theme';
import { Button, Card, Chip, Field, Label, Row, Switch, T } from '@/components/ui/primitives';
import { WebDateTimeInput } from './WebDateTimeInput';
import { WEEKDAY_SHORT } from './schedule';

export interface TaskFormValues {
  kind: TaskKind;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  date: string;
  start: string;
  end: string;
  duration: string;
  /** Deadline kind: due time HH:mm and reminder offsets. */
  dueTime: string;
  deadlineReminders: number[];
  /** Scheduled kind: optional "Batas akhir" date + time. */
  hardStopDate: string;
  hardStopTime: string;
  remindBeforeMin: number;
  remindAtStart: boolean;
  remindAtEnd: boolean;
  repeat: Repeat;
  weekdays: number[];
}

export interface FormDefaults {
  date: string; start?: string; remindBeforeMin: number;
  kind?: TaskKind; dueTime?: string; deadlineReminders?: number[];
}

export function initialValues(task: Task | undefined, defaults: FormDefaults): TaskFormValues {
  const dueTime = defaults.dueTime ?? DEFAULT_DUE_TIME;
  const deadlineReminders = defaults.deadlineReminders ?? DEFAULT_DEADLINE_REMINDERS;
  if (task) {
    const dur = task.start && task.end ? toMinutes(task.end) - toMinutes(task.start) : task.durationMin;
    const kind = kindOf(task);
    return {
      kind, title: task.title, description: task.description ?? '', category: task.category, priority: task.priority, date: task.date,
      start: task.start ?? '', end: task.end ?? '', duration: dur ? String(dur) : '',
      dueTime: task.dueTime ?? dueTime,
      deadlineReminders: kind === 'deadline' ? task.deadlineRemindersMin ?? deadlineReminders : deadlineReminders,
      hardStopDate: task.hardStop?.slice(0, 10) ?? '', hardStopTime: task.hardStop?.slice(11, 16) ?? '',
      remindBeforeMin: task.remindBeforeMin, remindAtStart: task.remindAtStart, remindAtEnd: task.remindAtEnd,
      repeat: task.repeat, weekdays: task.weekdays,
    };
  }
  const start = defaults.start ?? '';
  return {
    kind: defaults.kind ?? 'scheduled',
    title: '', description: '', category: 'belajar', priority: 'sedang', date: defaults.date, start,
    end: start ? fromMinutes(Math.min(toMinutes(start) + 60, 1439)) : '', duration: start ? '60' : '',
    dueTime, deadlineReminders: [...deadlineReminders], hardStopDate: '', hardStopTime: '',
    remindBeforeMin: defaults.remindBeforeMin, remindAtStart: true, remindAtEnd: true, repeat: 'none', weekdays: [],
  };
}

const REPEATS: { key: Repeat; label: string }[] = [
  { key: 'none', label: 'Tidak' }, { key: 'daily', label: 'Setiap hari' }, { key: 'weekdays', label: 'Senin–Jumat' }, { key: 'weekly', label: 'Mingguan' },
];

/** Add/edit task form. Conflicts are warnings only; validation blocks saving. */
const QUICK_DUE = ['23:59', '12:00'];

export function TaskForm({ task, initial, onSaved, onCancel }: { task?: Task; initial: TaskFormValues; onSaved: (t: Task) => void; onCancel: () => void }) {
  const saveTask = useStore((s) => s.saveTask);
  const updateSettings = useStore((s) => s.updateSettings);
  const occs = useStore((s) => s.occurrences);
  const tasks = useTaskList();
  const [v, setV] = useState<TaskFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (p: Partial<TaskFormValues>) => { setV((x) => ({ ...x, ...p })); setErrors((e) => { const n = { ...e }; Object.keys(p).forEach((k) => delete n[k]); return n; }); };

  const onStart = (start: string) => {
    if (!start) return set({ start, end: '' });
    const dur = Number(v.duration);
    if (dur > 0) set({ start, end: fromMinutes(Math.min(toMinutes(start) + dur, 1439)) });
    else set({ start });
  };
  const onEnd = (end: string) => {
    if (end && v.start && toMinutes(end) > toMinutes(v.start)) set({ end, duration: String(toMinutes(end) - toMinutes(v.start)) });
    else set({ end });
  };
  const onDuration = (d: string) => {
    const clean = d.replace(/\D/g, '').slice(0, 4);
    const n = Number(clean);
    if (v.start && n > 0) set({ duration: clean, end: fromMinutes(Math.min(toMinutes(v.start) + n, 1439)) });
    else set({ duration: clean });
  };

  const isDl = v.kind === 'deadline';
  const dueAt = v.date && v.dueTime ? wall(v.date, v.dueTime) : undefined;
  const dueMs = dueAt ? wallToDate(dueAt).getTime() : undefined;
  const nowMs = useCountdownNow(dueMs !== undefined ? [dueMs] : []);

  const conflicts = useMemo(
    () => (!isDl && v.start ? findConflicts({ id: task?.id, start: v.start, end: v.end || undefined, durationMin: Number(v.duration) || undefined }, v.date, tasks, occs) : { overlap: [], close: [] }),
    [isDl, v.start, v.end, v.duration, v.date, tasks, occs, task?.id],
  );

  const submit = () => {
    const shared = {
      kind: v.kind, title: v.title, description: v.description || undefined, category: v.category, priority: v.priority, date: v.date,
      repeat: v.repeat, weekdays: v.repeat === 'weekly' ? v.weekdays : [],
    };
    const hardStopErr = !isDl && (v.hardStopDate ? !v.hardStopTime : !!v.hardStopTime);
    const input = isDl
      ? {
          ...shared, dueTime: v.dueTime || undefined, deadlineRemindersMin: v.deadlineReminders,
          start: undefined, end: undefined, durationMin: undefined, hardStop: undefined,
          remindBeforeMin: 0, remindAtStart: false, remindAtEnd: false,
        }
      : {
          ...shared, dueTime: undefined, deadlineRemindersMin: [] as number[],
          start: v.start || undefined, end: v.end || undefined, durationMin: Number(v.duration) > 0 ? Number(v.duration) : undefined,
          hardStop: v.hardStopDate && v.hardStopTime ? wall(v.hardStopDate, v.hardStopTime) : undefined,
          remindBeforeMin: v.remindBeforeMin, remindAtStart: v.remindAtStart, remindAtEnd: v.remindAtEnd,
        };
    const r = taskFormSchema.safeParse(input);
    if (!r.success || hardStopErr) {
      const errs = r.success ? {} : fieldErrors(r.error);
      if (hardStopErr) errs.hardStop = 'Isi tanggal dan jam batas akhir, atau kosongkan keduanya';
      setErrors(errs);
      return;
    }
    // saveTask merges onto the stored task, so clear the legacy date-only `deadline` explicitly:
    // its replacement is kind/dueTime (deadline tasks) or hardStop (scheduled tasks).
    const saved = saveTask({ ...input, deadline: undefined, title: input.title.trim(), id: task?.id, subtasks: task?.subtasks });
    if (isDl && v.dueTime) updateSettings({ lastDueTime: v.dueTime });
    onSaved(saved);
  };

  const dueInfo = dueMs !== undefined ? countdown(dueMs, nowMs) : undefined;
  const past = dueMs !== undefined && dueMs < nowMs;
  const customDue = !QUICK_DUE.includes(v.dueTime);
  const openDuePicker = () => {
    const el = typeof document !== 'undefined' ? (document.querySelector('input[aria-label="Jam deadline"]') as HTMLInputElement | null) : null;
    try { el?.showPicker?.(); } catch { el?.focus(); }
  };

  const repeatField = (
    <View>
      <Label>Ulangi</Label>
      <Row wrap>
        {REPEATS.map((r) => <Chip key={r.key} label={r.label} accessibilityLabel={`Ulangi: ${r.label}`} selected={v.repeat === r.key} onPress={() => set({ repeat: r.key })} />)}
      </Row>
      {v.repeat === 'weekly' && (
        <Row wrap style={{ marginTop: 10 }}>
          {[1, 2, 3, 4, 5, 6, 0].map((d) => (
            <Chip key={d} label={WEEKDAY_SHORT[d]} selected={v.weekdays.includes(d)}
              onPress={() => set({ weekdays: v.weekdays.includes(d) ? v.weekdays.filter((x) => x !== d) : [...v.weekdays, d] })} />
          ))}
        </Row>
      )}
      {errors.weekdays ? <T v="small" style={{ color: colors.danger, marginTop: 4 }}>{errors.weekdays}</T> : null}
      {isDl && v.repeat !== 'none' && <T v="muted" style={{ marginTop: 6 }}>Setiap kejadian punya deadline di tanggalnya sendiri, jam {v.dueTime.replace(':', '.')}.</T>}
    </View>
  );

  return (
    <View style={{ gap: 14 }}>
      <Card style={{ gap: 14 }}>
        <View>
          <Row style={{ justifyContent: 'space-between' }}>
            <Label required>Nama tugas</Label>
            <T v="muted" style={{ marginBottom: 6 }}>{v.title.length}/80</T>
          </Row>
          <Field value={v.title} onChangeText={(t) => set({ title: t })} maxLength={80} placeholder="mis. Belajar Matematika" error={errors.title} accessibilityLabel="Nama tugas" autoFocus={!task} />
        </View>
        <View>
          <Label>Jenis tugas</Label>
          <TaskKindToggle value={v.kind} onChange={(kind) => set({ kind })} />
        </View>
        <View>
          <Label>Catatan</Label>
          <Field value={v.description} onChangeText={(t) => set({ description: t })} multiline placeholder="Detail, bab, link…" accessibilityLabel="Catatan" />
        </View>
        <View>
          <Label>Kategori</Label>
          <Row wrap>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={`${CATEGORY_EMOJI[c]} ${CATEGORY_LABEL[c]}`} accessibilityLabel={`Kategori ${CATEGORY_LABEL[c]}`} selected={v.category === c} color={categoryColors[c]} onPress={() => set({ category: c })} />
            ))}
          </Row>
        </View>
        <View>
          <Label>Prioritas</Label>
          <Row wrap>
            {PRIORITIES.map((p) => (
              <Chip key={p} label={PRIORITY_LABEL[p]} accessibilityLabel={`Prioritas ${PRIORITY_LABEL[p]}`} selected={v.priority === p} color={priorityColors[p]} onPress={() => set({ priority: p })} />
            ))}
          </Row>
        </View>
      </Card>

      {isDl ? (
        <Card title="Deadline" style={{ gap: 12 }}>
          <Row wrap gap={12} style={{ alignItems: 'flex-start' }}>
            <View style={{ flexGrow: 1, flexBasis: 230 }}>
              <Label required>Tanggal</Label>
              <WebDateTimeInput type="date" label="Tanggal deadline" value={v.date} onChange={(d) => set({ date: d })} error={errors.date} />
            </View>
            <View style={{ flexGrow: 1, flexBasis: 130 }}>
              <Label required>Jam deadline</Label>
              <WebDateTimeInput type="time" label="Jam deadline" value={v.dueTime} onChange={(t) => set({ dueTime: t })} error={errors.dueTime} placeholder="--.--" />
            </View>
          </Row>
          <View>
            <Label>Pilihan cepat jam deadline</Label>
            <Row wrap>
              {QUICK_DUE.map((t) => (
                <Chip key={t} label={t.replace(':', '.')} accessibilityLabel={`Jam deadline ${t.replace(':', '.')}`} selected={v.dueTime === t} onPress={() => set({ dueTime: t })} />
              ))}
              <Chip label={customDue && v.dueTime ? `Jam lain · ${v.dueTime.replace(':', '.')}` : 'Jam lain'} accessibilityLabel="Pilih jam deadline lain" selected={customDue && !!v.dueTime} onPress={openDuePicker} />
            </Row>
          </View>
          {dueInfo && (
            <Row gap={10} style={{ backgroundColor: past ? '#FFE0E9' : colors.accentSoft, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 }}>
              <Icon name="flag" size={18} color={past ? colors.danger : colors.accent} />
              <T v="small" accessibilityLiveRegion="polite" style={{ flex: 1, color: past ? colors.danger : colors.accent }}>
                {past ? 'Deadline ini sudah lewat. Tetap boleh disimpan.' : `${dueInfo.text} lagi dari sekarang`}
              </T>
            </Row>
          )}
          <ReminderChips value={v.deadlineReminders} onChange={(deadlineReminders) => set({ deadlineReminders })} dueAt={dueAt} />
          {repeatField}
        </Card>
      ) : (
        <>
      <Card title="Waktu" style={{ gap: 12 }}>
        <View>
          <Label required>Tanggal</Label>
          <WebDateTimeInput type="date" label="Tanggal" value={v.date} onChange={(d) => set({ date: d })} error={errors.date} />
        </View>
        <Row wrap gap={12} style={{ alignItems: 'flex-start' }}>
          <View style={{ flexGrow: 1, flexBasis: 130 }}>
            <Label>Jam mulai</Label>
            <WebDateTimeInput type="time" label="Jam mulai" value={v.start} onChange={onStart} error={errors.start} placeholder="--.--" clearable />
          </View>
          <View style={{ flexGrow: 1, flexBasis: 130 }}>
            <Label>Jam selesai</Label>
            <WebDateTimeInput type="time" label="Jam selesai" value={v.end} onChange={onEnd} error={errors.end} placeholder="--.--" clearable />
          </View>
          <View style={{ flexGrow: 1, flexBasis: 130 }}>
            <Label>Durasi (menit)</Label>
            <Field value={v.duration} onChangeText={onDuration} keyboardType="number-pad" inputMode="numeric" placeholder="25" accessibilityLabel="Durasi dalam menit" error={errors.durationMin} />
          </View>
        </Row>
        {(conflicts.overlap.length > 0 || conflicts.close.length > 0) && (
          <View accessibilityLiveRegion="polite" style={{ backgroundColor: '#FFF0F4', borderRadius: 14, borderWidth: 1, borderColor: '#F7C1D2', padding: 12, gap: 4 }}>
            {conflicts.overlap.length > 0 && <T v="small" style={{ color: colors.danger }}>⚠️ Bentrok dengan {conflicts.overlap.map((t) => `“${t.title}” (${t.start}${t.end ? `–${t.end}` : ''})`).join(', ')}</T>}
            {conflicts.close.length > 0 && <T v="small" style={{ color: '#85520F' }}>⏳ Kurang dari 10 menit dari {conflicts.close.map((t) => `“${t.title}” (${t.start}${t.end ? `–${t.end}` : ''})`).join(', ')}</T>}
            <T v="muted">Tetap boleh disimpan.</T>
          </View>
        )}
        <View>
          <Label>Batas akhir (opsional)</Label>
          <Row wrap gap={12} style={{ alignItems: 'flex-start' }}>
            <View style={{ flexGrow: 1, flexBasis: 150 }}>
              <WebDateTimeInput type="date" label="Tanggal batas akhir" value={v.hardStopDate} placeholder="Tidak ada" clearable
                onChange={(d) => set({ hardStopDate: d, hardStopTime: d && !v.hardStopTime ? DEFAULT_DUE_TIME : d ? v.hardStopTime : '' })} />
            </View>
            <View style={{ flexGrow: 1, flexBasis: 130 }}>
              <WebDateTimeInput type="time" label="Jam batas akhir" value={v.hardStopTime} placeholder="--.--" clearable onChange={(t) => set({ hardStopTime: t })} />
            </View>
          </Row>
          {errors.hardStop ? <T v="small" style={{ color: colors.danger, marginTop: 4 }}>{errors.hardStop}</T> : <T v="muted" style={{ marginTop: 4 }}>Hanya ditampilkan di detail tugas, tanpa pengingat tambahan.</T>}
        </View>
        {repeatField}
      </Card>

      <Card title="Pengingat" style={{ gap: 8 }}>
        <Label>Ingatkan sebelum mulai</Label>
        <Row wrap>
          {REMIND_OPTIONS.map((m) => (
            <Chip key={m} label={m === 0 ? 'Mati' : `${m} mnt`} accessibilityLabel={m === 0 ? 'Pengingat sebelum mulai mati' : `${m} menit sebelum`} selected={v.remindBeforeMin === m} onPress={() => set({ remindBeforeMin: m })} />
          ))}
        </Row>
        <Switch label="Ingatkan saat mulai" value={v.remindAtStart} onValueChange={(b) => set({ remindAtStart: b })} />
        <Switch label="Ingatkan saat selesai" value={v.remindAtEnd} onValueChange={(b) => set({ remindAtEnd: b })} />
        {!v.start && <T v="muted">Pengingat hanya aktif bila jam mulai diisi.</T>}
      </Card>
        </>
      )}

      <Row style={{ justifyContent: 'flex-end' }} wrap>
        <Button kind="outline" label="Batal" onPress={onCancel} />
        <Button label={task ? 'Simpan perubahan' : 'Simpan tugas'} onPress={submit} />
      </Row>
      {Object.keys(errors).length > 0 && <T v="small" style={{ color: colors.danger, textAlign: 'right' }} accessibilityLiveRegion="polite">Periksa lagi isian yang ditandai merah.</T>}
    </View>
  );
}
