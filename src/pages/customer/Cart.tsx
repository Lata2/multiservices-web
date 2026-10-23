import { useState } from 'react';
import { Link } from 'react-router';
import { Price, PriceSummary, PromoCard, ServiceThumb } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { ActionBar, Button, Card, ConfirmDialog, EmptyState, Icon, IconButton, Input, LinkButton, ListSkeleton, Modal, PageHeader, QuantityStepper, SectionHeader, Skeleton, Textarea } from '@/components/ui';
import { useCartServices, useOffers, useProvider, useQuote } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { toast } from '@/store/toast.store';
import { formatDuration, formatMoney } from '@/utils/format';

export default function Cart() {
  usePageMeta({ title: 'Cart', noindex: true });
  const { items, providerId, promoCode, notes, setQuantity, clear, setPromo, setNotes } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const services = useCartServices(items.map((i) => i.serviceId));
  const provider = useProvider(providerId ?? '');
  const quote = useQuote(items, promoCode);
  const offers = useOffers(providerId ?? undefined);
  const [code, setCode] = useState('');
  const [offersOpen, setOffersOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!items.length) {
    return (
      <PageBody narrow>
        <PageHeader title="Cart" />
        <EmptyState icon="cart" title="Your cart is empty" message="Browse services and add what you need. Services from the same provider can be booked together." actionLabel="Explore services" actionTo="/explore" />
      </PageBody>
    );
  }

  const applyCode = (value: string) => {
    if (!value.trim()) return;
    setPromo(value.trim().toUpperCase());
    setCode('');
    setOffersOpen(false);
  };
  const promoInvalid = !!promoCode && !!quote.data && !quote.data.promoValid;
  const totalMinutes = items.reduce((m, it) => m + (services.data?.find((s) => s.id === it.serviceId)?.durationMin ?? 0) * (it.quantity > 3 ? 1 : it.quantity), 0);
  const nonCustomer = user && user.role !== 'customer';

  const checkout = (
    <div className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        {quote.data ? <p className="text-h3 font-bold">{formatMoney(quote.data.pricing.total)}</p> : <Skeleton className="h-6 w-24" />}
        <p className="text-caption font-semibold text-primary-600">incl. taxes & fees</p>
      </div>
      <LinkButton to="/checkout/schedule" size="lg" rightIcon="arrow-right" className="flex-[1.4]" disabled={!!nonCustomer}>
        {user ? 'Select slot' : 'Sign in to book'}
      </LinkButton>
    </div>
  );

  return (
    <PageBody>
      <PageHeader title="Cart" subtitle={`${items.reduce((n, i) => n + i.quantity, 0)} items`} actions={<IconButton icon="trash" label="Clear cart" variant="plain" onClick={() => setConfirmClear(true)} />} />
      {nonCustomer ? (
        <p className="mb-4 flex items-center gap-2 rounded-lg bg-warning-50 p-3 text-body-sm text-warning-700">
          <Icon name="info" size={16} />
          You’re signed in as a {user.role}. Sign in with a customer account to book services.
        </p>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          {provider.data ? (
            <Link to={`/professionals/${providerId}`} className="focus-ring flex items-center gap-3 rounded-xl bg-primary-50 p-3 hover:bg-primary-100/70">
              <Icon name="store" size={19} className="text-primary-600" />
              <span className="min-w-0 flex-1">
                <span className="block text-caption text-ink-secondary">Booking with</span>
                <span className="block truncate font-semibold">{provider.data.provider.businessName}</span>
              </span>
              <span className="text-body-sm font-semibold text-primary-600">+ Add more</span>
            </Link>
          ) : null}

          <section aria-label="Cart items">
            {services.isPending ? (
              <ListSkeleton rows={2} />
            ) : (
              <Card className="flex flex-col gap-4">
                {items.map((it) => {
                  const s = services.data?.find((x) => x.id === it.serviceId);
                  if (!s) return null;
                  return (
                    <div key={it.serviceId} className="flex gap-3">
                      <ServiceThumb categoryId={s.categoryId} image={s.image} className="h-16 w-16 rounded-lg" iconSize={22} />
                      <div className="min-w-0 flex-1">
                        <Link to={`/service/${s.id}`} className="focus-ring line-clamp-2 rounded font-semibold hover:text-primary-700">
                          {s.title}
                        </Link>
                        <p className="text-caption text-ink-muted">{formatDuration(s.durationMin)}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <Price price={s.price * it.quantity} discountPrice={s.discountPrice ? s.discountPrice * it.quantity : undefined} size="sm" />
                          <QuantityStepper value={it.quantity} onChange={(v) => setQuantity(s.id, v)} max={s.maxQuantity} size="sm" label={`${s.title} quantity`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <p className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-caption text-ink-secondary">
                  <Icon name="clock" size={14} />
                  Estimated service time: {formatDuration(totalMinutes)}
                </p>
                {services.data && services.data.length !== items.length ? <p className="text-body-sm text-danger-600">Some services are no longer available.</p> : null}
              </Card>
            )}
          </section>

          <section>
            <SectionHeader title="Offers & coupons" action={offers.data?.length ? `View ${offers.data.length} offers` : undefined} onAction={() => setOffersOpen(true)} />
            <Card>
              {promoCode ? (
                <div className="flex items-center gap-3">
                  <span className={promoInvalid ? 'flex h-10 w-10 items-center justify-center rounded-full bg-danger-50 text-danger-600' : 'flex h-10 w-10 items-center justify-center rounded-full bg-success-50 text-success-600'}>
                    <Icon name={promoInvalid ? 'alert' : 'tag'} size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{promoCode}</p>
                    <p className={promoInvalid ? 'text-caption text-danger-600' : 'text-caption text-success-600'} aria-live="polite">
                      {quote.data?.promoMessage ?? 'Checking…'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setPromo(null)} className="focus-ring rounded text-body-sm font-semibold text-danger-600 hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form
                  className="flex items-start gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    applyCode(code);
                  }}
                >
                  <Input containerClassName="flex-1" aria-label="Promo code" placeholder="Enter promo code" value={code} onValueChange={(t) => setCode(t.toUpperCase())} leftIcon="tag" autoCapitalize="characters" />
                  <Button type="submit" variant="secondary" disabled={!code.trim()}>
                    Apply
                  </Button>
                </form>
              )}
            </Card>
          </section>

          <section>
            <SectionHeader title="Instructions for the professional" />
            <Textarea aria-label="Instructions for the professional" placeholder="E.g. gate code, parking, pets at home…" value={notes} onValueChange={setNotes} rows={3} maxLength={300} hint="Tip: include ‘#fail’ to simulate a declined payment in the demo." />
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <section>
            <SectionHeader title="Bill details" />
            <Card>{quote.data ? <PriceSummary pricing={quote.data.pricing} taxPercent={quote.data.taxPercent} promoCode={quote.data.promoValid ? promoCode : null} /> : <ListSkeleton rows={1} height={140} />}</Card>
          </section>
          <p className="flex items-start gap-2 rounded-lg bg-surface-muted p-3 text-caption text-ink-secondary">
            <Icon name="info" size={15} className="mt-px" />
            Free cancellation up to 3 hours before the slot. One provider per booking.
          </p>
          <Card elevation="md" className="hidden lg:block">
            {checkout}
          </Card>
        </aside>
      </div>
      <div className="lg:hidden">
        <ActionBar>{checkout}</ActionBar>
      </div>

      <Modal open={offersOpen} onClose={() => setOffersOpen(false)} title="Available offers">
        <div className="flex flex-col gap-3">
          {offers.data?.map((o) => (
            <PromoCard key={o.id} promo={o} applied={promoCode === o.code} onApply={() => applyCode(o.code)} />
          ))}
        </div>
      </Modal>
      <ConfirmDialog
        open={confirmClear}
        tone="danger"
        icon="trash"
        title="Clear cart?"
        message="All services will be removed from your cart."
        confirmLabel="Clear"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clear();
          setConfirmClear(false);
          toast.info('Cart cleared');
        }}
      />
    </PageBody>
  );
}
