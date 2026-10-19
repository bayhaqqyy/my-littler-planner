import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getCalendarFeedUrl, googleAddUrl, resetCalendarFeedUrl, toWebcal } from '@/services/ical';
import { isIOSDevice } from '@/services/install';
import { isSupabaseConfigured } from '@/services/supabase';
import { useUi } from '@/store/ui';
import { colors } from '@/theme/theme';
import { Button, Card, T } from '@/components/ui/primitives';
import { ConfirmDialog } from '@/components/ui/Overlays';
import { Icon } from '@/components/ui/Icon';


async function copy(text: string) {
  try { await navigator.clipboard.writeText(text); useUi.getState().pushToast('info', 'Link iCal disalin 📋'); }
  catch { window.prompt('Salin link ini:', text); }
}

/**
 * Settings card: subscribe to the tasks in the phone's own calendar app.
 * iPhone: straight into the Calendar app. Everything else: Google Calendar.
 */
export function CalendarFeedCard() {
  const [url, setUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const device = isIOSDevice() ? 'ios' : 'other';

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getCalendarFeedUrl().then(setUrl).catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);
  if (!isSupabaseConfigured) return null;

  const reset = async () => {
    setConfirm(false); setBusy(true); setError(undefined);
    try { setUrl(await resetCalendarFeedUrl()); useUi.getState().pushToast('info', 'Link iCal baru dibuat'); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  };

  return (
    <Card title="Connect iCal" right={<Icon name="calendar" size={20} color={colors.accent} />}>
      <View style={{ gap: 10 }}>
        {!url && !error && <T v="muted">Menyiapkan link iCal…</T>}
        {url && device === 'ios' && (
          <>
            <T v="muted">Tugas yang punya jam muncul di aplikasi <T v="small">Kalender</T> iPhone, gratis dan tanpa akun Google.</T>
            <Button label="Connect iCal ke Kalender iPhone" icon={<Icon name="calendar" size={16} color="#fff" />} onPress={() => { window.location.href = toWebcal(url); }} />
            <T v="muted">Di layar konfirmasi iPhone ketuk <T v="small">Subscribe</T> lalu <T v="small">Add</T>. Supaya cepat ter-update: Pengaturan → Aplikasi → Kalender → Akun → Ambil Data Baru → 15 menit.</T>
          </>
        )}
        {url && device !== 'ios' && (
          <>
            <T v="muted">Tugas yang punya jam muncul di <T v="small">Google Calendar</T>-mu.</T>
            <Button label="Connect iCal ke Google Calendar" icon={<Icon name="calendar" size={16} color="#fff" />} onPress={() => window.open(googleAddUrl(url), '_blank')} />
            <T v="muted">Google memperbarui kalender dari link ini beberapa kali sehari.</T>
          </>
        )}
        {url && (
          <>
            <Button kind="outline" small label="Salin link iCal" onPress={() => copy(url)} />
            <T v="muted">Link ini pribadi. Jangan dibagikan; siapa pun yang punya link bisa melihat jadwalmu.</T>
            <Button kind="ghost" small label={busy ? 'Membuat…' : 'Buat link iCal baru (link lama berhenti)'} disabled={busy} onPress={() => setConfirm(true)} />
          </>
        )}
        {error && <T v="small" style={{ color: colors.danger }}>{error}</T>}
      </View>
      <ConfirmDialog visible={confirm} title="Buat link iCal baru?" confirmLabel="Buat baru"
        message="Kalender yang sudah terhubung lewat link lama akan berhenti ter-update. Kamu perlu menambahkan link baru lagi di HP."
        onCancel={() => setConfirm(false)} onConfirm={reset} />
    </Card>
  );
}
