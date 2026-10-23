import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { ActionBar, Avatar, Button, Card, FormInput, Icon, PageHeader } from '@/components/ui';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useRoleBase } from '@/hooks/useRole';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/toast.store';
import { profileSchema, type ProfileForm } from '@/utils/validation';

export default function EditProfile() {
  usePageMeta({ title: 'Edit profile', noindex: true });
  const { base } = useRoleBase();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user)!;
  const updateUser = useAuthStore((s) => s.updateUser);
  const { control, handleSubmit, setError, formState } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: { name: user.name, email: user.email, phone: user.phone } });
  const save = useApiMutation((v: ProfileForm) => authApi.updateProfile(v), {
    silentError: true,
    successMessage: 'Profile updated',
    onSuccess: (u) => {
      updateUser(u);
      navigate(base === '/account' ? '/account' : `${base}/account`);
    },
    onError: (e) => (e.fieldErrors?.email ? setError('email', { message: e.fieldErrors.email }) : toast.error(e.message)),
  });
  return (
    <div className="max-w-[var(--container-narrow)]">
      <PageHeader title="Edit profile" back={base === '/account' ? '/account' : `${base}/account`} />
      {!user.phone ? (
        <p className="mb-4 flex items-start gap-2 rounded-lg bg-warning-50 p-3 text-body-sm text-warning-700">
          <Icon name="info" size={16} className="mt-0.5" />
          Add your mobile number so professionals can reach you on the day of service.
        </p>
      ) : null}
      <Card className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar src={user.avatar} name={user.name} size={80} />
            <label className="focus-within:ring-primary-500 absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-surface bg-primary-500 text-white focus-within:ring-2">
              <Icon name="camera" size={15} />
              <span className="sr-only">Change photo</span>
              <input type="file" accept="image/*" className="sr-only" onChange={() => toast.info('Photo upload connects to your storage provider when the backend is live.')} />
            </label>
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-caption text-ink-muted">JPG or PNG, up to 5 MB</p>
          </div>
        </div>
        <form id="profile-form" noValidate onSubmit={handleSubmit((v) => save.mutate(v))} className="flex flex-col gap-4">
          <FormInput control={control} name="name" label="Full name" leftIcon="user" autoComplete="name" required />
          <FormInput control={control} name="email" label="Email" leftIcon="mail" type="email" autoComplete="email" required />
          <FormInput control={control} name="phone" label="Mobile number" leftIcon="phone" type="tel" autoComplete="tel" required />
        </form>
      </Card>
      <ActionBar>
        <Button type="submit" form="profile-form" size="lg" fullWidth disabled={!formState.isDirty} loading={save.isPending}>
          Save changes
        </Button>
      </ActionBar>
    </div>
  );
}
