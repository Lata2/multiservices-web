import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { roleHome } from '@/constants/routes';
import { authApi, type SignupPrefill } from '@/services/api';
import { getSocialProvider, isCancellation, isSocialAuthError, type SocialProviderId } from '@/services/auth';
import { isApiError } from '@/services/http';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/store/toast.store';
import type { Role } from '@/types/models';

interface Vars {
  providerId: SocialProviderId;
  demoIdentityId?: string;
}

/**
 * Orchestrates social sign-in for a role:
 *   provider SDK (or demo picker) → credential → backend `socialLogin` → app session.
 * Never creates a session without the backend's response.
 */
export function useSocialSignIn(role: Role, next?: string | null) {
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();
  const [pickerFor, setPickerFor] = useState<SocialProviderId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ providerId, demoIdentityId }: Vars) => {
      const provider = getSocialProvider(providerId);
      if (!provider) throw new Error('This sign-in option is not available.');
      const credential = await provider.signIn({ demoIdentityId });
      return authApi.socialLogin({ credential, role });
    },
    onSuccess: ({ user, token }, { providerId }) => {
      signIn(user, token, providerId);
      toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
      navigate(next && next.startsWith('/') ? next : roleHome(user.role), { replace: true });
    },
    onError: (err, { providerId }) => {
      if (isCancellation(err)) return;
      if (isApiError(err) && err.code === 'SIGNUP_REQUIRED') {
        const prefill = (err.details ?? {}) as SignupPrefill;
        toast.info('Almost there — complete your application.');
        const q = new URLSearchParams({ role, name: prefill.name ?? '', email: prefill.email ?? '', via: providerId });
        navigate(`/signup?${q.toString()}`);
        return;
      }
      if (isApiError(err) && (err.code === 'BACKEND_REQUIRED' || err.code === 'WRONG_ROLE')) return setNotice(err.message);
      if (isSocialAuthError(err) && ['NOT_CONFIGURED', 'UNAVAILABLE', 'NO_ID_TOKEN'].includes(err.code)) return setNotice(err.message);
      toast.error(err instanceof Error ? err.message : 'Sign-in failed. Please try again.');
    },
  });

  const start = (providerId: SocialProviderId) => {
    setNotice(null);
    const provider = getSocialProvider(providerId);
    if (!provider || mutation.isPending) return;
    if (provider.kind === 'demo') setPickerFor(providerId);
    else mutation.mutate({ providerId });
  };

  const chooseDemoIdentity = (demoIdentityId: string) => {
    if (!pickerFor) return;
    const providerId = pickerFor;
    setPickerFor(null);
    mutation.mutate({ providerId, demoIdentityId });
  };

  return {
    start,
    pickerFor,
    closePicker: () => setPickerFor(null),
    chooseDemoIdentity,
    pendingProvider: mutation.isPending ? mutation.variables?.providerId : undefined,
    busy: mutation.isPending,
    notice,
    dismissNotice: () => setNotice(null),
  };
}
