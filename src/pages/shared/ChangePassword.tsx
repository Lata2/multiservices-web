import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { ActionBar, Button, Card, FormInput, PageHeader } from '@/components/ui';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useRoleBase } from '@/hooks/useRole';
import { authApi } from '@/services/api';
import { toast } from '@/store/toast.store';
import { changePasswordSchema, type ChangePasswordForm } from '@/utils/validation';

export default function ChangePassword() {
  usePageMeta({ title: 'Change password', noindex: true });
  const { base } = useRoleBase();
  const navigate = useNavigate();
  const { control, handleSubmit, setError, reset } = useForm<ChangePasswordForm>({ resolver: zodResolver(changePasswordSchema), defaultValues: { current: '', next: '', confirm: '' } });
  const save = useApiMutation((v: ChangePasswordForm) => authApi.changePassword(v.current, v.next), {
    silentError: true,
    successMessage: 'Password changed',
    onSuccess: () => {
      reset();
      navigate(`${base}/settings`);
    },
    onError: (e) => (e.fieldErrors?.current ? setError('current', { message: e.fieldErrors.current }) : toast.error(e.message)),
  });
  return (
    <div className="max-w-[var(--container-narrow)]">
      <PageHeader title="Change password" back={`${base}/settings`} />
      <Card>
        <form id="password-form" noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="flex flex-col gap-4">
          <input type="text" name="username" autoComplete="username" hidden readOnly />
          <FormInput control={control} name="current" label="Current password" type="password" leftIcon="lock" autoComplete="current-password" required />
          <FormInput control={control} name="next" label="New password" type="password" leftIcon="key" autoComplete="new-password" hint="At least 8 characters with a letter and a number." required />
          <FormInput control={control} name="confirm" label="Confirm new password" type="password" leftIcon="key" autoComplete="new-password" required />
        </form>
      </Card>
      <ActionBar>
        <Button type="submit" form="password-form" size="lg" fullWidth loading={save.isPending}>
          Update password
        </Button>
      </ActionBar>
    </div>
  );
}
