import type { Category, Priority, Rarity } from '@/domain/types';

export const colors = {
  bg: '#FFF7F9',
  bgGradient: ['#FFF1F6', '#F8F0FF', '#EEF6FF'],
  surface: 'rgba(255,255,255,0.92)',
  surfaceSoft: '#FFF8FA',
  line: '#F3E1E8',
  text: '#4A3B52',
  muted: '#76627C',
  accent: '#C2457A',
  accentGradient: ['#D9578A', '#C2457A'],
  accentSoft: '#FFE6EE',
  sidebar: ['#FFF0F5', '#FFF7F2'],
  danger: '#B8325E',
  white: '#FFFFFF',
  pastel: ['#FFDDE5', '#FFF5F0', '#D6C5F4', '#C5E6FA', '#C8E6D3', '#FFE5AE', '#EBD1B8', '#F8DBEC', '#B9E3FC'],
};

export const categoryColors: Record<Category, { bg: string; text: string; dot: string }> = {
  kuliah: { bg: '#E2F2FD', text: '#2B6A94', dot: '#9CD3F5' },
  belajar: { bg: '#EFE8FB', text: '#5E44A0', dot: '#C3B0EE' },
  tugas: { bg: '#FFF1D6', text: '#85520F', dot: '#F7CF82' },
  istirahat: { bg: '#E3F4EA', text: '#2E6B4A', dot: '#A8DABD' },
  olahraga: { bg: '#E9F5E0', text: '#44682A', dot: '#B5DD9A' },
  pribadi: { bg: '#FDE6EE', text: '#9C3A63', dot: '#F7A8C4' },
};

export const priorityColors: Record<Priority, { bg: string; text: string }> = {
  tinggi: { bg: '#FFE0E9', text: '#B23A66' },
  sedang: { bg: '#FFF1D6', text: '#85520F' },
  rendah: { bg: '#E3F4EA', text: '#2E6B4A' },
};

/** Deadline urgency label colors (PRD). Text is always written too, so color is never the only cue. */
export const urgencyColors = {
  aman: { bg: '#E3F4EA', text: '#2E6B4A', dot: '#A8DABD' },
  dekat: { bg: '#FFF1D6', text: '#85520F', dot: '#F7CF82' },
  mendesak: { bg: '#FFE0E9', text: '#B23A66', dot: '#F48FB1' },
  terlewat: { bg: '#EFE7EB', text: '#5E4D66', dot: '#B9A9BF' },
  selesai: { bg: 'transparent', text: '#2E6B4A', dot: '#A8DABD' },
} as const;

export const giftColors: Record<Exclude<Rarity, 'default'>, { box: string; ribbon: string }> = {
  biasa: { box: '#BFE8D6', ribbon: '#7FCBAA' },
  langka: { box: '#D9C8FF', ribbon: '#A88BEE' },
  super: { box: '#FFE08A', ribbon: '#EDB52F' },
  streak: { box: '#FFC1D6', ribbon: '#F07BA3' },
  legenda: { box: '#D9C8FF', ribbon: '#EDB52F' },
};

export const data = {
  rainbow: ['#FF9EC2', '#FFC48F', '#FFE27A', '#9EE0B5', '#9CD3F5', '#C3B0EE'],
  stat: {
    total: ['#FFF3F7', '#FFE1EC'],
    done: ['#F0FAF3', '#D9F2E3'],
    pending: ['#F6F1FF', '#E7DEFF'],
    streak: ['#FFF6E6', '#FFE0C7'],
    progress: ['#F1F8FF', '#DDEDFF'],
  },
  streakNumber: '#A8441A',
  bars: ['#F7A8C4', '#C3B0EE', '#9CD3F5', '#A8DABD', '#F7CF82', '#F5B8A0', '#B5DD9A'],
  donutTrack: '#FBE1EC',
  donutFill: ['#FF7FAF', '#B48CF2', '#5FB4EE'],
  timer: { petal: '#FFD9E6', ring: ['#F48FB1', '#FFB38A', '#B9A0F0'], restPetal: '#D9F2E4', restRing: '#7CCFA4' },
};

export const fonts = {
  medium: 'Quicksand_500Medium',
  semibold: 'Quicksand_600SemiBold',
  bold: 'Quicksand_700Bold',
};

export const type = {
  pageTitle: { fontFamily: fonts.bold, fontSize: 24 },
  greeting: { fontFamily: fonts.bold, fontSize: 22 },
  cardTitle: { fontFamily: fonts.bold, fontSize: 15.5 },
  body: { fontFamily: fonts.medium, fontSize: 14.5 },
  small: { fontFamily: fonts.semibold, fontSize: 12.5 },
  chip: { fontFamily: fonts.semibold, fontSize: 11.5 },
};

/** iOS Safari zooms into any focused field with text smaller than 16px — keep inputs at 16. */
export const INPUT_FONT_SIZE = 16;

export const radius = { card: 20, greeting: 24, row: 14, pill: 999, icon: 12 };
export const space = (n: number) => n * 4;

export const shadow = {
  card: { boxShadow: '0 2px 10px rgba(200,140,170,.08)' },
  button: { boxShadow: '0 6px 14px rgba(194,69,122,.25)' },
} as const;

export const breakpoints = { tablet: 600, desktop: 900 };

export const linear = (stops: string[], deg = 135) => `linear-gradient(${deg}deg, ${stops.join(', ')})`;
