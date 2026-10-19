import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ITEMS, SLOTS, SLOT_LABEL, type Slot } from '@/domain';
import { useStore } from '@/store/store';
import { useCharacterName, useLayout } from '@/store/hooks';
import { Card, css, RarityPill, Segmented, T } from '@/components/ui/primitives';
import { ItemThumb, MiniAzza } from '@/components/illustrations';
import { colors, radius } from '@/theme/theme';

/** Lemari Mini <username>: tabs per slot, locked items blurred as "???". */
export function Wardrobe() {
  const wardrobe = useStore((s) => s.wardrobe);
  const equip = useStore((s) => s.equip);
  const [slot, setSlot] = useState<Slot>('hair');
  const { character } = useCharacterName();
  const { isMobile } = useLayout();
  const items = ITEMS.filter((i) => i.slot === slot);
  const ownedCount = ITEMS.filter((i) => wardrobe.owned.includes(i.id)).length;
  return (
    <Card title={`Lemari ${character}`} right={<T v="muted">{ownedCount}/{ITEMS.length} item</T>}>
      <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
        <View style={[{ alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: radius.card, minWidth: 190 }, css({ backgroundImage: 'linear-gradient(160deg,#FFF3F7,#F6F1FF)' })]}>
          <MiniAzza size={150} equipped={wardrobe.equipped} />
        </View>
        <View style={isMobile ? { gap: 12 } : { flex: 1, gap: 12, minWidth: 0 }}>
          <Segmented label="Kategori lemari" fill={isMobile} value={slot} onChange={setSlot} items={SLOTS.map((s) => ({ key: s, label: SLOT_LABEL[s] }))} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {items.map((it) => {
              const owned = wardrobe.owned.includes(it.id);
              const on = wardrobe.equipped[it.slot] === it.id;
              return (
                <Pressable
                  key={it.id}
                  disabled={!owned}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on, disabled: !owned }}
                  accessibilityLabel={owned ? `${it.name}${on ? ', sedang dipakai' : ''}` : 'Item terkunci'}
                  onPress={() => equip(it.slot, on && it.slot !== 'outfit' ? undefined : it.id)}
                  style={[
                    { width: isMobile ? '31%' : 104, alignItems: 'center', gap: 4, padding: 8, borderRadius: 16, borderWidth: on ? 2 : 1, borderColor: on ? colors.accent : colors.line, backgroundColor: on ? colors.accentSoft : '#fff' },
                    css({ cursor: owned ? 'pointer' : 'default' }),
                  ]}
                >
                  <View style={owned ? null : css({ filter: 'blur(4px) grayscale(.6)', opacity: 0.5 })}>
                    <ItemThumb itemId={it.id} size={64} />
                  </View>
                  <T v="small" numberOfLines={2} style={{ textAlign: 'center', minHeight: 32 }}>{owned ? it.name : '???'}</T>
                  {owned ? <RarityPill r={it.rarity} /> : <T v="chip" style={{ color: colors.muted }}>🔒 Terkunci</T>}
                </Pressable>
              );
            })}
          </View>
          <T v="muted">Ketuk item untuk memakai{slot !== 'outfit' ? ', ketuk lagi untuk melepas' : ' (baju selalu terpasang satu)'}.</T>
        </View>
      </View>
    </Card>
  );
}
