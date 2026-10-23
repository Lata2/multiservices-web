import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { Button, FormInput, Icon, OtpInput } from '@/components/ui';
import { env } from '@/config/env';
import { ROLES } from '@/constants/roles';
import { roleHome } from '@/constants/routes';
import { useApiMutation } from '@/hooks/useApiMutation';
import { useAuthRole } from '@/hooks/useAuthRole';
import { usePageMeta } from '@/hooks/usePageMeta';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/toast.store';
import { phoneLoginSchema, type PhoneLoginForm } from '@/utils/validation';

export default function OtpLogin() {
  usePageMeta({ title: 'Sign in with phone' });
  const { role, next } = useAuthRole();
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();
  const [phone, setPhone] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const { control, handleSubmit } = useForm<PhoneLoginForm>({ resolver: zodResolver(phoneLoginSchema), defaultValues: { phone: '' } });

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const request = useApiMutation((p: string) => authApi.requestOtp(p), {
    onSuccess: (_, p) => {
      setPhone(p);
      setSeconds(30);
      toast.info(env.useMocks ? `Code sent. Demo code: ${env.demoOtp}` : 'Verification code sent.');
    },
  });
  const verify = useApiMutation((v: { phone: string; code: string }) => authApi.verifyOtp(v.phone, v.code, role), {
    silentError: true,
    onSuccess: ({ user, token }) => {
      signIn(user, token, 'otp');
      navigate(next && next.startsWith('/') ? next : roleHome(user.role), { replace: true });
    },
    onError: (e) => setCodeError(e.message),
  });

  const submitCode = (value: string) => {
    if (phone && value.length === 6 && !verify.isPending) verify.mutate({ phone, code: value });
  };

  return (
    <>
      <Link to={`/login?role=${role}`} className="focus-ring mb-6 flex w-fit items-center gap-1 rounded text-body-sm font-semibold text-ink-secondary hover:text-ink" onClick={(e) => phone && (e.preventDefault(), setPhone(null), setCode(''))}>
        <Icon name="chevron-left" size={16} />
        {phone ? 'Change number' : 'Back to sign in'}
      </Link>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <Icon name={phone ? 'chat' : 'smartphone'} size={23} />
      </span>
      {!phone ? (
        <form noValidate onSubmit={handleSubmit((v) => request.mutate(v.phone))}>
          <h1 className="text-h1 font-bold">Your phone number</h1>
          <p className="mb-6 mt-1 text-ink-secondary">We’ll text a 6-digit code to sign you in as a {ROLES[role].title.toLowerCase()}.</p>
          <FormInput control={control} name="phone" label="Mobile number" prefix="+91" placeholder="98765 43210" type="tel" inputMode="tel" autoComplete="tel-national" autoFocus maxLength={14} />
          <Button type="submit" size="lg" fullWidth className="mt-6" loading={request.isPending}>
            Send code
          </Button>
        </form>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submitCode(code);
          }}
        >
          <h1 className="text-h1 font-bold">Enter the code</h1>
          <p className="mb-6 mt-1 text-ink-secondary">Sent to +91 {phone}.</p>
          <OtpInput
            value={code}
            error={!!codeError}
            onChange={(v) => {
              setCode(v);
              setCodeError(null);
              if (v.length === 6) submitCode(v);
            }}
          />
          {codeError ? (
            <p role="alert" className="mt-3 text-body-sm text-danger-600">
              {codeError}
            </p>
          ) : null}
          <Button type="submit" size="lg" fullWidth className="mt-6" disabled={code.length !== 6} loading={verify.isPending}>
            Verify & continue
          </Button>
          <p className="mt-6 text-center text-ink-muted">
            {seconds > 0 ? (
              `Resend code in 0:${`${seconds}`.padStart(2, '0')}`
            ) : (
              <button type="button" onClick={() => request.mutate(phone)} className="focus-ring rounded font-semibold text-primary-600 hover:underline">
                Resend code
              </button>
            )}
          </p>
          {env.useMocks ? <p className="mt-3 text-center text-caption text-ink-muted">Demo: use code {env.demoOtp}</p> : null}
        </form>
      )}
    </>
  );
}
