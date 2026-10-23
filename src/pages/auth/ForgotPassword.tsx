import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { z } from 'zod';
import { Button, FormInput, Icon, LinkButton } from '@/components/ui';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { authApi } from '@/services/api';
import { rules } from '@/utils/validation';

const schema = z.object({ email: rules.email });

export default function ForgotPassword() {
  usePageMeta({ title: 'Reset password' });
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<{ email: string }>({ resolver: zodResolver(schema), defaultValues: { email: '' } });
  const send = useApiMutation((email: string) => authApi.forgotPassword(email), { onSuccess: (r) => setSentTo(r.email) });

  if (sentTo) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-50 text-success-600">
          <Icon name="mail-open" size={34} />
        </span>
        <h1 className="text-h2 font-bold">Check your inbox</h1>
        <p className="mx-auto mt-2 max-w-sm text-ink-secondary">If an account exists for {sentTo}, you’ll receive a link to reset your password within a few minutes.</p>
        <LinkButton to="/login" className="mt-8">
          Back to sign in
        </LinkButton>
      </div>
    );
  }
  return (
    <>
      <Link to="/login" className="focus-ring mb-6 flex w-fit items-center gap-1 rounded text-body-sm font-semibold text-ink-secondary hover:text-ink">
        <Icon name="chevron-left" size={16} />
        Back to sign in
      </Link>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <Icon name="key" size={23} />
      </span>
      <h1 className="text-h1 font-bold">Reset password</h1>
      <p className="mb-6 mt-1 text-ink-secondary">Enter the email linked to your account and we’ll send you a reset link.</p>
      <form noValidate onSubmit={handleSubmit((v) => send.mutate(v.email))}>
        <FormInput control={control} name="email" label="Email" placeholder="you@example.com" leftIcon="mail" type="email" autoComplete="email" autoFocus />
        <Button type="submit" size="lg" fullWidth className="mt-6" loading={send.isPending}>
          Send reset link
        </Button>
      </form>
    </>
  );
}
