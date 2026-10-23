import { Link } from 'react-router';
import { Card, ListSkeleton, PageHeader, QueryView, SectionHeader } from '@/components/ui';
import { EarningsView } from '@/features/EarningsView';
import { useProviderEarnings, useProviderProfile } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { providerApi } from '@/services/api';
import { formatDay, formatMoney } from '@/utils/format';

export default function ProviderEarnings() {
  usePageMeta({ title: 'Earnings', noindex: true });
  const q = useProviderEarnings();
  const profile = useProviderProfile();
  const payout = useApiMutation((v: { amount: number; done: () => void }) => providerApi.requestPayout(v.amount), { invalidate: [qk.provider_.all], successMessage: 'Payout requested', onSuccess: (_, v) => v.done() });
  const bank = profile.data?.bank;
  return (
    <>
      <PageHeader title="Earnings" />
      <QueryView query={q} loading={<ListSkeleton rows={3} height={160} />}>
        {(d) => (
          <EarningsView
            summary={d.summary}
            payouts={d.payouts}
            requesting={payout.isPending}
            onRequestPayout={(amount, done) => payout.mutate({ amount, done })}
            bankLabel={bank ? `${bank.bankName} ${bank.accountNumber}` : undefined}
            extra={
              <>
                <SectionHeader title="Completed jobs" />
                <Card padded={false}>
                  {d.recent.length ? (
                    <ul className="divide-y divide-border">
                      {d.recent.slice(0, 8).map((b) => (
                        <li key={b.id}>
                          <Link to={`/provider/bookings/${b.id}`} className="focus-ring flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-muted/60">
                            <span className="min-w-0">
                              <span className="block truncate text-body-sm font-semibold">{b.items[0].title}</span>
                              <span className="text-caption text-ink-muted">
                                {b.customerName} · {formatDay(b.scheduledDate)}
                              </span>
                            </span>
                            <span className="text-right">
                              <span className="block font-bold text-success-600">+{formatMoney(b.net)}</span>
                              <span className="text-caption text-ink-muted">of {formatMoney(b.pricing.total)}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-4 text-ink-muted">No completed jobs yet.</p>
                  )}
                </Card>
                <p className="mt-2 text-caption text-ink-muted">Earnings shown after {d.commissionRate}% platform commission. Taxes are collected from customers and remitted by Servio.</p>
              </>
            }
          />
        )}
      </QueryView>
    </>
  );
}
