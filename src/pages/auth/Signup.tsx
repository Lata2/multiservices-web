import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type Control, type FieldValues, type Path, type UseFormSetError } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button, Checkbox, FormInput, Icon, OptionCards, Select } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import { roleHome } from '@/constants/routes';
import { RolePicker } from '@/features/auth/RolePicker';
import { OrDivider, SocialAuthButtons } from '@/features/auth/SocialAuthButtons';
import { useCategories, useCities } from '@/hooks/api';
import { useApiMutation } from '@/hooks/useApiMutation';
import { useAuthRole } from '@/hooks/useAuthRole';
import { usePageMeta } from '@/hooks/usePageMeta';
import { authApi, type SignupPayload } from '@/services/api';
import type { ApiError } from '@/services/http';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/toast.store';
import type { Role } from '@/types/models';
import { customerSignupSchema, deliverySignupSchema, providerSignupSchema, type CustomerSignupForm, type DeliverySignupForm, type ProviderSignupForm } from '@/utils/validation';

type SignupRole = Exclude<Role, 'admin'>;
interface Prefill {
  name: string;
  email: string;
  referralCode?: string;
}

function useSignup<T extends FieldValues>(setError: UseFormSetError<T>) {
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();
  return useApiMutation((p: SignupPayload) => authApi.signup(p), {
    silentError: true,
    onSuccess: ({ user, token }) => {
      signIn(user, token, 'signup');
      toast.success(user.role === 'customer' ? 'Account created — welcome!' : 'Application submitted for review');
      navigate(roleHome(user.role), { replace: true });
    },
    onError: (e: ApiError) => {
      if (e.fieldErrors?.email) setError('email' as Path<T>, { message: e.fieldErrors.email });
      else toast.error(e.message);
    },
  });
}

function CommonFields<T extends FieldValues>({ control }: { control: Control<T> }) {
  return (
    <>
      <FormInput control={control} name={'name' as Path<T>} label="Full name" placeholder="Jane Doe" leftIcon="user" autoComplete="name" required />
      <FormInput control={control} name={'email' as Path<T>} label="Email" placeholder="you@example.com" leftIcon="mail" type="email" autoComplete="email" required />
      <FormInput control={control} name={'phone' as Path<T>} label="Mobile number" placeholder="98765 43210" prefix="+91" type="tel" autoComplete="tel-national" maxLength={14} required />
      <div className="grid gap-4">
        <FormInput control={control} name={'password' as Path<T>} label="Password" placeholder="Min 8 characters" leftIcon="lock" type="password" autoComplete="new-password" required hint="8+ characters with a letter and a number" />
        <FormInput control={control} name={'confirmPassword' as Path<T>} label="Confirm password" placeholder="Re-enter password" leftIcon="lock" type="password" autoComplete="new-password" required />
      </div>
    </>
  );
}

function Terms<T extends FieldValues>({ control }: { control: Control<T> }) {
  return (
    <Controller
      control={control}
      name={'acceptTerms' as Path<T>}
      render={({ field, fieldState }) => (
        <Checkbox
          checked={!!field.value}
          onChange={field.onChange}
          error={fieldState.error?.message}
          label={
            <>
              I agree to the{' '}
              <Link to="/legal/terms" target="_blank" className="font-semibold text-primary-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/legal/privacy" target="_blank" className="font-semibold text-primary-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </>
          }
        />
      )}
    />
  );
}

function CustomerForm({ prefill }: { prefill: Prefill }) {
  const { control, handleSubmit, setError } = useForm<CustomerSignupForm>({
    resolver: zodResolver(customerSignupSchema),
    defaultValues: { name: prefill.name, email: prefill.email, phone: '', password: '', confirmPassword: '', referralCode: prefill.referralCode ?? '', acceptTerms: false },
  });
  const m = useSignup(setError);
  return (
    <form noValidate onSubmit={handleSubmit((v) => m.mutate({ role: 'customer', ...v }))} className="flex flex-col gap-4">
      <CommonFields control={control} />
      <FormInput control={control} name="referralCode" label="Referral code (optional)" placeholder="e.g. AARAV50" leftIcon="gift" />
      <Terms control={control} />
      <Button type="submit" size="lg" fullWidth loading={m.isPending}>
        Create account
      </Button>
    </form>
  );
}

function ProviderForm({ prefill }: { prefill: Prefill }) {
  const categories = useCategories(null);
  const cities = useCities();
  const { control, handleSubmit, setError } = useForm<ProviderSignupForm>({
    resolver: zodResolver(providerSignupSchema),
    defaultValues: { name: prefill.name, email: prefill.email, phone: '', password: '', confirmPassword: '', acceptTerms: false, businessName: '', providerType: 'individual', categoryIds: [], city: '', yearsExperience: '' },
  });
  const m = useSignup(setError);
  return (
    <form noValidate onSubmit={handleSubmit((v) => m.mutate({ role: 'provider', ...v, yearsExperience: Number(v.yearsExperience) }))} className="flex flex-col gap-4">
      <h2 className="text-body-sm font-semibold text-ink-muted">Business details</h2>
      <Controller
        control={control}
        name="providerType"
        render={({ field }) => (
          <OptionCards
            label="Provider type"
            value={field.value}
            onChange={field.onChange}
            options={[
              { value: 'individual', label: 'Individual', description: 'Freelance professional', icon: 'user' },
              { value: 'organization', label: 'Organisation', description: 'Company with a team', icon: 'building' },
            ]}
          />
        )}
      />
      <FormInput control={control} name="businessName" label="Business / display name" placeholder="e.g. Sparkle Home Services" leftIcon="store" required />
      <Controller
        control={control}
        name="categoryIds"
        render={({ field, fieldState }) => (
          <Select label="Service categories" required multiple values={field.value} onChangeMany={field.onChange} error={fieldState.error?.message} placeholder="Select the categories you offer" options={(categories.data ?? []).map((c) => ({ value: c.id, label: c.name, icon: c.icon }))} />
        )}
      />
      <div className="grid grid-cols-[1fr_130px] gap-3">
        <Controller
          control={control}
          name="city"
          render={({ field, fieldState }) => <Select label="City" required value={field.value} onChange={field.onChange} error={fieldState.error?.message} options={(cities.data ?? []).map((c) => ({ value: c.name, label: c.name, description: c.state }))} />}
        />
        <FormInput control={control} name="yearsExperience" label="Experience" placeholder="Years" inputMode="numeric" maxLength={2} required />
      </div>
      <h2 className="mt-2 text-body-sm font-semibold text-ink-muted">Owner & login</h2>
      <CommonFields control={control} />
      <Terms control={control} />
      <Button type="submit" size="lg" fullWidth loading={m.isPending}>
        Submit application
      </Button>
      <p className="text-center text-caption text-ink-muted">Your profile goes live after our team verifies your documents (usually within 24–48 hours).</p>
    </form>
  );
}

function DeliveryForm({ prefill }: { prefill: Prefill }) {
  const cities = useCities();
  const { control, handleSubmit, setError } = useForm<DeliverySignupForm>({
    resolver: zodResolver(deliverySignupSchema),
    defaultValues: { name: prefill.name, email: prefill.email, phone: '', password: '', confirmPassword: '', acceptTerms: false, vehicleType: 'bike', vehicleNumber: '', licenseNumber: '', city: '' },
  });
  const m = useSignup(setError);
  return (
    <form noValidate onSubmit={handleSubmit((v) => m.mutate({ role: 'delivery', ...v }))} className="flex flex-col gap-4">
      <CommonFields control={control} />
      <h2 className="mt-2 text-body-sm font-semibold text-ink-muted">Vehicle details</h2>
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
      <FormInput control={control} name="vehicleNumber" label="Vehicle registration number" placeholder="KA 01 AB 1234" leftIcon="card" required className="uppercase" />
      <FormInput control={control} name="licenseNumber" label="Driving licence number" placeholder="KA0120200012345" leftIcon="id-card" required className="uppercase" />
      <Controller
        control={control}
        name="city"
        render={({ field, fieldState }) => <Select label="Operating city" required value={field.value} onChange={field.onChange} error={fieldState.error?.message} options={(cities.data ?? []).map((c) => ({ value: c.name, label: c.name, description: c.state }))} />}
      />
      <Terms control={control} />
      <Button type="submit" size="lg" fullWidth loading={m.isPending}>
        Submit application
      </Button>
    </form>
  );
}

export default function Signup() {
  usePageMeta({ title: 'Create account', description: 'Join Servio as a customer, service provider or delivery partner.' });
  const { role: pending, setRole } = useAuthRole();
  const [params, setParams] = useSearchParams();
  const prefill: Prefill = { name: params.get('name') ?? '', email: params.get('email') ?? '', referralCode: params.get('ref')?.toUpperCase() ?? '' };
  const viaRaw = params.get('via');
  const via = viaRaw === 'google' ? 'Google' : viaRaw === 'apple' ? 'Apple' : null;
  const role: SignupRole = pending === 'admin' ? 'customer' : pending;
  const roles: SignupRole[] = ['customer', 'provider', 'delivery'];
  const pick = (r: SignupRole) => {
    setRole(r);
    const n = new URLSearchParams(params);
    n.set('role', r);
    setParams(n, { replace: true });
  };

  return (
    <>
      <h1 className="text-h1 font-extrabold">{via && role !== 'customer' ? 'Complete your application' : 'Create your account'}</h1>
      <p className="mb-5 mt-1 text-ink-secondary">{ROLES[role].description}.</p>
      {via ? (
        <p className="mb-5 flex items-start gap-2 rounded-lg bg-primary-50 p-3 text-body-sm text-ink-secondary">
          <Icon name="check-circle" size={17} className="mt-px text-primary-500" />
          We filled in the details from your {via} account. Add the rest to continue.
        </p>
      ) : null}
      <div className="mb-6">
        <RolePicker roles={roles} value={role} onChange={pick} label="I’m joining as" long />
      </div>
      {role === 'customer' && !via ? (
        <>
          <SocialAuthButtons role="customer" />
          <OrDivider label="or sign up with email" />
        </>
      ) : null}
      {role === 'customer' ? <CustomerForm key="c" prefill={prefill} /> : role === 'provider' ? <ProviderForm key="p" prefill={prefill} /> : <DeliveryForm key="d" prefill={prefill} />}
      <p className="mt-8 text-center text-ink-secondary">
        Already have an account?{' '}
        <Link to={`/login?role=${role}`} className="font-semibold text-primary-600 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
