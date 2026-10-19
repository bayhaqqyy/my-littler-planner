import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { colors, radius, shadow } from '@/theme/theme';
import { useUi } from '@/store/ui';
import { useStore } from '@/store/store';
import { useLayout, useReduceMotion, useCharacterName } from '@/store/hooks';
import { MiniAzza, Flame, HeartShape, StarShape, DaisyArt } from '@/components/illustrations';
import Svg from 'react-native-svg';
import { css, IconButton, T, Button, Row } from './primitives';
import { Icon } from './Icon';

/** Bottom sheet on mobile, centered dialog on larger screens. */
export function Sheet({ visible, onClose, title, children, footer, wide }: {
  visible: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean;
}) {
  const { isMobile } = useLayout();
  return (
    <Modal visible={visible} transparent animationType={isMobile ? 'slide' : 'fade'} onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: isMobile ? 'flex-end' : 'center', alignItems: 'center' }}>
        <Pressable accessibilityLabel="Tutup" onPress={onClose} style={[{ position: 'absolute', inset: 0 } as object, { backgroundColor: 'rgba(74,59,82,0.28)' }]} />
        <View
          accessibilityViewIsModal
          accessibilityLabel={title}
          style={[
            { backgroundColor: '#fff', width: '100%', maxWidth: isMobile ? undefined : wide ? 720 : 520, maxHeight: '92%', borderTopLeftRadius: 26, borderTopRightRadius: 26, borderBottomLeftRadius: isMobile ? 0 : 26, borderBottomRightRadius: isMobile ? 0 : 26, borderWidth: 1, borderColor: colors.line },
            css({ boxShadow: '0 12px 40px rgba(194,69,122,.18)', paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : 0 }),
          ]}
        >
          <Row style={{ justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 }}>
            <T v="pageTitle" style={{ fontSize: 20, flex: 1 }} accessibilityRole="header">{title}</T>
            <IconButton label="Tutup" onPress={onClose} size={40}><Icon name="close" size={18} /></IconButton>
          </Row>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 18, gap: 14 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {footer ? <View style={{ borderTopWidth: 1, borderColor: colors.line, padding: 14 }}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

export function ConfirmDialog({ visible, title, message, confirmLabel = 'Hapus', onConfirm, onCancel }: {
  visible: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Sheet visible={visible} onClose={onCancel} title={title}
      footer={<Row style={{ justifyContent: 'flex-end' }}><Button kind="outline" label="Batal" onPress={onCancel} /><Button kind="danger" label={confirmLabel} onPress={onConfirm} /></Row>}>
      <T>{message}</T>
    </Sheet>
  );
}

/** Toasts with Mini Azza's face (cheers) or the streak flame. */
export function ToastHost() {
  const toasts = useUi((s) => s.toasts);
  const equipped = useStore((s) => s.wardrobe.equipped);
  const { isMobile } = useLayout();
  return (
    <View pointerEvents="box-none" style={[{ position: 'absolute', left: 0, right: 0, top: isMobile ? 12 : 20, alignItems: 'center', gap: 8, zIndex: 50 }, css({ position: 'fixed' })]}>
      {toasts.map((t) => (
        <ToastItem key={t.id} text={t.text}>
          {t.kind === 'streak' ? <Flame size={34} /> : <MiniAzza faceOnly size={38} pose="happy" equipped={equipped} />}
        </ToastItem>
      ))}
    </View>
  );
}

function ToastItem({ text, children }: { text: string; children: ReactNode }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(a, { toValue: 1, useNativeDriver: false, friction: 6 }).start(); }, [a]);
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: radius.pill, paddingVertical: 6, paddingLeft: 6, paddingRight: 18, borderWidth: 1, borderColor: colors.line, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }] },
        css({ boxShadow: '0 8px 24px rgba(194,69,122,.18)' }),
      ]}
    >
      {children}
      <T v="cardTitle">{text}</T>
    </Animated.View>
  );
}

/** Particles (hearts, stars, flowers) bursting from a checkbox. */
export function BurstHost() {
  const burst = useUi((s) => s.burst);
  const reduce = useReduceMotion();
  if (!burst || reduce) return null;
  return <Burst key={burst.id} x={burst.x} y={burst.y} />;
}

function Burst({ x, y }: { x: number; y: number }) {
  const parts = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const ang = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 40 + Math.random() * 40;
    return { dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist - 20, kind: i % 3, color: ['#FF9EC2', '#FFE27A', '#C3B0EE', '#9CD3F5', '#A8DABD'][i % 5], rot: Math.random() * 360 };
  }), []);
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(t, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(); }, [t]);
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', left: x, top: y, zIndex: 60 }, css({ position: 'fixed' })]} aria-hidden>
      {parts.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: -8, top: -8,
          opacity: t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
          transform: [
            { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] }) },
            { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, p.dy] }) },
            { scale: t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.3, 1.1, 0.8] }) },
            { rotate: `${p.rot}deg` },
          ],
        }}>
          <Svg width={16} height={16} viewBox="0 0 20 20">
            {p.kind === 0 ? <HeartShape color={p.color} /> : p.kind === 1 ? <StarShape color={p.color} /> : <DaisyArt s={0.5} center={p.color} />}
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
}

/** Confetti + dancing Mini Azza when every task of the day is done. */
export function CelebrationHost() {
  const celebrate = useUi((s) => s.celebrate);
  const setCelebrate = useUi((s) => s.setCelebrate);
  const equipped = useStore((s) => s.wardrobe.equipped);
  const reduce = useReduceMotion();
  const { character } = useCharacterName();
  useEffect(() => {
    if (!celebrate) return;
    const tm = setTimeout(() => setCelebrate(false), 4000);
    return () => clearTimeout(tm);
  }, [celebrate, setCelebrate]);
  if (!celebrate) return null;
  return (
    <Pressable onPress={() => setCelebrate(false)} accessibilityLabel="Tutup perayaan"
      style={[{ position: 'absolute', inset: 0, zIndex: 70, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,247,249,0.6)' } as object, css({ position: 'fixed' })]}>
      {!reduce && <Confetti />}
      <View accessibilityRole="alert" style={[{ alignItems: 'center', backgroundColor: '#fff', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: colors.line }, css(shadow.button)]}>
        <View style={reduce ? null : css({ animationKeyframes: [{ '0%': { transform: 'rotate(-8deg) translateY(0)' }, '50%': { transform: 'rotate(8deg) translateY(-10px)' }, '100%': { transform: 'rotate(-8deg) translateY(0)' } }], animationDuration: '0.8s', animationIterationCount: 'infinite' })}>
          <MiniAzza size={130} pose="dance" equipped={equipped} />
        </View>
        <T v="greeting" style={{ marginTop: 8 }}>All tasks done! 🎉</T>
        <T v="muted">{character} bangga banget sama kamu hari ini</T>
      </View>
    </Pressable>
  );
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 600, dur: 2000 + Math.random() * 1600, color: ['#FF9EC2', '#FFC48F', '#FFE27A', '#9EE0B5', '#9CD3F5', '#C3B0EE'][i % 6], w: 6 + Math.random() * 6, rot: Math.random() * 360,
  })), []);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden' }} aria-hidden>
      {pieces.map((p, i) => (
        <View key={i} style={[
          { position: 'absolute', top: -20, left: `${p.left}%`, width: p.w, height: p.w * 1.6, borderRadius: 2, backgroundColor: p.color },
          css({ animationKeyframes: [{ from: { transform: `translateY(0) rotate(${p.rot}deg)` }, to: { transform: `translateY(110vh) rotate(${p.rot + 540}deg)` } }], animationDuration: `${p.dur}ms`, animationDelay: `${p.delay}ms`, animationTimingFunction: 'ease-in', animationFillMode: 'forwards' }),
        ]} />
      ))}
    </View>
  );
}

/** In-app reminder banners with Start / Snooze / Done actions. */
export function ReminderBannerHost({ onStart, onSnooze, onDone, onReschedule }: {
  onStart: (key: string, id: string) => void; onSnooze: (key: string, id: string) => void; onDone: (key: string, id: string) => void;
  /** Deadline reached: pick a new date/time for this occurrence. */
  onReschedule: (key: string, id: string) => void;
}) {
  const banners = useUi((s) => s.banners);
  const drop = useUi((s) => s.dropBanner);
  const equipped = useStore((s) => s.wardrobe.equipped);
  const { isMobile } = useLayout();
  if (!banners.length) return null;
  const b = banners[0];
  return (
    <View pointerEvents="box-none" style={[{ position: 'absolute', left: 0, right: 0, top: isMobile ? 10 : 18, alignItems: 'center', zIndex: 65, paddingHorizontal: 12 }, css({ position: 'fixed' })]}>
      <View accessibilityRole="alert" accessibilityLiveRegion="assertive" style={[
        { width: '100%', maxWidth: 520, backgroundColor: '#fff', borderRadius: 22, borderWidth: 2, borderColor: '#FFC1D6', padding: 14, gap: 10 },
        css({ boxShadow: '0 12px 32px rgba(194,69,122,.25)', backgroundImage: 'linear-gradient(135deg,#FFF3F7,#F8F0FF)' }),
      ]}>
        <Row gap={12}>
          <MiniAzza faceOnly size={52} pose="surprised" equipped={equipped} />
          <View style={{ flex: 1 }}>
            <T v="cardTitle">{b.title}</T>
            <T v="muted">{b.body}</T>
          </View>
          <IconButton label="Tutup pengingat" size={36} onPress={() => drop(b.id)}><Icon name="close" size={16} /></IconButton>
        </Row>
        <Row wrap>
          {b.kind === 'deadline-due' ? (
            <>
              <Button small label="Tandai selesai" onPress={() => onDone(b.occurrenceKey, b.id)} />
              <Button small kind="soft" label="Jadwalkan ulang" onPress={() => onReschedule(b.occurrenceKey, b.id)} />
            </>
          ) : b.kind === 'deadline-before' ? (
            <>
              <Button small label="Kerjakan sekarang" onPress={() => onStart(b.occurrenceKey, b.id)} />
              <Button small kind="soft" label="Tandai selesai" onPress={() => onDone(b.occurrenceKey, b.id)} />
              <Button small kind="ghost" label="Tunda 15 menit" onPress={() => onSnooze(b.occurrenceKey, b.id)} />
            </>
          ) : (
            <>
              {b.kind === 'end'
                ? <Button small label="Tandai selesai" onPress={() => onDone(b.occurrenceKey, b.id)} />
                : <Button small label="Mulai sekarang" onPress={() => onStart(b.occurrenceKey, b.id)} />}
              <Button small kind="soft" label="Tunda 5 menit" onPress={() => onSnooze(b.occurrenceKey, b.id)} />
            </>
          )}
          {banners.length > 1 ? <T v="muted">+{banners.length - 1} lagi</T> : null}
        </Row>
      </View>
    </View>
  );
}

export function goTimer(key: string) {
  router.push({ pathname: '/timer', params: { occ: key } });
}
