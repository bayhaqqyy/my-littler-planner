import type { AlarmTone, Settings, SoundEvent, SoundId } from '@/domain';

/**
 * Alarm tones synthesised with Web Audio (no sound files to download, works offline).
 * Browsers block audio until the user interacts, so `unlockAudio` is called on the first tap.
 */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  return ctx;
}

export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume();
  preloadSounds();
}

function note(c: AudioContext, out: AudioNode, freq: number, t0: number, dur: number, type: OscillatorType, peak: number, freqEnd?: number) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(out);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

const TONES: Record<AlarmTone, (c: AudioContext, out: AudioNode, t: number) => void> = {
  // Bell: fundamental + inharmonic partials, rung twice
  lonceng: (c, out, t) => {
    for (const s of [0, 0.7]) {
      note(c, out, 880, t + s, 1.4, 'sine', 0.5);
      note(c, out, 880 * 2.76, t + s, 0.8, 'sine', 0.15);
      note(c, out, 880 * 5.4, t + s, 0.4, 'sine', 0.06);
    }
  },
  // Chime: gentle ascending arpeggio
  chime: (c, out, t) => {
    [659.25, 783.99, 987.77, 1318.51].forEach((f, i) => note(c, out, f, t + i * 0.18, 1.1, 'triangle', 0.35));
  },
  // Cat: two "meow" glides
  kucing: (c, out, t) => {
    for (const s of [0, 0.6]) {
      note(c, out, 700, t + s, 0.22, 'sawtooth', 0.12, 1100);
      note(c, out, 1100, t + s + 0.2, 0.3, 'sawtooth', 0.1, 600);
    }
  },
  // Soft: low warm sine pulses
  lembut: (c, out, t) => {
    [523.25, 659.25, 523.25].forEach((f, i) => note(c, out, f, t + i * 0.45, 0.9, 'sine', 0.3));
  },
};

export const TONE_LABEL: Record<AlarmTone, string> = { lonceng: 'Lonceng', chime: 'Chime', kucing: 'Suara kucing', lembut: 'Nada lembut' };

export function playTone(tone: AlarmTone, volume: number) {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  const master = c.createGain();
  master.gain.value = Math.max(0, Math.min(1, volume));
  master.connect(c.destination);
  TONES[tone](c, master, c.currentTime + 0.02);
}

/* ---------- Sound library: recorded voice clips + synthesized tones ---------- */


export interface SoundOption { id: SoundId; label: string; kind: 'suara' | 'nada' | 'mati'; file?: string }

/** Voice clips (public/sounds) and the tones synthesized above. */
export const SOUNDS: SoundOption[] = [
  { id: 'v-remind', label: '“Sebentar lagi, siap-siap yaa!”', kind: 'suara', file: '/sounds/remind-before.mp3' },
  { id: 'v-start', label: '“Ayo belajar! Semangaaat!”', kind: 'suara', file: '/sounds/start-study.mp3' },
  { id: 'v-break', label: '“Istirahat… minum air dulu yuk!”', kind: 'suara', file: '/sounds/break.mp3' },
  { id: 'v-back', label: '“Istirahatnya udah, ayo lanjut!”', kind: 'suara', file: '/sounds/back-to-study.mp3' },
  { id: 'v-done', label: '“Yeaaay, sudah selesaiii!”', kind: 'suara', file: '/sounds/done.mp3' },
  { id: 'lonceng', label: 'Lonceng', kind: 'nada' },
  { id: 'chime', label: 'Chime', kind: 'nada' },
  { id: 'kucing', label: 'Suara kucing', kind: 'nada' },
  { id: 'lembut', label: 'Nada lembut', kind: 'nada' },
  { id: 'none', label: 'Tanpa suara', kind: 'mati' },
];
export const SOUND_BY_ID = Object.fromEntries(SOUNDS.map((s) => [s.id, s])) as Record<SoundId, SoundOption>;

export const SOUND_EVENTS: { event: SoundEvent; label: string; hint: string }[] = [
  { event: 'remind-before', label: 'Sebelum mulai', hint: 'Pengingat N menit sebelum tugas' },
  { event: 'start', label: 'Waktunya mulai', hint: 'Saat jam mulai tugas tiba' },
  { event: 'end', label: 'Waktu habis', hint: 'Saat jam selesai tugas atau timer tugas habis' },
  { event: 'break', label: 'Waktunya istirahat', hint: 'Sesi fokus Pomodoro selesai' },
  { event: 'back', label: 'Istirahat selesai', hint: 'Saatnya fokus lagi' },
  { event: 'done', label: 'Tugas selesai', hint: 'Saat kamu mencentang tugas' },
];

export const DEFAULT_SOUNDS: Record<SoundEvent, SoundId> = {
  'remind-before': 'v-remind',
  start: 'v-start',
  end: 'lonceng',
  break: 'v-break',
  back: 'v-back',
  done: 'v-done',
};

export function soundFor(settings: Pick<Settings, 'sounds'>, event: SoundEvent): SoundId {
  return settings.sounds?.[event] ?? DEFAULT_SOUNDS[event];
}

const buffers = new Map<string, Promise<AudioBuffer>>();
let current: AudioBufferSourceNode | null = null;

function loadBuffer(c: AudioContext, file: string): Promise<AudioBuffer> {
  let p = buffers.get(file);
  if (!p) {
    p = fetch(file).then((r) => r.arrayBuffer()).then((b) => new Promise<AudioBuffer>((res, rej) => c.decodeAudioData(b, res, rej)));
    p.catch(() => buffers.delete(file));
    buffers.set(file, p);
  }
  return p;
}

/** Decode the voice clips ahead of time (after the first tap) so they play instantly. */
export function preloadSounds() {
  const c = getCtx();
  if (!c) return;
  for (const s of SOUNDS) if (s.file) loadBuffer(c, s.file).catch(() => {});
}

/** Play one sound from the library. A new clip stops the previous one (no overlapping voices). */
export async function playSound(id: SoundId, volume: number) {
  const opt = SOUND_BY_ID[id];
  if (!opt || opt.kind === 'mati') return;
  if (opt.kind === 'nada') return playTone(id as AlarmTone, volume);
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') await c.resume().catch(() => {});
  try {
    const buf = await loadBuffer(c, opt.file!);
    current?.stop();
    const src = c.createBufferSource();
    const gain = c.createGain();
    gain.gain.value = Math.max(0, Math.min(1, volume));
    src.buffer = buf;
    src.connect(gain).connect(c.destination);
    src.start();
    current = src;
    src.onended = () => { if (current === src) current = null; };
  } catch {
    playTone('lonceng', volume); // offline and never cached: fall back to a tone
  }
}

export function playEvent(settings: Pick<Settings, 'sounds' | 'volume'>, event: SoundEvent) {
  return playSound(soundFor(settings, event), settings.volume);
}
