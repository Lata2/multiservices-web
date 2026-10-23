import { useParams } from 'react-router';
import { PageBody } from '@/components/layout/SiteLayout';
import { Button, Card, Divider, ErrorState, LoadingState, PageHeader, KeyValue } from '@/components/ui';
import { LogoMark } from '@/components/layout/Logo';
import { paymentLabel } from '@/constants/status';
import { useBooking } from '@/hooks/api';
import { errorMessage } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatDate, formatMoney } from '@/utils/format';
import { shareContent } from '@/utils/linking';

/** Tax invoice. Print/save as PDF uses the browser; in production the backend returns a signed PDF URL. */
export default function Invoice() {
  usePageMeta({ title: 'Tax invoice', noindex: true });
  const { id = '' } = useParams();
  const q = useBooking(id);
  if (q.isPending) return <LoadingState />;
  if (q.isError) return <PageBody narrow><PageHeader title="Invoice" back={`/bookings/${id}`} /><ErrorState message={errorMessage(q.error)} /></PageBody>;
  const b = q.data;
  const share = () => void shareContent({ title: `Servio invoice INV-${b.code}`, text: `Servio invoice INV-${b.code}\n${b.items.map((i) => `${i.title} × ${i.quantity}: ${formatMoney(i.unitPrice * i.quantity)}`).join('\n')}\nTotal: ${formatMoney(b.pricing.total)}` });

  return (
    <PageBody narrow>
      <div className="print:hidden">
        <PageHeader
          title="Tax invoice"
          back={`/bookings/${id}`}
          actions={
            <>
              <Button variant="outline" size="sm" leftIcon="share" onClick={share}>
                Share
              </Button>
              <Button size="sm" leftIcon="download" onClick={() => window.print()}>
                Download PDF
              </Button>
            </>
          }
        />
      </div>
      <Card elevation="md" className="flex flex-col gap-5 print:border-0 print:shadow-none">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark size={40} />
            <div>
              <p className="text-title font-black">Servio</p>
              <p className="text-caption text-ink-muted">GSTIN 29ABCDE1234F1Z5</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-caption text-ink-muted">Invoice no.</p>
            <p className="font-semibold">INV-{b.code}</p>
            <p className="text-caption text-ink-muted">{formatDate(b.scheduledDate)}</p>
          </div>
        </div>
        <Divider />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-caption font-semibold text-ink-muted">Billed to</p>
            <p className="mt-1 font-semibold">{b.customerName}</p>
            <p className="text-caption text-ink-secondary">
              {b.address.line1}, {b.address.city} {b.address.pincode}
            </p>
          </div>
          <div>
            <p className="text-caption font-semibold text-ink-muted">Service by</p>
            <p className="mt-1 font-semibold">{b.providerName}</p>
            <p className="text-caption text-ink-secondary">Booking #{b.code}</p>
          </div>
        </div>
        <table className="w-full text-body-sm">
          <thead>
            <tr className="border-y border-border text-caption text-ink-muted">
              <th className="py-2 text-left font-semibold">Item</th>
              <th className="w-14 py-2 text-center font-semibold">Qty</th>
              <th className="w-24 py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {b.items.map((it) => (
              <tr key={it.serviceId} className="border-b border-border">
                <td className="py-2.5 pr-2">{it.title}</td>
                <td className="py-2.5 text-center">{it.quantity}</td>
                <td className="py-2.5 text-right font-medium">{formatMoney(it.unitPrice * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl>
          <KeyValue label="Subtotal" value={formatMoney(b.pricing.subtotal)} />
          {b.pricing.discount ? <KeyValue label={`Discount ${b.promoCode ? `(${b.promoCode})` : ''}`} value={`− ${formatMoney(b.pricing.discount)}`} tone="success" /> : null}
          <KeyValue label="Visiting charge" value={formatMoney(b.pricing.visitingCharge)} />
          <KeyValue label="CGST (9%)" value={formatMoney(b.pricing.tax / 2)} />
          <KeyValue label="SGST (9%)" value={formatMoney(b.pricing.tax / 2)} />
          <Divider className="my-2" />
          <KeyValue label="Grand total" value={formatMoney(b.pricing.total)} bold />
        </dl>
        <p className="rounded-lg bg-surface-muted p-3 text-caption text-ink-secondary">
          Paid via {paymentLabel(b.payment.method)}
          {b.payment.transactionId ? ` · Txn ${b.payment.transactionId}` : ''} · Status: {b.payment.status}
        </p>
        <p className="text-center text-caption text-ink-muted">This is a computer-generated invoice and does not require a signature.</p>
      </Card>
    </PageBody>
  );
}
