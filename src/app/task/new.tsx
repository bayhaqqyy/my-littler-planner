import { useLocalSearchParams } from 'expo-router';
import { goBack } from '@/components/task/nav';
import { isValidDate, isValidTime } from '@/domain';
import { Page } from '@/components/AppShell';
import { TaskForm, initialValues } from '@/components/task/TaskForm';
import { useStore } from '@/store/store';
import { useToday } from '@/store/hooks';
import { useUi } from '@/store/ui';

export default function NewTask() {
  // `kind=deadline` when opened from the Deadline tab; otherwise always Terjadwal (PRD AC1).
  const { date, start, kind } = useLocalSearchParams<{ date?: string; start?: string; kind?: string }>();
  const today = useToday();
  const settings = useStore((s) => s.settings);
  const initial = initialValues(undefined, {
    date: isValidDate(date) ? date : today,
    start: isValidTime(start) ? start : undefined,
    remindBeforeMin: settings.defaultRemindBeforeMin,
    kind: kind === 'deadline' ? 'deadline' : 'scheduled',
    dueTime: settings.lastDueTime,
    deadlineReminders: settings.defaultDeadlineRemindersMin,
  });
  return (
    <Page title="New Task" subtitle="Catat tugas dan atur pengingatnya" back>
      <TaskForm
        initial={initial}
        onCancel={() => goBack()}
        onSaved={(t) => { useUi.getState().pushToast('info', `“${t.title}” ditambahkan 🌷`); goBack(); }}
      />
    </Page>
  );
}
