import { View } from 'react-native';
import { countdown, urgencyOf, URGENCY_LABEL } from '@/domain';
import { urgencyColors } from '@/theme/theme';
import { T } from '@/components/ui/primitives';

/** Two-line countdown label ("Sisa" / "2 jam 15 mnt") colored by urgency. Hidden when done. */
export function CountdownBadge({ dueMs, nowMs, done, compact }: { dueMs: number; nowMs: number; done?: boolean; compact?: boolean }) {
  if (done) return null;
  const u = urgencyOf(dueMs, nowMs);
  const c = countdown(dueMs, nowMs);
  const col = urgencyColors[u];
  return (
    <View
      accessibilityLabel={`${c.text}, ${URGENCY_LABEL[u]}`}
      style={{ backgroundColor: col.bg, borderRadius: 14, paddingHorizontal: compact ? 10 : 12, paddingVertical: compact ? 4 : 6, alignItems: 'center', minWidth: compact ? undefined : 72 }}
    >
      {compact ? (
        <T v="chip" style={{ color: col.text, fontSize: 12 }}>{c.text}</T>
      ) : (
        <>
          <T v="chip" style={{ color: col.text, fontSize: 12 }}>{c.top}</T>
          <T v="small" style={{ color: col.text, fontFamily: 'Quicksand_700Bold' }}>{c.bottom}</T>
        </>
      )}
    </View>
  );
}
