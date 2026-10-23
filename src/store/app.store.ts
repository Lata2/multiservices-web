import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './storage';

interface Prefs {
  pushBookings: boolean;
  pushOffers: boolean;
  email: boolean;
  sms: boolean;
}

interface AppState {
  city: string;
  recentSearches: string[];
  prefs: Prefs;
  setCity: (c: string) => void;
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
  setPref: (k: keyof Prefs, v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      city: 'Bengaluru',
      recentSearches: ['AC service', 'Deep cleaning', 'Haircut'],
      prefs: { pushBookings: true, pushOffers: true, email: true, sms: false },
      setCity: (city) => set({ city }),
      addRecentSearch: (q) =>
        set((s) => ({ recentSearches: [q, ...s.recentSearches.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 8) })),
      clearRecentSearches: () => set({ recentSearches: [] }),
      setPref: (k, v) => set((s) => ({ prefs: { ...s.prefs, [k]: v } })),
    }),
    { name: 'servio.app', storage: persistStorage },
  ),
);
