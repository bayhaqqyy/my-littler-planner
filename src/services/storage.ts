import localforage from 'localforage';
import type { StateStorage } from 'zustand/middleware';

/** IndexedDB-backed storage (via localforage) for offline-first persistence. */
localforage.config({ name: 'my-little-planner', storeName: 'data' });

export const idbStorage: StateStorage = {
  getItem: async (name) => (await localforage.getItem<string>(name)) ?? null,
  setItem: async (name, value) => { await localforage.setItem(name, value); },
  removeItem: async (name) => { await localforage.removeItem(name); },
};

export const clearLocal = () => localforage.clear();
