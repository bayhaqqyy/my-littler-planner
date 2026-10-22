import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { ITEM_BY_ID, MEMORY_FLOWER, RARITY_LABEL, type GiftBox } from '@/domain';
import { useStore, type OpenResult } from '@/store/store';
import { useCharacterName, useReduceMotion } from '@/store/hooks';
import { Button, Card, RarityPill, Row, T } from '@/components/ui/primitives';
import { Sheet } from '@/components/ui/Overlays';
import { GiftBoxArt, MiniAzza, Tulip } from '@/components/illustrations';
import { colors } from '@/theme/theme';

/** Opening animation: the box wiggles twice (900 ms), then the item pops in (600 ms). */
export function GiftReveal({ box, onClose }: { box?: GiftBox; onClose: () => void }) {
  const openGift = useStore((s) => s.openGift);
  const equip = useStore((s) => s.equip);
  const equipped = useStore((s) => s.wardrobe.equipped);
  const { character } = useCharacterName();
  const reduce = useReduceMotion();
  const [res, setRes] = useState<OpenResult>();
  const [stage, setStage] = useState<'shake' | 'reveal'>('shake');
  const shake = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const opened = useRef<string | null>(null);

  useEffect(() => {
    if (!box || opened.current === box.id) return;
    opened.current = box.id;
    setStage('shake');
    setRes(openGift(box.id));
    shake.setValue(0); pop.setValue(0);
    const toReveal = () => {
      setStage('reveal');
      if (reduce) pop.setValue(1);
      else Animated.timing(pop, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(2)), useNativeDriver: false }).start();
    };
    if (reduce) { toReveal(); return; }
    Animated.timing(shake, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: false }).start(toReveal);
  }, [box, openGift, reduce, shake, pop]);

  if (!box) return null;
  const item = res && res.itemId !== MEMORY_FLOWER ? ITEM_BY_ID[res.itemId] : undefined;
  const wearing = item ? { ...equipped, [item.slot]: item.id } : equipped;
  const rotate = shake.interpolate({ inputRange: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1], outputRange: ['0deg', '-12deg', '12deg', '-12deg', '0deg', '-12deg', '12deg', '-12deg', '0deg'] });

  return (
    <Sheet visible onClose={onClose} title={stage === 'shake' ? 'Membuka kado…' : !item ? 'Bunga kenangan 🌷' : res?.duplicate ? 'Isinya item yang sama 😊' : box.rarity === 'legenda' ? 'Item Legenda! 👑' : 'Yay, dapat item baru!'}>
      <View style={{ alignItems: 'center', gap: 10, minHeight: 260, justifyContent: 'center' }}>
        {stage === 'shake' ? (
          <Animated.View style={{ transform: [{ rotate }, { scale: shake.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.08, 1.15] }) }] }}>
            <GiftBoxArt size={150} rarity={box.rarity} />
          </Animated.View>
        ) : (
          <Animated.View style={{ alignItems: 'center', gap: 8, opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }}>
            {item ? <MiniAzza size={150} pose="surprised" equipped={wearing} /> : <Tulip size={120} color="#C3B0EE" />}
            <Row gap={8}>
              <T v="greeting">{item ? item.name : 'Bunga kenangan'}</T>
              {item && <RarityPill r={item.rarity} />}
            </Row>
            <T v="muted" style={{ textAlign: 'center' }}>
              {item ? item.description : `Semua item sudah kamu miliki! ${character} menyimpan bunga ini sebagai kenangan.`}
            </T>
            {res?.duplicate && (
              <View style={{ backgroundColor: '#EFE7EB', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 }}>
                <T v="small" style={{ color: '#5E4D66', textAlign: 'center' }}>Kamu sudah punya item ini, jadi tidak ada item baru kali ini. Coba lagi di kado berikutnya!</T>
              </View>
            )}
            <T v="muted">Dari: {box.source} · {RARITY_LABEL[box.rarity]}</T>
            
            <Row style={{ marginTop: 6 }}>
              {item && !res?.duplicate && <Button label="Pakai sekarang" onPress={() => { equip(item.slot, item.id); onClose(); }} />}
              <Button kind={item && !res?.duplicate ? 'outline' : 'primary'} label={item && !res?.duplicate ? 'Simpan dulu' : 'Oke'} onPress={onClose} />
            </Row>
          </Animated.View>
        )}
      </View>
      <View style={{ height: 1, backgroundColor: colors.line }} />
    </Sheet>
  );
}
