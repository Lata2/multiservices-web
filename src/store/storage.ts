import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/**
 * localStorage wrapper that never throws (private mode, quota exceeded, SSR/tests).
 * Falls back to an in-memory map so the app keeps working for the session.
 */
const memory = new Map<string, string>();

const safeStorage: StateStorage = {
  getItem(key) {
    try {
      return globalThis.localStorage?.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem(key, value) {
    memory.set(key, value);
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* storage unavailable — memory copy is used */
    }
  },
  removeItem(key) {
    memory.delete(key);
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const persistStorage = createJSONStorage(() => safeStorage);
