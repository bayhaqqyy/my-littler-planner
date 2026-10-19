import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { z } from 'zod';
import { usernameSchema } from '@/domain';
import {
  authErrorText, isSupabaseConfigured, linkError, resendVerification, sendPasswordReset, signInWithEmail, signInWithGoogle, signUpWithEmail,
} from '@/services/supabase';
import { colors, linear } from '@/theme/theme';
import { BunnyArt, ChickArt, MiniAzza, TulipArt } from '@/components/illustrations';
import { DecoLayer } from '@/components/deco/DecoLayer';
import { Button, Card, css, Field, Label, Row, Segmented, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { InstallInstructions } from '@/components/InstallCard';
import { isInstalled } from '@/services/install';
import { unlockAudio } from '@/services/audio';

export const MIN_PASSWORD = 8;
const emailSchema = z.string().trim().email('Format email tidak valid');
const passwordSchema = z.string().min(MIN_PASSWORD, `Password minimal ${MIN_PASSWORD} karakter`);

function GoogleG() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </Svg>
  );
}

/** Password field with show/hide toggle. */
export function PasswordField({ value, onChange, error, label, autoComplete, onSubmit }: {
  value: string; onChange: (v: string) => void; error?: string; label: string; autoComplete: 'current-password' | 'new-password'; onSubmit?: () => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <View>
      <Label required>{label}</Label>
      <View>
        <Field value={value} onChangeText={onChange} secureTextEntry={!show} placeholder={`Minimal ${MIN_PASSWORD} karakter`} accessibilityLabel={label}
          autoComplete={autoComplete} error={error} onSubmitEditing={onSubmit} style={{ paddingRight: 64 }} />
        <Pressable onPress={() => setShow(!show)} accessibilityRole="button" accessibilityLabel={show ? 'Sembunyikan password' : 'Tampilkan password'}
          style={[{ position: 'absolute', right: 6, top: 0, height: 44, minWidth: 52, alignItems: 'center', justifyContent: 'center' }, css({ cursor: 'pointer' })]}>
          <T v="small" style={{ color: colors.accent }}>{show ? 'Sembunyi' : 'Lihat'}</T>
        </Pressable>
      </View>
    </View>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <ScrollView style={[{ flex: 1 }, css({ backgroundImage: linear(colors.bgGradient) })]}
      contentContainerStyle={[{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }, css({ minHeight: '100vh' })]}
      keyboardShouldPersistTaps="handled">
      <DecoLayer />
      <Card style={{ width: '100%', maxWidth: 420, gap: 12, paddingVertical: 24 }}>{children}</Card>
    </ScrollView>
  );
}

function Header({ sub }: { sub: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Row gap={0} style={{ alignItems: 'flex-end' }}>
        <Svg width={28} height={42} viewBox="0 0 40 60" aria-hidden><TulipArt color="#FF9EC2" /></Svg>
        <Svg width={44} height={46} viewBox="0 0 60 62" aria-hidden><BunnyArt /></Svg>
        <MiniAzza size={90} pose="happy" showPet={false} />
        <Svg width={36} height={36} viewBox="0 0 60 60" aria-hidden><ChickArt /></Svg>
        <Svg width={24} height={36} viewBox="0 0 40 60" aria-hidden><TulipArt color="#C3B0EE" /></Svg>
      </Row>
      <T v="title" accessibilityRole="header" style={{ color: colors.accent, marginTop: 6 }}>My Little Planner</T>
      <T v="muted" style={{ textAlign: 'center' }}>{sub}</T>
    </View>
  );
}

function Notice({ kind, children }: { kind: 'error' | 'ok'; children: ReactNode }) {
  return (
    <View accessibilityLiveRegion="polite" style={{ borderRadius: 14, padding: 12, backgroundColor: kind === 'error' ? '#FFE0E9' : '#E3F4EA' }}>
      <T v="small" style={{ color: kind === 'error' ? colors.danger : '#2E6B4A' }}>{children}</T>
    </View>
  );
}

function Divider() {
  return (
    <Row gap={10}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      <T v="muted">atau</T>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
    </Row>
  );
}

type Mode = 'login' | 'register' | 'forgot';

export function LoginScreen({ onDemo }: { onDemo: () => void }) {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | undefined>(linkError);
  const [info, setInfo] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  const switchMode = (m: Mode) => { setMode(m); setErrors({}); setError(undefined); setInfo(undefined); setNeedsVerify(false); };
  const run = async (fn: () => Promise<void>) => {
    unlockAudio();
    setBusy(true); setError(undefined); setInfo(undefined);
    try { await fn(); } catch (e) {
      const msg = authErrorText(e);
      setError(msg);
      if (/belum diverifikasi/.test(msg)) setNeedsVerify(true);
    } finally { setBusy(false); }
  };
  const check = (fields: Record<string, z.ZodType>, values: Record<string, string>) => {
    const errs: Record<string, string> = {};
    for (const [k, schema] of Object.entries(fields)) {
      const r = schema.safeParse(values[k]);
      if (!r.success) errs[k] = r.error.issues[0].message;
    }
    if ('confirm' in values && values.confirm !== values.password) errs.confirm = 'Password tidak sama';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const login = () => {
    if (!check({ email: emailSchema, password: z.string().min(1, 'Password wajib diisi') }, { email, password })) return;
    run(() => signInWithEmail(email, password));
  };
  const register = () => {
    if (!check({ username: usernameSchema, email: emailSchema, password: passwordSchema }, { username, email, password, confirm })) return;
    run(async () => {
      const pending = await signUpWithEmail(email, password, username);
      if (pending) {
        setMode('login');
        setPassword(''); setConfirm('');
        setInfo(`Akun dibuat! Kami kirim link verifikasi ke ${email.trim()}. Buka link itu (cek juga folder spam), lalu masuk di sini.`);
      }
    });
  };
  const forgot = () => {
    if (!check({ email: emailSchema }, { email })) return;
    run(async () => {
      await sendPasswordReset(email);
      setInfo(`Kalau ${email.trim()} terdaftar, link reset password sudah dikirim. Buka link itu untuk membuat password baru.`);
    });
  };

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <Header sub="Rencanakan harimu, fokus belajar, dan kumpulkan hadiah lucu ✨" />
        <Button label="Coba mode lokal" onPress={() => { unlockAudio(); onDemo(); }} />
        <T v="muted" style={{ textAlign: 'center' }}>Supabase belum dikonfigurasi (.env). Data hanya tersimpan di perangkat ini.</T>
      </Shell>
    );
  }

  const google = (
    <Button kind="outline" icon={<GoogleG />} label="Lanjut dengan Google" disabled={busy}
      onPress={() => run(() => signInWithGoogle())} />
  );

  return (
    <Shell>
      <Header sub={mode === 'register' ? 'Buat akun baru, gratis ✨' : mode === 'forgot' ? 'Lupa password? Tenang 🌷' : 'Selamat datang kembali 💕'} />

      {mode !== 'forgot' && (
        <Segmented<Mode> label="Masuk atau daftar" fill value={mode} onChange={switchMode}
          items={[{ key: 'login', label: 'Masuk' }, { key: 'register', label: 'Daftar' }]} />
      )}

      {info && <Notice kind="ok">{info}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}
      {needsVerify && (
        <Button small kind="soft" label="Kirim ulang email verifikasi" disabled={busy}
          onPress={() => run(async () => { await resendVerification(email); setNeedsVerify(false); setInfo('Email verifikasi dikirim ulang. Cek inbox atau folder spam.'); })} />
      )}

      {mode === 'register' && (
        <View>
          <Label required>Username</Label>
          <Field value={username} onChangeText={setUsername} placeholder="mis. Azza" maxLength={20} accessibilityLabel="Username" error={errors.username} autoComplete="nickname" />
          <T v="muted" style={{ marginTop: 4 }}>Karaktermu nanti bernama Mini {username.trim() || '…'}</T>
        </View>
      )}

      <View>
        <Label required>Email</Label>
        <Field value={email} onChangeText={setEmail} placeholder="nama@email.com" accessibilityLabel="Email" error={errors.email}
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" inputMode="email"
          onSubmitEditing={mode === 'forgot' ? forgot : undefined} />
      </View>

      {mode !== 'forgot' && (
        <PasswordField label="Password" value={password} onChange={setPassword} error={errors.password}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'} onSubmit={mode === 'login' ? login : undefined} />
      )}
      {mode === 'register' && (
        <PasswordField label="Ulangi password" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" onSubmit={register} />
      )}

      {mode === 'login' && (
        <Pressable onPress={() => switchMode('forgot')} accessibilityRole="button" style={[{ alignSelf: 'flex-end', minHeight: 32, justifyContent: 'center' }, css({ cursor: 'pointer' })]}>
          <T v="small" style={{ color: colors.accent }}>Lupa password?</T>
        </Pressable>
      )}

      {mode === 'login' && <Button label={busy ? 'Masuk…' : 'Masuk'} disabled={busy} onPress={login} />}
      {mode === 'register' && <Button label={busy ? 'Membuat akun…' : 'Daftar'} disabled={busy} onPress={register} />}
      {mode === 'forgot' && (
        <>
          <Button label={busy ? 'Mengirim…' : 'Kirim link reset password'} disabled={busy} onPress={forgot} />
          <Button kind="ghost" label="Kembali ke Masuk" onPress={() => switchMode('login')} />
        </>
      )}

      {mode !== 'forgot' && (<><Divider />{google}</>)}

      {!isInstalled() && (
        <View style={{ marginTop: 4, gap: 8 }}>
          <Pressable onPress={() => setShowInstall(!showInstall)} accessibilityRole="button" style={[{ minHeight: 36, justifyContent: 'center' }, css({ cursor: 'pointer' })]}>
            <Row gap={6} style={{ justifyContent: 'center' }}>
              <Icon name="plus" size={14} color={colors.accent} />
              <T v="small" style={{ color: colors.accent }}>Cara pasang aplikasi di HP</T>
            </Row>
          </Pressable>
          {showInstall && <InstallInstructions />}
        </View>
      )}
    </Shell>
  );
}
