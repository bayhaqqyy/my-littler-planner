import { useEffect, useState, useSyncExternalStore } from 'react';
import { Image, Pressable, View } from 'react-native';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { DEFAULT_DEADLINE_REMINDERS, REMIND_OPTIONS, usernameSchema } from '@/domain';
import { ReminderChips } from '@/components/deadline/ReminderChips';
import { useStore } from '@/store/store';
import { useLayout } from '@/store/hooks';
import { Page } from '@/components/AppShell';
import { Button, Card, Chip, css, Field, IconButton, Label, Row, Segmented, Switch, T } from '@/components/ui/primitives';
import { ConfirmDialog } from '@/components/ui/Overlays';
import { Icon } from '@/components/ui/Icon';
import { MiniAzza, Bunny } from '@/components/illustrations';
import { TonePicker } from '@/components/settings/TonePicker';
import { PomodoroPicker } from '@/components/timer/PomodoroPicker';
import { logOut, signOutEverywhere } from '@/components/auth/AuthGate';
import { InstallInstructions, InstallSettingsCard } from '@/components/InstallCard';
import { GoogleCalendarCard } from '@/components/settings/GoogleCalendarCard';
import { CalendarFeedCard } from '@/components/settings/CalendarFeedCard';
import { gcalDisconnect } from '@/services/gcal';
import { currentPushEndpoint, enableNotifications, isIOS, needsHomeScreenGuide, permission } from '@/services/notifications';
import { isSupabaseConfigured, signOut } from '@/services/supabase';
import { deleteRemoteData, syncNow, useSyncStatus } from '@/services/sync';
import { clearLocal } from '@/services/storage';
import { playTone } from '@/services/audio';
import { colors, radius } from '@/theme/theme';

export default function SettingsScreen() {
  const { isDesktop } = useLayout();
  return (
    <Page title="Settings" back>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 14, alignItems: isDesktop ? 'flex-start' : 'stretch' }}>
        <View style={isDesktop ? { flex: 1, gap: 14, minWidth: 0 } : { gap: 14 }}>
          <ProfileCard />
          <ReminderDefaultsCard />
          <InstallSettingsCard />
          <NotificationCard />
        </View>
        <View style={isDesktop ? { flex: 1, gap: 14, minWidth: 0 } : { gap: 14 }}>
          <CalendarFeedCard />
          <GoogleCalendarCard />
          <TimerDefaultsCard />
          <AccountCard />
        </View>
      </View>
    </Page>
  );
}

function ProfileCard() {
  const profile = useStore((s) => s.profile);
  const setUsername = useStore((s) => s.setUsername);
  const equipped = useStore((s) => s.wardrobe.equipped);
  const [name, setName] = useState(profile?.username ?? '');
  const [err, setErr] = useState<string>();
  const [saved, setSaved] = useState(false);
  const dirty = name.trim() !== profile?.username;
  const save = () => {
    const r = usernameSchema.safeParse(name);
    if (!r.success) { setErr(r.error.issues[0].message); return; }
    setUsername(r.data);
    setName(r.data);
    setSaved(true);
  };
  return (
    <Card title="Profil">
      <Row gap={14} style={{ marginBottom: 12 }}>
        {profile?.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#FFC1D6' }} accessibilityLabel="Foto akun Google" />
        ) : (
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFE1EC', alignItems: 'center', justifyContent: 'center' }}><MiniAzza faceOnly size={48} equipped={equipped} /></View>
        )}
        <View style={{ flex: 1 }}>
          <T v="cardTitle">{profile?.googleName ?? profile?.username}</T>
          <T v="muted">Karaktermu: <T v="small" style={{ color: colors.accent }}>Mini {name.trim() || '…'}</T></T>
        </View>
      </Row>
      <Label required>Username</Label>
      <Row style={{ alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Field value={name} maxLength={20} accessibilityLabel="Username" error={err} onSubmitEditing={save}
            onChangeText={(t) => { setName(t); setErr(undefined); setSaved(false); }} />
        </View>
        <Button label="Simpan" disabled={!dirty} onPress={save} />
      </Row>
      <T v="muted" style={{ marginTop: 6 }}>{saved ? 'Tersimpan ✨' : '2–20 karakter: huruf, angka, dan spasi.'}</T>
    </Card>
  );
}

function VolumeControl() {
  const volume = useStore((s) => s.settings.volume);
  const update = useStore((s) => s.updateSettings);
  const level = Math.round(volume * 10);
  const set = (l: number) => { const v = Math.max(0, Math.min(10, l)) / 10; update({ volume: v }); playTone('lonceng', v); };
  return (
    <View style={{ gap: 6 }}>
      <Label>Volume · {level * 10}%</Label>
      <Row gap={8}>
        <IconButton label="Kecilkan volume" size={40} onPress={() => set(level - 1)}><T v="cardTitle" style={{ color: colors.accent }}>−</T></IconButton>
        <View style={{ flex: 1, flexDirection: 'row', gap: 4, alignItems: 'flex-end', height: 32 }} accessibilityRole="adjustable" accessibilityLabel="Volume" accessibilityValue={{ min: 0, max: 100, now: level * 10 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <Pressable key={i} onPress={() => set(i + 1)} accessibilityLabel={`Volume ${(i + 1) * 10}%`}
              style={[{ flex: 1, height: 10 + i * 2.2, borderRadius: 6, backgroundColor: i < level ? ['#FF9EC2', '#FFC48F', '#FFE27A', '#9EE0B5', '#9CD3F5', '#C3B0EE'][Math.floor(i / 2) % 6] : '#F3E1E8' }, css({ cursor: 'pointer' })]} />
          ))}
        </View>
        <IconButton label="Besarkan volume" size={40} onPress={() => set(level + 1)}><Icon name="plus" size={16} color={colors.accent} /></IconButton>
      </Row>
    </View>
  );
}

function ReminderDefaultsCard() {
  const v = useStore((s) => s.settings.defaultRemindBeforeMin);
  const dl = useStore((s) => s.settings.defaultDeadlineRemindersMin) ?? DEFAULT_DEADLINE_REMINDERS;
  const update = useStore((s) => s.updateSettings);
  return (
    <Card title="Pengingat bawaan">
      <View style={{ gap: 14 }}>
        <View>
          <T v="muted" style={{ marginBottom: 8 }}>Tugas terjadwal baru: ingatkan sebelum mulai</T>
          <Row wrap>
            {REMIND_OPTIONS.map((m) => <Chip key={m} label={m === 0 ? 'Mati' : `${m} menit`} selected={v === m} onPress={() => update({ defaultRemindBeforeMin: m })} />)}
          </Row>
        </View>
        <ReminderChips label="Tugas deadline baru: pengingat deadline bawaan" value={dl} onChange={(m) => update({ defaultDeadlineRemindersMin: m })} />
      </View>
    </Card>
  );
}

function TimerDefaultsCard() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  return (
    <Card title="Timer & Pomodoro">
      <View style={{ gap: 12 }}>
        <View>
          <Label>Mode timer bawaan</Label>
          <Segmented label="Mode timer bawaan" value={settings.defaultTimerMode} onChange={(m) => update({ defaultTimerMode: m })}
            items={[{ key: 'task', label: 'Sesuai tugas' }, { key: 'pomodoro', label: 'Pomodoro' }]} />
        </View>
        <View>
          <Label>Preset Pomodoro bawaan</Label>
          <PomodoroPicker value={settings.pomodoro} onChange={(c) => update({ pomodoro: c })} />
        </View>
        <Switch label="Mulai otomatis fase berikutnya" hint="Bila mati, tekan tombol untuk mulai istirahat atau fokus lagi"
          value={settings.pomodoro.autoStartNext} onValueChange={(autoStartNext) => update({ pomodoro: { ...settings.pomodoro, autoStartNext } })} />
      </View>
    </Card>
  );
}

const PERM_LABEL: Record<string, string> = {
  granted: 'Aktif ✅', denied: 'Diblokir di pengaturan browser', default: 'Belum diaktifkan', unsupported: 'Tidak didukung di browser ini',
};

/** Shown when permission is granted but this browser isn't registered (e.g. removed from the list). */
function ThisDeviceToggle() {
  const subs = useStore((s) => s.pushSubs);
  const [mine, setMine] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { currentPushEndpoint().then((e) => setMine(e ?? '')).catch(() => setMine('')); }, [subs]);
  if (mine === null) return null;
  const registered = !!mine && Object.values(subs).some((d) => d.endpoint === mine);
  if (registered) return null;
  return (
    <Button label={busy ? 'Mengaktifkan…' : 'Terima notifikasi di perangkat ini'} icon={<Icon name="bell" size={16} color="#fff" />} disabled={busy}
      onPress={async () => { setBusy(true); try { await enableNotifications(); setMine((await currentPushEndpoint()) ?? ''); } finally { setBusy(false); } }} />
  );
}

function NotificationCard() {
  const [perm, setPerm] = useState(permission());
  const [busy, setBusy] = useState(false);
  const guide = needsHomeScreenGuide();
  return (
    <Card title="Notifikasi">
      <View style={{ gap: 12 }}>
        {perm === 'granted' && !guide ? (
          <Row gap={10} style={{ backgroundColor: '#E3F4EA', borderRadius: radius.row, padding: 12 }}>
            <T style={{ fontSize: 22 }} aria-hidden>✅</T>
            <View style={{ flex: 1, minWidth: 0 }}>
              <T v="cardTitle" style={{ color: '#2E6B4A' }}>Notifikasi sudah diaktifkan</T>
              <T v="muted">Pengingat tetap datang walau aplikasi ditutup.</T>
            </View>
          </Row>
        ) : (
          <Row style={{ justifyContent: 'space-between' }}>
            <T>Status</T>
            <T v="small" style={{ color: colors.muted, flexShrink: 1, textAlign: 'right' }}>{guide ? 'Perlu dipasang ke Home Screen' : PERM_LABEL[perm]}</T>
          </Row>
        )}
        {guide && (
          <View style={{ backgroundColor: '#FFF3F7', borderRadius: radius.card, padding: 14, gap: 8, borderWidth: 1, borderColor: '#FFC1D6' }}>
            <Row gap={10}>
              <Bunny size={48} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <T v="cardTitle">Pasang ke Home Screen dulu ya</T>
                <T v="muted">Di iPhone, Safari maupun Chrome tidak bisa mengizinkan notifikasi untuk situs web biasa. Ini aturan Apple: notifikasi hanya untuk aplikasi web yang dibuka dari ikon Home Screen.</T>
              </View>
            </Row>
            <InstallInstructions />
            <T v="muted">Setelah itu buka Little Planner dari ikon Home Screen, masuk lagi ke akunmu, lalu kembali ke Settings → Aktifkan notifikasi.</T>
          </View>
        )}
        {!guide && perm === 'default' && (
          <Button label={busy ? 'Meminta izin…' : 'Aktifkan notifikasi'} icon={<Icon name="bell" size={16} color="#fff" />} disabled={busy}
            onPress={async () => { setBusy(true); try { setPerm(await enableNotifications()); } finally { setBusy(false); } }} />
        )}
        {perm === 'denied' && (
          <T v="muted">
            Notifikasi pernah ditolak, jadi aplikasi tidak bisa meminta lagi.{' '}
            {isIOS() ? 'Buka Pengaturan iPhone → Notifikasi → Little Planner → nyalakan Izinkan Notifikasi.' : 'Izinkan lewat ikon gembok/pengaturan situs di browser, lalu muat ulang.'}
          </T>
        )}
        {perm === 'unsupported' && !guide && <T v="muted">Browser ini tidak mendukung notifikasi web. Coba Chrome, Edge, Firefox, atau Safari versi terbaru.</T>}
        {perm === 'granted' && isSupabaseConfigured && <ThisDeviceToggle />}

        <View style={{ gap: 4 }}>
          <T v="cardTitle" style={{ fontSize: 14.5 }}>Jenis notifikasi</T>
          <T v="muted">Nyalakan yang kamu mau, ketuk namanya untuk ganti suara, ▶ untuk mendengar.</T>
        </View>
        <TonePicker toggles />
        <VolumeControl />
        <T v="muted">Suara pilihan berbunyi saat aplikasi terbuka. Saat aplikasi tertutup, notifikasi memakai bunyi bawaan HP (aplikasi web tidak boleh memakai suara khusus di sana).</T>
      </View>
    </Card>
  );
}

function AccountCard() {
  const resetAll = useStore((s) => s.resetAll);
  const status = useSyncExternalStore(useSyncStatus.subscribe, useSyncStatus.get);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const logout = logOut;
  const wipe = async () => {
    setBusy(true); setErr(undefined);
    try {
      if (isSupabaseConfigured) {
        await gcalDisconnect().catch(() => {}); // revoke Google access before the account data goes
        await deleteRemoteData();
      }
      await clearLocal();
      resetAll();
      try { localStorage.clear(); } catch { /* ignore */ }
      setConfirm(false);
      await logout();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal menghapus data');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card title="Akun & data">
      <View style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T>Sinkronisasi</T>
          <T v="small" style={{ color: status.error ? colors.danger : colors.muted, flexShrink: 1, textAlign: 'right' }}>
            {!isSupabaseConfigured ? 'Mode lokal (tanpa sinkron)' : status.error ? `Gagal: ${status.error}` : status.lastSync ? `Terakhir ${format(new Date(status.lastSync), 'd MMM, HH.mm', { locale: localeId })}` : 'Belum sinkron'}
          </T>
        </Row>
        {isSupabaseConfigured && <Button kind="soft" label="Sinkronkan sekarang" onPress={() => syncNow()} />}
        <Button kind="outline" label="Keluar" icon={<Icon name="logout" size={16} color={colors.accent} />} onPress={logout} />
        <Button kind="danger" label="Hapus semua data" icon={<Icon name="trash" size={16} color={colors.danger} />} onPress={() => setConfirm(true)} />
        {err ? <T v="small" style={{ color: colors.danger }}>{err}</T> : null}
      </View>
      <ConfirmDialog visible={confirm} title="Hapus semua data?" confirmLabel={busy ? 'Menghapus…' : 'Hapus semua'}
        message={`Semua tugas, catatan, kado, dan progres akan dihapus dari perangkat ini${isSupabaseConfigured ? ' dan dari server' : ''}. Tindakan ini tidak bisa dibatalkan.`}
        onCancel={() => setConfirm(false)} onConfirm={() => { if (!busy) wipe(); }} />
    </Card>
  );
}
