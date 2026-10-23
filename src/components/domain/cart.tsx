import { useState } from 'react';
import { useCartServices } from '@/hooks/api';
import { useCartStore } from '@/store/cart.store';
import { toast } from '@/store/toast.store';
import type { Service } from '@/types/models';
import { formatMoney } from '@/utils/format';
import { effectivePrice } from '@/utils/pricing';
import { Button, ConfirmDialog, LinkButton, QuantityStepper } from '../ui';

/**
 * Add-to-cart with the single-provider rule. Returns an `addService` action plus the
 * conflict dialog element to mount once per page.
 */
export function useAddToCart() {
  const add = useCartStore((s) => s.add);
  const replaceWith = useCartStore((s) => s.replaceWith);
  const [pending, setPending] = useState<Service | null>(null);

  const addService = (service: Service) => {
    const r = add(service.id, service.providerId);
    if (r === 'conflict') setPending(service);
    else toast.success('Added to cart');
  };

  const dialog = (
    <ConfirmDialog
      open={!!pending}
      icon="cart"
      title="Replace cart items?"
      message="Your cart has services from another provider. Each booking can include services from one provider only."
      confirmLabel="Replace"
      onCancel={() => setPending(null)}
      onConfirm={() => {
        if (pending) replaceWith(pending.id, pending.providerId);
        setPending(null);
        toast.success('Cart updated');
      }}
    />
  );
  return { addService, dialog };
}

export function AddToCartControl({ service, onAdd, size = 'sm' }: { service: Service; onAdd: (s: Service) => void; size?: 'sm' | 'md' }) {
  const qty = useCartStore((s) => s.items.find((i) => i.serviceId === service.id)?.quantity ?? 0);
  const setQuantity = useCartStore((s) => s.setQuantity);
  if (qty > 0) return <QuantityStepper value={qty} onChange={(v) => setQuantity(service.id, v)} max={service.maxQuantity} size={size} label={`${service.title} quantity`} />;
  return (
    <Button size="sm" variant="secondary" leftIcon="plus" onClick={() => onAdd(service)} aria-label={`Add ${service.title} to cart`} disabled={!service.active}>
      Add
    </Button>
  );
}

/** Floating "View cart" bar shown on browsing pages when the cart has items. */
export function CartBar() {
  const items = useCartStore((s) => s.items);
  const services = useCartServices(items.map((i) => i.serviceId));
  if (!items.length) return null;
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((sum, it) => {
    const s = services.data?.find((x) => x.id === it.serviceId);
    return sum + (s ? effectivePrice(s) * it.quantity : 0);
  }, 0);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottom-nav-h,0px)+12px)] z-40 flex justify-center px-4 lg:bottom-6 lg:justify-end lg:px-8">
      <div className="pointer-events-auto flex w-full max-w-md animate-sheet-up items-center justify-between gap-3 rounded-xl bg-primary-600 py-2.5 pl-4 pr-2.5 text-white shadow-lg">
        <div>
          <p className="text-caption text-white/80">
            {count} item{count > 1 ? 's' : ''} in cart
          </p>
          <p className="font-bold">
            {services.data ? formatMoney(total) : '…'} <span className="text-caption font-normal text-white/70">+ taxes</span>
          </p>
        </div>
        <LinkButton to="/cart" variant="white" size="sm" rightIcon="arrow-right">
          View cart
        </LinkButton>
      </div>
    </div>
  );
}
