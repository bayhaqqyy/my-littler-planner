import { useEffect, useState } from 'react';

/**
 * Current time for countdowns: ticks every minute, or every second when any of the given
 * deadlines is less than an hour away (PRD AC5). Pass `seconds` to always tick per second.
 */
export function useCountdownNow(dueMs: number[] = [], seconds = false): number {
  const [now, setNow] = useState(() => Date.now());
  const soon = seconds || dueMs.some((d) => d - now > -60_000 && d - now < 3600_000);
  useEffect(() => {
    const step = soon ? 1000 : 60_000;
    // Align minute ticks to the clock so "Sisa 5 mnt" flips on the minute.
    const first = soon ? step : step - (Date.now() % step);
    let iv: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => { setNow(Date.now()); iv = setInterval(() => setNow(Date.now()), step); }, first);
    return () => { clearTimeout(t); if (iv) clearInterval(iv); };
  }, [soon]);
  return now;
}
