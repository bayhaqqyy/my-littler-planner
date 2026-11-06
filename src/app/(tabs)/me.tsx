import { useMemo, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { G, Rect } from 'react-native-svg';
import { addDays, completionsOn, currentStreak, ITEMS, levelEmoji, moodsOf, MOOD_LABEL, startOfWeek, uniqueCompletions } from '@/domain';
import { FEATURES } from '@/config/features';
import { useStore } from '@/store/store';
import { badgesFromState, levelFromState } from '@/store/selectors';
import { useCharacterName, useLayout, useToday } from '@/store/hooks';
import { colors, fonts, radius, shadow } from '@/theme/theme';
import { HeaderActions, Page } from '@/components/AppShell';
import { css, Row, T } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/Charts';
import { GiftBoxArt, MiniAzza } from '@/components/illustrations';
import { FlowerShape, Hill } from '@/components/deco/Garden';
import { BadgeMedal } from '@/components/rewards/BadgeMedal';

type TileTone = { edge: string; soft: string; ink: string };
const TONES: Record<string, TileTone> = {
  pink: { edge: '#FFC9DC', soft: '#FFF0F5', ink: '#C93A73' },
  gold: { edge: '#FFDD99', soft: '#FFF8E6', ink: '#9A6400' },
  lilac: { edge: '#D8CCFF', soft: '#F5F1FF', ink: '#6A4CC9' },
  green: { edge: '#BFE6B0', soft: '#F0FAEC', ink: '#2F7A3C' },
  blue: { edge: '#BFDDFB', soft: '#EEF6FF', ink: '#2F6FB4' },
  peach: { edge: '#FFCDB2', soft: '#FFF3EC', ink: '#B9541F' },
};

function Tile({ title, sub, tone, art, badge, onPress, basis }: { title: string; sub: string; tone: TileTone; art: ReactNode; badge?: number; onPress: () => void; basis: string }) {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={`${title}, ${sub}`} onPress={onPress}
      style={(st) => [
        { flexGrow: 1, flexBasis: basis as never, minHeight: 116, backgroundColor: '#fff', borderRadius: 24, borderWidth: 2.5, borderColor: tone.edge, padding: 12, overflow: 'hidden', transform: [{ translateY: (st as { hovered?: boolean }).hovered ? -2 : 0 }] },
        css({ ...shadow.card, cursor: 'pointer', transitionDuration: '150ms' }),
      ]}>
      <View aria-hidden style={{ position: 'absolute', right: -28, top: -28, width: 86, height: 86, borderRadius: 43, backgroundColor: tone.soft }} />
      <View aria-hidden style={{ position: 'absolute', right: 10, top: 10 }}>
        <Svg width={16} height={16} viewBox="0 0 24 24"><FlowerShape color={tone.edge} outline={false} /></Svg>
      </View>
      <Row gap={10} style={{ alignItems: 'flex-start' }}>
        <View style={{ width: 58, height: 58, borderRadius: 18, backgroundColor: tone.soft, borderWidth: 2, borderColor: tone.edge, alignItems: 'center', justifyContent: 'center' }}>{art}</View>
        <T v="small" style={{ flex: 1, color: tone.ink, fontFamily: fonts.bold, marginTop: 6, paddingRight: 18 }}>{sub}</T>
      </Row>
      <Row style={{ justifyContent: 'space-between', marginTop: 8 }}>
        <T v="cardTitle" style={{ fontSize: 18 }}>{title}</T>
        <Icon name="chevron-right" size={20} color={tone.ink} />
      </Row>
      {badge ? (
        <View style={{ position: 'absolute', top: 6, left: 54, backgroundColor: '#E84D5B', borderRadius: 11, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }}>
          <T v="chip" style={{ color: '#fff' }}>{badge}</T>
        </View>
      ) : null}
    </Pressable>
  );
}

function IconArt({ name, color }: { name: Parameters<typeof Icon>[0]['name']; color: string }) {
  return <Icon name={name} size={30} color={color} />;
}

function CalendarArt() {
  return (
    <Svg width={38} height={38} viewBox="0 0 40 40">
      <Rect x={4} y={8} width={32} height={28} rx={6} fill="#fff" stroke="#7A5848" strokeWidth={2} />
      <Rect x={4} y={8} width={32} height={9} rx={4} fill="#FF8A80" stroke="#7A5848" strokeWidth={2} />
      <Rect x={11} y={4} width={4} height={9} rx={2} fill="#7A5848" />
      <Rect x={25} y={4} width={4} height={9} rx={2} fill="#7A5848" />
      <G><Rect x={11} y={22} width={6} height={6} rx={2} fill="#FFCE3A" /><Rect x={21} y={22} width={6} height={6} rx={2} fill="#FFC9DC" /></G>
    </Svg>
  );
}

export default function MeScreen() {
  const today = useToday();
  const { character } = useCharacterName();
  const { isMobile } = useLayout();
  const basis = isMobile ? '40%' : '30%';
  const equipped = useStore((s) => s.wardrobe.equipped);
  const owned = useStore((s) => s.wardrobe.owned);
  const gifts = useStore((s) => (FEATURES.gifts ? Object.keys(s.giftBoxes).length : 0));
  const logs = useStore((s) => s.completionLogs);
  const focus = useStore((s) => s.focusLogs);
  const progress = useStore((s) => s.progress);
  const notes = useStore((s) => s.notes);
  const wardrobe = useStore((s) => s.wardrobe);

  const lvl = useMemo(() => levelFromState({ completionLogs: logs, focusLogs: focus }), [logs, focus]);
  const badges = useMemo(() => badgesFromState({ completionLogs: logs, focusLogs: focus, progress, notes, wardrobe }), [logs, focus, progress, notes, wardrobe]);
  const earned = badges.filter((b) => b.earned);
  const best = [...earned].sort((a, b) => b.rank - a.rank)[0];
  const streak = useMemo(() => currentStreak(Object.values(logs), today), [logs, today]);
  const weekDone = useMemo(() => {
    const list = uniqueCompletions(Object.values(logs));
    const start = startOfWeek(today);
    return Array.from({ length: 7 }, (_, i) => completionsOn(list, addDays(start, i))).reduce((a, b) => a + b, 0);
  }, [logs, today]);
  const mood = moodsOf(notes[today])[0];
  const collectable = ITEMS.filter((i) => i.rarity !== 'default').length;
  const have = owned.filter((id) => ITEMS.some((i) => i.id === id && i.rarity !== 'default')).length;

  return (
    <Page title="Aku" subtitle={`Halo, ${character.replace('Mini ', '')}!`} actions={<HeaderActions />}>
      <View style={[{ borderRadius: 30, overflow: 'hidden', borderWidth: 2, borderColor: '#fff', flexDirection: isMobile ? 'row' : 'row', alignItems: 'center', padding: isMobile ? 14 : 22, gap: isMobile ? 10 : 22, minHeight: isMobile ? 190 : 220 }, css({ backgroundImage: 'linear-gradient(160deg, #FFE7F0, #FFF6E0)', ...shadow.card })]}>
        <View aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}><Hill width="100%" height={isMobile ? 70 : 90} flowers={false} /></View>
        <View style={{ alignItems: 'center' }}>
          <MiniAzza size={isMobile ? 132 : 170} pose="happy" equipped={equipped} showPet={!isMobile} />
        </View>
        <View style={{ flex: 1, gap: 6, minWidth: 0, paddingBottom: isMobile ? 16 : 20 }}>
          <T v="greeting" style={{ fontSize: isMobile ? 22 : 28 }}>{character}</T>
          <View style={{ alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 }}>
            <T v="small" style={{ color: colors.accent, fontFamily: fonts.bold }}>Lv {lvl.level} {levelEmoji(lvl.level)} {lvl.title}</T>
          </View>
          <T v="muted">{lvl.next ? `${lvl.next.min - lvl.points} poin lagi ke Lv ${lvl.next.level}` : 'Level tertinggi! 👑'}</T>
          <ProgressBar value={lvl.progress} height={10} label={`Progres level ${Math.round(lvl.progress * 100)} persen`} />
          <Row gap={8} wrap style={{ marginTop: 4 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}><T v="small"><T v="small" style={{ color: '#B9541F', fontFamily: fonts.bold }}>{streak}</T> hari beruntun</T></View>
            <View style={{ backgroundColor: '#fff', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}><T v="small"><T v="small" style={{ color: '#6A4CC9', fontFamily: fonts.bold }}>{earned.length}</T> badge</T></View>
          </Row>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <Tile basis={basis} title="Lemari" sub={`${have}/${collectable} item`} tone={TONES.pink} art={<IconArt name="hanger" color={TONES.pink.ink} />} onPress={() => router.navigate('/rewards')} />
        <Tile basis={basis} title="Kado" sub={gifts ? `${gifts} belum dibuka` : 'Belum ada kado'} tone={TONES.gold} badge={gifts} art={<GiftBoxArt size={44} rarity="super" />} onPress={() => router.navigate('/rewards')} />
        <Tile basis={basis} title="Progres" sub={`${weekDone} tugas pekan ini`} tone={TONES.lilac} art={<IconArt name="chart" color={TONES.lilac.ink} />} onPress={() => router.navigate('/progress')} />
        <Tile basis={basis} title="Catatan" sub={mood ? `Mood ${MOOD_LABEL[mood].toLowerCase()}` : 'Tulis hari ini'} tone={TONES.green} art={<IconArt name="note" color={TONES.green.ink} />} onPress={() => router.navigate('/notes')} />
        <Tile basis={basis} title="Badge" sub={`${earned.length} dari ${badges.length}`} tone={TONES.blue} art={best ? <BadgeMedal rank={best.rank} emoji={best.emoji} earned size={44} /> : <IconArt name="medal" color={TONES.blue.ink} />} onPress={() => router.navigate('/rewards')} />
        <Tile basis={basis} title="Kalender" sub="Jadwal & deadline" tone={TONES.peach} art={<CalendarArt />} onPress={() => router.navigate('/calendar')} />
      </View>
    </Page>
  );
}
