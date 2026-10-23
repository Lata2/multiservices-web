import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { BookingCard } from '@/components/domain';
import { ActionBar, Avatar, Badge, Button, Card, Chip, ConfirmDialog, ErrorState, Icon, Input, KeyValue, LoadingState, Modal, PageHeader, SectionHeader, StatCard } from '@/components/ui';
import { PROVIDER_STATUS } from '@/constants/status';
import { useAdminProvider, useCategories } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { errorMessage, useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminApi } from '@/services/api';
import type { ProviderStatus } from '@/types/models';
import { formatDate, formatMoney } from '@/utils/format';

export default function AdminProviderDetail() {
  const { id = '' } = useParams();
  const q = useAdminProvider(id);
  const cats = useCategories(null);
  const [action, setAction] = useState<ProviderStatus | null>(null);
  const [note, setNote] = useState('');
  const [commissionOpen, setCommissionOpen] = useState(false);
  const [rate, setRate] = useState('');
  const invalidate = [qk.admin.all, ['providers'], ['provider']];
  const setStatus = useApiMutation((s: ProviderStatus) => adminApi.setProviderStatus(id, s, note || undefined), { invalidate, successMessage: (p) => `Provider ${PROVIDER_STATUS[p.status].label.toLowerCase()}`, onSuccess: () => (setAction(null), setNote('')) });
  const setCommission = useApiMutation(() => adminApi.setCommission(id, Number(rate)), { invalidate, successMessage: 'Commission updated', onSuccess: () => setCommissionOpen(false) });
  usePageMeta({ title: q.data?.provider.businessName ?? 'Provider', noindex: true });

  if (q.isPending) return <LoadingState />;
  if (q.isError) return <><PageHeader title="Provider" back="/admin/providers" /><ErrorState message={errorMessage(q.error)} onRetry={() => void q.refetch()} /></>;
  const { provider: p, bookings, serviceCount, revenue } = q.data;
  const s = PROVIDER_STATUS[p.status];

  const actions =
    p.status === 'pending' ? (
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => setAction('rejected')}>
          Reject
        </Button>
        <Button variant="success" leftIcon="check" className="flex-1" onClick={() => setAction('approved')}>
          Approve
        </Button>
      </div>
    ) : p.status === 'approved' ? (
      <Button variant="outline" leftIcon="ban" fullWidth onClick={() => setAction('suspended')}>
        Suspend provider
      </Button>
    ) : (
      <Button variant="success" leftIcon="refresh" fullWidth onClick={() => setAction('approved')}>
        Reinstate provider
      </Button>
    );

  return (
    <>
      <PageHeader title="Provider details" back="/admin/providers" />
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-4">
          <Card className="flex flex-col items-center gap-2 text-center">
            <Avatar src={p.avatar} name={p.businessName} size={72} rounded="lg" />
            <h2 className="text-h3 font-semibold">{p.businessName}</h2>
            <p className="text-body-sm text-ink-secondary">
              {p.ownerName} · {p.type === 'organization' ? 'Organisation' : 'Individual'}
            </p>
            <Badge label={s.label} tone={s.tone} size="md" />
            <Link to={`/professionals/${p.id}`} target="_blank" className="focus-ring mt-1 flex items-center gap-1 rounded text-caption font-semibold text-primary-600 hover:underline">
              View public profile
              <Icon name="arrow-out" size={12} />
            </Link>
          </Card>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            <StatCard label="Bookings" value={`${bookings.length}`} icon="receipt" />
            <StatCard label="Services" value={`${serviceCount}`} icon="wrench" tone="accent" />
            <StatCard label="Commission earned" value={formatMoney(revenue)} icon="wallet" tone="success" />
          </div>
          <Card className="hidden lg:block">{actions}</Card>
        </aside>
        <div className="flex min-w-0 flex-col gap-6">
          <section>
            <SectionHeader title="Business information" />
            <Card>
              <dl>
                <KeyValue label="Email" value={p.email} />
                <KeyValue label="Phone" value={p.phone} />
                <KeyValue label="City" value={p.city} />
                <KeyValue label="Experience" value={`${p.yearsExperience} years`} />
                <KeyValue label="Joined" value={formatDate(p.joinedAt)} />
                <KeyValue label="Visiting charge" value={formatMoney(p.visitingCharge)} />
                <KeyValue
                  label="Commission"
                  value={
                    <button type="button" className="focus-ring rounded font-semibold text-primary-600 hover:underline" onClick={() => (setRate(String(p.commissionRate)), setCommissionOpen(true))}>
                      {p.commissionRate}% · Edit
                    </button>
                  }
                />
              </dl>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.categoryIds.map((cid) => (
                  <Badge key={cid} label={cats.data?.find((x) => x.id === cid)?.name ?? cid} tone="primary" />
                ))}
              </div>
              {p.about ? <p className="mt-3 text-body-sm text-ink-secondary">{p.about}</p> : null}
            </Card>
          </section>
          <div className="grid gap-6 xl:grid-cols-2">
            <section>
              <SectionHeader title="KYC documents" />
              <Card className="flex flex-col gap-3">
                {p.documents.map((d) => (
                  <div key={d.id} className="flex items-center gap-3">
                    <Icon name="document" size={19} className="text-primary-500" />
                    <span className="flex-1">{d.name}</span>
                    <Badge label={d.status} tone={d.status === 'verified' ? 'success' : d.status === 'missing' ? 'neutral' : d.status === 'rejected' ? 'danger' : 'warning'} className="capitalize" />
                  </div>
                ))}
              </Card>
            </section>
            {p.bank ? (
              <section>
                <SectionHeader title="Payout account" />
                <Card>
                  <dl>
                    <KeyValue label="Account" value={p.bank.accountName} />
                    <KeyValue label="Number" value={p.bank.accountNumber} />
                    <KeyValue label="IFSC" value={p.bank.ifsc} />
                    <KeyValue label="Bank" value={p.bank.bankName} />
                  </dl>
                </Card>
              </section>
            ) : null}
          </div>
          <section>
            <SectionHeader title="Recent bookings" />
            {bookings.length ? (
              <div className="grid gap-3 xl:grid-cols-2">
                {bookings.slice(0, 4).map((b) => (
                  <BookingCard key={b.id} booking={b} perspective="admin" to={`/admin/bookings/${b.id}`} />
                ))}
              </div>
            ) : (
              <p className="text-ink-muted">No bookings yet.</p>
            )}
          </section>
        </div>
      </div>
      <div className="lg:hidden">
        <ActionBar>{actions}</ActionBar>
      </div>
      <ConfirmDialog
        open={!!action}
        tone={action === 'approved' ? 'success' : 'danger'}
        icon={action === 'approved' ? 'check-circle' : 'alert'}
        title={action === 'approved' ? (p.status === 'pending' ? 'Approve provider?' : 'Reinstate provider?') : action === 'rejected' ? 'Reject application?' : 'Suspend provider?'}
        message={action === 'approved' ? 'Their services go live immediately and they’ll be notified.' : 'The provider will be notified with your note.'}
        confirmLabel={action === 'approved' ? 'Approve' : action === 'rejected' ? 'Reject' : 'Suspend'}
        loading={setStatus.isPending}
        onCancel={() => setAction(null)}
        onConfirm={() => action && setStatus.mutate(action)}
      >
        {action !== 'approved' ? (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {['Documents unclear', 'Incomplete profile', 'Policy violation', 'Customer complaints'].map((r) => (
                <Chip key={r} label={r} selected={note === r} onClick={() => setNote(r)} />
              ))}
            </div>
            <Input aria-label="Note to provider" placeholder="Note to provider" value={note} onValueChange={setNote} />
          </>
        ) : null}
      </ConfirmDialog>
      <Modal open={commissionOpen} onClose={() => setCommissionOpen(false)} title="Set commission" subtitle="Percentage of service value retained by the platform" size="sm" footer={<Button fullWidth loading={setCommission.isPending} onClick={() => setCommission.mutate()} disabled={!rate}>Save commission</Button>}>
        <Input label="Commission %" inputMode="numeric" value={rate} onValueChange={(t) => setRate(t.replace(/\D/g, '').slice(0, 2))} data-autofocus />
        <div className="mt-3 flex gap-2">
          {['10', '12', '15', '20'].map((r) => (
            <Chip key={r} label={`${r}%`} selected={rate === r} onClick={() => setRate(r)} />
          ))}
        </div>
      </Modal>
    </>
  );
}
