import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { authErrorText, updatePassword } from '@/services/supabase';
import { colors, linear } from '@/theme/theme';
import { MiniAzza } from '@/components/illustrations';
import { DecoLayer } from '@/components/deco/DecoLayer';
import { Button, Card, css, T } from '@/components/ui/primitives';
import { MIN_PASSWORD, PasswordField } from './LoginScreen';

/** Shown after opening a password-reset email link (the link already signed the user in). */
export function ResetPasswordScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const errs: typeof errors = {};
    if (password.length < MIN_PASSWORD) errs.password = `Password minimal ${MIN_PASSWORD} karakter`;
    if (confirm !== password) errs.confirm = 'Password tidak sama';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setError(undefined);
    try { await updatePassword(password); setDone(true); } catch (e) { setError(authErrorText(e)); } finally { setBusy(false); }
  };

  return (
    <ScrollView style={[{ flex: 1 }, css({ backgroundImage: linear(colors.bgGradient) })]}
      contentContainerStyle={[{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }, css({ minHeight: '100vh' })]}>
      <DecoLayer />
      <Card style={{ width: '100%', maxWidth: 420, gap: 12 }}>
        <View style={{ alignItems: 'center' }}><MiniAzza size={100} pose={done ? 'dance' : 'surprised'} showPet={false} /></View>
        <T v="greeting" accessibilityRole="header" style={{ textAlign: 'center' }}>{done ? 'Password diganti! 🎉' : 'Buat password baru'}</T>
        {done ? (
          <>
            <T v="muted" style={{ textAlign: 'center' }}>Mulai sekarang masuk dengan password barumu.</T>
            <Button label="Lanjut ke aplikasi" onPress={onDone} />
          </>
        ) : (
          <>
            {error && <T v="small" style={{ color: colors.danger }} accessibilityLiveRegion="polite">{error}</T>}
            <PasswordField label="Password baru" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" />
            <PasswordField label="Ulangi password baru" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" onSubmit={submit} />
            <Button label={busy ? 'Menyimpan…' : 'Simpan password'} disabled={busy} onPress={submit} />
          </>
        )}
      </Card>
    </ScrollView>
  );
}
