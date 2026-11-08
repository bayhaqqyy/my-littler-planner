import { View } from 'react-native';
import { MiniAzza } from '@/components/illustrations';
import { useStore } from '@/store/store';
import { T } from './primitives';
import { Flower, Friend, FriendArt } from '@/components/avatar/friends';

export function EmptyState({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  const equipped = useStore((s) => s.wardrobe.equipped);
  return (
    <View style={{ alignItems: 'center', paddingVertical: 18, gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }} aria-hidden>
        <Friend kind="landak" size={46} />
        <MiniAzza size={70} equipped={equipped} showPet={false} />
        <Friend kind="lebah" size={38} />
      </View>
      <T v="cardTitle" style={{ textAlign: 'center' }}>{title}</T>
      {sub ? <T v="muted" style={{ textAlign: 'center' }}>{sub}</T> : null}
      {children}
    </View>
  );
}
