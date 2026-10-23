/**
 * Social sign-in entry point. UI code asks this module for a provider and never needs to
 * know whether it is talking to the real SDK or the demo implementation.
 *
 *   VITE_AUTH_MODE=demo  (default) → demo providers (only while VITE_USE_MOCKS=true)
 *   VITE_AUTH_MODE=live            → Google Identity Services / Sign in with Apple JS
 */
import { env } from '@/config/env';
import type { Role } from '@/types/models';
import { appleProvider } from './providers/apple';
import { demoAppleProvider, demoGoogleProvider } from './providers/demo';
import { googleProvider } from './providers/google';
import type { SocialAuthProvider, SocialProviderId } from './types';

export * from './errors';
export * from './types';
export { listDemoIdentities } from './providers/demo';

export type SocialAuthMode = 'live' | 'demo' | 'off';

/** Effective mode: demo credentials are meaningless to a real backend, so demo turns itself off. */
export function socialAuthMode(): SocialAuthMode {
  if (env.auth.mode === 'live') return 'live';
  return env.useMocks ? 'demo' : 'off';
}

/** Admin accounts are provisioned internally and sign in with email + password only. */
export const socialRoles: Role[] = ['customer', 'provider', 'delivery'];

export function getSocialProvider(id: SocialProviderId): SocialAuthProvider | null {
  const mode = socialAuthMode();
  if (mode === 'off') return null;
  if (id === 'google') return mode === 'live' ? googleProvider : demoGoogleProvider;
  if (!env.auth.apple.enabled) return null;
  return mode === 'live' ? appleProvider : demoAppleProvider;
}

export const socialProviderOrder = (): SocialProviderId[] => ['google', 'apple'];

/** Sign out of the identity provider's local session (no-op for password/OTP sessions). */
export async function signOutOfProvider(method: string | null | undefined) {
  if (method !== 'google' && method !== 'apple') return;
  await getSocialProvider(method)?.signOut().catch(() => undefined);
}
