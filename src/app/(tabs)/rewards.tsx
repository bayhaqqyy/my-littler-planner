import { FEATURES } from '@/config/features';
import { disabledLook, GiftsDisabledNote } from '@/components/rewards/GiftsDisabled';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ITEMS, RARITY_LABEL, type GiftBox } from '@/domain';
import { useStore } from '@/store/store';
import { useLayout } from '@/store/hooks';
import { Page, HeaderActions } from '@/components/AppShell';
import { Button, Card, css, Row, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { Hill } from '@/components/deco/Garden';
import { GiftBoxArt } from '@/components/illustrations';
import { GiftReveal } from '@/components/rewards/GiftReveal';
import { Wardrobe } from '@/components/rewards/Wardrobe';
import { BadgeGrid, LevelCard, StreakCard } from '@/components/rewards/Cards';
import { colors, fonts, giftColors, radius, shadow } from '@/theme/theme';

const ORDER = { legenda: 0, streak: 1, super: 2, langka: 3, biasa: 4 } as const;

const RAR_INK: Record<string, string> = { biasa: '#2F7A3C', langka: '#6A4CC9', super: '#C2336B', streak: '#B9541F', legenda: '#9A6400' };
const RAR_SOFT: Record<string, string> = { biasa: '#E4F6E2', langka: '#EEE7FF', super: '#FFE3EC', streak: '#FFE9DC', legenda: '#FFF1CC' };

export default function RewardsScreen() {
  const giftBoxes = useStore((s) => s.giftBoxes);
  const [opening, setOpening] = useState<GiftBox>();
  const { isDesktop } = useLayout();
  const gifts = Object.values(giftBoxes).sort((a, b) => ORDER[a.rarity] - ORDER[b.rarity] || a.createdAt.localeCompare(b.createdAt));
  const top = gifts[0];
  const rest = gifts.slice(1);
  const owned = useStore((s) => s.wardrobe.owned);
  const collectable = ITEMS.filter((i) => i.rarity !== 'default').length;
  const ownedCollect = ITEMS.filter((i) => i.rarity !== 'default' && owned.includes(i.id)).length;

  return (
    <Page title="Lemari & Kado" subtitle="Semua item didapat dari kado 🎁" actions={<HeaderActions />}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 16, alignItems: isDesktop ? 'stretch' : undefined }}>
        <View style={[{ flex: isDesktop ? 1.3 : undefined, borderRadius: radius.greeting, borderWidth: 2, borderColor: '#fff', overflow: 'hidden', minHeight: 250, padding: 18 }, css({ backgroundImage: 'linear-gradient(165deg,#FFE3EC,#FFF4F7 60%,#F2FAEB)', ...shadow.card })]}>
          <View aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}><Hill width="100%" height={110} /></View>
          {!FEATURES.gifts && <GiftsDisabledNote />}
          {top ? (
            <View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }, FEATURES.gifts ? null : disabledLook]}>
              <View style={{ flex: 1, gap: 6, zIndex: 1 }}>
                <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Icon name="gift" size={15} color={giftColors[top.rarity].ribbon} />
                  <T v="small" style={{ fontFamily: fonts.bold, color: colors.text }}>Kado {RARITY_LABEL[top.rarity]}</T>
                </View>
                <T v="greeting" style={{ fontSize: isDesktop ? 26 : 22 }}>{gifts.length} kado menunggu</T>
                <T v="muted">Dari {top.source}{top.early ? ', selesai lebih awal ✨' : ''}</T>
                <Button label="Buka kado" disabled={!FEATURES.gifts} onPress={() => setOpening(top)} style={{ alignSelf: 'flex-start', marginTop: 6 }} />
              </View>
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }}>
                <GiftBoxArt size={isDesktop ? 150 : 118} rarity={top.rarity} />
                <T aria-hidden style={{ position: 'absolute', top: -4, right: -6, fontSize: 22 }}>✨</T>
                <T aria-hidden style={{ position: 'absolute', bottom: 18, left: -10, fontSize: 16 }}>✨</T>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1, gap: 6, zIndex: 1 }}>
                <T v="greeting" style={{ fontSize: isDesktop ? 26 : 22 }}>Belum ada kado</T>
                <T v="muted">{FEATURES.gifts ? 'Setiap tugas yang selesai memberi satu kado. Semangat!' : 'Untuk sementara tugas yang selesai tidak memberi kado.'}</T>
              </View>
              <View style={{ paddingBottom: 10 }}><GiftBoxArt size={isDesktop ? 130 : 100} rarity="biasa" /></View>
            </View>
          )}
        </View>
        <Card title="Koleksimu" right={<T v="muted">{ownedCollect}/{collectable} item</T>} style={isDesktop ? { flex: 1 } : undefined}>
          <View style={{ gap: 10 }}>
            {(['biasa', 'langka', 'super', 'legenda'] as const).map((r) => {
              const all = ITEMS.filter((i) => i.rarity === r);
              const have = all.filter((i) => owned.includes(i.id)).length;
              return (
                <View key={r} style={{ gap: 4 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <T v="small" style={{ fontFamily: fonts.bold, color: RAR_INK[r] }}>{RARITY_LABEL[r]}</T>
                    <T v="chip" style={{ color: colors.muted }}>{have}/{all.length}</T>
                  </Row>
                  <View style={{ height: 10, borderRadius: 5, backgroundColor: RAR_SOFT[r], overflow: 'hidden' }}>
                    <View style={{ width: `${all.length ? (have / all.length) * 100 : 0}%`, height: 10, borderRadius: 5, backgroundColor: RAR_INK[r] }} />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      {rest.length > 0 && (
        <Card title="Kado lainnya" right={<T v="muted">{rest.length} kado</T>}>
          <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, FEATURES.gifts ? null : disabledLook]}>
            {rest.map((g) => (
              <Pressable key={g.id} accessibilityRole="button" accessibilityLabel={`Buka kado ${RARITY_LABEL[g.rarity]} dari ${g.source}`} disabled={!FEATURES.gifts}
                onPress={() => { if (FEATURES.gifts) setOpening(g); }}
                style={({ pressed }) => [{ flexGrow: 1, flexBasis: 260, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 20, borderWidth: 2, borderColor: colors.line, backgroundColor: '#fff', transform: [{ scale: pressed ? 0.98 : 1 }] }, css({ cursor: 'pointer' })]}>
                <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: RAR_SOFT[g.rarity] ?? '#F4F1F6', alignItems: 'center', justifyContent: 'center' }}><GiftBoxArt size={42} rarity={g.rarity} /></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T v="body" style={{ fontFamily: fonts.bold, color: RAR_INK[g.rarity] ?? colors.text }}>Kado {RARITY_LABEL[g.rarity]}</T>
                  <T v="muted" numberOfLines={1}>Dari {g.source}</T>
                </View>
                <View style={{ backgroundColor: RAR_SOFT[g.rarity] ?? colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7 }}>
                  <T v="small" style={{ fontFamily: fonts.bold, color: RAR_INK[g.rarity] ?? colors.accent }}>Buka</T>
                </View>
              </Pressable>
            ))}
          </View>
        </Card>
      )}

      <Wardrobe />

      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 14 }}>
        <View style={isDesktop ? { flex: 1, minWidth: 0, gap: 14 } : { gap: 14 }}><LevelCard /><StreakCard /></View>
        <View style={isDesktop ? { flex: 1, minWidth: 0, gap: 14 } : { gap: 14 }}><BadgeGrid /></View>
      </View>

      {opening && <GiftReveal box={opening} onClose={() => setOpening(undefined)} />}
    </Page>
  );
}
