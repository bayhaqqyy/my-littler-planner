import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, useWindowDimensions } from 'react-native';
import { toDateStr } from '@/domain';
import { useStore } from './store';
import { breakpoints } from '@/theme/theme';

/** Current time, re-rendering every `ms`. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(iv);
  }, [ms]);
  return now;
}

/** Today's date string; updates automatically at midnight. */
export function useToday() {
  const now = useNow(30_000);
  return toDateStr(now);
}

export function useTaskList() {
  const tasks = useStore((s) => s.tasks);
  return useMemo(() => Object.values(tasks).filter((t) => !t.deletedAt), [tasks]);
}

export function useCharacterName() {
  const u = useStore((s) => s.profile?.username) ?? 'Azza';
  return { username: u, character: `Mini ${u}` };
}

export function useLayout() {
  const { width } = useWindowDimensions();
  return { width, isMobile: width < breakpoints.tablet, isTablet: width >= breakpoints.tablet && width < breakpoints.desktop, isDesktop: width >= breakpoints.desktop };
}

let reduce = false;
export function useReduceMotion() {
  const [v, setV] = useState(reduce);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((r) => { reduce = r; setV(r); });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (r) => { reduce = r; setV(r); });
    return () => sub.remove();
  }, []);
  return v;
}
