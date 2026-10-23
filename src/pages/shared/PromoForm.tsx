import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { PromoCard } from '@/components/domain';
import { ActionBar, Button, Card, FormInput, FormTextarea, OptionCards, PageHeader } from '@/components/ui';
import { useAdminPromos, useProviderPromos } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useRoleBase } from '@/hooks/useRole';
import { adminApi, providerApi } from '@/services/api';
import { formatDay } from '@/utils/format';
import { promoSchema, type PromoForm } from '@/utils/validation';

export default function PromoFormPage() {
  const { id } = useParams();
  usePageMeta({ title: id ? 'Edit promo code' : 'New promo code', noindex: true });
  const { role, base } = useRoleBase();
  const navigate = useNavigate();
  const isAdmin = role === 'admin';
  const providerQ = useProviderPromos(!isAdmin);
  const adminQ = useAdminPromos(isAdmin);
  const existing = (isAdmin ? adminQ.data : providerQ.data)?.find((p) => p.id === id);

  const { control, handleSubmit, reset } = useForm<PromoForm>({
    resolver: zodResolver(promoSchema),
    defaultValues: { code: '', title: '', description: '', discountType: 'percent', value: '10', minOrder: '0', maxDiscount: '', validDays: '30', usageLimit: '500' },
  });
  const v = useWatch({ control });
  useEffect(() => {
    if (existing)
      reset({
        code: existing.code,
        title: existing.title,
        description: existing.description,
        discountType: existing.discountType,
        value: String(existing.value),
        minOrder: String(existing.minOrder),
        maxDiscount: existing.maxDiscount ? String(existing.maxDiscount) : '',
        validDays: String(Math.max(1, Math.ceil((new Date(existing.expiresAt).getTime() - Date.now()) / 86_400_000))),
        usageLimit: String(existing.usageLimit),
      });
  }, [existing, reset]);

  const toPayload = (f: Partial<PromoForm>) => ({
    code: (f.code ?? '').trim().toUpperCase(),
    title: (f.title ?? '').trim(),
    description: f.description?.trim() ?? '',
    discountType: f.discountType ?? 'percent',
    value: Number(f.value) || 0,
    minOrder: Number(f.minOrder) || 0,
    maxDiscount: f.maxDiscount ? Number(f.maxDiscount) : undefined,
    expiresAt: new Date(Date.now() + (Number(f.validDays) || 0) * 86_400_000).toISOString(),
    active: existing?.active ?? true,
    usageLimit: Number(f.usageLimit) || 0,
  });

  const save = useApiMutation(
    (f: PromoForm) => {
      const payload = toPayload(f);
      return isAdmin ? adminApi.savePromo({ ...payload, providerId: existing?.providerId ?? null }, id) : providerApi.savePromo(payload, id);
    },
    { invalidate: [qk.provider_.promos, qk.admin.promos, ['offers']], successMessage: id ? 'Promo updated' : 'Promo created', onSuccess: () => navigate(`${base}/promos`) },
  );
  const preview = toPayload(v);

  return (
    <>
      <PageHeader title={id ? 'Edit promo code' : 'New promo code'} back={`${base}/promos`} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form id="promo-form" noValidate onSubmit={handleSubmit((f) => save.mutate(f))}>
          <Card className="flex flex-col gap-4">
            <FormInput control={control} name="code" label="Code" placeholder="SUMMER20" maxLength={16} required hint="Capital letters and numbers, 4–16 characters" className="uppercase" />
            <FormInput control={control} name="title" label="Headline" placeholder="20% off deep cleaning" required />
            <FormTextarea control={control} name="description" label="Description" placeholder="Terms shown to customers" rows={3} />
            <Controller
              control={control}
              name="discountType"
              render={({ field }) => (
                <OptionCards
                  label="Discount type"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'percent', label: 'Percentage', icon: 'percent', description: 'e.g. 20% off' },
                    { value: 'flat', label: 'Flat amount', icon: 'cash', description: 'e.g. ₹250 off' },
                  ]}
                />
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormInput control={control} name="value" label={v.discountType === 'percent' ? 'Discount %' : 'Discount ₹'} inputMode="numeric" required />
              <FormInput control={control} name="maxDiscount" label="Max discount ₹" inputMode="numeric" hint={v.discountType === 'percent' ? 'Optional cap' : 'Not used for flat'} disabled={v.discountType !== 'percent'} />
              <FormInput control={control} name="minOrder" label="Min order ₹" inputMode="numeric" required />
              <FormInput control={control} name="usageLimit" label="Usage limit" inputMode="numeric" required />
            </div>
            <FormInput control={control} name="validDays" label="Valid for (days)" inputMode="numeric" required hint={existing ? `Currently expires ${formatDay(existing.expiresAt)}` : undefined} />
          </Card>
        </form>
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <p className="mb-2 text-caption font-semibold text-ink-muted">Preview</p>
          <PromoCard promo={{ ...preview, id: 'preview', usageCount: 0, providerId: null, code: preview.code || 'CODE', title: preview.title || 'Your headline' }} />
        </aside>
      </div>
      <ActionBar>
        <Button type="submit" form="promo-form" size="lg" fullWidth loading={save.isPending}>
          {id ? 'Save changes' : 'Create promo'}
        </Button>
      </ActionBar>
    </>
  );
}
