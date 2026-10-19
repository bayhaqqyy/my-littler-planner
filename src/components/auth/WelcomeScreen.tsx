import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { usernameSchema } from '@/domain';
import { useStore } from '@/store/store';
import { colors, linear } from '@/theme/theme';
import { MiniAzza } from '@/components/illustrations';
import { DecoLayer } from '@/components/deco/DecoLayer';
import { Button, Card, css, Field, Label, T } from '@/components/ui/primitives';
import type { AuthUser } from './AuthGate';

/** First login: pick a username (prefilled from the Google first name). */
export function WelcomeScreen({ user, auto }: { user: AuthUser; auto?: boolean }) {
  const setProfile = useStore((s) => s.setProfile);
  // Email sign-up: keep the full chosen username. Google: first name.
  const first = (auto ? user.username ?? '' : (user.name ?? '').trim().split(/\s+/)[0] ?? '').replace(/[^\p{L}\p{N} ]/gu, '').trim().slice(0, 20);
  const [name, setName] = useState(first.length >= 2 ? first : '');
  const [err, setErr] = useState<string>();
  const preview = name.trim() || '…';
  const submit = () => {
    const r = usernameSchema.safeParse(name);
    if (!r.success) { setErr(r.error.issues[0].message); return; }
    setProfile({ userId: user.id, username: r.data, googleName: auto ? undefined : user.name, avatarUrl: user.avatarUrl, createdAt: new Date().toISOString() });
  };
  // The username was already chosen on the sign-up form: skip this screen.
  useEffect(() => {
    if (auto && usernameSchema.safeParse(first).success) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }, css({ minHeight: '100vh', backgroundImage: linear(colors.bgGradient) })]}>
      <DecoLayer />
      <Card style={{ width: '100%', maxWidth: 420, gap: 10 }}>
        <View style={{ alignItems: 'center' }}><MiniAzza size={110} pose="surprised" /></View>
        <T v="greeting" accessibilityRole="header" style={{ textAlign: 'center' }}>Halo! Siapa namamu?</T>
        <T v="muted" style={{ textAlign: 'center' }}>Karaktermu akan bernama <T v="small" style={{ color: colors.accent }}>Mini {preview}</T>. Nama bisa diganti kapan saja di Settings.</T>
        <View>
          <Label required>Username</Label>
          <Field value={name} onChangeText={(t) => { setName(t); setErr(undefined); }} placeholder="mis. Azza" maxLength={20} autoFocus error={err} onSubmitEditing={submit} accessibilityLabel="Username" />
        </View>
        <Button label="Mulai ✨" onPress={submit} />
      </Card>
    </View>
  );
}
