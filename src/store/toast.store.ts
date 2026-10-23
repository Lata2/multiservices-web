import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info';

interface ToastState {
  toast: { id: number; message: string; kind: ToastKind } | null;
  show: (message: string, kind?: ToastKind) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (message, kind = 'success') => set({ toast: { id: Date.now(), message, kind } }),
  hide: () => set({ toast: null }),
}));

/** Imperative helper usable outside React components (e.g. mutation callbacks). */
export const toast = {
  success: (m: string) => useToastStore.getState().show(m, 'success'),
  error: (m: string) => useToastStore.getState().show(m, 'error'),
  info: (m: string) => useToastStore.getState().show(m, 'info'),
};
