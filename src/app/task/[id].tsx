import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CATEGORY_EMOJI, completionText, dueAtOf, dueLabel, durationOf, endOf, fromMinutes, isDeadline, isValidDate, occKey, occursOn,
  remindersFor, REMINDER_OFFSET_LABEL, urgencyOf, URGENCY_LABEL, wallDate, wallTime, wallToDate, type Reminder,
} from '@/domain';
import { CountdownBadge } from '@/components/deadline/CountdownBadge';
import { useCountdownNow } from '@/components/deadline/useCountdown';
import { useStore } from '@/store/store';
import { useToday } from '@/store/hooks';
import { useUi } from '@/store/ui';
import { categoryColors, colors, radius, urgencyColors } from '@/theme/theme';
import { HeaderActions, Page } from '@/components/AppShell';
import { Button, Card, CategoryPill, css, Divider, Field, IconButton, PriorityPill, Row, T } from '@/components/ui/primitives';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/Overlays';
import { EmptyState } from '@/components/ui/EmptyState';
import { FlowerCheck } from '@/components/task/FlowerCheck';
import { completeWithFx } from '@/components/task/useComplete';
import { TaskForm, initialValues } from '@/components/task/TaskForm';
import { RescheduleSheet } from '@/components/task/RescheduleSheet';
import { fmtDate, repeatText } from '@/components/task/schedule';
import { goBack } from '@/components/task/nav';

const REMINDER_LABEL: Record<Reminder['kind'], string> = { before: 'Sebelum mulai', start: 'Saat mulai', end: 'Saat selesai', snooze: 'Tunda', 'deadline-before': 'Sebelum deadline', 'deadline-due': 'Saat deadline' };

function InfoRow({ icon, label, value, danger }: { icon: IconName; label: string; value: string; danger?: boolean }) {
  return (
    <Row gap={10} style={{ minHeight: 32 }}>
      <Icon name={icon} size={18} color={danger ? colors.danger : colors.muted} />
      <T v="muted" style={{ width: 92 }}>{label}</T>
      <T v="body" style={{ flex: 1, color: danger ? colors.danger : colors.text, fontFamily: 'Quicksand_600SemiBold' }}>{value}</T>
    </Row>
  );
}

export default function TaskDetail() {
  const params = useLocalSearchParams<{ id: string; date?: string; edit?: string; reschedule?: string }>();
  const today = useToday();
  const task = useStore((s) => s.tasks[params.id]);
  const occs = useStore((s) => s.occurrences);
  const settings = useStore((s) => s.settings);
  const { startTimer, uncomplete, skip, deleteTask, addSubtask, toggleSubtask, removeSubtask } = useStore.getState();
  const [editing, setEditing] = useState(params.edit === '1');
  // `?reschedule=1` comes from the "Jadwalkan ulang" notification action.
  const [moving, setMoving] = useState(params.reschedule === '1');
  const [confirmDel, setConfirmDel] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [sub, setSub] = useState('');
  const dl = !!task && !task.deletedAt && isDeadline(task);
  const dlDate = task && (isValidDate(params.date) ? params.date : occursOn(task, today) ? today : task.date);
  const dueMs = dl && task && dlDate ? wallToDate(dueAtOf(task, dlDate, occs[occKey(task.id, dlDate)])).getTime() : undefined;
  const nowMs = useCountdownNow(dueMs !== undefined ? [dueMs] : []);

  if (!task || task.deletedAt) {
    return (
      <Page title="Task Detail" back>
        <Card><EmptyState title="Tugas tidak ditemukan" sub="Mungkin sudah dihapus."><Button label="Ke To-Do List" onPress={() => router.replace('/tasks')} /></EmptyState></Card>
      </Page>
    );
  }

  const date = isValidDate(params.date) ? params.date : occursOn(task, today) ? today : task.date;
  const key = occKey(task.id, date);
  const occ = occs[key];
  const done = !!occ?.doneAt;
  const skipped = !!occ?.skipped;

  if (editing) {
    return (
      <Page title="Edit Task" subtitle={task.title} back>
        <TaskForm
          task={task}
          initial={initialValues(task, {
            date: task.date, remindBeforeMin: settings.defaultRemindBeforeMin,
            dueTime: settings.lastDueTime, deadlineReminders: settings.defaultDeadlineRemindersMin,
          })}
          onCancel={() => setEditing(false)}
          onSaved={() => { useUi.getState().pushToast('info', 'Perubahan disimpan ✨'); setEditing(false); router.setParams({ edit: undefined }); }}
        />
      </Page>
    );
  }

  const end = endOf(task);
  const time = task.start ? `${task.start}${end !== undefined ? ` – ${fromMinutes(end)}` : ''} (${durationOf(task)} menit)` : `Tanpa jam · ${durationOf(task)} menit`;
  const dueAt = dl ? dueAtOf(task, date, occ) : undefined;
  const urgency = dueMs !== undefined ? urgencyOf(dueMs, nowMs, done) : undefined;
  const hardStopText = !dl && task.hardStop ? `${fmtDate(wallDate(task.hardStop), 'EEE, d MMM yyyy')}, ${wallTime(task.hardStop).replace(':', '.')}` : undefined;
  const reminders = remindersFor(task, date, occ);
  const c = categoryColors[task.category];
  const subDone = task.subtasks.filter((s) => s.done).length;

  return (
    <Page title="Task Detail" back actions={<HeaderActions />}>
      <View style={{ gap: 14, width: '100%', maxWidth: 820 }}>
        <Card style={[{ gap: 12, borderLeftWidth: 6, borderLeftColor: c.dot }]}>
          <Row gap={6} style={{ alignItems: 'flex-start' }}>
            <FlowerCheck done={done} category={task.category} label={`${done ? 'Batalkan selesai' : 'Tandai selesai'}: ${task.title}`}
              onToggle={(e) => (done ? uncomplete(key) : completeWithFx(key, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY }))} />
            <View style={{ flex: 1, gap: 6, paddingTop: 8 }}>
              <T v="greeting" style={[{ fontSize: 21 }, done ? css({ textDecorationLine: 'line-through', textDecorationColor: '#F7A8C4', color: colors.muted }) : null]}>
                {CATEGORY_EMOJI[task.category]} {task.title}
              </T>
              <Row wrap gap={6}>
                <CategoryPill c={task.category} />
                <PriorityPill p={task.priority} />
                {dl && <Row gap={4} style={{ backgroundColor: colors.accentSoft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}><Icon name="flag" size={12} color={colors.accent} /><T v="chip" style={{ color: colors.accent }}>Deadline</T></Row>}
                {done && <T v="small" style={{ color: '#2E6B4A' }}>✓ Selesai</T>}
                {skipped && <T v="small" style={{ color: colors.muted }}>Dilewati</T>}
              </Row>
            </View>
            {dl && dueMs !== undefined && !done && <View style={{ paddingTop: 8 }}><CountdownBadge dueMs={dueMs} nowMs={nowMs} /></View>}
          </Row>
          {dl && done && occ?.doneAt && dueMs !== undefined && (
            <T v="small" style={{ color: occ.completedLate ? '#85520F' : '#2E6B4A' }}>✓ {completionText(occ.doneAt, dueMs)}</T>
          )}
          <Divider />
          {dl && dueAt ? (
            <>
              <InfoRow icon="flag" label="Deadline" value={dueLabel(dueAt, today)} danger={urgency === 'mendesak' || urgency === 'terlewat'} />
              {urgency && urgency !== 'selesai' && (
                <Row gap={10} style={{ minHeight: 32 }}>
                  <Icon name="clock" size={18} color={colors.muted} />
                  <T v="muted" style={{ width: 92 }}>Status</T>
                  <View style={{ backgroundColor: urgencyColors[urgency].bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                    <T v="small" style={{ color: urgencyColors[urgency].text }}>{URGENCY_LABEL[urgency]}</T>
                  </View>
                </Row>
              )}
              {occ?.dueAt && wallDate(occ.dueAt) !== date && <InfoRow icon="move" label="Asli" value={`${fmtDate(date, 'EEE, d MMM')}, ${(task.dueTime ?? '23:59').replace(':', '.')} (dijadwalkan ulang)`} />}
            </>
          ) : (
            <>
              <InfoRow icon="calendar" label="Tanggal" value={fmtDate(date)} />
              <InfoRow icon="clock" label="Waktu" value={time} />
            </>
          )}
          <InfoRow icon="repeat" label="Ulangi" value={repeatText(task)} />
          {hardStopText && <InfoRow icon="flag" label="Batas akhir" value={hardStopText} />}
          {occ && occ.focusSec > 0 && <InfoRow icon="timer" label="Waktu fokus" value={`${Math.round(occ.focusSec / 60)} menit`} />}
        </Card>

        <Card title="Aksi">
          <Row wrap>
            {!done && (dl
              ? <Button label="Mulai fokus" icon={<Icon name="play" size={16} color="#fff" />} onPress={() => { startTimer(key, 'pomodoro'); router.push('/timer'); }} />
              : <Button label="Mulai timer" icon={<Icon name="play" size={16} color="#fff" />} onPress={() => { startTimer(key, settings.defaultTimerMode); router.push('/timer'); }} />)}
            <Button kind="soft" label={done ? 'Batalkan selesai' : 'Tandai selesai'} icon={<Icon name="check" size={16} color={colors.accent} />}
              onPress={() => (done ? uncomplete(key) : completeWithFx(key))} />
            <Button kind="outline" label="Edit" icon={<Icon name="edit" size={16} color={colors.accent} />} onPress={() => setEditing(true)} />
            <Button kind="outline" label="Jadwalkan ulang" icon={<Icon name="move" size={16} color={colors.accent} />} onPress={() => setMoving(true)} />
            {task.repeat !== 'none' && !done && !skipped && <Button kind="outline" label="Lewati hari ini" icon={<Icon name="skip" size={16} color={colors.accent} />} onPress={() => setConfirmSkip(true)} />}
            <Button kind="danger" label="Hapus" icon={<Icon name="trash" size={16} color={colors.danger} />} onPress={() => setConfirmDel(true)} />
          </Row>
        </Card>

        <Row wrap gap={14} style={{ alignItems: 'flex-start' }}>
          <Card title="Pengingat" style={{ flexGrow: 1, flexBasis: 280 }}>
            {reminders.length === 0 ? (
              <T v="muted">{dl ? (task.deadlineRemindersMin?.length ? 'Semua waktu pengingat sudah lewat.' : 'Tidak ada pengingat deadline dipilih.') : task.start ? 'Semua pengingat dimatikan.' : 'Isi jam mulai untuk mengaktifkan pengingat.'}</T>
            ) : (
              <View style={{ gap: 8 }}>
                {reminders.map((r) => (
                  <Row key={r.id} gap={10}>
                    <Icon name="bell" size={16} color={colors.accent} />
                    <T v="body" style={{ fontVariant: ['tabular-nums'], fontFamily: 'Quicksand_700Bold' }}>{r.time}</T>
                    <T v="muted">
                      {dl ? REMINDER_OFFSET_LABEL[Number(r.id.split('|dl')[1])] ?? REMINDER_LABEL[r.kind] : REMINDER_LABEL[r.kind]}
                      {r.date !== (dl && dueAt ? wallDate(dueAt) : date) ? ` (${fmtDate(r.date, 'EEE, d MMM')})` : ''}
                    </T>
                  </Row>
                ))}
              </View>
            )}
          </Card>
          <Card title="Catatan" style={{ flexGrow: 1, flexBasis: 280 }}>
            <T v={task.description ? 'body' : 'muted'}>{task.description || 'Belum ada catatan.'}</T>
          </Card>
        </Row>

        <Card title={`Subtask${task.subtasks.length ? ` (${subDone}/${task.subtasks.length})` : ''}`}>
          <View style={{ gap: 6 }}>
            {task.subtasks.map((s) => (
              <Row key={s.id} gap={6} style={{ backgroundColor: s.done ? colors.surfaceSoft : '#fff', borderRadius: radius.row, borderWidth: 1, borderColor: colors.line, paddingLeft: 4, paddingRight: 4 }}>
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: s.done }} accessibilityLabel={s.text} onPress={() => toggleSubtask(task.id, s.id)}
                  style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 8 }, css({ cursor: 'pointer' })]}>
                  <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: c.dot, backgroundColor: s.done ? c.dot : '#fff', alignItems: 'center', justifyContent: 'center' }}>
                    {s.done && <Icon name="check" size={14} color="#fff" />}
                  </View>
                  <T style={[{ flex: 1 }, s.done ? css({ textDecorationLine: 'line-through', color: colors.muted }) : null]}>{s.text}</T>
                </Pressable>
                <IconButton label={`Hapus subtask ${s.text}`} size={36} onPress={() => removeSubtask(task.id, s.id)}><Icon name="trash" size={16} /></IconButton>
              </Row>
            ))}
            <Row gap={8} style={{ marginTop: 4 }}>
              <View style={{ flex: 1 }}>
                <Field value={sub} onChangeText={setSub} placeholder="Tambah subtask…" accessibilityLabel="Subtask baru" maxLength={120}
                  onSubmitEditing={() => { addSubtask(task.id, sub); setSub(''); }} />
              </View>
              <IconButton label="Tambah subtask" bg={colors.accentSoft} onPress={() => { addSubtask(task.id, sub); setSub(''); }}><Icon name="plus" color={colors.accent} /></IconButton>
            </Row>
          </View>
        </Card>
      </View>

      <RescheduleSheet visible={moving} onClose={() => { setMoving(false); if (params.reschedule) router.setParams({ reschedule: undefined }); }} task={task} date={date}
        onDone={(to) => { if (dl) return; if (task.repeat === 'none') router.setParams({ date: to }); else goBack(); }} />
      <ConfirmDialog visible={confirmDel} title="Hapus tugas?" confirmLabel="Hapus"
        message={task.repeat !== 'none' ? `“${task.title}” dan semua jadwal rutinnya akan dihapus.` : `“${task.title}” akan dihapus.`}
        onCancel={() => setConfirmDel(false)}
        onConfirm={() => { setConfirmDel(false); deleteTask(task.id); useUi.getState().pushToast('info', 'Tugas dihapus'); goBack(); }} />
      <ConfirmDialog visible={confirmSkip} title="Lewati hari ini?" confirmLabel="Lewati"
        message={`“${task.title}” tanggal ${fmtDate(date, 'd MMMM')} akan dilewati. Jadwal rutin lainnya tetap.`}
        onCancel={() => setConfirmSkip(false)}
        onConfirm={() => { setConfirmSkip(false); skip(key); useUi.getState().pushToast('info', 'Dilewati untuk hari ini'); goBack(); }} />
    </Page>
  );
}
