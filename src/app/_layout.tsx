import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router, Slot } from 'expo-router';
import { useFonts, Quicksand_500Medium, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { AuthGate } from '@/components/auth/AuthGate';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AppShell } from '@/components/AppShell';
import { Engines, snoozeLocal } from '@/components/Engines';
import { BurstHost, CelebrationHost, ReminderBannerHost, ToastHost, goTimer } from '@/components/ui/Overlays';
import { completeWithFx } from '@/components/task/useComplete';
import { registerServiceWorker } from '@/services/notifications';
// Registers the `beforeinstallprompt` listener as early as possible (Android install button).
import '@/services/install';
import { unlockAudio } from '@/services/audio';
import { useUi } from '@/store/ui';
import { colors } from '@/theme/theme';

export default function RootLayout() {
  const [loaded, fontError] = useFonts({ Quicksand_500Medium, Quicksand_600SemiBold, Quicksand_700Bold });
  // Never block on fonts: in iOS WebKit (Safari/Chrome/Opera on iPhone) useFonts can stay pending
  // even after the fonts load. Show the app after a short grace period; Quicksand swaps in when ready.
  const [fontGraceOver, setFontGraceOver] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFontGraceOver(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // First React paint is on screen (loading screen or the app): fade out the HTML splash.
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => (window as { __mlpReady?: () => void }).__mlpReady?.()));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    registerServiceWorker();
    // Browsers block audio until a gesture: unlock on the first tap of the session.
    const unlock = () => { unlockAudio(); window.removeEventListener('pointerdown', unlock); };
    window.addEventListener('pointerdown', unlock);
    document.documentElement.style.colorScheme = 'light';
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  if (!loaded && !fontError && !fontGraceOver) return <LoadingScreen />;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AuthGate>
        <Engines />
        <AppShell>
          <Slot />
        </AppShell>
        <ReminderBannerHost
          onStart={(key, id) => { useUi.getState().dropBanner(id); goTimer(key); }}
          onSnooze={(key, id) => snoozeLocal(key, id)}
          onDone={(key, id) => { useUi.getState().dropBanner(id); completeWithFx(key); }}
          onReschedule={(key, id) => {
            useUi.getState().dropBanner(id);
            const i = key.lastIndexOf('@');
            router.push({ pathname: '/task/[id]', params: { id: key.slice(0, i), date: key.slice(i + 1), reschedule: '1' } });
          }}
        />
        <CelebrationHost />
        <BurstHost />
      </AuthGate>
      <ToastHost />
    </View>
  );
}
