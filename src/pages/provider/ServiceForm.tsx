import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { ActionBar, Button, Card, FormInput, FormTextarea, Icon, PageHeader, Select, SwitchRow } from '@/components/ui';
import { useAllCategories, useProviderServices } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { providerApi } from '@/services/api';
import { toast } from '@/store/toast.store';
import { formatMoney } from '@/utils/format';
import { serviceSchema, type ServiceForm } from '@/utils/validation';

const lines = (s?: string) => (s ?? '').split('\n').map((x) => x.trim()).filter(Boolean);

export default function ServiceFormPage() {
  const { id } = useParams();
  usePageMeta({ title: id ? 'Edit service' : 'New service', noindex: true });
  const navigate = useNavigate();
  const services = useProviderServices();
  const cats = useAllCategories();
  const existing = services.data?.find((s) => s.id === id);

  const { control, handleSubmit, reset, setValue } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { title: '', description: '', categoryId: '', subcategoryId: '', price: '', discountPrice: '', durationMin: '60', membersRequired: '1', includes: '', excludes: '', requiresPickup: false, active: true },
  });
  const [categoryId, price, discountPrice] = useWatch({ control, name: ['categoryId', 'price', 'discountPrice'] });
  useEffect(() => {
    if (existing)
      reset({
        title: existing.title,
        description: existing.description,
        categoryId: existing.categoryId,
        subcategoryId: existing.subcategoryId ?? '',
        price: String(existing.price),
        discountPrice: existing.discountPrice ? String(existing.discountPrice) : '',
        durationMin: String(existing.durationMin),
        membersRequired: String(existing.membersRequired),
        includes: existing.includes.join('\n'),
        excludes: existing.excludes.join('\n'),
        requiresPickup: existing.requiresPickup,
        active: existing.active,
      });
  }, [existing, reset]);

  const save = useApiMutation(
    (v: ServiceForm) =>
      providerApi.saveService(
        {
          title: v.title.trim(),
          description: v.description.trim(),
          categoryId: v.categoryId,
          subcategoryId: v.subcategoryId || undefined,
          price: Number(v.price),
          discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined,
          durationMin: Number(v.durationMin),
          membersRequired: Math.max(1, Number(v.membersRequired)),
          includes: lines(v.includes),
          excludes: lines(v.excludes),
          requiresPickup: v.requiresPickup,
          active: v.active,
        },
        id,
      ),
    { invalidate: [qk.provider_.all, ['services']], successMessage: id ? 'Service updated' : 'Service published', onSuccess: () => navigate('/provider/services') },
  );

  const parents = (cats.data ?? []).filter((x) => !x.parentId);
  const subs = (cats.data ?? []).filter((x) => x.parentId === categoryId);
  const off = Number(price) && Number(discountPrice) ? Math.round(((Number(price) - Number(discountPrice)) / Number(price)) * 100) : 0;

  return (
    <div className="max-w-3xl">
      <PageHeader title={id ? 'Edit service' : 'New service'} back="/provider/services" />
      <form id="service-form" noValidate onSubmit={handleSubmit((v) => save.mutate(v), () => toast.error('Please fix the highlighted fields'))} className="flex flex-col gap-5">
        <label className="focus-within:ring-primary-500 flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-border-strong bg-surface py-7 text-center hover:border-primary-300 focus-within:ring-2">
          <Icon name="images" size={26} className="text-primary-500" />
          <span className="font-semibold">Add photos</span>
          <span className="text-caption text-ink-muted">Up to 5 images · JPG/PNG · max 5 MB</span>
          <input type="file" accept="image/*" multiple className="sr-only" onChange={() => toast.info('Image upload connects to your storage bucket when the backend is live.')} />
        </label>
        <Card className="flex flex-col gap-4">
          <FormInput control={control} name="title" label="Service title" placeholder="e.g. Deep kitchen cleaning" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="categoryId"
              render={({ field, fieldState }) => (
                <Select label="Category" required value={field.value} onChange={(v) => (field.onChange(v), setValue('subcategoryId', ''))} error={fieldState.error?.message} options={parents.map((p) => ({ value: p.id, label: p.name, icon: p.icon }))} />
              )}
            />
            {subs.length ? <Controller control={control} name="subcategoryId" render={({ field }) => <Select label="Sub-category" value={field.value} onChange={field.onChange} options={subs.map((s) => ({ value: s.id, label: s.name }))} />} /> : null}
          </div>
          <FormTextarea control={control} name="description" label="Description" placeholder="What does the customer get? Mention equipment, process and guarantees." rows={5} required />
        </Card>
        <Card className="grid gap-4 sm:grid-cols-2">
          <FormInput control={control} name="price" label="Price" prefix="₹" inputMode="numeric" required />
          <FormInput control={control} name="discountPrice" label="Offer price" prefix="₹" inputMode="numeric" hint={off > 0 ? `${off}% off · customer pays ${formatMoney(Number(discountPrice))}` : 'Optional'} />
          <FormInput control={control} name="durationMin" label="Duration (minutes)" inputMode="numeric" required />
          <FormInput control={control} name="membersRequired" label="Professionals needed" inputMode="numeric" required />
        </Card>
        <Card className="grid gap-4 sm:grid-cols-2">
          <FormTextarea control={control} name="includes" label="What’s included" placeholder={'One item per line\nMachine scrubbing\nEco-friendly chemicals'} rows={4} />
          <FormTextarea control={control} name="excludes" label="Not included" placeholder="One item per line" rows={4} />
        </Card>
        <Card className="py-1">
          <Controller control={control} name="requiresPickup" render={({ field }) => <SwitchRow icon="bike" title="Requires pickup & drop" subtitle="A delivery partner collects items (e.g. laundry, workshop repair)" value={field.value} onChange={field.onChange} />} />
          <Controller control={control} name="active" render={({ field }) => <SwitchRow icon="eye" title="Visible to customers" subtitle="Turn off to pause bookings" value={field.value} onChange={field.onChange} />} />
        </Card>
      </form>
      <ActionBar>
        <Button type="submit" form="service-form" size="lg" fullWidth loading={save.isPending}>
          {id ? 'Save changes' : 'Publish service'}
        </Button>
      </ActionBar>
    </div>
  );
}
