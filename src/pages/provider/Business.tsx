import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { ActionBar, Button, Card, FormInput, FormTextarea, LoadingState, PageHeader, Select } from '@/components/ui';
import { useCategories, useProviderProfile } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { providerApi } from '@/services/api';
import { rules } from '@/utils/validation';

const schema = z.object({
  businessName: rules.required('Business name'),
  about: z.string().trim().min(20, 'Write at least 20 characters about your business'),
  address: rules.required('Address'),
  phone: rules.phone,
  email: rules.email,
  visitingCharge: rules.money('Visiting charge'),
  yearsExperience: z.string().regex(/^\d{1,2}$/, '0–99'),
  categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
  accountName: rules.required('Account holder name'),
  accountNumber: z.string().trim().min(6, 'Enter a valid account number'),
  ifsc: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC (e.g. HDFC0001234)'),
  bankName: rules.required('Bank name'),
});
type Form = z.infer<typeof schema>;

export default function Business() {
  usePageMeta({ title: 'Business profile', noindex: true });
  const navigate = useNavigate();
  const q = useProviderProfile();
  const cats = useCategories(null);
  const { control, handleSubmit, reset, formState } = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const p = q.data;
    if (p)
      reset({
        businessName: p.businessName,
        about: p.about,
        address: p.address,
        phone: p.phone,
        email: p.email,
        visitingCharge: String(p.visitingCharge),
        yearsExperience: String(p.yearsExperience),
        categoryIds: p.categoryIds,
        accountName: p.bank?.accountName ?? '',
        accountNumber: p.bank?.accountNumber ?? '',
        ifsc: p.bank?.ifsc ?? '',
        bankName: p.bank?.bankName ?? '',
      });
  }, [q.data, reset]);

  const save = useApiMutation(
    (v: Form) =>
      providerApi.updateProfile({
        businessName: v.businessName,
        about: v.about,
        address: v.address,
        phone: v.phone,
        email: v.email,
        visitingCharge: Number(v.visitingCharge),
        yearsExperience: Number(v.yearsExperience),
        categoryIds: v.categoryIds,
        bank: { accountName: v.accountName, accountNumber: v.accountNumber, ifsc: v.ifsc.toUpperCase(), bankName: v.bankName },
      }),
    { invalidate: [qk.provider_.all, ['provider']], successMessage: 'Business profile saved', onSuccess: () => navigate('/provider/account') },
  );

  if (q.isPending) return <LoadingState />;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Business profile" back="/provider/account" />
      <form id="business-form" noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="flex flex-col gap-5">
        <Card className="flex flex-col gap-4">
          <FormInput control={control} name="businessName" label="Business name" required />
          <FormTextarea control={control} name="about" label="About your business" rows={4} required />
          <Controller
            control={control}
            name="categoryIds"
            render={({ field, fieldState }) => <Select label="Categories" multiple required values={field.value ?? []} onChangeMany={field.onChange} error={fieldState.error?.message} options={(cats.data ?? []).map((c) => ({ value: c.id, label: c.name, icon: c.icon }))} />}
          />
          <FormInput control={control} name="address" label="Business address" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput control={control} name="visitingCharge" label="Visiting charge" prefix="₹" inputMode="numeric" required />
            <FormInput control={control} name="yearsExperience" label="Experience (years)" inputMode="numeric" required />
            <FormInput control={control} name="phone" label="Business phone" type="tel" required />
            <FormInput control={control} name="email" label="Business email" type="email" required />
          </div>
        </Card>
        <Card className="flex flex-col gap-4">
          <h2 className="text-title font-semibold">Bank account for payouts</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput control={control} name="accountName" label="Account holder" required />
            <FormInput control={control} name="accountNumber" label="Account number" inputMode="numeric" required />
            <FormInput control={control} name="ifsc" label="IFSC" required className="uppercase" />
            <FormInput control={control} name="bankName" label="Bank" required />
          </div>
        </Card>
      </form>
      <ActionBar>
        <Button type="submit" form="business-form" size="lg" fullWidth disabled={!formState.isDirty} loading={save.isPending}>
          Save changes
        </Button>
      </ActionBar>
    </div>
  );
}
