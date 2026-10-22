import { View } from 'react-native';
import { css, T } from '@/components/ui/primitives';

/** Label shown on gift features while FEATURES.gifts is off. */
export function GiftsDisabledNote() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#EFE7EB', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
      <T v="chip" style={{ color: '#5E4D66' }}>🔒 Hadiah sedang dinonaktifkan</T>
    </View>
  );
}

/** Grey, non-interactive look for a disabled gift area (still visible). */
export const disabledLook = css({ filter: 'grayscale(1)', opacity: 0.5, pointerEvents: 'none' });

