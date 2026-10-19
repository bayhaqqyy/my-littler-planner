import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { RARITY_LABEL, type GiftBox } from '@/domain';
import { useStore } from '@/store/store';
import { useLayout } from '@/store/hooks';
import { Page, HeaderActions } from '@/components/AppShell';
import { Card, css, T } from '@/components/ui/primitives';
import { EmptyState } from '@/components/ui/EmptyState';
import { GiftBoxArt } from '@/components/illustrations';
import { GiftReveal } from '@/components/rewards/GiftReveal';
import { Wardrobe } from '@/components/rewards/Wardrobe';
import { BadgeGrid, LevelCard, StreakCard } from '@/components/rewards/Cards';
import { colors, giftColors } from '@/theme/theme';

const ORDER = { streak: 0, super: 1, langka: 2, biasa: 3 } as const;

export default function RewardsScreen() {
  const giftBoxes = useStore((s) => s.giftBoxes);
  const [opening, setOpening] = useState<GiftBox>();
  const { isDesktop } = useLayout();
  const gifts = Object.values(giftBoxes).sort((a, b) => ORDER[a.rarity] - ORDER[b.rarity] || a.createdAt.localeCompare(b.createdAt));

  return (
    <Page title="Rewards" subtitle="Kado, lemari, level, dan streak-mu ✨" actions={<HeaderActions />}>
      <Card title="Kado belum dibuka" right={<T v="muted">{gifts.length} kado</T>}>
        {gifts.length === 0 ? (
          <EmptyState title="Belum ada kado" sub="Selesaikan tugas untuk mendapatkan kado 🎁" />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {gifts.map((g) => (
              <Pressable key={g.id} accessibilityRole="button" accessibilityLabel={`Buka kado ${RARITY_LABEL[g.rarity]} dari ${g.source}${g.early ? ', bonus selesai lebih awal' : ''}`}
                onPress={() => setOpening(g)}
                style={({ pressed }) => [
                  { width: 118, alignItems: 'center', gap: 4, padding: 10, borderRadius: 18, borderWidth: 1, borderColor: giftColors[g.rarity].ribbon, backgroundColor: '#fff', transform: [{ scale: pressed ? 0.96 : 1 }] },
                  css({ cursor: 'pointer', boxShadow: g.early ? '0 0 0 2px #FFE08A, 0 6px 18px rgba(237,181,47,.35)' : '0 4px 12px rgba(200,140,170,.12)' }),
                ]}>
                <View>
                  <GiftBoxArt size={70} rarity={g.rarity} />
                  {/* Finished a deadline early: extra sparkle on the box. */}
                  {g.early && (
                    <>
                      <T aria-hidden style={{ position: 'absolute', top: -6, right: -8, fontSize: 18 }}>✨</T>
                      <T aria-hidden style={{ position: 'absolute', bottom: 2, left: -8, fontSize: 13 }}>✨</T>
                    </>
                  )}
                </View>
                <T v="small" style={{ color: colors.text }}>{RARITY_LABEL[g.rarity]}</T>
                <T v="chip" numberOfLines={1} style={{ color: colors.muted }}>{g.source}</T>
                {g.early && <T v="chip" style={{ color: '#946200' }}>Bonus lebih awal</T>}
              </Pressable>
            ))}
          </View>
        )}
      </Card>

      <Wardrobe />

      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 14 }}>
        <View style={isDesktop ? { flex: 1, minWidth: 0, gap: 14 } : { gap: 14 }}><LevelCard /><StreakCard /></View>
        <View style={isDesktop ? { flex: 1, minWidth: 0, gap: 14 } : { gap: 14 }}><BadgeGrid /></View>
      </View>

      {opening && <GiftReveal box={opening} onClose={() => setOpening(undefined)} />}
    </Page>
  );
}
