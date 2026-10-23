import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, PaymentMethod } from '@/types/models';
import { persistStorage } from './storage';

/**
 * Client-side cart. Enforces the marketplace rule: one provider per cart.
 * Also carries checkout draft state (schedule, address, payment, promo) across
 * the multi-step booking flow.
 */
interface CartState {
  providerId: string | null;
  items: CartItem[];
  // checkout draft
  date: string | null;
  slot: string | null;
  addressId: string | null;
  paymentMethod: PaymentMethod;
  promoCode: string | null;
  notes: string;

  add: (serviceId: string, providerId: string) => 'added' | 'conflict';
  replaceWith: (serviceId: string, providerId: string) => void;
  /** Replace the whole cart (e.g. "Book again"). */
  setAll: (providerId: string, items: CartItem[]) => void;
  setQuantity: (serviceId: string, qty: number) => void;
  remove: (serviceId: string) => void;
  clear: () => void;
  quantityOf: (serviceId: string) => number;
  count: () => number;
  setSchedule: (date: string | null, slot: string | null) => void;
  setAddress: (id: string | null) => void;
  setPayment: (m: PaymentMethod) => void;
  setPromo: (code: string | null) => void;
  setNotes: (n: string) => void;
}

const emptyDraft = { date: null, slot: null, promoCode: null, notes: '' };

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      providerId: null,
      items: [],
      addressId: null,
      paymentMethod: 'upi',
      ...emptyDraft,

      add: (serviceId, providerId) => {
        const s = get();
        if (s.providerId && s.providerId !== providerId && s.items.length) return 'conflict';
        const existing = s.items.find((i) => i.serviceId === serviceId);
        set({
          providerId,
          items: existing
            ? s.items.map((i) => (i.serviceId === serviceId ? { ...i, quantity: i.quantity + 1 } : i))
            : [...s.items, { serviceId, quantity: 1 }],
        });
        return 'added';
      },
      replaceWith: (serviceId, providerId) => set({ providerId, items: [{ serviceId, quantity: 1 }], ...emptyDraft }),
      setAll: (providerId, items) => set({ providerId, items, ...emptyDraft }),
      setQuantity: (serviceId, qty) =>
        set((s) => {
          const items = qty <= 0 ? s.items.filter((i) => i.serviceId !== serviceId) : s.items.map((i) => (i.serviceId === serviceId ? { ...i, quantity: qty } : i));
          return { items, providerId: items.length ? s.providerId : null, ...(items.length ? {} : emptyDraft) };
        }),
      remove: (serviceId) => get().setQuantity(serviceId, 0),
      clear: () => set({ providerId: null, items: [], ...emptyDraft }),
      quantityOf: (serviceId) => get().items.find((i) => i.serviceId === serviceId)?.quantity ?? 0,
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      setSchedule: (date, slot) => set({ date, slot }),
      setAddress: (addressId) => set({ addressId }),
      setPayment: (paymentMethod) => set({ paymentMethod }),
      setPromo: (promoCode) => set({ promoCode }),
      setNotes: (notes) => set({ notes }),
    }),
    { name: 'servio.cart', storage: persistStorage },
  ),
);
