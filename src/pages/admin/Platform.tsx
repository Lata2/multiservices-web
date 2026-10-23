import { useState } from 'react';
import { ActionBar, Button, Card, Divider, Input, LoadingState, PageHeader, SectionHeader, SwitchRow } from '@/components/ui';
import { useAdminSettings } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminApi } from '@/services/api';
import type { PlatformSettings } from '@/types/models';

const GATEWAYS: { key: keyof PlatformSettings['paymentGateways']; label: string }[] = [
  { key: 'upi', label: 'UPI' },
  { key: 'card', label: 'Cards' },
  { key: 'razorpay', label: 'Razorpay' },
  { key: 'stripe', label: 'Stripe' },
  { key: 'paystack', label: 'Paystack' },
  { key: 'flutterwave', label: 'Flutterwave' },
];

export default function PlatformSettingsPage() {
  usePageMeta({ title: 'Platform settings', noindex: true });
  const q = useAdminSettings();
  if (!q.data) return <LoadingState />;
  return <SettingsEditor initial={q.data} />;
}

function SettingsEditor({ initial }: { initial: PlatformSettings }) {
  const [s, setS] = useState<PlatformSettings>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = useApiMutation(() => adminApi.updateSettings(s), { invalidate: [qk.admin.settings, ['config'], ['quote']], successMessage: 'Platform settings saved' });
  const num = (k: 'taxPercent' | 'defaultCommission' | 'minPayout' | 'cancellationWindowHours', v: string) => setS({ ...s, [k]: Number(v.replace(/\D/g, '')) || 0 });
  const dirty = JSON.stringify(s) !== JSON.stringify(initial);
  const validate = () => {
    const e: Record<string, string> = {};
    if (s.taxPercent > 40) e.tax = 'Maximum is 40%';
    if (s.defaultCommission > 50) e.commission = 'Maximum is 50%';
    if (!/^\S+@\S+\.\S+$/.test(s.supportEmail)) e.email = 'Enter a valid email';
    if (s.supportPhone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid phone number';
    setErrors(e);
    return !Object.keys(e).length;
  };

  return (
    <div className="max-w-4xl">
      <PageHeader title="Platform settings" back="/admin/more" />
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionHeader title="Pricing" />
          <Card className="grid grid-cols-2 gap-4">
            <Input label="GST / tax %" inputMode="numeric" value={String(s.taxPercent)} onValueChange={(v) => num('taxPercent', v)} error={errors.tax} />
            <Input label="Default commission %" inputMode="numeric" value={String(s.defaultCommission)} onValueChange={(v) => num('defaultCommission', v)} error={errors.commission} />
            <Input label="Min payout ₹" inputMode="numeric" value={String(s.minPayout)} onValueChange={(v) => num('minPayout', v)} />
            <Input label="Free cancellation (hrs)" inputMode="numeric" value={String(s.cancellationWindowHours)} onValueChange={(v) => num('cancellationWindowHours', v)} />
          </Card>
        </section>
        <section>
          <SectionHeader title="Support contact" />
          <Card className="flex flex-col gap-4">
            <Input label="Support email" type="email" value={s.supportEmail} onValueChange={(v) => setS({ ...s, supportEmail: v })} error={errors.email} />
            <Input label="Support phone" type="tel" value={s.supportPhone} onValueChange={(v) => setS({ ...s, supportPhone: v })} error={errors.phone} />
          </Card>
        </section>
        <section>
          <SectionHeader title="Payment methods" />
          <Card className="py-1">
            {GATEWAYS.map((g, i) => (
              <div key={g.key}>
                {i > 0 ? <Divider /> : null}
                <SwitchRow title={g.label} value={s.paymentGateways[g.key]} onChange={(v) => setS({ ...s, paymentGateways: { ...s.paymentGateways, [g.key]: v } })} />
              </div>
            ))}
            <Divider />
            <SwitchRow title="Pay after service (cash)" value={s.cashOnService} onChange={(v) => setS({ ...s, cashOnService: v })} />
          </Card>
          <p className="mt-2 text-caption text-ink-muted">Disabled methods disappear from customer checkout immediately. Gateway API keys live on the server — never in the app.</p>
        </section>
        <section>
          <SectionHeader title="System" />
          <Card className="py-1">
            <SwitchRow icon="construct" title="Maintenance mode" subtitle="Temporarily pause new bookings" value={s.maintenanceMode} onChange={(v) => setS({ ...s, maintenanceMode: v })} />
          </Card>
        </section>
      </div>
      <ActionBar>
        <Button size="lg" fullWidth disabled={!dirty} loading={save.isPending} onClick={() => validate() && save.mutate()}>
          Save settings
        </Button>
      </ActionBar>
    </div>
  );
}
