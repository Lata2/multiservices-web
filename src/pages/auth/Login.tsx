import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { Button, FormInput, Icon, LinkButton } from '@/components/ui';
import { env } from '@/config/env';
import { ROLE_ORDER, ROLES } from '@/constants/roles';
import { roleHome } from '@/constants/routes';
import { RolePicker } from '@/features/auth/RolePicker';
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
      <h1 className="text-h1 font-extrabold">Welcome back</h1>
      <p className="mt-1 text-ink-secondary">Sign in as a {meta.title.toLowerCase()}.</p>

      <div className="my-6">
        <RolePicker roles={ROLE_ORDER} value={role} onChange={switchRole} label="Account type" />
      </div>

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
            Continue with phone
          </LinkButton>
        </>
      ) : (
        <p className="mt-4 flex items-center justify-center gap-2 text-caption text-ink-muted">
          <Icon name="lock" size={13} />
          Admin accounts sign in with email and password only.
        </p>
      )}

      {env.useMocks ? (
        <button type="button" onClick={fillDemo} className="focus-ring mt-6 flex w-full items-center gap-3 rounded-xl border border-dashed border-primary-300 bg-primary-50/70 p-3 text-left transition-colors hover:bg-primary-50">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary-600 shadow-sm">
            <Icon name="flask" size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-body-sm font-semibold text-primary-700">Use demo {meta.short.toLowerCase()} account — click to fill</span>
            <span className="block truncate text-caption text-ink-secondary">
              {DEMO_ACCOUNTS[role]} · {DEMO_PASSWORD}
            </span>
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
