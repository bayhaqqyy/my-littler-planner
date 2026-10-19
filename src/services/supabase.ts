import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Read before the client consumes the URL: a password-reset link lands with
 * `#...type=recovery` and must open the "set new password" screen.
 */
/** Error from an expired/invalid email link (`#error_description=...`), shown on the login screen. */
export const linkError: string | undefined = (() => {
  if (typeof window === 'undefined') return undefined;
  const p = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
  const d = p.get('error_description');
  if (!d) return undefined;
  return /expired|invalid/i.test(d) ? 'Link di email sudah kedaluwarsa atau sudah dipakai. Minta link baru ya.' : d.replace(/\+/g, ' ');
})();

export const openedFromRecoveryLink =
  typeof window !== 'undefined' && /type=recovery/.test(window.location.hash + window.location.search);

/**
 * Supabase is optional at build time; without it the app runs in local demo mode.
 * Implicit flow (not PKCE) so email links (verify / reset password) work even when they
 * open in another browser than the one that asked — e.g. Safari vs the iPhone home-screen app.
 */
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { flowType: 'implicit', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

export const isSupabaseConfigured = !!supabase;

const need = () => {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  return supabase;
};

/** Google OAuth with a full-page redirect (works inside the iPhone home-screen PWA). */
export async function signInWithGoogle() {
  const { error } = await need().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/', queryParams: { prompt: 'select_account' } },
  });
  if (error) throw error;
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await need().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

/** Returns true when the account still needs email verification (no session yet). */
export async function signUpWithEmail(email: string, password: string, username: string): Promise<boolean> {
  const { data, error } = await need().auth.signUp({
    email: email.trim(),
    password,
    options: { data: { username: username.trim() }, emailRedirectTo: window.location.origin + '/' },
  });
  if (error) throw error;
  // Supabase hides "already registered" behind an empty identities list.
  if (data.user && data.user.identities?.length === 0) throw new Error('User already registered');
  return !data.session;
}

export async function sendPasswordReset(email: string) {
  const { error } = await need().auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + '/' });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await need().auth.updateUser({ password });
  if (error) throw error;
}

export async function resendVerification(email: string) {
  const { error } = await need().auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: window.location.origin + '/' } });
  if (error) throw error;
}

/** Friendly Indonesian messages for common Supabase auth errors. */
export function authErrorText(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/Invalid login credentials/i.test(m)) return 'Email atau password salah.';
  if (/Email not confirmed/i.test(m)) return 'Email belum diverifikasi. Cek inbox (atau folder spam) untuk link verifikasi.';
  if (/already registered|already been registered/i.test(m)) return 'Email ini sudah terdaftar. Silakan masuk atau reset password.';
  if (/rate limit|too many/i.test(m)) return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
  if (/Password should be at least/i.test(m)) return 'Password terlalu pendek.';
  if (/same.*password|different from the old/i.test(m)) return 'Password baru harus berbeda dari password lama.';
  if (/valid email|invalid.*email/i.test(m)) return 'Format email tidak valid.';
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Tidak ada koneksi internet.';
  return m;
}

export async function signOut() {
  await supabase?.auth.signOut();
}
