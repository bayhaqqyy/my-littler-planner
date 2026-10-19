import { useState } from 'react';
import { Pressable, View } from 'react-native';
import type { SoundEvent, SoundId } from '@/domain';
import { useStore } from '@/store/store';
import { playSound, SOUND_BY_ID, SOUND_EVENTS, SOUNDS, soundFor, unlockAudio } from '@/services/audio';
import { colors, radius } from '@/theme/theme';
import { css, Row, Switch, T } from '@/components/ui/primitives';
import { Sheet } from '@/components/ui/Overlays';
import { Icon } from '@/components/ui/Icon';

function PlayButton({ id, label }: { id: SoundId; label: string }) {
  const volume = useStore((s) => s.settings.volume);
  if (id === 'none') return <View style={{ width: 44 }} />;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Putar ${label}`} onPress={() => { unlockAudio(); playSound(id, volume); }}
      style={[{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft }, css({ cursor: 'pointer' })]}>
      <Icon name="play" size={16} color={colors.accent} />
    </Pressable>
  );
}

/**
 * One row per moment (sebelum mulai, mulai, waktu habis, istirahat, …) with its own sound.
 * `events` limits the rows (the timer page only shows the timer-related ones).
 */
export function TonePicker({ events, toggles }: { events?: SoundEvent[]; toggles?: boolean }) {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const [editing, setEditing] = useState<SoundEvent>();
  const rows = SOUND_EVENTS.filter((e) => !events || events.includes(e.event));
  const current = editing ? soundFor(settings, editing) : undefined;
  const pick = (id: SoundId) => {
    if (!editing) return;
    update({ sounds: { ...settings.sounds, [editing]: id } });
    unlockAudio();
    playSound(id, settings.volume);
  };
  return (
    <View style={{ gap: 8 }}>
      {rows.map((e) => {
        const id = soundFor(settings, e.event);
        const on = settings.notify?.[e.event] !== false;
        return (
          <Row key={e.event} gap={6} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: radius.row, paddingLeft: 12, paddingRight: 4, minHeight: 60, backgroundColor: on ? '#fff' : '#F7F4F8' }}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Ganti suara ${e.label}`} onPress={() => setEditing(e.event)} disabled={!on}
              style={[{ flex: 1, minWidth: 0, paddingVertical: 8 }, css({ cursor: on ? 'pointer' : 'default' })]}>
              <T v="body" style={{ fontFamily: 'Quicksand_700Bold', color: on ? colors.text : colors.muted }}>{e.label}</T>
              <T v="muted" numberOfLines={1}>{on ? `🔊 ${SOUND_BY_ID[id]?.label ?? id}` : 'Mati'}</T>
            </Pressable>
            {on && <PlayButton id={id} label={e.label} />}
            {toggles && (
              <View style={{ width: 60, alignItems: 'center' }}>
                <Switch value={on} onValueChange={(v) => update({ notify: { ...settings.notify, [e.event]: v } })} label={`Notifikasi ${e.label}`} bare />
              </View>
            )}
          </Row>
        );
      })}
      <Sheet visible={!!editing} onClose={() => setEditing(undefined)} title={`Suara: ${SOUND_EVENTS.find((e) => e.event === editing)?.label ?? ''}`}>
        <T v="muted">{SOUND_EVENTS.find((e) => e.event === editing)?.hint}</T>
        {(['suara', 'nada', 'mati'] as const).map((kind) => (
          <View key={kind} style={{ gap: 6 }}>
            <T v="small" style={{ color: colors.muted }}>{kind === 'suara' ? 'Suara Kak Ceria' : kind === 'nada' ? 'Nada' : 'Lainnya'}</T>
            {SOUNDS.filter((s) => s.kind === kind).map((s) => {
              const on = s.id === current;
              return (
                <Row key={s.id} gap={8} style={{ borderWidth: 1, borderColor: on ? colors.accent : colors.line, backgroundColor: on ? colors.accentSoft : '#fff', borderRadius: radius.row, paddingLeft: 12, paddingRight: 4, minHeight: 52 }}>
                  <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={s.label} onPress={() => pick(s.id)}
                    style={[{ flex: 1, minWidth: 0, paddingVertical: 10 }, css({ cursor: 'pointer' })]}>
                    <T v="body" style={{ color: on ? colors.accent : colors.text }}>{on ? '✓ ' : ''}{s.label}</T>
                  </Pressable>
                  <PlayButton id={s.id} label={s.label} />
                </Row>
              );
            })}
          </View>
        ))}
      </Sheet>
    </View>
  );
}
