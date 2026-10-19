import { supabase } from './supabase';

/** Private calendar-feed link (served by the `ical` Edge Function). */
async function call(action: 'get' | 'reset'): Promise<string> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi');
  const { data, error } = await supabase.functions.invoke('ical', { body: { action } });
  if (error) throw error;
  return (data as { url: string }).url;
}

export const getCalendarFeedUrl = () => call('get');
export const resetCalendarFeedUrl = () => call('reset');

/** webcal:// makes iOS/macOS open the Calendar app's "Subscribe" dialog directly. */
export const toWebcal = (url: string) => url.replace(/^https?:\/\//, 'webcal://');
/** Google Calendar's "add calendar from URL" page. */
export const googleAddUrl = (url: string) => `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(toWebcal(url))}`;
