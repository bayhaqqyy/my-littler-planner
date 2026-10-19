import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { openedFromRecoveryLink, signOut, supabase } from '@/services/supabase';
import { setSyncUser, startAutoSync, syncNow } from '@/services/sync';
import { useStore } from '@/store/store';
import { colors } from '@/theme/theme';
import { LoginScreen } from './LoginScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { ResetPasswordScreen } from './ResetPasswordScreen';
import { LoadingScreen } from '@/components/LoadingScreen';

export const LOCAL_USER = 'local-demo';
const LS_DEMO = 'mlp-demo-mode';

export type AuthUser = { id: string; name?: string; avatarUrl?: string; demo?: boolean; /** chosen on the email sign-up form */ username?: string };

let signOutHandler: () => void = () => {};
export const signOutEverywhere = () => signOutHandler();

/** Local keys that belong to the signed-in account (reminder bookkeeping, install banner stays). */
const ACCOUNT_LOCAL_KEYS = ['mlp-reminder-last', 'mlp-reminder-fired', 'mlp-reminder-snoozed'];

/**
 * Log out and leave nothing of this account on the device: push pending changes first
 * (best effort, max 5 s), then wipe the local copy. Everything is still on the server.
 */
export async function logOut() {
  await Promise.race([syncNow(), new Promise((r) => setTimeout(r, 5000))]).catch(() => {});
  await signOut();
  useStore.getState().resetAll();
  for (const k of ACCOUNT_LOCAL_KEYS) { try { localStorage.removeItem(k); } catch { /* ignore */ } }
  signOutEverywhere();
}

/**
 * Login is required. With Supabase configured this uses Google OAuth; without it (local
 * development) a clearly-labelled local demo mode keeps everything on this device.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const hydrated = useStore((s) => s.hydrated);
  const profile = useStore((s) => s.profile);
  const ownerId = useStore((s) => s.ownerId);
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const [syncedOnce, setSyncedOnce] = useState(false);
  const [recovery, setRecovery] = useState(openedFromRecoveryLink);

  // If local storage (IndexedDB) never answers, carry on with an empty in-memory copy;
  // the account's data still arrives from the server.
  useEffect(() => {
    if (hydrated) return;
    const t = setTimeout(() => {
      if (!useStore.getState().hydrated) {
        console.warn('Local storage did not load in time; continuing without it');
        useStore.setState({ hydrated: true });
      }
    }, 8000);
    return () => clearTimeout(t);
  }, [hydrated]);

  useEffect(() => {
    if (!supabase) {
      setUser(localStorage.getItem(LS_DEMO) ? { id: LOCAL_USER, demo: true } : null);
      return;
    }
    const toUser = (s: Session | null): AuthUser | null => s ? {
      id: s.user.id,
      username: s.user.user_metadata?.username as string | undefined,
      // Email sign-ups store the chosen username; Google gives full_name.
      name: (s.user.user_metadata?.username ?? s.user.user_metadata?.full_name ?? s.user.user_metadata?.name) as string | undefined,
      avatarUrl: (s.user.user_metadata?.avatar_url ?? s.user.user_metadata?.picture) as string | undefined,
    } : null;
    supabase.auth.getSession().then(({ data }) => setUser(toUser(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === 'PASSWORD_RECOVERY') setRecovery(true);
      setUser(toUser(s));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  signOutHandler = () => {
    localStorage.removeItem(LS_DEMO);
    setUser(null);
  };

  // The local data must belong to the signed-in account. Anything else is wiped *before*
  // any screen renders (children run their effects before ours, so this can't be left to them).
  const owned = !!user && ownerId === user.id;
  useEffect(() => {
    if (!hydrated || !user || owned) return;
    const st = useStore.getState();
    // Data from before ownership was tracked: keep it only if the profile says it's this account's.
    if (!st.ownerId && st.profile?.userId === user.id) st.setOwner(user.id);
    else st.resetAll(user.id);
  }, [hydrated, user, owned]);

  // Sync for real accounts (only once the local data is theirs).
  useEffect(() => {
    if (!hydrated || !user || !owned) return;
    if (user.demo) { setSyncedOnce(true); return; }
    setSyncedOnce(false);
    setSyncUser(user.id);
    let stop: (() => void) | undefined;
    syncNow().finally(() => { setSyncedOnce(true); stop = startAutoSync(); });
    return () => { stop?.(); setSyncUser(null); };
  }, [hydrated, user, owned]);

  if (!hydrated || user === undefined) return <LoadingScreen />;
  if (user && recovery) {
    return <ResetPasswordScreen onDone={() => { setRecovery(false); window.history.replaceState(null, '', '/'); }} />;
  }
  if (!user) return <LoginScreen onDemo={() => { localStorage.setItem(LS_DEMO, '1'); setUser({ id: LOCAL_USER, demo: true }); }} />;
  if (!owned) return <LoadingScreen message="Menyiapkan akunmu…" />;
  if (!syncedOnce && !profile) return <LoadingScreen message="Mengambil datamu…" />;
  if (!profile || profile.userId !== user.id) return <WelcomeScreen user={user} auto={!!user.username} />;
  return <>{children}</>;
}

