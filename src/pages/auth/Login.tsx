import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { Button, Chip, ChipRow, FormInput, Icon, LinkButton } from '@/components/ui';
import { env } from '@/config/env';
import { ROLE_ORDER, ROLES } from '@/constants/roles';
import { roleHome } from '@/constants/routes';
import { OrDivider, SocialAuthButtons } from '@/features/auth/SocialAuthButtons';
import { useApiMutation } from '@/hooks/useApiMutation';
import { useAuthRole } from '@/hooks/useAuthRole';
import { usePageMeta } from '@/hooks/usePageMeta';
import { authApi, DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/toast.store';
import type { Role } from '@/types/models';
import { loginSchema, type LoginForm } from '@/utils/validation';

export default function Login() {
  usePageMeta({ title: 'Sign in', description: 'Sign in to Servio as a customer, service provider, delivery partner or admin.' });
  const { role, setRole, next } = useAuthRole();
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();
  const meta = ROLES[role];
  const { control, handleSubmit, setValue, setError } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const login = useApiMutation((v: LoginForm) => authApi.login(v.email, v.password, role), {
    silentError: true,
    onSuccess: ({ user, token }) => {
      signIn(user, token, 'password');
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(next && next.startsWith('/') ? next : roleHome(user.role), { replace: true });
    },
    onError: (err) => {
      if (err.fieldErrors?.email) setError('email', { message: err.fieldErrors.email });
      else if (err.fieldErrors?.password) setError('password', { message: err.fieldErrors.password });
      else toast.error(err.message);
    },
  });

  const fillDemo = () => {
    setValue('email', DEMO_ACCOUNTS[role], { shouldValidate: true });
    setValue('password', DEMO_PASSWORD, { shouldValidate: true });
  };
  const switchRole = (r: Role) => {
    setRole(r);
    navigate(`/login?role=${r}${next ? `&next=${encodeURIComponent(next)}` : ''}`, { replace: true });
  };

  return (
    <>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <Icon name={meta.icon} size={23} />
      </span>
      <h1 className="text-h1 font-bold">Sign in</h1>
      <p className="mt-1 text-ink-secondary">Welcome back! Sign in to your {meta.title.toLowerCase()} account.</p>

      <ChipRow className="my-6" label="Account type">
        {ROLE_ORDER.map((r) => (
          <Chip key={r} label={ROLES[r].short} icon={ROLES[r].icon} selected={r === role} onClick={() => switchRole(r)} />
        ))}
      </ChipRow>

      <form noValidate onSubmit={handleSubmit((v) => login.mutate(v))} className="flex flex-col gap-4">
        <FormInput control={control} name="email" label="Email" placeholder="you@example.com" leftIcon="mail" type="email" autoComplete="email" />
        <FormInput control={control} name="password" label="Password" placeholder="Your password" leftIcon="lock" type="password" autoComplete="current-password" />
        <Link to="/forgot-password" className="focus-ring -mt-1 self-end rounded text-body-sm font-semibold text-primary-600 hover:underline">
          Forgot password?
        </Link>
        <Button type="submit" size="lg" fullWidth loading={login.isPending}>
          Sign in
        </Button>
      </form>

      {role !== 'admin' ? (
        <>
          <OrDivider />
          <SocialAuthButtons role={role} next={next} className="mb-3" />
          <LinkButton to={`/login/otp?role=${role}${next ? `&next=${encodeURIComponent(next)}` : ''}`} variant="outline" size="lg" fullWidth leftIcon="smartphone">
            Continue with phone (OTP)
          </LinkButton>
        </>
      ) : (
        <p className="mt-4 flex items-center justify-center gap-2 text-caption text-ink-muted">
          <Icon name="lock" size={13} />
          Admin accounts sign in with email and password only.
        </p>
      )}

      {env.useMocks ? (
        <button type="button" onClick={fillDemo} className="focus-ring mt-6 w-full rounded-xl border border-dashed border-primary-300 bg-primary-50 p-4 text-left hover:bg-primary-100/60">
          <span className="flex items-center gap-2 text-body-sm font-semibold text-primary-700">
            <Icon name="flask" size={15} />
            Demo {meta.short.toLowerCase()} account — click to fill
          </span>
          <span className="mt-1.5 block text-caption text-ink-secondary">
            {DEMO_ACCOUNTS[role]} · {DEMO_PASSWORD}
          </span>
        </button>
      ) : null}

      {meta.canSignup ? (
        <p className="mt-8 text-center text-ink-secondary">
          New to Servio?{' '}
          <Link to={`/signup?role=${role}`} className="font-semibold text-primary-600 hover:underline">
            Create an account
          </Link>
        </p>
      ) : null}
    </>
  );
}
