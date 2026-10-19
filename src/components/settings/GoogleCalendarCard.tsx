import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { gcalConnect, gcalDisconnect, gcalStatus, gcalSyncNow, type GcalStatus } from '@/services/gcal';
import { isSupabaseConfigured } from '@/services/supabase';
import { useUi } from '@/store/ui';
import { colors } from '@/theme/theme';
import { Button, Card, Row, T } from '@/components/ui/primitives';
import { ConfirmDialog } from '@/components/ui/Overlays';
import { Icon } from '@/components/ui/Icon';

/** Settings card: connect / sync / disconnect the one-way Google Calendar sync. */
export function GoogleCalendarCard() {
  const params = useLocalSearchParams<{ gcal?: string; reason?: string }>();
  const [status, setStatus] = useState<GcalStatus>();
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();
  const [confirm, setConfirm] = useState(false);

  const refresh = () => gcalStatus().then(setStatus).catch((e) => setError(e instanceof Error ? e.message : String(e)));

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    refresh();
    // Back from Google's consent screen.
    if (params.gcal) {
      const toast = useUi.getState().pushToast;
      if (params.gcal === 'connected') toast('info', 'Google Calendar terhubung! 📅');
      else if (params.gcal === 'cancelled') toast('info', 'Batal menghubungkan Google Calendar');
      else setError(params.reason ?? 'Gagal menghubungkan Google Calendar');
      router.setParams({ gcal: undefined, reason: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isSupabaseConfigured) return null;
  const run = async (what: string, fn: () => Promise<unknown>) => {
    setBusy(what); setError(undefined);
    try { await fn(); await refresh(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } finally { setBusy(undefined); }
  };
  const needsReconnect = status?.lastError?.startsWith('reconnect');

  return (
    <Card title="Google Calendar" right={<Icon name="calendar" size={20} color={colors.accent} />}>
      <View style={{ gap: 10 }}>
        <T v="muted">
          Tugas yang punya jam otomatis muncul di kalender <T v="small">Little Planner 🌷</T> di Google Calendar-mu. Kalender Google lain tidak disentuh.
        </T>
        {!status ? (
          <T v="muted">Memeriksa…</T>
        ) : status.connected ? (
          <>
            <Row style={{ justifyContent: 'space-between' }}>
              <T>Akun</T>
              <T v="small" style={{ color: '#2E6B4A', flexShrink: 1, textAlign: 'right' }}>{status.email ?? 'Terhubung'} ✅</T>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <T>Sinkron terakhir</T>
              <T v="small" style={{ color: colors.muted }}>
                {status.lastSyncAt ? formatDistanceToNow(new Date(status.lastSyncAt), { addSuffix: true, locale: localeId }) : 'Belum'}
              </T>
            </Row>
            {needsReconnect && <T v="small" style={{ color: colors.danger }}>Akses Google berakhir. Hubungkan ulang ya.</T>}
            {status.lastError && !needsReconnect && <T v="small" style={{ color: colors.danger }}>Gagal sinkron: {status.lastError}</T>}
            {needsReconnect
              ? <Button label="Hubungkan ulang" disabled={!!busy} onPress={() => run('connect', gcalConnect)} />
              : <Button kind="soft" label={busy === 'sync' ? 'Menyinkronkan…' : 'Sinkronkan sekarang'} disabled={!!busy} onPress={() => run('sync', gcalSyncNow)} />}
            <Button kind="outline" label="Putuskan Google Calendar" disabled={!!busy} onPress={() => setConfirm(true)} />
          </>
        ) : (
          <>
            <Button label={busy === 'connect' ? 'Membuka Google…' : 'Hubungkan Google Calendar'} icon={<Icon name="calendar" size={16} color="#fff" />}
              disabled={!!busy} onPress={() => run('connect', gcalConnect)} />
            <T v="muted">Google akan menampilkan peringatan “aplikasi belum diverifikasi”. Ketuk Lanjutan → Buka Little Planner, lalu centang izin kalender.</T>
          </>
        )}
        {error && <T v="small" style={{ color: colors.danger }} accessibilityLiveRegion="polite">{error}</T>}
      </View>
      <ConfirmDialog visible={confirm} title="Putuskan Google Calendar?" confirmLabel="Putuskan"
        message="Tugas tidak lagi dikirim ke Google. Kalender “Little Planner 🌷” di Google tetap ada; hapus manual kalau tidak dipakai."
        onCancel={() => setConfirm(false)} onConfirm={() => { setConfirm(false); run('disconnect', gcalDisconnect); }} />
    </Card>
  );
}
