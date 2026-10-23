import { useState } from 'react';
import { Button, Card, Chip, cn, EmptyState, Icon, Input, ListSkeleton, Modal, PageHeader, QueryView, SectionHeader } from '@/components/ui';
import { useWallet } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { walletApi } from '@/services/api';
import { formatDateTime, formatMoney } from '@/utils/format';

export default function Wallet() {
  usePageMeta({ title: 'Servio Wallet', noindex: true });
  const q = useWallet();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('500');
  const [method, setMethod] = useState('UPI');
  const [error, setError] = useState<string | null>(null);
  const add = useApiMutation(() => walletApi.addMoney(Number(amount), method), { invalidate: [qk.wallet], successMessage: `${formatMoney(Number(amount))} added to wallet`, onSuccess: () => setOpen(false) });
  const submit = () => {
    const n = Number(amount);
    if (!amount || Number.isNaN(n) || n < 10) return setError('Minimum amount is ₹10');
    if (n > 50000) return setError('Maximum amount is ₹50,000');
    add.mutate();
  };

  return (
    <>
      <PageHeader title="Servio Wallet" back="/account" />
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="relative h-fit overflow-hidden rounded-xl bg-gradient-to-br from-primary-500 to-primary-800 p-6 text-white shadow-md" aria-label="Wallet balance">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" aria-hidden />
          <div className="flex items-center justify-between">
            <p className="text-white/80">Available balance</p>
            <Icon name="wallet" size={21} />
          </div>
          <p className="mt-2 text-display font-black">{q.data ? formatMoney(q.data.balance) : '—'}</p>
          <p className="mt-1 text-caption text-white/70">Use for instant checkout & faster refunds</p>
          <Button variant="white" leftIcon="plus" className="mt-5" onClick={() => (setError(null), setOpen(true))}>
            Add money
          </Button>
        </section>
        <section>
          <SectionHeader title="Transactions" />
          <QueryView query={q} loading={<ListSkeleton rows={4} height={64} />} isEmpty={(d) => d.transactions.length === 0} empty={<EmptyState compact icon="receipt" title="No transactions yet" />}>
            {(d) => (
              <Card padded={false}>
                <ul className="divide-y divide-border">
                  {d.transactions.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 px-4 py-3.5">
                      <span className={cn('flex h-10 w-10 items-center justify-center rounded-full', t.type === 'credit' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600')}>
                        <Icon name={t.type === 'credit' ? 'arrow-down' : 'arrow-up'} size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-body-sm font-medium">{t.title}</span>
                        <span className="text-caption text-ink-muted">{formatDateTime(t.createdAt)}</span>
                      </span>
                      <span className={cn('font-bold', t.type === 'credit' ? 'text-success-600' : 'text-ink')}>
                        {t.type === 'credit' ? '+' : '−'}
                        {formatMoney(t.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </QueryView>
        </section>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add money" footer={<Button fullWidth loading={add.isPending} onClick={submit}>Add {amount ? formatMoney(Number(amount) || 0) : ''}</Button>}>
        <Input label="Amount" prefix="₹" inputMode="numeric" value={amount} onValueChange={(t) => (setAmount(t.replace(/\D/g, '')), setError(null))} error={error ?? undefined} data-autofocus />
        <div className="mt-3 flex flex-wrap gap-2">
          {['200', '500', '1000', '2000'].map((v) => (
            <Chip key={v} label={`₹${v}`} selected={amount === v} onClick={() => setAmount(v)} />
          ))}
        </div>
        <p className="mb-2 mt-5 text-body-sm font-medium text-ink-secondary">Pay using</p>
        <div className="flex flex-wrap gap-2">
          {['UPI', 'Card', 'Netbanking'].map((m) => (
            <Chip key={m} label={m} selected={method === m} onClick={() => setMethod(m)} />
          ))}
        </div>
      </Modal>
    </>
  );
}
