import { View } from 'react-native';
import { LIMITS, PRESET_LABEL, presetConfig, type PomodoroConfig, type PomodoroPreset } from '@/domain';
import { Chip, Row } from '@/components/ui/primitives';
import { Stepper } from '@/components/settings/Stepper';

const PRESET_KEYS: PomodoroPreset[] = ['klasik', 'santai', 'fokus-panjang', 'custom'];

/** Preset chips + custom steppers. Shared by the timer page and Settings. */
export function PomodoroPicker({ value, onChange, disabled }: { value: PomodoroConfig; onChange: (c: PomodoroConfig) => void; disabled?: boolean }) {
  const custom = (patch: Partial<PomodoroConfig>) => onChange(presetConfig('custom', { ...value, ...patch }, value.autoStartNext));
  return (
    <View style={{ gap: 8 }}>
      <Row wrap>
        {PRESET_KEYS.map((p) => (
          <Chip key={p} label={PRESET_LABEL[p]} selected={value.preset === p}
            onPress={() => { if (!disabled) onChange(p === 'custom' ? presetConfig('custom', value, value.autoStartNext) : presetConfig(p, undefined, value.autoStartNext)); }} />
        ))}
      </Row>
      {value.preset === 'custom' && (
        <View>
          <Stepper label="Fokus" unit=" mnt" value={value.focusMin} min={LIMITS.focusMin[0]} max={LIMITS.focusMin[1]} step={5} disabled={disabled} onChange={(v) => custom({ focusMin: v })} />
          <Stepper label="Istirahat pendek" unit=" mnt" value={value.shortBreakMin} min={LIMITS.shortBreakMin[0]} max={LIMITS.shortBreakMin[1]} disabled={disabled} onChange={(v) => custom({ shortBreakMin: v })} />
          <Stepper label="Istirahat panjang" unit=" mnt" value={value.longBreakMin} min={LIMITS.longBreakMin[0]} max={LIMITS.longBreakMin[1]} step={5} disabled={disabled} onChange={(v) => custom({ longBreakMin: v })} />
          <Stepper label="Sesi sebelum istirahat panjang" value={value.sessionsBeforeLong} min={LIMITS.sessionsBeforeLong[0]} max={LIMITS.sessionsBeforeLong[1]} disabled={disabled} onChange={(v) => custom({ sessionsBeforeLong: v })} />
        </View>
      )}
    </View>
  );
}
