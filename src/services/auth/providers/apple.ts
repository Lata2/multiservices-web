/**
 * LIVE Sign in with Apple for the web (Apple JS, popup mode).
 * Requires an Apple "Services ID" and a registered redirect URI.
 */
import { env } from '@/config/env';
import { decodeJwtPayload } from '@/mocks/identityVerification';
import { SocialAuthError } from '../errors';
import type { SocialAuthProvider, SocialCredential } from '../types';
import { createNonce, loadScript } from './loadScript';

interface AppleSignInResponse {
  authorization: { id_token: string; code: string };
  user?: { email?: string; name?: { firstName?: string; lastName?: string } };
}
declare global {
  interface Window {
    AppleID?: { auth: { init(cfg: Record<string, unknown>): void; signIn(): Promise<AppleSignInResponse> } };
  }
}

export const appleProvider: SocialAuthProvider = {
  id: 'apple',
  kind: 'live',
  async checkAvailability() {
    if (!env.auth.apple.enabled) return { available: false, reason: 'Disabled' };
    if (!env.auth.apple.serviceId || !env.auth.apple.redirectUri) return { available: false, reason: 'VITE_APPLE_SERVICE_ID / VITE_APPLE_REDIRECT_URI not set' };
    return { available: true };
  },
  async signIn(): Promise<SocialCredential> {
    try {
      await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');
    } catch (e) {
      throw new SocialAuthError('UNAVAILABLE', 'Could not reach Apple. Check your connection.', e);
    }
    if (!window.AppleID) throw new SocialAuthError('UNAVAILABLE', 'Sign in with Apple is unavailable.');
    const nonce = await createNonce();
    window.AppleID.auth.init({
      clientId: env.auth.apple.serviceId,
      scope: 'name email',
      redirectURI: env.auth.apple.redirectUri,
      nonce: nonce.hashed,
      usePopup: true,
    });
    let res: AppleSignInResponse;
    try {
      res = await window.AppleID.auth.signIn();
    } catch (e) {
      const err = (e as { error?: string })?.error;
      if (err === 'popup_closed_by_user' || err === 'user_cancelled_authorize') throw new SocialAuthError('CANCELLED', 'Apple sign-in was cancelled.');
      throw new SocialAuthError('FAILED', 'Apple sign-in failed. Please try again.', e);
    }
    const claims = decodeJwtPayload(res.authorization.id_token) ?? {};
    const name = [res.user?.name?.firstName, res.user?.name?.lastName].filter(Boolean).join(' ') || null;
    return {
      provider: 'apple',
      kind: 'live',
      idToken: res.authorization.id_token,
      rawNonce: nonce.raw,
      authorizationCode: res.authorization.code,
      profile: { providerUserId: String(claims.sub ?? ''), email: res.user?.email ?? (typeof claims.email === 'string' ? claims.email : null), name },
    };
  },
  async signOut() {},
};
