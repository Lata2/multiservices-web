import { useState, type ReactNode } from 'react';
import { PAYOUT_STATUS } from '@/constants/status';
import type { EarningsSummary, Payout } from '@/types/models';
import { compactNumber, formatDate, formatMoney } from '@/utils/format';
import { Badge, BarChart, Button, Card, Chip, EmptyState, Input, Modal, SectionHeader } from '@/components/ui';

/** Earnings summary + payouts used by providers and delivery partners. */
export function EarningsView({
  summary,
  payouts,
  onRequestPayout,
  requesting,
  minPayout = 500,
  extra,
  bankLabel,
}: {
  summary: EarningsSummary;
  payouts: Payout[];
  onRequestPayout: (amount: number, done: () => void) => void;
  requesting: boolean;
  minPayout?: number;
  extra?: ReactNode;
  bankLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const n = Number(amount);
    if (!n || Number.isNaN(n)) return setError('Enter an amount');
    if (n < minPayout) return setError(`Minimum withdrawal is ${formatMoney(minPayout)}`);
    if (n > summary.pendingPayout) return setError('Amount exceeds available balance');
    onRequestPayout(n, () => setOpen(false));
  };
  const week = summary.series.reduce((s, x) => s + x.value, 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="flex flex-col gap-5">
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-success-600 to-success-700 p-5 text-white shadow-md sm:p-6" aria-label="Balance">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" aria-hidden />
          <p className="text-white/80">Available to withdraw</p>
          <p className="mt-1 text-display font-black">{formatMoney(summary.pendingPayout)}</p>
          <dl className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <dt className="text-caption text-white/70">Lifetime</dt>
              <dd className="font-bold">{formatMoney(summary.total)}</dd>
            </div>
            <div>
              <dt className="text-caption text-white/70">Withdrawn</dt>
              <dd className="font-bold">{formatMoney(summary.withdrawn)}</dd>
            </div>
            {summary.commissionPaid ? (
              <div>
                <dt className="text-caption text-white/70">Commission</dt>
                <dd className="font-bold">{formatMoney(summary.commissionPaid)}</dd>
              </div>
            ) : null}
          </dl>
          <Button variant="white" leftIcon="arrow-up" className="mt-5" disabled={summary.pendingPayout < minPayout} onClick={() => (setAmount(String(summary.pendingPayout)), setError(null), setOpen(true))}>
            Withdraw
          </Button>
        </section>
        <Card>
          <div className="mb-4 flex items-end justify-between gap-2">
            <div>
              <p className="text-caption text-ink-muted">Last 7 days</p>
              <p className="text-h3 font-semibold">{formatMoney(week)}</p>
            </div>
            <Badge label={`This month ${formatMoney(summary.thisMonth)}`} tone="success" />
          </div>
          <BarChart data={summary.series} format={(v) => `₹${compactNumber(v)}`} label="Earnings over the last 7 days" />
        </Card>
      </div>
      <div className="flex flex-col">
        {extra}
        <SectionHeader title="Payout history" className={extra ? 'mt-7' : ''} />
        {payouts.length ? (
          <Card padded={false}>
            <ul className="divide-y divide-border">
              {payouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div>
                    <p className="font-semibold">{formatMoney(p.amount)}</p>
                    <p className="text-caption text-ink-muted">
                      Requested {formatDate(p.requestedAt)}
                      {p.processedAt ? ` · processed ${formatDate(p.processedAt)}` : ''}
                    </p>
                    {p.note ? <p className="text-caption text-danger-600">{p.note}</p> : null}
                  </div>
                  <Badge label={PAYOUT_STATUS[p.status].label} tone={PAYOUT_STATUS[p.status].tone} />
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card>
            <EmptyState compact icon="cash" title="No payouts yet" message={`Withdraw once your balance reaches ${formatMoney(minPayout)}.`} />
          </Card>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Withdraw earnings" subtitle={bankLabel ? `To ${bankLabel}` : undefined} footer={<Button fullWidth loading={requesting} onClick={submit}>Request payout</Button>}>
        <Input label="Amount" prefix="₹" inputMode="numeric" value={amount} onValueChange={(t) => (setAmount(t.replace(/\D/g, '')), setError(null))} error={error ?? undefined} hint={`Available ${formatMoney(summary.pendingPayout)} · minimum ${formatMoney(minPayout)}`} data-autofocus />
        <div className="mt-3 flex gap-2">
          {[0.25, 0.5, 1].map((f) => (
            <Chip key={f} label={f === 1 ? 'All' : `${f * 100}%`} onClick={() => setAmount(String(Math.floor(summary.pendingPayout * f)))} />
          ))}
        </div>
        <p className="mt-4 text-caption text-ink-muted">Payouts are reviewed by our team and usually reach your bank within 2 business days.</p>
      </Modal>
    </div>
  );
}
