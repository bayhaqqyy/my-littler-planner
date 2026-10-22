import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Svg from 'react-native-svg';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { addDays, MOOD_LABEL, MOODS, moodsOf, parseDate, toggleMood, type DailyNote, type Mood } from '@/domain';
import { useStore } from '@/store/store';
import { useLayout, useToday } from '@/store/hooks';
import { colors, fonts, INPUT_FONT_SIZE, radius } from '@/theme/theme';
import { HeaderActions, Page } from '@/components/AppShell';
import { Button, Card, css, Field, IconButton, Label, Row, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { BunnyArt, ChickArt, SheepArt } from '@/components/illustrations';
import { MoodFace, MOOD_COLORS } from '@/components/notes/MoodFace';

const LINE = 28;
const fmt = (d: string, p: string) => format(parseDate(d), p, { locale: localeId });

/** Debounced save of one field of a daily note. */
function useDebouncedNote(date: string) {
  const saveNote = useStore((s) => s.saveNote);
  const pending = useRef<{ date: string; patch: Partial<DailyNote> } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (pending.current) { saveNote(pending.current.date, pending.current.patch); pending.current = null; }
  };
  useEffect(() => flush, [date]); // flush when switching days / unmounting
  return (patch: Partial<DailyNote>) => {
    pending.current = { date, patch: { ...(pending.current?.date === date ? pending.current.patch : {}), ...patch } };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 400);
  };
}

function MoodPicker({ value, onToggle }: { value: Mood[]; onToggle: (m: Mood) => void }) {
  return (
    <View accessibilityRole="group" accessibilityLabel="Mood hari ini (boleh pilih lebih dari satu)" style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 2 }}>
      {MOODS.map((m) => {
        const on = value.includes(m);
        return (
          <Pressable
            key={m}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            aria-checked={on}
            accessibilityLabel={MOOD_LABEL[m]}
            onPress={() => onToggle(m)}
            style={[{ alignItems: 'center', gap: 4, flex: 1, minWidth: 0, paddingVertical: 6, borderRadius: 16, backgroundColor: on ? '#FFF3F7' : 'transparent' }, css({ cursor: 'pointer', transitionDuration: '200ms' })]}
          >
            <View style={[
              { borderRadius: 999, padding: 3, borderWidth: 2.5, borderColor: on ? MOOD_COLORS[m].line : 'transparent', transform: [{ scale: on ? 1.06 : 1 }] },
              css({ transitionDuration: '200ms' }),
            ]}>
              <MoodFace mood={m} size={on ? 40 : 36} />
            </View>
            <T v="chip" numberOfLines={1} style={{ fontSize: 10, letterSpacing: -0.2, color: on ? colors.accent : colors.muted, fontFamily: on ? fonts.bold : fonts.semibold }}>{MOOD_LABEL[m]}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function NotesScreen() {
  const today = useToday();
  const { isDesktop } = useLayout();
  const [date, setDate] = useState(today);
  const notes = useStore((s) => s.notes);
  const saveNote = useStore((s) => s.saveNote);
  const note = notes[date];
  const [text, setText] = useState(note?.text ?? '');
  const [reflection, setReflection] = useState(note?.reflection ?? '');
  const save = useDebouncedNote(date);

  // Reload local fields when the day changes (or synced data arrives for another day).
  const loadedFor = useRef(date);
  useEffect(() => {
    if (loadedFor.current !== date) {
      loadedFor.current = date;
      setText(notes[date]?.text ?? '');
      setReflection(notes[date]?.reflection ?? '');
    }
  }, [date, notes]);

  const isToday = date >= today;
  const previous = useMemo(
    () => Object.values(notes).filter((n) => n.date !== date && (n.text.trim() || n.reflection.trim() || moodsOf(n).length)).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30),
    [notes, date],
  );

  const paper = (
    <Card style={{ gap: 12 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <IconButton label="Hari sebelumnya" onPress={() => setDate(addDays(date, -1))}><Icon name="chevron-left" /></IconButton>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <T v="cardTitle" accessibilityLiveRegion="polite" style={{ textTransform: 'capitalize', textAlign: 'center' }}>{fmt(date, 'EEEE, d MMMM yyyy')}</T>
          {date === today ? <T v="muted">Hari ini</T> : <T v="muted" onPress={() => setDate(today)} style={{ color: colors.accent }}>Kembali ke hari ini</T>}
        </View>
        <View style={{ opacity: isToday ? 0.35 : 1 }} pointerEvents={isToday ? 'none' : 'auto'}>
          <IconButton label={isToday ? 'Hari berikutnya (tidak tersedia)' : 'Hari berikutnya'} onPress={() => !isToday && setDate(addDays(date, 1))}><Icon name="chevron-right" /></IconButton>
        </View>
      </Row>

      <View>
        <Label>Mood hari ini · boleh pilih lebih dari satu</Label>
        <MoodPicker value={moodsOf(note)} onToggle={(m) => saveNote(date, toggleMood(notes[date], m))} />
      </View>

      <View>
        <Label>Catatan harian</Label>
        <View style={[
          { borderRadius: 16, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', backgroundColor: '#FFFDF8' },
          css({ backgroundImage: `linear-gradient(90deg, transparent 38px, #FBC9DA 38px, #FBC9DA 40px, transparent 40px), repeating-linear-gradient(180deg, transparent 0, transparent ${LINE - 1}px, #E8DDF5 ${LINE - 1}px, #E8DDF5 ${LINE}px)`, backgroundPosition: '0 10px' }),
        ]}>
          <TextInput
            value={text}
            onChangeText={(t) => { setText(t); save({ text: t }); }}
            multiline
            placeholder="Tulis ceritamu hari ini… ✏️"
            placeholderTextColor="#A897AD"
            accessibilityLabel="Catatan harian"
            style={[
              { minHeight: LINE * 9, paddingLeft: 50, paddingRight: 14, paddingTop: 10, color: colors.text, fontFamily: fonts.medium, fontSize: INPUT_FONT_SIZE, lineHeight: LINE, textAlignVertical: 'top' },
              css({ outlineStyle: 'none' }),
            ]}
          />
        </View>
      </View>

      <View>
        <Label>Daily reflection</Label>
        <T v="body" style={{ marginBottom: 6 }}>Apa yang sudah kamu lakukan hari ini?</T>
        <Field
          value={reflection}
          onChangeText={(t) => { setReflection(t); save({ reflection: t }); }}
          multiline
          placeholder="Aku sudah…"
          accessibilityLabel="Apa yang sudah kamu lakukan hari ini?"
        />
      </View>
      <Row style={{ justifyContent: 'flex-end' }}>
        <T v="muted">Tersimpan otomatis 💾</T>
      </Row>
    </Card>
  );

  const list = (
    <Card title="Catatan sebelumnya" right={
      <Row gap={0}>
        <Svg width={34} height={33} viewBox="0 0 60 58" aria-hidden><SheepArt /></Svg>
        <Svg width={32} height={33} viewBox="0 0 60 62" aria-hidden><BunnyArt /></Svg>
        <Svg width={30} height={30} viewBox="0 0 60 60" aria-hidden><ChickArt /></Svg>
      </Row>
    }>
      {previous.length === 0 ? (
        <T v="muted">Belum ada catatan lain. Yuk mulai menulis hari ini! 🌸</T>
      ) : (
        <View style={{ gap: 8 }}>
          {previous.map((n) => {
            const moods = moodsOf(n);
            const snippet = (n.text.trim() || n.reflection.trim() || 'Hanya mood').replace(/\s+/g, ' ');
            return (
              <Pressable
                key={n.date}
                accessibilityRole="button"
                accessibilityLabel={`Buka catatan ${fmt(n.date, 'EEEE d MMMM')}${moods.length ? `, mood ${moods.map((m) => MOOD_LABEL[m]).join(', ')}` : ''}`}
                onPress={() => setDate(n.date)}
                style={({ pressed }) => [
                  { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, minHeight: 56, borderRadius: radius.row, borderWidth: 1, borderColor: colors.line, backgroundColor: pressed ? colors.surfaceSoft : '#fff' },
                  css({ cursor: 'pointer' }),
                ]}
              >
                {moods.length ? (
                  <View style={{ flexDirection: 'row', width: 36 + Math.min(moods.length - 1, 2) * 14 }}>
                    {moods.slice(0, 3).map((m, i) => (
                      <View key={m} style={{ marginLeft: i ? -22 : 0, zIndex: 3 - i, borderRadius: 999, backgroundColor: '#fff' }}><MoodFace mood={m} size={36} /></View>
                    ))}
                  </View>
                ) : <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F6EEF3' }} />}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T v="small" style={{ textTransform: 'capitalize' }}>{fmt(n.date, 'EEE, d MMM yyyy')}</T>
                  <T v="muted" numberOfLines={2}>{snippet}</T>
                </View>
                <Icon name="chevron-right" size={18} />
              </Pressable>
            );
          })}
        </View>
      )}
      {date !== today && <Button kind="soft" small label="Tulis catatan hari ini" style={{ marginTop: 10, alignSelf: 'flex-start' }} onPress={() => setDate(today)} />}
    </Card>
  );

  return (
    <Page title="Notes" subtitle="Catatan harian, mood, dan refleksi" actions={<HeaderActions />}>
      {isDesktop ? (
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
          <View style={{ flex: 1.6, minWidth: 0 }}>{paper}</View>
          <View style={{ flex: 1, minWidth: 280 }}>{list}</View>
        </View>
      ) : (
        <View style={{ gap: 14 }}>{paper}{list}</View>
      )}
    </Page>
  );
}
