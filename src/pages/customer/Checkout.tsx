import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AddressCard, PriceSummary } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { ActionBar, Button, Card, cn, EmptyState, Icon, LinkButton, ListSkeleton, Modal, PageHeader, SectionHeader, Spinner } from '@/components/ui';
import { PAYMENT_METHODS } from '@/constants/status';
import { useAddresses, usePaymentConfig, useProvider, useQuote, useWallet } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { bookingsApi } from '@/services/api';
import { useCartStore } from '@/store/cart.store';
import { toast } from '@/store/toast.store';
import { formatDay, formatMoney, formatTime } from '@/utils/format';
import { CheckoutSteps } from './CheckoutSteps';

export default function Checkout() {
  usePageMeta({ title: 'Checkout', noindex: true });
  const qc = useQueryClient();
  const navigate = useNavigate();
  const cart = useCartStore();
  const addresses = useAddresses();
  const quote = useQuote(cart.items, cart.promoCode);
  const wallet = useWallet();
  const provider = useProvider(cart.providerId ?? '');
  const gateways = usePaymentConfig();
  const [showAllPay, setShowAllPay] = useState(false);

  // Default the address to the user's default address.
  useEffect(() => {
    const list = addresses.data;
    if (!list) return;
    if (!cart.addressId || !list.some((a) => a.id === cart.addressId)) cart.setAddress(list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null);
  }, [addresses.data, cart]);

  const place = useApiMutation(
    () =>
      bookingsApi.create({
        items: cart.items,
        addressId: cart.addressId!,
        date: cart.date!,
        slot: cart.slot!,
        paymentMethod: cart.paymentMethod,
        promoCode: quote.data?.promoValid ? (cart.promoCode ?? undefined) : undefined,
        notes: cart.notes || undefined,
      }),
    {
      silentError: true,
      onSuccess: async (booking) => {
        cart.clear();
        await Promise.all([qc.invalidateQueries({ queryKey: qk.bookings.all }), qc.invalidateQueries({ queryKey: qk.wallet }), qc.invalidateQueries({ queryKey: qk.notifications })]);
        navigate(`/booking-success/${booking.id}`, { replace: true });
      },
      onError: (e) => {
        toast.error(e.message);
        if (e.code === 'PHONE_REQUIRED') navigate('/account/profile');
        if (e.code === 'SLOT_TAKEN') {
          cart.setSchedule(cart.date, null);
          void qc.invalidateQueries({ queryKey: ['slots'] });
          navigate('/checkout/schedule');
        }
      },
    },
  );

  if (!cart.items.length || !cart.date || !cart.slot) {
    return (
      <PageBody narrow>
        <PageHeader title="Checkout" back="/cart" />
        <EmptyState icon="calendar" title="Pick a slot first" message="Choose your services and a time slot before checking out." actionLabel="Go to cart" actionTo="/cart" />
      </PageBody>
    );
  }

  const total = quote.data?.pricing.total ?? 0;
  const balance = wallet.data?.balance ?? 0;
  const enabled = (m: (typeof PAYMENT_METHODS)[number]['value']) => {
    const g = gateways.data;
    if (!g) return true;
    if (m === 'cash') return g.cashOnService;
    if (m === 'wallet') return true;
    return g.paymentGateways[m];
  };
  const available = PAYMENT_METHODS.filter((m) => enabled(m.value));
  const methods = available.filter((m) => showAllPay || !m.gateway || m.value === 'razorpay');
  const walletShort = cart.paymentMethod === 'wallet' && balance < total;
  const canPlace = !!cart.addressId && !!quote.data && !walletShort && enabled(cart.paymentMethod);
  const payLabel = cart.paymentMethod === 'cash' ? 'Confirm booking' : `Pay ${formatMoney(total)}`;
  const slotEnd = `${String(Number(cart.slot.slice(0, 2))).padStart(2, '0')}:30`;

  const cta = (
    <div className="flex flex-col gap-2">
      {walletShort ? (
        <p className="text-center text-caption text-danger-600" role="alert">
          Wallet balance is {formatMoney(balance)}.{' '}
          <Link to="/account/wallet" className="font-semibold underline">
            Add money
          </Link>{' '}
          or choose another method.
        </p>
      ) : null}
      <Button size="lg" fullWidth leftIcon={cart.paymentMethod === 'cash' ? 'check-circle' : 'lock'} disabled={!canPlace} loading={place.isPending} onClick={() => place.mutate()}>
        {payLabel}
      </Button>
    </div>
  );

  return (
    <PageBody>
      <PageHeader title="Checkout" subtitle={provider.data?.provider.businessName} back="/checkout/schedule" />
      <div className="lg:max-w-2xl">
        <CheckoutSteps current={2} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section>
            <SectionHeader title="Service address" action={addresses.data?.length ? 'Add new' : undefined} to="/account/addresses/new?return=/checkout" />
            {addresses.isPending ? (
              <ListSkeleton rows={1} />
            ) : addresses.data?.length ? (
              <div role="radiogroup" aria-label="Service address" className="grid gap-3 xl:grid-cols-2">
                {addresses.data.map((a) => (
                  <AddressCard key={a.id} address={a} selected={a.id === cart.addressId} onSelect={() => cart.setAddress(a.id)} />
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-center py-8 text-center">
                <Icon name="pin" size={26} className="text-primary-500" />
                <p className="mt-2 font-semibold">No saved addresses</p>
                <LinkButton to="/account/addresses/new?return=/checkout" size="sm" className="mt-3" leftIcon="plus">
                  Add address
                </LinkButton>
              </Card>
            )}
          </section>

          <section>
            <SectionHeader title="Schedule" action="Change" to="/checkout/schedule" />
            <Card className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <Icon name="calendar" size={19} />
              </span>
              <div>
                <p className="font-semibold">{formatDay(cart.date)}</p>
                <p className="text-body-sm text-ink-secondary">
                  Arrival between {formatTime(cart.slot)} – {formatTime(slotEnd)}
                </p>
              </div>
            </Card>
          </section>

          <section>
            <SectionHeader title="Payment method" />
            <Card padded={false}>
              <div role="radiogroup" aria-label="Payment method">
                {methods.map((m, i) => {
                  const selected = cart.paymentMethod === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => cart.setPayment(m.value)}
                      className={cn('focus-ring flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-muted/60', i > 0 && 'border-t border-border', selected && 'bg-primary-50/50')}
                    >
                      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', selected ? 'bg-primary-500 text-white' : 'bg-surface-muted text-ink-secondary')}>
                        <Icon name={m.icon} size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{m.label}</span>
                        <span className="block text-caption text-ink-muted">{m.value === 'wallet' ? `Balance ${wallet.data ? formatMoney(balance) : '…'}` : m.description}</span>
                      </span>
                      <Icon name={selected ? 'radio-on' : 'circle'} size={21} className={selected ? 'text-primary-500' : 'text-ink-muted'} />
                    </button>
                  );
                })}
              </div>
              {available.length > methods.length || showAllPay ? (
                <button type="button" onClick={() => setShowAllPay((v) => !v)} className="focus-ring w-full border-t border-border px-4 py-3 text-center text-body-sm font-semibold text-primary-600 hover:bg-surface-muted/60">
                  {showAllPay ? 'Show fewer options' : 'More payment options'}
                </button>
              ) : null}
            </Card>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <section>
            <SectionHeader title="Bill summary" />
            <Card>{quote.data ? <PriceSummary pricing={quote.data.pricing} taxPercent={quote.data.taxPercent} promoCode={quote.data.promoValid ? cart.promoCode : null} /> : <ListSkeleton rows={1} height={140} />}</Card>
          </section>
          <p className="flex items-center justify-center gap-1.5 text-caption text-ink-secondary">
            <Icon name="shield-check" size={14} className="text-success-600" />
            Payments are encrypted and processed securely
          </p>
          <Card elevation="md" className="hidden lg:block">
            {cta}
          </Card>
        </aside>
      </div>
      <div className="lg:hidden">
        <ActionBar>{cta}</ActionBar>
      </div>

      <Modal open={place.isPending && cart.paymentMethod !== 'cash'} onClose={() => undefined} variant="dialog" size="sm" hideClose locked>
        <div className="flex flex-col items-center py-4 text-center">
          <Spinner size={36} />
          <h2 className="mt-4 text-h3 font-semibold">Processing payment</h2>
          <p className="mt-1 text-ink-secondary">Securely contacting {PAYMENT_METHODS.find((m) => m.value === cart.paymentMethod)?.label}. Please don’t close this tab.</p>
        </div>
      </Modal>
    </PageBody>
  );
}
