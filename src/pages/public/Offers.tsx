import { PromoCard } from '@/components/domain';
import { PageBody } from '@/components/layout/SiteLayout';
import { EmptyState, ListSkeleton, PageHeader, QueryView } from '@/components/ui';
import { useOffers } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useCartStore } from '@/store/cart.store';
import { copyText } from '@/utils/linking';

export default function Offers() {
  usePageMeta({ title: 'Offers & coupons', description: 'Current Servio promo codes and deals on cleaning, AC service, salon at home and more.' });
  const q = useOffers();
  const setPromo = useCartStore((s) => s.setPromo);
  const promo = useCartStore((s) => s.promoCode);
  return (
    <PageBody>
      <PageHeader title="Offers & coupons" subtitle="Apply a code at checkout. Provider codes work only with that provider’s services." back="/" />
      <QueryView query={q} loading={<ListSkeleton rows={4} height={120} />} empty={<EmptyState icon="tags" title="No offers right now" message="Check back soon for seasonal deals." />}>
        {(list) => (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((p) => (
              <PromoCard
                key={p.id}
                promo={p}
                applied={promo === p.code}
                onApply={() => {
                  setPromo(p.code);
                  void copyText(p.code, `${p.code} will be applied in your cart`);
                }}
              />
            ))}
          </div>
        )}
      </QueryView>
    </PageBody>
  );
}
