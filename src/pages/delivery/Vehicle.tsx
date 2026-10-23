import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { ActionBar, Badge, Button, Card, FormInput, Icon, LoadingState, OptionCards, PageHeader, SectionHeader } from '@/components/ui';
import { useDeliveryProfile } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { deliveryApi } from '@/services/api';
import { toast } from '@/store/toast.store';

const schema = z.object({
  vehicleType: z.enum(['bike', 'scooter', 'car', 'van']),
  vehicleNumber: z.string().trim().min(6, 'Enter a valid vehicle number').max(14),
  licenseNumber: z.string().trim().min(8, 'Enter a valid licence number'),
});
type Form = z.infer<typeof schema>;

export default function Vehicle() {
  usePageMeta({ title: 'Vehicle & documents', noindex: true });
  const navigate = useNavigate();
  const q = useDeliveryProfile();
  const { control, handleSubmit, reset, formState } = useForm<Form>({ resolver: zodResolver(schema) });
  useEffect(() => {
    if (q.data) reset({ vehicleType: q.data.vehicleType, vehicleNumber: q.data.vehicleNumber, licenseNumber: q.data.licenseNumber });
  }, [q.data, reset]);
  const save = useApiMutation((v: Form) => deliveryApi.updateProfile({ ...v, vehicleNumber: v.vehicleNumber.toUpperCase(), licenseNumber: v.licenseNumber.toUpperCase() }), {
    invalidate: [qk.delivery.all],
    successMessage: 'Vehicle details saved',
    onSuccess: () => navigate('/delivery/account'),
  });
  if (q.isPending) return <LoadingState />;
  const approved = q.data?.status === 'approved';

  return (
    <div className="max-w-3xl">
      <PageHeader title="Vehicle & documents" back="/delivery/account" />
      <form id="vehicle-form" noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
        <Card className="flex flex-col gap-4">
          <Controller
            control={control}
            name="vehicleType"
            render={({ field }) => (
              <OptionCards
                label="Vehicle type"
                value={field.value}
                onChange={field.onChange}
                options={[
                  { value: 'bike', label: 'Bike', icon: 'bike' },
                  { value: 'scooter', label: 'Scooter', icon: 'gauge' },
                  { value: 'car', label: 'Car', icon: 'car' },
                  { value: 'van', label: 'Van', icon: 'van' },
                ]}
              />
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput control={control} name="vehicleNumber" label="Registration number" required className="uppercase" />
            <FormInput control={control} name="licenseNumber" label="Driving licence" required className="uppercase" />
          </div>
        </Card>
      </form>
      <section className="mt-6">
        <SectionHeader title="Documents" />
        <ul className="grid gap-3 sm:grid-cols-2">
          {['Driving licence', 'Vehicle RC', 'Insurance', 'Aadhaar / ID'].map((d, i) => {
            const ok = approved || i < 2;
            return (
              <li key={d}>
                <button type="button" onClick={() => toast.info('Document upload connects to secure storage when the backend is live.')} className="focus-ring flex w-full items-center gap-3 rounded-card border border-border/80 bg-surface p-4 text-left shadow-sm hover:border-primary-200">
                  <Icon name="document" size={21} className="text-primary-500" />
                  <span className="flex-1 font-medium">{d}</span>
                  <Badge label={ok ? 'Verified' : 'Pending'} tone={ok ? 'success' : 'warning'} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <ActionBar>
        <Button type="submit" form="vehicle-form" size="lg" fullWidth disabled={!formState.isDirty} loading={save.isPending}>
          Save
        </Button>
      </ActionBar>
    </div>
  );
}
