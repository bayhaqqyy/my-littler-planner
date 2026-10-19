import { View } from 'react-native';
import Svg from 'react-native-svg';
import { MiniAzza, BunnyArt, ChickArt } from '@/components/illustrations';
import { useStore } from '@/store/store';
import { T } from './primitives';

export function EmptyState({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  const equipped = useStore((s) => s.wardrobe.equipped);
  return (
    <View style={{ alignItems: 'center', paddingVertical: 18, gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }} aria-hidden>
        <Svg width={44} height={44} viewBox="0 0 60 62"><BunnyArt /></Svg>
        <MiniAzza size={70} equipped={equipped} showPet={false} />
        <Svg width={38} height={38} viewBox="0 0 60 60"><ChickArt /></Svg>
      </View>
      <T v="cardTitle" style={{ textAlign: 'center' }}>{title}</T>
      {sub ? <T v="muted" style={{ textAlign: 'center' }}>{sub}</T> : null}
      {children}
    </View>
  );
}
