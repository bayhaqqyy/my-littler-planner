import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg from 'react-native-svg';
import { GARDEN_MAX, ITEM_BY_ID, ITEMS, RARITY_LABEL, SLOTS, SLOT_LABEL, type Item, type Slot } from '@/domain';
import { useStore } from '@/store/store';
import { useCharacterName, useLayout } from '@/store/hooks';
import { Card, css, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { ItemThumb, MiniAzza } from '@/components/illustrations';
import { GardenArt } from '@/components/avatar/garden';
import { FlowerShape, GardenCloud, Hill } from '@/components/deco/Garden';
import { colors, fonts, radius, shadow } from '@/theme/theme';

const RARITY_TONE: Record<string, { fg: string; bg: string }> = {
  default: { fg: '#7E9172', bg: '#EEF5E8' },
  biasa: { fg: '#2F7A3C', bg: '#E4F6E2' },
  langka: { fg: '#6A4CC9', bg: '#EEE7FF' },
  super: { fg: '#C2336B', bg: '#FFE3EC' },
  streak: { fg: '#B9541F', bg: '#FFE9DC' },
  legenda: { fg: '#9A6400', bg: '#FFF1CC' },
};

function GiftMini({ color }: { color: string }) {
  return <Icon name="gift" size={12} color={color} />;
}

/** Garden scene with the placed decorations standing on the hill. */
export function GardenStage({ placed, height = 210, compact }: { placed: string[]; height?: number; compact?: boolean }) {
  const slots = compact ? [12, 30, 52, 70, 86, 42] : [8, 22, 38, 62, 78, 90];
  const equipped = useStore((s) => s.wardrobe.equipped);
  return (
    <View style={[{ height, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' }, css({ backgroundImage: 'linear-gradient(180deg,#CBEAFF,#EEF8FF)', ...shadow.card })]}>
      <View aria-hidden style={{ position: 'absolute', top: 14, right: 30 }}><Svg width={84} height={42} viewBox="0 0 80 40"><GardenCloud /></Svg></View>
      <View aria-hidden style={{ position: 'absolute', top: 40, left: 20 }}><Svg width={60} height={30} viewBox="0 0 80 40"><GardenCloud /></Svg></View>
      <View aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}><Hill width="100%" height={height * 0.55} flowers={false} /></View>
      {placed.length === 0 && (
        <View style={{ position: 'absolute', top: 18, left: 18, right: 120 }}>
          <T v="small" style={{ fontFamily: fonts.bold }}>Kebunmu masih kosong</T>
          <T v="muted">Pasang dekorasi dari kado untuk menghias halaman Kebun.</T>
        </View>
      )}
      {placed.map((id, i) => (
        <View key={id} style={{ position: 'absolute', left: `${slots[i % slots.length]}%`, bottom: height * 0.18 + (i % 2) * 14, marginLeft: -30 }}>
          <Svg width={compact ? 54 : 62} height={compact ? 54 : 62} viewBox="0 0 60 60"><GardenArt look={ITEM_BY_ID[id]?.look ?? { k: 'pot' }} /></Svg>
        </View>
      ))}
      <View style={{ position: 'absolute', left: '50%', bottom: 8, marginLeft: -34 }}>
        <MiniAzza size={60} equipped={equipped} showPet={false} />
      </View>
      <View style={{ position: 'absolute', right: 12, top: 12, backgroundColor: '#fff', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
        <T v="chip" style={{ color: colors.text }}>{placed.length}/{GARDEN_MAX} terpasang</T>
      </View>
    </View>
  );
}

function AvatarStage({ height }: { height: number }) {
  const equipped = useStore((s) => s.wardrobe.equipped);
  const { isMobile } = useLayout();
  return (
    <View style={[{ height, borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'flex-end' }, css({ backgroundImage: 'linear-gradient(170deg,#FFE7F0,#FFF6E0)', ...shadow.card })]}>
      <View aria-hidden style={{ position: 'absolute', top: 16, right: 28 }}><Svg width={78} height={39} viewBox="0 0 80 40"><GardenCloud /></Svg></View>
      <View aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}><Hill width="100%" height={height * 0.42} /></View>
      {[['10%', 0], ['84%', 1], ['20%', 2], ['74%', 3]].map(([left, c]) => (
        <View key={left as string} aria-hidden style={{ position: 'absolute', left: left as `${number}%`, bottom: 22 + (c as number) * 4 }}>
          <Svg width={18} height={18} viewBox="0 0 24 24"><FlowerShape color={['#FF9EC2', '#FFCE3A', '#B79CFF', '#8EC9FF'][c as number]} /></Svg>
        </View>
      ))}
      <View style={{ marginBottom: 6 }}>
        <MiniAzza size={isMobile ? 132 : 150} pose="happy" equipped={equipped} />
      </View>
    </View>
  );
}

function Tile({ it, owned, on, onPress, width }: { it: Item; owned: boolean; on: boolean; onPress: () => void; width: number | `${number}%` }) {
  const tone = RARITY_TONE[it.rarity];
  return (
    <Pressable
      disabled={!owned}
      accessibilityRole="button"
      accessibilityState={{ selected: on, disabled: !owned }}
      accessibilityLabel={owned ? `${it.name}, ${RARITY_LABEL[it.rarity]}${on ? ', sedang dipakai' : ''}` : `${it.name}, belum punya, dari kado ${RARITY_LABEL[it.rarity]}`}
      onPress={onPress}
      style={(st) => [
        { width, alignItems: 'center', paddingTop: 8, paddingBottom: 8, paddingHorizontal: 4, borderRadius: 20, borderWidth: on ? 3 : 2, borderColor: on ? '#FF8DB6' : colors.line, backgroundColor: owned ? '#fff' : '#F3F1F5', transform: [{ translateY: owned && (st as { hovered?: boolean }).hovered ? -2 : 0 }] },
        owned && it.rarity === 'legenda' && !on ? { borderColor: '#EDB52F', backgroundColor: '#FFFBEA' } : null,
        css({ cursor: owned ? 'pointer' : 'default', transitionDuration: '150ms' }),
      ]}
    >
      <View style={owned ? null : css({ filter: 'grayscale(.5)', opacity: 0.38 })}>
        <ItemThumb itemId={it.id} size={60} />
      </View>
      <T v="chip" numberOfLines={2} style={{ textAlign: 'center', minHeight: 28, marginTop: 2, color: owned ? colors.text : '#8E8698', fontFamily: fonts.bold }}>{it.name}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: tone.bg, borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 1, marginTop: 2 }}>
        {!owned && <GiftMini color={tone.fg} />}
        <T v="chip" style={{ fontSize: 10, color: tone.fg }}>{it.rarity === 'default' ? 'Bawaan' : RARITY_LABEL[it.rarity].replace(' Langka', '')}</T>
      </View>
      {on && (
        <View style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF8DB6', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={14} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

/** Lemari Mini <username>: a stage with Mini (or the garden), category chips and every item. */
export function Wardrobe() {
  const wardrobe = useStore((s) => s.wardrobe);
  const equip = useStore((s) => s.equip);
  const [slot, setSlot] = useState<Slot>('hair');
  const { character } = useCharacterName();
  const { isMobile, width } = useLayout();
  const items = ITEMS.filter((i) => i.slot === slot);
  const placed = wardrobe.garden ?? [];
  const isOn = (it: Item) => (it.slot === 'garden' ? placed.includes(it.id) : wardrobe.equipped[it.slot] === it.id);
  const total = ITEMS.filter((i) => i.rarity !== 'default').length;
  const ownedCount = ITEMS.filter((i) => i.rarity !== 'default' && wardrobe.owned.includes(i.id)).length;
  const tileW: number | `${number}%` = isMobile ? (width < 380 ? '31%' : '23%') : 112;
  const sideBySide = !isMobile && width >= 1100;

  const stage = slot === 'garden' ? <GardenStage placed={placed} height={sideBySide ? 300 : 220} /> : <AvatarStage height={sideBySide ? 300 : 220} />;

  return (
    <Card title={`Lemari ${character}`} right={<T v="muted">{ownedCount}/{total} item</T>}>
      <View style={{ flexDirection: sideBySide ? 'row' : 'column', gap: 16, alignItems: sideBySide ? 'flex-start' : 'stretch' }}>
        <View style={sideBySide ? [{ width: 300 }, css({ position: 'sticky', top: 20 })] : null}>
          {stage}
          <T v="muted" style={{ marginTop: 8, textAlign: 'center' }}>
            {slot === 'garden' ? `Ketuk dekorasi untuk memasang atau melepas (maks. ${GARDEN_MAX}).` : `Ketuk item untuk memakai${slot !== 'outfit' ? ', ketuk lagi untuk melepas' : ''}.`}
          </T>
        </View>
        <View style={{ flex: sideBySide ? 1 : undefined, gap: 12, minWidth: 0 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }} accessibilityRole="tablist" accessibilityLabel="Kategori lemari">
            {SLOTS.map((s) => {
              const on = s === slot;
              const inSlot = ITEMS.filter((i) => i.slot === s && i.rarity !== 'default');
              const have = inSlot.filter((i) => wardrobe.owned.includes(i.id)).length;
              return (
                <Pressable key={s} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={`${SLOT_LABEL[s]}, ${have} dari ${inSlot.length}`} onPress={() => setSlot(s)}
                  style={[{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: on ? '#FF8DB6' : '#fff', borderWidth: on ? 0 : 2, borderColor: colors.line }, css({ cursor: 'pointer' })]}>
                  <T v="small" style={{ fontFamily: fonts.bold, color: on ? '#fff' : colors.text, fontSize: 13.5 }}>{SLOT_LABEL[s]}</T>
                  <T v="chip" style={{ color: on ? '#FFE3EE' : colors.muted }}>{have}/{inSlot.length}</T>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {items.map((it) => {
              const owned = wardrobe.owned.includes(it.id);
              const on = isOn(it);
              return (
                <Tile key={it.id} it={it} owned={owned} on={on} width={tileW}
                  onPress={() => (it.slot === 'garden' ? equip('garden', it.id) : equip(it.slot, on && it.slot !== 'outfit' ? undefined : it.id))} />
              );
            })}
          </View>
        </View>
      </View>
    </Card>
  );
}
