import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import Svg from 'react-native-svg';
import { remainingSec, splitOccKey } from '@/domain';
import { useStore } from '@/store/store';
import { useCharacterName, useLayout, useNow, useReduceMotion } from '@/store/hooks';
import { colors, fonts, linear, radius, shadow } from '@/theme/theme';
import { css, IconButton, Row, T } from './ui/primitives';
import { Icon, type IconName } from './ui/Icon';
import { BunnyArt, MiniAzza, TulipArt } from './illustrations';
import { DecoLayer } from './deco/DecoLayer';

export const NAV: { href: string; label: string; short: string; icon: IconName }[] = [
  { href: '/', label: 'Home', short: 'Home', icon: 'home' },
  { href: '/tasks', label: 'To-Do List', short: 'To-Do', icon: 'list' },
  { href: '/calendar', label: 'Calendar', short: 'Calendar', icon: 'calendar' },
  { href: '/timer', label: 'Focus Timer', short: 'Timer', icon: 'timer' },
  { href: '/progress', label: 'Progress', short: 'Progress', icon: 'chart' },
  { href: '/notes', label: 'Notes', short: 'Notes', icon: 'note' },
  { href: '/rewards', label: 'Rewards', short: 'Rewards', icon: 'gift' },
];

const isActive = (path: string, href: string) => (href === '/' ? path === '/' : path.startsWith(href));

function Sidebar() {
  const path = usePathname();
  const equipped = useStore((s) => s.wardrobe.equipped);
  const gifts = useStore((s) => Object.keys(s.giftBoxes).length);
  const { character } = useCharacterName();
  return (
    <View style={[{ width: 236, paddingVertical: 20, paddingHorizontal: 14, borderRightWidth: 1, borderColor: colors.line, gap: 4 }, css({ backgroundImage: linear(colors.sidebar, 180), position: 'sticky', top: 0, height: '100vh' })]}>
      <Row gap={10} style={{ paddingHorizontal: 8, marginBottom: 16 }}>
        <MiniAzza faceOnly size={44} equipped={equipped} />
        <View>
          <T v="cardTitle" style={{ color: colors.accent }}>My Little</T>
          <T v="cardTitle" style={{ marginTop: -2 }}>Planner</T>
        </View>
      </Row>
      <View accessibilityRole="navigation" style={{ gap: 4 }}>
        {NAV.map((n) => {
          const on = isActive(path, n.href);
          return (
            <Pressable
              key={n.href}
              accessibilityRole="link"
              accessibilityState={{ selected: on }}
              accessibilityLabel={n.label}
              onPress={() => router.navigate(n.href as never)}
              style={(st) => [
                { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: on ? colors.accentSoft : (st as { hovered?: boolean }).hovered ? 'rgba(255,230,238,.5)' : 'transparent' },
                css({ cursor: 'pointer', transitionDuration: '150ms' }),
              ]}
            >
              <Icon name={n.icon} size={20} color={on ? colors.accent : colors.muted} />
              <T v="body" style={{ fontFamily: on ? fonts.bold : fonts.semibold, color: on ? colors.accent : colors.text, flex: 1 }}>{n.label}</T>
              {n.href === '/rewards' && gifts > 0 && (
                <View style={{ backgroundColor: colors.accent, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }}>
                  <T v="chip" style={{ color: '#fff' }}>{gifts}</T>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ alignItems: 'center', marginBottom: 6 }} aria-hidden>
        <Row gap={0} style={{ alignItems: 'flex-end' }}>
          <Svg width={28} height={42} viewBox="0 0 40 60"><TulipArt color="#FF9EC2" /></Svg>
          <Svg width={64} height={66} viewBox="0 0 60 62"><BunnyArt /></Svg>
          <Svg width={26} height={39} viewBox="0 0 40 60"><TulipArt color="#C3B0EE" /></Svg>
        </Row>
        <T v="muted" style={{ textAlign: 'center' }}>{character} menemanimu 💕</T>
      </View>
      <Pressable accessibilityRole="link" accessibilityLabel="Settings" onPress={() => router.navigate('/settings')}
        style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: isActive(path, '/settings') ? colors.accentSoft : 'transparent' }, css({ cursor: 'pointer' })]}>
        <Icon name="settings" size={20} color={colors.muted} />
        <T v="body">Settings</T>
      </Pressable>
    </View>
  );
}

function TabBar() {
  const path = usePathname();
  return (
    <View accessibilityRole="navigation" style={[
      { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.96)', borderTopWidth: 1, borderColor: colors.line, zIndex: 20 },
      css({ position: 'fixed', paddingBottom: 'env(safe-area-inset-bottom)', backdropFilter: 'blur(10px)', boxShadow: '0 -4px 16px rgba(200,140,170,.08)' }),
    ]}>
      {NAV.map((n) => {
        const on = isActive(path, n.href);
        return (
          <Pressable key={n.href} accessibilityRole="link" accessibilityLabel={n.label} accessibilityState={{ selected: on }}
            onPress={() => router.navigate(n.href as never)}
            style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, minHeight: 54, gap: 2 }, css({ cursor: 'pointer' })]}>
            <View style={{ backgroundColor: on ? colors.accentSoft : 'transparent', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Icon name={n.icon} size={20} color={on ? colors.accent : colors.muted} />
            </View>
            <T v="chip" style={{ fontSize: 10, color: on ? colors.accent : colors.muted }} numberOfLines={1}>{n.short}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

function Fab() {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Tambah tugas" onPress={() => router.push('/task/new')}
      style={({ pressed }) => [
        { position: 'absolute', right: 18, bottom: 78, width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', zIndex: 21, transform: [{ scale: pressed ? 0.94 : 1 }] },
        css({ position: 'fixed', marginBottom: 'env(safe-area-inset-bottom)', backgroundImage: linear(colors.accentGradient), ...shadow.button, cursor: 'pointer' }),
      ]}>
      <Icon name="plus" size={28} color="#fff" />
    </Pressable>
  );
}

/** Floating mini timer when a timer runs and you're on another page. */
function MiniTimer({ bottom }: { bottom: number }) {
  const timer = useStore((s) => s.timer);
  const task = useStore((s) => (s.timer ? s.tasks[splitOccKey(s.timer.occurrenceKey).taskId] : undefined));
  const path = usePathname();
  const now = useNow(1000);
  const equipped = useStore((s) => s.wardrobe.equipped);
  if (!timer || !task || path.startsWith('/timer') || timer.state === 'idle') return null;
  const rem = remainingSec(timer, now.getTime());
  const mm = String(Math.floor(rem / 60)).padStart(2, '0');
  const ss = String(rem % 60).padStart(2, '0');
  const label = timer.state === 'finished' ? 'Selesai!' : `${mm}:${ss}`;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Timer ${task.title}, ${label}. Buka timer`} onPress={() => router.navigate('/timer')}
      style={[
        { position: 'absolute', left: 16, bottom, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: radius.pill, paddingVertical: 6, paddingLeft: 6, paddingRight: 14, borderWidth: 1, borderColor: '#FFC1D6', zIndex: 22, maxWidth: 260 },
        css({ position: 'fixed', boxShadow: '0 8px 22px rgba(194,69,122,.2)', cursor: 'pointer', marginBottom: 'env(safe-area-inset-bottom)' }),
      ]}>
      <MiniAzza faceOnly size={34} pose={timer.state === 'paused' ? 'rest' : 'study'} equipped={equipped} />
      <View style={{ flexShrink: 1 }}>
        <T v="cardTitle" style={{ fontVariant: ['tabular-nums'], color: timer.phase === 'focus' ? colors.accent : '#2E6B4A' }}>{label}{timer.state === 'paused' ? ' ⏸' : ''}</T>
        <T v="muted" numberOfLines={1}>{timer.phase === 'focus' ? task.title : 'Istirahat ☕'}</T>
      </View>
    </Pressable>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { isDesktop, isMobile } = useLayout();
  const path = usePathname();
  const reduce = useReduceMotion();
  const a = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduce) return;
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 300, useNativeDriver: false }).start();
  }, [path, reduce, a]);
  return (
    <View style={[{ flex: 1, flexDirection: 'row', backgroundColor: colors.bg }, css({ minHeight: '100vh', backgroundImage: linear(colors.bgGradient, 135), backgroundAttachment: 'fixed' })]}>
      <DecoLayer />
      {isDesktop && <Sidebar />}
      <Animated.View style={{ flex: 1, minWidth: 0, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
        {children}
      </Animated.View>
      {!isDesktop && <TabBar />}
      {isMobile && !path.startsWith('/task') && <Fab />}
      <MiniTimer bottom={isDesktop ? 20 : 78} />
    </View>
  );
}

/** Page wrapper: scrollable, centered, with title and header actions. */
export function Page({ title, subtitle, children, actions, back }: { title: string; subtitle?: string; children: ReactNode; actions?: ReactNode; back?: boolean }) {
  const { isDesktop, isMobile } = useLayout();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[{ padding: isMobile ? 16 : 24, paddingBottom: isDesktop ? 40 : 150, gap: 14, width: '100%', maxWidth: 1240, alignSelf: 'center' }, css({ paddingTop: isMobile ? 'max(16px, env(safe-area-inset-top))' : 24 })]}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <Row gap={10} style={{ flex: 1, minWidth: 0 }}>
          {back && <IconButton label="Kembali" onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))}><Icon name="chevron-left" /></IconButton>}
          <View style={{ flex: 1, minWidth: 0 }}>
            <T v="title" accessibilityRole="header" style={{ fontSize: isMobile ? 22 : 27 }}>{title}</T>
            {subtitle ? <T v="muted">{subtitle}</T> : null}
          </View>
        </Row>
        {actions ? <Row gap={8} style={{ flexShrink: 0 }}>{actions}</Row> : null}
      </Row>
      {children}
    </ScrollView>
  );
}

/** Default header actions: Add + Settings. */
export function HeaderActions({ addDate }: { addDate?: string }) {
  return (
    <>
      <IconButton label="Tambah tugas" bg={colors.accentSoft} onPress={() => router.push({ pathname: '/task/new', params: addDate ? { date: addDate } : {} })}><Icon name="plus" color={colors.accent} /></IconButton>
      <IconButton label="Settings" onPress={() => router.push('/settings')}><Icon name="settings" /></IconButton>
    </>
  );
}
