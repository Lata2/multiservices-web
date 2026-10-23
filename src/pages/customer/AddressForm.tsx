import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ActionBar, Button, Card, Checkbox, FormInput, Icon, OptionCards, PageHeader } from '@/components/ui';
import { useAddresses } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { addressesApi } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { toast } from '@/store/toast.store';
import { addressSchema, type AddressForm } from '@/utils/validation';

export default function AddressFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const returnTo = params.get('return');
  const navigate = useNavigate();
  usePageMeta({ title: id ? 'Edit address' : 'Add address', noindex: true });
  const user = useAuthStore((s) => s.user)!;
  const addresses = useAddresses();
  const existing = addresses.data?.find((a) => a.id === id);
  const [locating, setLocating] = useState(false);

  const { control, handleSubmit, reset, setValue } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: 'Home', contactName: user.name, phone: user.phone, line1: '', line2: '', landmark: '', city: '', state: '', pincode: '', isDefault: false },
  });
  useEffect(() => {
    if (existing) reset({ ...existing, line2: existing.line2 ?? '', landmark: existing.landmark ?? '' });
  }, [existing, reset]);

  const save = useApiMutation((v: AddressForm) => addressesApi.save(v, id), {
    invalidate: [qk.addresses],
    successMessage: id ? 'Address updated' : 'Address saved',
    onSuccess: (a) => {
      if (!id) useCartStore.getState().setAddress(a.id);
      navigate(returnTo && returnTo.startsWith('/') ? returnTo : '/account/addresses', { replace: true });
    },
  });

  /** Uses the browser's Geolocation API; reverse geocoding plugs in here (Google/Mapbox). */
  const detectLocation = () => {
    const fill = () => {
      setValue('line2', 'Koramangala 5th Block', { shouldValidate: true });
      setValue('city', 'Bengaluru', { shouldValidate: true });
      setValue('state', 'Karnataka', { shouldValidate: true });
      setValue('pincode', '560095', { shouldValidate: true });
      setLocating(false);
      toast.success('Location detected');
    };
    setLocating(true);
    if (!navigator.geolocation) return fill();
    navigator.geolocation.getCurrentPosition(
      () => fill(),
      () => {
        setLocating(false);
        toast.error('Location permission denied. Enter the address manually.');
      },
      { timeout: 8000 },
    );
  };

  return (
    <div className="max-w-[var(--container-narrow)]">
      <PageHeader title={id ? 'Edit address' : 'Add address'} back={returnTo ?? '/account/addresses'} />
      <form noValidate id="address-form" onSubmit={handleSubmit((v) => save.mutate(v))} className="flex flex-col gap-5">
        <Button variant="secondary" leftIcon="navigate" loading={locating} onClick={detectLocation} fullWidth>
          {locating ? 'Detecting location…' : 'Use my current location'}
        </Button>
        <Controller
          control={control}
          name="label"
          render={({ field }) => (
            <OptionCards
              label="Address type"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'Home', label: 'Home', icon: 'home' },
                { value: 'Work', label: 'Work', icon: 'briefcase' },
                { value: 'Other', label: 'Other', icon: 'pin' },
              ]}
            />
          )}
        />
        <Card className="flex flex-col gap-4">
          <FormInput control={control} name="line1" label="House / flat no. & building" placeholder="Flat 1204, Prestige Lakeside" autoComplete="address-line1" required />
          <FormInput control={control} name="line2" label="Area / street" placeholder="Varthur Main Road" autoComplete="address-line2" />
          <FormInput control={control} name="landmark" label="Landmark" placeholder="Near…" />
          <div className="grid grid-cols-2 gap-3">
            <FormInput control={control} name="city" label="City" autoComplete="address-level2" required />
            <FormInput control={control} name="pincode" label="PIN code" inputMode="numeric" autoComplete="postal-code" maxLength={6} required />
          </div>
          <FormInput control={control} name="state" label="State" autoComplete="address-level1" required />
        </Card>
        <Card className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 text-body-sm font-semibold text-ink-muted">
            <Icon name="user" size={15} />
            Contact at this address
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput control={control} name="contactName" label="Name" autoComplete="name" required />
            <FormInput control={control} name="phone" label="Phone" type="tel" autoComplete="tel" required />
          </div>
          <Controller control={control} name="isDefault" render={({ field }) => <Checkbox checked={field.value} onChange={field.onChange} label="Set as default address" />} />
        </Card>
      </form>
      <ActionBar>
        <Button type="submit" form="address-form" size="lg" fullWidth loading={save.isPending}>
          Save address
        </Button>
      </ActionBar>
    </div>
  );
}
