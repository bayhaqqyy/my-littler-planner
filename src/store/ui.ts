import { create } from 'zustand';
import type { Reminder } from '@/domain';

export interface Toast { id: number; kind: 'cheer' | 'streak' | 'info' | 'gift'; text: string }

interface UiState {
  toasts: Toast[];
  banners: Reminder[];
  celebrate: boolean;
  burst?: { x: number; y: number; id: number };
  pushToast(kind: Toast['kind'], text: string): void;
  dropToast(id: number): void;
  pushBanner(r: Reminder): void;
  dropBanner(id: string): void;
  setCelebrate(v: boolean): void;
  setBurst(x: number, y: number): void;
}

let n = 0;
export const useUi = create<UiState>((set) => ({
  toasts: [],
  banners: [],
  celebrate: false,
  pushToast: (kind, text) => {
    const id = ++n;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, kind, text }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200);
  },
  dropToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  pushBanner: (r) => set((s) => (s.banners.some((b) => b.id === r.id) ? s : { banners: [...s.banners, r] })),
  dropBanner: (id) => set((s) => ({ banners: s.banners.filter((b) => b.id !== id) })),
  setCelebrate: (v) => set({ celebrate: v }),
  setBurst: (x, y) => set({ burst: { x, y, id: ++n } }),
}));
