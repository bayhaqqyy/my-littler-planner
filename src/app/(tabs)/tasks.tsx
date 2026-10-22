import { FEATURES } from '@/config/features';
import { useMemo, useState } from 'react';
import { Pressable, View, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  addDays, CATEGORIES, CATEGORY_EMOJI, CATEGORY_LABEL, conflictingIds, DEADLINE_GROUP_LABEL, deadlineGroup, deadlineOccurrences,
  matchesSearch, occurrencesInRange, occurrencesOn, occursOn, overdue, overdueDeadlines, viewOf, type Category, type DeadlineGroup,
  type OccView,
} from '@/domain';
import { useStore } from '@/store/store';
import { useNow, useTaskList, useToday } from '@/store/hooks';
import { categoryColors, colors, radius, urgencyColors } from '@/theme/theme';
import { HeaderActions, Page } from '@/components/AppShell';
import { Button, Card, Chip, css, Field, Row, Segmented, T, CategoryPill } from '@/components/ui/primitives';
import type { IconName } from '@/components/ui/Icon';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { TaskRow } from '@/components/task/TaskRow';
import { fmtDate, repeatText } from '@/components/task/schedule';

type Tab = 'hari-ini' | 'deadline' | 'mendatang' | 'terlewat' | 'selesai' | 'rutin';
const TABS: { key: Tab; label: string; icon?: IconName }[] = [
  { key: 'hari-ini', label: 'Hari ini' }, { key: 'deadline', label: 'Deadline', icon: 'flag' }, { key: 'mendatang', label: 'Mendatang' },
  { key: 'terlewat', label: 'Terlewat' }, { key: 'selesai', label: 'Selesai' }, { key: 'rutin', label: 'Rutin' },
];
const ALIASES: Record<string, Tab> = { today: 'hari-ini', upcoming: 'mendatang', overdue: 'terlewat', done: 'selesai', routine: 'rutin', deadlines: 'deadline' };
const GROUP_ORDER: DeadlineGroup[] = ['terlewat', 'hari-ini', 'minggu-ini', 'nanti', 'selesai'];

/** Urgency legend under the Deadline list (colors also carry a written label). */
function UrgencyLegend() {
  const items = [
    { c: urgencyColors.aman, label: 'Lebih dari 2 hari' },
    { c: urgencyColors.dekat, label: '6 jam sampai 2 hari' },
    { c: urgencyColors.mendesak, label: 'Kurang dari 6 jam' },
  ];
  return (
    <Row wrap gap={12} style={{ marginTop: 6 }}>
      {items.map((it) => (
        <Row key={it.label} gap={6}>
          <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: it.c.bg, borderWidth: 1, borderColor: it.c.text }} />
          <T v="muted">{it.label}</T>
        </Row>
      ))}
    </Row>
  );
}

function groupByDate(list: OccView[]) {
  const groups: { date: string; items: OccView[] }[] = [];
  for (const v of list) {
    const g = groups[groups.length - 1];
    if (g && g.date === v.date) g.items.push(v);
    else groups.push({ date: v.date, items: [v] });
  }
  return groups;
}

export default function Tasks() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const initial = (params.tab && (TABS.some((t) => t.key === params.tab) ? params.tab : ALIASES[params.tab])) as Tab | undefined;
  const [tab, setTab] = useState<Tab>(initial ?? 'hari-ini');
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [q, setQ] = useState('');
  const today = useToday();
  const tasks = useTaskList();
  const occs = useStore((s) => s.occurrences);
  const now = useNow(60_000);

  const filter = (v: OccView) => (cat === 'all' || v.task.category === cat) && matchesSearch(v.task, q);

  const data = useMemo(() => {
    const todayList = occurrencesOn(tasks, today, occs);
    const upcoming = occurrencesInRange(tasks, addDays(today, 1), 14, occs).filter((v) => !v.done);
    const lateDeadlines: OccView[] = overdueDeadlines(tasks, occs, now);
    const late = [...lateDeadlines, ...overdue(tasks, today, occs)];
    const deadlines: OccView[] = deadlineOccurrences(tasks, occs, addDays(today, -60), addDays(today, 120));
    const from = addDays(today, -14);
    const byId = Object.fromEntries(tasks.map((t) => [t.id, t]));
    const done = Object.values(occs)
      .filter((o) => o.doneAt && o.date >= from && byId[o.taskId])
      .sort((a, b) => (a.doneAt! < b.doneAt! ? 1 : -1))
      .map((o) => viewOf(byId[o.taskId], o.date, occs));
    const routines = tasks.filter((t) => t.repeat !== 'none').sort((a, b) => (a.start ?? '99').localeCompare(b.start ?? '99'));
    return { todayList, upcoming, late, done, routines, deadlines };
  }, [tasks, occs, today, now]);

  const conflicts = useMemo(() => conflictingIds(tasks, today, occs), [tasks, today, occs]);
  const counts: Record<Tab, number> = {
    'hari-ini': data.todayList.filter((v) => !v.done).length,
    deadline: data.deadlines.filter((v) => !v.done).length, mendatang: data.upcoming.length, terlewat: data.late.length,
    selesai: data.done.length, rutin: data.routines.length,
  };

  const renderList = (list: OccView[], opts: { showDate?: boolean; group?: boolean; markConflicts?: boolean }) => {
    const items = list.filter(filter);
    if (!items.length) return null;
    if (opts.group) {
      return groupByDate(items).map((g) => (
        <View key={g.date} style={{ gap: 8 }}>
          <T v="small" style={{ color: colors.accent, marginTop: 6 }} accessibilityRole="header">{g.date === addDays(today, 1) ? 'Besok · ' : ''}{fmtDate(g.date, 'EEEE, d MMMM')}</T>
          {g.items.map((v) => <TaskRow key={v.key} v={v} />)}
        </View>
      ));
    }
    return items.map((v) => <TaskRow key={v.key} v={v} showDate={opts.showDate} conflict={opts.markConflicts && !v.done && conflicts.has(v.task.id)} />);
  };

  let body: React.ReactNode;
  let empty = { title: '', sub: '' };
  switch (tab) {
    case 'hari-ini':
      body = renderList(data.todayList, { markConflicts: true });
      empty = { title: 'Belum ada tugas hari ini', sub: 'Tambahkan satu tugas kecil untuk memulai 🌷' };
      break;
    case 'deadline': {
      const items = data.deadlines.filter(filter);
      const groups = GROUP_ORDER.map((g) => ({ g, items: items.filter((v) => deadlineGroup(v as Parameters<typeof deadlineGroup>[0], now) === g) }))
        .filter((x) => x.items.length);
      body = (
        <>
          <Row style={{ justifyContent: 'flex-end' }}>
            <Button small kind="soft" label="+ Deadline" accessibilityLabel="Tambah tugas deadline"
              onPress={() => router.push({ pathname: '/task/new', params: { kind: 'deadline' } })} />
          </Row>
          {groups.length ? groups.map(({ g, items: list }) => (
            <View key={g} style={{ gap: 8 }}>
              <T v="small" accessibilityRole="header" style={{ marginTop: 6, color: g === 'terlewat' ? colors.danger : colors.muted, fontFamily: 'Quicksand_700Bold' }}>
                {DEADLINE_GROUP_LABEL[g]}
              </T>
              {list.map((v) => <TaskRow key={v.key} v={v} />)}
            </View>
          )) : (
            <EmptyState title={q || cat !== 'all' ? 'Tidak ada yang cocok' : 'Belum ada deadline'} sub={q || cat !== 'all' ? 'Coba kata kunci atau kategori lain.' : 'Catat tugas yang punya batas pengumpulan di sini 🚩'} />
          )}
          <UrgencyLegend />
        </>
      );
      empty = { title: 'Belum ada deadline', sub: '' };
      break;
    }
    case 'mendatang':
      body = renderList(data.upcoming, { group: true });
      empty = { title: 'Tidak ada tugas 14 hari ke depan', sub: 'Waktunya merencanakan sesuatu yang seru!' };
      break;
    case 'terlewat':
      body = renderList(data.late, { showDate: true });
      empty = { title: 'Tidak ada yang terlewat', sub: 'Hebat, semuanya terkendali ✨' };
      break;
    case 'selesai':
      body = renderList(data.done, { showDate: true });
      empty = { title: 'Belum ada tugas selesai', sub: FEATURES.gifts ? 'Centang tugas pertamamu untuk dapat kado 🎁' : 'Centang tugas pertamamu 🌸' };
      break;
    case 'rutin': {
      const items = data.routines.filter((t) => (cat === 'all' || t.category === cat) && matchesSearch(t, q));
      body = items.length ? items.map((t) => {
        const next = Array.from({ length: 8 }, (_, i) => addDays(today, i)).find((d) => occursOn(t, d) && !occs[`${t.id}@${d}`]?.doneAt && !occs[`${t.id}@${d}`]?.skipped);
        return (
          <Pressable key={t.id} accessibilityRole="button" accessibilityLabel={`Buka detail ${t.title}`}
            onPress={() => router.push({ pathname: '/task/[id]', params: { id: t.id, ...(next ? { date: next } : {}) } })}
            style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.row, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: categoryColors[t.category].dot }, css({ cursor: 'pointer' })]}>
            <View style={{ width: 40, height: 40, borderRadius: radius.icon, backgroundColor: categoryColors[t.category].bg, alignItems: 'center', justifyContent: 'center' }}>
              <T style={{ fontSize: 20 }}>{CATEGORY_EMOJI[t.category]}</T>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <T v="body" style={{ fontFamily: 'Quicksand_700Bold' }} numberOfLines={1}>{t.title}</T>
              <Row wrap gap={6}>
                <Icon name="repeat" size={13} />
                <T v="muted">{repeatText(t)}{t.start ? ` · ${t.start}${t.end ? `–${t.end}` : ''}` : ''}</T>
                <CategoryPill c={t.category} />
              </Row>
              {next && <T v="muted">Berikutnya: {next === today ? 'hari ini' : fmtDate(next, 'EEE, d MMM')}</T>}
            </View>
            <Icon name="chevron-right" size={18} />
          </Pressable>
        );
      }) : null;
      empty = { title: 'Belum ada tugas rutin', sub: 'Buat tugas dengan pengulangan harian atau mingguan.' };
      break;
    }
  }

  return (
    <Page title="To-Do List" subtitle={fmtDate(today)} actions={<HeaderActions />}>
      <Segmented label="Daftar tugas" value={tab} onChange={setTab} variant="chips"
        items={TABS.map((t) => ({ key: t.key, label: t.label, icon: t.icon, count: counts[t.key] }))} />
      <Card style={{ gap: 12 }}>
        <Row gap={8}>
          <Icon name="search" size={18} />
          <View style={{ flex: 1 }}>
            <Field value={q} onChangeText={setQ} placeholder="Cari judul atau catatan…" accessibilityLabel="Cari tugas" />
          </View>
        </Row>
        {/* Category filter: one swipeable row instead of three wrapped rows on phones. */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 6, paddingRight: 4 }}>
          <Chip label="Semua" selected={cat === 'all'} onPress={() => setCat('all')} accessibilityLabel="Semua kategori" />
          {CATEGORIES.map((c) => (
            <Chip key={c} label={`${CATEGORY_EMOJI[c]} ${CATEGORY_LABEL[c]}`} accessibilityLabel={`Filter ${CATEGORY_LABEL[c]}`} selected={cat === c} color={categoryColors[c]} onPress={() => setCat(cat === c ? 'all' : c)} />
          ))}
        </ScrollView>
      </Card>
      <Card>
        <View style={{ gap: 8 }}>
          {body ?? <EmptyState title={q || cat !== 'all' ? 'Tidak ada yang cocok' : empty.title} sub={q || cat !== 'all' ? 'Coba kata kunci atau kategori lain.' : empty.sub} />}
        </View>
      </Card>
    </Page>
  );
}
