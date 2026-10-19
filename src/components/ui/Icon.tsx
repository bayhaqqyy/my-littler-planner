import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home' | 'list' | 'calendar' | 'timer' | 'chart' | 'note' | 'gift' | 'settings' | 'plus' | 'search' | 'chevron-left'
  | 'chevron-right' | 'close' | 'check' | 'trash' | 'edit' | 'play' | 'pause' | 'reset' | 'bell' | 'repeat' | 'clock' | 'flag' | 'skip' | 'logout' | 'move';

const P: Record<IconName, string> = {
  home: 'M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4Z',
  list: 'M9 6 H20 M9 12 H20 M9 18 H20 M4.5 6 h.01 M4.5 12 h.01 M4.5 18 h.01',
  calendar: 'M5 6 H19 V20 H5Z M5 10 H19 M9 3 V7 M15 3 V7',
  timer: 'M12 8 V13 L15 15 M9 2 H15 M12 21 A8 8 0 1 0 12 5 A8 8 0 0 0 12 21Z',
  chart: 'M5 20 V12 M10 20 V6 M15 20 V10 M20 20 V4',
  note: 'M6 3 H15 L19 7 V21 H6Z M9 11 H16 M9 15 H16 M9 7 H12',
  gift: 'M4 10 H20 V20 H4Z M3 7 H21 V10 H3Z M12 7 V20 M12 7 C9 2 5 4 7 7 M12 7 C15 2 19 4 17 7',
  settings: 'M12 15 A3 3 0 1 0 12 9 A3 3 0 0 0 12 15Z M19 12 L21 11 L20 8 L18 8 L17 6 L18 4 L15 3 L14 5 H10 L9 3 L6 4 L7 6 L6 8 L4 8 L3 11 L5 12 L3 13 L4 16 L6 16 L7 18 L6 20 L9 21 L10 19 H14 L15 21 L18 20 L17 18 L18 16 L20 16 L21 13Z',
  plus: 'M12 5 V19 M5 12 H19',
  search: 'M11 18 A7 7 0 1 0 11 4 A7 7 0 0 0 11 18Z M16 16 L21 21',
  'chevron-left': 'M15 5 L8 12 L15 19',
  'chevron-right': 'M9 5 L16 12 L9 19',
  close: 'M6 6 L18 18 M18 6 L6 18',
  check: 'M5 12 L10 17 L19 7',
  trash: 'M5 7 H19 M10 7 V4 H14 V7 M7 7 L8 20 H16 L17 7',
  edit: 'M4 20 L5 15 L16 4 L20 8 L9 19Z M14 6 L18 10',
  play: 'M8 5 L19 12 L8 19Z',
  pause: 'M8 5 V19 M16 5 V19',
  reset: 'M4 12 A8 8 0 1 0 7 6 M4 4 V9 H9',
  bell: 'M6 16 V11 A6 6 0 0 1 18 11 V16 L20 18 H4Z M10 21 H14',
  repeat: 'M17 3 L20 6 L17 9 M4 12 V10 A4 4 0 0 1 8 6 H20 M7 21 L4 18 L7 15 M20 12 V14 A4 4 0 0 1 16 18 H4',
  clock: 'M12 21 A9 9 0 1 0 12 3 A9 9 0 0 0 12 21Z M12 7 V12 L15 14',
  flag: 'M5 21 V4 M5 4 H17 L14 8 L17 12 H5',
  skip: 'M6 5 L15 12 L6 19Z M18 5 V19',
  logout: 'M15 4 H19 V20 H15 M10 8 L6 12 L10 16 M6 12 H16',
  move: 'M12 3 V21 M3 12 H21 M12 3 L9 6 M12 3 L15 6 M12 21 L9 18 M12 21 L15 18',
};

export function Icon({ name, size = 22, color = '#76627C', fill }: { name: IconName; size?: number; color?: string; fill?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <Path d={P[name]} stroke={color} strokeWidth={1.9} fill={fill ?? (name === 'play' ? color : 'none')} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export { Circle, Rect };
