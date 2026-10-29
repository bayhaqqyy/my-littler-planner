import { useEffect, useLayoutEffect, useRef, useState, type ComponentRef } from 'react';
import { Pressable, View, type TextInput } from 'react-native';
import { presetConfig, type PomodoroPreset } from '@/domain';
import { useStore } from '@/store/store';
import { checklist, linear } from '@/theme/theme';
import { css, Field, Row, T } from '@/components/ui/primitives';
import { Sheep, Tulip } from '@/components/illustrations';

const QUICK_PRESETS: { key: Exclude<PomodoroPreset, 'custom'>; label: string; long: string }[] = [
  { key: 'klasik', label: '25/5', long: 'Klasik 25 menit fokus, 5 menit istirahat' },
  { key: 'santai', label: '15/3', long: 'Santai 15 menit fokus, 3 menit istirahat' },
  { key: 'fokus-panjang', label: '50/10', long: 'Fokus panjang 50 menit fokus, 10 menit istirahat' },
];

/** Peach "Check List" header: greeting, today's progress and the Pomodoro preset used by row timers. */
export function ChecklistHeader({ name, done, total }: { name: string; done: number; total: number }) {
  const pomodoro = useStore((s) => s.settings.pomodoro);
  const updateSettings = useStore((s) => s.updateSettings);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const summary = !total ? `Halo, ${name}! Belum ada tugas hari ini.`
    : done === total ? `Halo, ${name}! Semua tugas hari ini beres.`
      : `Halo, ${name}! ${done} dari ${total} tugas hari ini selesai.`;
  return (
    <View style={[{ borderRadius: 26, padding: 18, gap: 10, overflow: 'hidden' }, css({ backgroundImage: linear(checklist.header, 160) })]}>
      <T v="title" accessibilityRole="header" style={{ color: checklist.accent, fontSize: 32 }}>Check List</T>
      <T v="body" style={{ color: checklist.ink, fontFamily: 'Quicksand_700Bold' }}>{summary}</T>
      <View accessibilityRole="progressbar" accessibilityLabel={`Progres hari ini ${pct} persen`}
        aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
        style={{ height: 10, borderRadius: 999, backgroundColor: checklist.track, overflow: 'hidden' }}>
        <View style={[{ height: 10, borderRadius: 999, width: `${pct}%` }, css({ backgroundImage: linear(checklist.progress, 90) })]} />
      </View>
      <Row wrap gap={8} style={{ justifyContent: 'space-between' }}>
        <T v="small" style={{ color: checklist.inkSoft }}>Timer Pomodoro</T>
        <View accessibilityRole="radiogroup" accessibilityLabel="Preset timer Pomodoro"
          style={{ flexDirection: 'row', gap: 4, backgroundColor: '#fff', borderRadius: 999, padding: 3 }}>
          {QUICK_PRESETS.map((p) => {
            const on = pomodoro.preset === p.key;
            return (
              <Pressable key={p.key} accessibilityRole="radio" accessibilityState={{ checked: on }} aria-checked={on} accessibilityLabel={p.long}
                onPress={() => updateSettings({ pomodoro: presetConfig(p.key, undefined, pomodoro.autoStartNext) })}
                style={[{ minHeight: 36, minWidth: 52, paddingHorizontal: 10, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: on ? checklist.accent : 'transparent' }, css({ cursor: 'pointer' })]}>
                <T v="small" style={{ color: on ? '#fff' : checklist.inkSoft, fontFamily: 'Quicksand_700Bold' }}>{p.label}</T>
              </Pressable>
            );
          })}
        </View>
      </Row>
      {pomodoro.preset === 'custom' && (
        <T v="muted" style={{ color: checklist.inkSoft }}>Sekarang memakai Custom {pomodoro.focusMin}/{pomodoro.shortBreakMin} (atur di tab Timer).</T>
      )}
    </View>
  );
}

const NOTE_MIN_HEIGHT = 72;

/** Small lined note for the day (same note as the Notes tab) with a sheep under the tulips. */
export function ChecklistNote({ date }: { date: string }) {
  const saved = useStore((s) => s.notes[date]?.text ?? '');
  const saveNote = useStore((s) => s.saveNote);
  const [text, setText] = useState(saved);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editing = useRef(false);
  const input = useRef<ComponentRef<typeof TextInput>>(null);

  // Grow the box with its text so long notes stay fully visible (on web the input is a <textarea>).
  useLayoutEffect(() => {
    const el = input.current as unknown as HTMLTextAreaElement | null;
    if (!el || typeof el.scrollHeight !== 'number') return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(NOTE_MIN_HEIGHT, el.scrollHeight)}px`;
  }, [text]);

  // Follow edits made elsewhere (Notes tab, sync) while not typing here.
  useEffect(() => { if (!editing.current) setText(saved); }, [saved]);
  useEffect(() => () => { if (pending.current) clearTimeout(pending.current); }, []);

  const onChange = (t: string) => {
    setText(t);
    editing.current = true;
    if (pending.current) clearTimeout(pending.current);
    pending.current = setTimeout(() => { saveNote(date, { text: t }); editing.current = false; }, 400);
  };

  return (
    <Row gap={10} style={{ alignItems: 'flex-end' }}>
      <View style={{ flex: 1, minWidth: 0, backgroundColor: '#fff', borderRadius: 20, padding: 12, gap: 4 }}>
        <T v="small" nativeID="checklist-note" style={{ color: checklist.accent, letterSpacing: 0.6 }}>NOTE</T>
        <Field ref={input} multiline value={text} onChangeText={onChange} placeholder="Catatan kecil hari ini…" aria-labelledby="checklist-note" accessibilityLabel="Catatan hari ini"
          style={{ borderWidth: 0, borderRadius: 12, backgroundColor: checklist.paper, minHeight: NOTE_MIN_HEIGHT, overflow: 'hidden' }} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }} aria-hidden>
        <Tulip size={44} color="#F6A58F" />
        <Sheep size={84} />
      </View>
    </Row>
  );
}
