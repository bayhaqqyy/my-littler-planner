import Svg from 'react-native-svg';
import { ITEM_BY_ID } from '@/domain';
import { MiniAzza } from './MiniAzza';
import { TulipArt } from './Critters';
import { PetArt } from '../avatar/pets';
import { GardenArt } from '../avatar/garden';

/** Preview of a wardrobe item: on Mini for things she wears, on its own for pets and garden decor. */
export function ItemThumb({ itemId, size = 64 }: { itemId: string; size?: number }) {
  const item = ITEM_BY_ID[itemId];
  if (!item) {
    return <Svg width={size} height={size} viewBox="0 0 40 60"><TulipArt color="#C3B0EE" /></Svg>;
  }
  if (item.slot === 'pet') return <Svg width={size} height={size} viewBox="0 0 60 60"><PetArt look={item.look} /></Svg>;
  if (item.slot === 'garden') return <Svg width={size} height={size} viewBox="0 0 60 60"><GardenArt look={item.look} /></Svg>;
  if (item.slot === 'hair' || item.slot === 'glasses') {
    return <MiniAzza faceOnly size={size} equipped={{ outfit: 'outfit-kaos-pink', [item.slot]: item.id }} />;
  }
  if (item.slot === 'extra') return <MiniAzza size={size * 0.79} showPet={false} equipped={{ outfit: 'outfit-kaos-pink', extra: item.id }} />;
  return <MiniAzza size={size * 0.79} showPet={false} equipped={{ outfit: item.id }} />;
}
