import { useStore } from './store';

/** Development only: expose the store for seeding data from scripts (Playwright). */
if (__DEV__) (globalThis as { __mlpStore?: typeof useStore }).__mlpStore = useStore;
