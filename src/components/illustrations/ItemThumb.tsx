import Svg from 'react-native-svg';
import { ITEM_BY_ID } from '@/domain';
import { MiniAzza } from './MiniAzza';
import { BearArt, BunnyArt, ChickArt, KittyArt, SheepArt, TulipArt } from './Critters';

const PETS: Record<string, (p: { x?: number; y?: number; s?: number }) => React.JSX.Element> = {
  'pet-kelinci': BunnyArt, 'pet-anak-ayam': ChickArt, 'pet-kucing': KittyArt, 'pet-beruang': BearArt, 'pet-domba': SheepArt,
};

/** Preview of a wardrobe item, drawn on Mini Azza (or the pet alone). */
export function ItemThumb({ itemId, size = 64 }: { itemId: string; size?: number }) {
  const item = ITEM_BY_ID[itemId];
  if (!item) {
    return <Svg width={size} height={size} viewBox="0 0 40 60"><TulipArt color="#C3B0EE" /></Svg>;
  }
  if (item.slot === 'pet') {
    const Art = PETS[item.id];
    return <Svg width={size} height={size} viewBox="0 0 60 60">{Art && <Art />}</Svg>;
  }
  if (item.slot === 'hair' || item.slot === 'glasses') {
    return <MiniAzza faceOnly size={size} equipped={{ outfit: 'outfit-kaos-pink', [item.slot]: item.id }} />;
  }
  return <MiniAzza size={size * 0.82} showPet={false} equipped={{ outfit: item.slot === 'outfit' ? item.id : 'outfit-kaos-pink', [item.slot]: item.id }} />;
}
