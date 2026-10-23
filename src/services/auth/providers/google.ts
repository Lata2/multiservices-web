/**
 * LIVE Google sign-in for the web via Google Identity Services (One Tap / popup).
 * Returns the OpenID Connect ID token; the backend must verify it (see docs/BACKEND_INTEGRATION.md).
 */
import { env } from '@/config/env';
import { decodeJwtPayload } from '@/mocks/identityVerification';
import { SocialAuthError } from '../errors';
import type { SocialAuthProvider, SocialCredential } from '../types';
import { createNonce, loadScript } from './loadScript';

interface GoogleId {
  initialize(cfg: { client_id: string; callback: (r: { credential?: string }) => void; nonce?: string; use_fedcm_for_prompt?: boolean; cancel_on_tap_outside?: boolean }): void;
  prompt(listener?: (n: { isNotDisplayed?: () => boolean; isSkippedMoment?: () => boolean; isDismissedMoment?: () => boolean }) => void): void;
  disableAutoSelect(): void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

export const googleProvider: SocialAuthProvider = {
  id: 'google',
  kind: 'live',
  async checkAvailability() {
    if (!env.auth.google.clientId) return { available: false, reason: 'VITE_GOOGLE_CLIENT_ID is not set' };
    return { available: true };
  },
  async signIn(): Promise<SocialCredential> {
    if (!env.auth.google.clientId) throw new SocialAuthError('NOT_CONFIGURED', 'Google sign-in is not configured.');
    try {
      await loadScript('https://accounts.google.com/gsi/client');
    } catch (e) {
      throw new SocialAuthError('UNAVAILABLE', 'Could not reach Google. Check your connection or ad-blocker.', e);
    }
    const gid = window.google?.accounts.id;
    if (!gid) throw new SocialAuthError('UNAVAILABLE', 'Google sign-in is unavailable in this browser.');
    const nonce = await createNonce();
    return new Promise<SocialCredential>((resolve, reject) => {
      gid.initialize({
        client_id: env.auth.google.clientId,
        nonce: nonce.raw,
        use_fedcm_for_prompt: true,
        cancel_on_tap_outside: true,
        callback: ({ credential }) => {
          if (!credential) return reject(new SocialAuthError('NO_ID_TOKEN', 'Google did not return an ID token.'));
          const claims = decodeJwtPayload(credential) ?? {};
          resolve({
            provider: 'google',
            kind: 'live',
            idToken: credential,
            rawNonce: nonce.raw,
            profile: {
              providerUserId: String(claims.sub ?? ''),
              email: typeof claims.email === 'string' ? claims.email : null,
              name: typeof claims.name === 'string' ? claims.name : null,
              photo: typeof claims.picture === 'string' ? claims.picture : null,
            },
          });
        },
      });
      gid.prompt((n) => {
        if (n.isNotDisplayed?.() || n.isSkippedMoment?.() || n.isDismissedMoment?.()) reject(new SocialAuthError('CANCELLED', 'Google sign-in was dismissed.'));
      });
    });
  },
  async signOut() {
    window.google?.accounts.id.disableAutoSelect();
  },
};
