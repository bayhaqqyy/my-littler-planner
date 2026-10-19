import { View, type ViewStyle } from 'react-native';
import Svg from 'react-native-svg';
import { BunnyArt, ButterflyShape, ChickArt, CloudShape, HeartShape, KittyArt, SparkleShape, StarShape, TulipArt } from '@/components/illustrations';
import { useLayout, useReduceMotion } from '@/store/hooks';
import { css } from '@/components/ui/primitives';

const float = (dur: number, delay = 0): ViewStyle =>
  css({ animationKeyframes: [{ '0%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' }, '100%': { transform: 'translateY(0)' } }], animationDuration: `${dur}s`, animationDelay: `${delay}s`, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' });

function Item({ style, w, h, vb, dur, delay, children }: { style: ViewStyle; w: number; h: number; vb: string; dur: number; delay?: number; children: React.ReactNode }) {
  const reduce = useReduceMotion();
  return (
    <View style={[{ position: 'absolute' }, style, css({ filter: 'drop-shadow(0 2px 3px rgba(200,140,170,.15))' }), reduce ? null : float(dur, delay)]}>
      <Svg width={w} height={h} viewBox={vb}>{children}</Svg>
    </View>
  );
}

/** Soft floating background decoration. Hidden from screen readers; lighter on mobile. */
export function DecoLayer() {
  const { isMobile } = useLayout();
  return (
    <View pointerEvents="none" aria-hidden
      style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden' }, css({ position: 'fixed' })]}>
      <Item style={{ top: 30, right: '8%' }} w={110} h={66} vb="0 0 50 30" dur={9}><CloudShape color="#FFFFFF" /></Item>
      <Item style={{ top: '38%', left: -10 }} w={90} h={54} vb="0 0 50 30" dur={10} delay={1}><CloudShape color="#E2F2FD" /></Item>
      <Item style={{ top: '62%', right: -14 }} w={100} h={60} vb="0 0 50 30" dur={8} delay={2}><CloudShape color="#F8E6F8" /></Item>
      <Item style={{ top: 120, left: '42%' }} w={18} h={18} vb="0 0 20 20" dur={7}><HeartShape color="#FFC1D6" /></Item>
      <Item style={{ top: '28%', right: '22%' }} w={16} h={16} vb="0 0 20 20" dur={8} delay={1.5}><StarShape color="#FFE5AE" /></Item>
      <Item style={{ top: '75%', left: '30%' }} w={16} h={16} vb="0 0 20 20" dur={7.5} delay={0.5}><SparkleShape color="#D6C5F4" /></Item>
      {!isMobile && (
        <>
          <Item style={{ top: '18%', left: '26%' }} w={34} h={28} vb="0 0 30 24" dur={9} delay={0.8}><ButterflyShape /></Item>
          <Item style={{ top: '55%', right: '30%' }} w={28} h={24} vb="0 0 30 24" dur={10} delay={2.2}><ButterflyShape a="#C5E6FA" b="#FFE5AE" /></Item>
          <Item style={{ top: '48%', left: '55%' }} w={14} h={14} vb="0 0 20 20" dur={7} delay={3}><HeartShape color="#D6C5F4" /></Item>
          <View style={{ position: 'absolute', right: 12, bottom: 0, flexDirection: 'row', alignItems: 'flex-end', opacity: 0.9 }}>
            <Svg width={30} height={45} viewBox="0 0 40 60"><TulipArt color="#FF9EC2" /></Svg>
            <Svg width={44} height={44} viewBox="0 0 60 62"><BunnyArt /></Svg>
            <Svg width={26} height={39} viewBox="0 0 40 60"><TulipArt color="#C3B0EE" /></Svg>
            <Svg width={36} height={36} viewBox="0 0 60 56"><KittyArt /></Svg>
            <Svg width={28} height={42} viewBox="0 0 40 60"><TulipArt color="#FFE27A" /></Svg>
            <Svg width={30} height={30} viewBox="0 0 60 60"><ChickArt /></Svg>
          </View>
        </>
      )}
    </View>
  );
}
