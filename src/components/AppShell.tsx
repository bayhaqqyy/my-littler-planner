import { FEATURES } from '@/config/features';
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import Svg, { G } from 'react-native-svg';
import { remainingSec, splitOccKey } from '@/domain';
import { useStore } from '@/store/store';
import { useCharacterName, useLayout, useNow, useReduceMotion } from '@/store/hooks';
import { colors, fonts, linear, radius, shadow } from '@/theme/theme';
import { css, IconButton, Row, T } from './ui/primitives';
import { Icon, type IconName } from './ui/Icon';
import { BunnyArt, MiniAzza } from './illustrations';
import { StemFlower } from './deco/Garden';
import { DecoLayer } from './deco/DecoLayer';

export const NAV: { href: string; label: string; short: string; icon: IconName }[] = [
  { href: '/', label: 'Kebun', short: 'Kebun', icon: 'garden' },
  { href: '/tasks', label: 'Tugas', short: 'Tugas', icon: 'tasks' },
  { href: '/calendar', label: 'Kalender', short: 'Kalender', icon: 'calendar' },
  { href: '/timer', label: 'Fokus', short: 'Fokus', icon: 'timer' },
  { href: '/progress', label: 'Progres', short: 'Progres', icon: 'chart' },
  { href: '/notes', label: 'Catatan', short: 'Catatan', icon: 'note' },
  { href: '/rewards', label: 'Lemari & Kado', short: 'Lemari', icon: 'hanger' },
];

/** Bottom tabs on phones and tablets: four sections around a big "Tambah" button. */
const TABS: { href: string; label: string; icon: IconName; match: string[] }[] = [
  { href: '/', label: 'Kebun', icon: 'garden', match: ['/'] },
  { href: '/tasks', label: 'Tugas', icon: 'tasks', match: ['/tasks', '/calendar', '/task'] },
  { href: '/timer', label: 'Fokus', icon: 'timer', match: ['/timer'] },
  { href: '/me', label: 'Aku', icon: 'user', match: ['/me', '/progress', '/notes', '/rewards', '/settings'] },
];

const isActive = (path: string, href: string) => (href === '/' ? path === '/' : path.startsWith(href));
const tabActive = (path: string, match: string[]) => match.some((m) => isActive(path, m));

function useGiftCount() {
  return useStore((s) => (FEATURES.gifts ? Object.keys(s.giftBoxes).length : 0));
}

function CountBadge({ n, style }: { n: number; style?: object }) {
  if (n <= 0) return null;
  return (
    <View style={[{ backgroundColor: '#E84D5B', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, borderWidth: 2, borderColor: '#fff' }, style]}>
      <T v="chip" style={{ color: '#fff', fontSize: 10.5, lineHeight: 13 }}>{n > 9 ? '9+' : n}</T>
    </View>
  );
}

function Sidebar() {
  const path = usePathname();
  const equipped = useStore((s) => s.wardrobe.equipped);
  const gifts = useGiftCount();
  const { character } = useCharacterName();
  return (
    <View style={[{ width: 248, paddingVertical: 20, paddingHorizontal: 14, gap: 4, zIndex: 2 }, css({ position: 'sticky', top: 0, height: '100vh' })]}>
      <View style={[{ flex: 1, backgroundColor: 'rgba(255,255,255,.9)', borderRadius: 28, borderWidth: 2, borderColor: colors.line, paddingVertical: 16, paddingHorizontal: 12, gap: 4 }, css({ ...shadow.card, backdropFilter: 'blur(8px)' })]}>
        <Pressable accessibilityRole="link" accessibilityLabel={`Profil ${character}`} onPress={() => router.navigate('/me')}
          style={(st) => [{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 20, marginBottom: 6, backgroundColor: isActive(path, '/me') ? colors.accentSoft : (st as { hovered?: boolean }).hovered ? '#F4FBEE' : 'transparent' }, css({ cursor: 'pointer' })]}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF1F6', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <MiniAzza faceOnly size={44} equipped={equipped} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T v="cardTitle" style={{ color: colors.accent, lineHeight: 20 }}>My Little</T>
            <T v="cardTitle" style={{ lineHeight: 20 }}>Planner</T>
          </View>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Tambah tugas" onPress={() => router.push('/task/new')}
          style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: radius.pill, marginBottom: 10, transform: [{ scale: pressed ? 0.97 : 1 }] }, css({ backgroundImage: linear(colors.accentGradient, 135), ...shadow.button, cursor: 'pointer' })]}>
          <Icon name="plus" size={22} color="#fff" />
          <T v="body" style={{ color: '#fff', fontFamily: fonts.bold, fontSize: 15.5 }}>Tambah tugas</T>
        </Pressable>
        <View accessibilityRole="navigation" style={{ gap: 2 }}>
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
                  { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: on ? colors.accentSoft : (st as { hovered?: boolean }).hovered ? '#F4FBEE' : 'transparent' },
                  css({ cursor: 'pointer', transitionDuration: '150ms' }),
                ]}
              >
                <Icon name={n.icon} size={21} color={on ? colors.accent : colors.muted} />
                <T v="body" style={{ fontFamily: on ? fonts.bold : fonts.semibold, color: on ? colors.accent : colors.text, flex: 1 }}>{n.label}</T>
                {n.href === '/rewards' && <CountBadge n={gifts} />}
              </Pressable>
            );
          })}
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ alignItems: 'center', marginBottom: 6 }} aria-hidden>
          <Svg width={150} height={54} viewBox="0 0 150 54">
            <G transform="translate(4 -4)"><StemFlower color="#FF9EC2" height={34} /></G>
            <G transform="translate(30 0)"><StemFlower color="#FFCE3A" height={42} /></G>
            <G transform="translate(52 6) scale(0.8)"><BunnyArt /></G>
            <G transform="translate(98 -2)"><StemFlower color="#B79CFF" height={36} /></G>
            <G transform="translate(122 2)"><StemFlower color="#8EC9FF" height={30} /></G>
          </Svg>
          <T v="muted" style={{ textAlign: 'center' }}>{character} menemanimu 🌷</T>
        </View>
        <Pressable accessibilityRole="link" accessibilityLabel="Pengaturan" onPress={() => router.navigate('/settings')}
          style={(st) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: isActive(path, '/settings') ? colors.accentSoft : (st as { hovered?: boolean }).hovered ? '#F4FBEE' : 'transparent' }, css({ cursor: 'pointer' })]}>
          <Icon name="settings" size={20} color={colors.muted} />
          <T v="body">Pengaturan</T>
        </Pressable>
      </View>
    </View>
  );
}

function TabBar() {
  const path = usePathname();
  const gifts = useGiftCount();
  const { width } = useLayout();
  const barW = Math.min(width - 20, 560);
  const slots = [TABS[0], TABS[1], null, TABS[2], TABS[3]];
  return (
    <View pointerEvents="box-none" style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', zIndex: 20 }, css({ position: 'fixed', paddingBottom: 'max(10px, env(safe-area-inset-bottom))' })]}>
      <View accessibilityRole="navigation" style={[{ width: barW, height: 70, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,.97)', borderRadius: 35, borderWidth: 2, borderColor: colors.line, alignItems: 'stretch' }, css({ ...shadow.float, backdropFilter: 'blur(10px)' })]}>
        {slots.map((t, i) => {
          if (!t) return <View key="gap" style={{ flex: 1 }} />;
          const on = tabActive(path, t.match);
          return (
            <Pressable key={t.href} accessibilityRole="link" accessibilityLabel={t.label} accessibilityState={{ selected: on }}
              onPress={() => router.navigate(t.href as never)}
              style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 }, css({ cursor: 'pointer' })]}>
              <View style={{ backgroundColor: on ? colors.accentSoft : 'transparent', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 4 }}>
                <Icon name={t.icon} size={22} color={on ? colors.accent : '#8EA083'} />
              </View>
              <T v="chip" style={{ fontSize: 11, color: on ? colors.accent : '#7E9172', fontFamily: on ? fonts.bold : fonts.semibold }} numberOfLines={1}>{t.label}</T>
              {t.href === '/me' && <CountBadge n={gifts} style={{ position: 'absolute', top: 4, left: '54%' }} />}
            </Pressable>
          );
        })}
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: -30, alignItems: 'center' }}>
          <View style={[{ width: 78, height: 78, borderRadius: 39, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }, css(shadow.float)]}>
            <Pressable accessibilityRole="button" accessibilityLabel="Tambah tugas" onPress={() => router.push('/task/new')}
              style={({ pressed }) => [{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.94 : 1 }] }, css({ backgroundImage: linear(colors.accentGradient, 160), ...shadow.button, cursor: 'pointer' })]}>
              <Icon name="plus" size={32} color="#fff" />
            </Pressable>
          </View>
          <T v="chip" style={{ marginTop: 2, color: colors.accent, fontFamily: fonts.bold, fontSize: 11 }}>Tambah</T>
        </View>
      </View>
    </View>
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
    <View style={[{ flex: 1, flexDirection: 'row', backgroundColor: colors.bg }, css({ minHeight: '100vh', backgroundImage: linear(colors.bgGradient, 180), backgroundAttachment: 'fixed' })]}>
      <DecoLayer />
      {isDesktop && <Sidebar />}
      <Animated.View style={{ flex: 1, minWidth: 0, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
        {children}
      </Animated.View>
      {!isDesktop && !path.startsWith('/task/') && <TabBar />}
      <MiniTimer bottom={isDesktop ? 20 : 112} />
    </View>
  );
}

/** Page wrapper: scrollable, centered, with title and header actions. */
/** `switcher`: a view toggle shown beside the title on wide screens and on its own row on phones. */
export function Page({ title, subtitle, children, actions, back, switcher }: { title: string; subtitle?: string; children: ReactNode; actions?: ReactNode; back?: boolean; switcher?: ReactNode }) {
  const { isDesktop, isMobile } = useLayout();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[{ padding: isMobile ? 16 : 24, paddingBottom: isDesktop ? 60 : 170, gap: 14, width: '100%', maxWidth: 1240, alignSelf: 'center' }, css({ paddingTop: isMobile ? 'max(16px, env(safe-area-inset-top))' : 24 })]}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <Row gap={10} style={{ flex: 1, minWidth: 0 }}>
          {back && <IconButton label="Kembali" onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))}><Icon name="chevron-left" /></IconButton>}
          <View style={{ flex: 1, minWidth: 0 }}>
            <T v="title" accessibilityRole="header" style={{ fontSize: isMobile ? 26 : 30, lineHeight: isMobile ? 34 : 38 }}>{title}</T>
            {subtitle ? <T v="muted">{subtitle}</T> : null}
          </View>
        </Row>
        {actions || (switcher && !isMobile) ? <Row gap={8} style={{ flexShrink: 0 }}>{!isMobile && switcher}{actions}</Row> : null}
      </Row>
      {isMobile && switcher ? <View style={{ marginTop: -4 }}>{switcher}</View> : null}
      {children}
    </ScrollView>
  );
}

/** Default header actions: Settings, plus "Tambah" when a page can prefill a date (calendar). */
export function HeaderActions({ addDate }: { addDate?: string }) {
  const { isMobile } = useLayout();
  return (
    <>
      {addDate && !isMobile ? <IconButton label="Tambah tugas di tanggal ini" bg={colors.accentSoft} onPress={() => router.push({ pathname: '/task/new', params: { date: addDate } })}><Icon name="plus" color={colors.accent} /></IconButton> : null}
      <IconButton label="Pengaturan" onPress={() => router.push('/settings')}><Icon name="settings" /></IconButton>
    </>
  );
}
