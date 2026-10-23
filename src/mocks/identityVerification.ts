/**
 * MOCK-BACKEND ONLY: turns a social credential into trusted claims.
 *
 * A real backend MUST verify ID tokens cryptographically:
 *  - Google: verify the JWT signature with Google's JWKS (https://www.googleapis.com/oauth2/v3/certs),
 *    `iss` ∈ {accounts.google.com, https://accounts.google.com}, `aud` = your client ID(s), `exp`.
 *  - Apple:  verify with Apple's JWKS (https://appleid.apple.com/auth/keys), `iss` = https://appleid.apple.com,
 *    `aud` = your bundle id / service id, `exp`, and `nonce` = SHA-256(rawNonce).
 * See docs/AUTH_SETUP.md. This file never pretends to do that.
 */
import { env } from '@/config/env';
import { ApiError } from '@/services/http';
import { decodeDemoToken } from './socialIdentities';

export interface VerifiedIdentity {
  provider: 'google' | 'apple';
  subject: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  /** `demo` = demo IdP, `unverified` = real token whose signature was NOT checked (dev only). */
  assurance: 'demo' | 'unverified';
}

const ISSUERS = { google: ['accounts.google.com', 'https://accounts.google.com'], apple: ['https://appleid.apple.com'] } as const;

function base64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  const binary = atob(b64);
  // Decode UTF-8 bytes (names can contain non-Latin characters).
  return decodeURIComponent(
    binary
      .split('')
      .map((ch) => `%${ch.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  );
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function verifyMockIdentityToken(provider: 'google' | 'apple', idToken: string): VerifiedIdentity {
  const demo = decodeDemoToken(idToken);
  if (demo) {
    if (demo.provider !== provider) throw new ApiError('Credential does not match the selected provider.', 401, 'INVALID_TOKEN');
    return { provider, subject: demo.sub, email: demo.email, emailVerified: true, name: demo.name, assurance: 'demo' };
  }

  // A real Google/Apple token reached the mock backend.
  if (!env.auth.mockAcceptUnverifiedIdTokens) {
    throw new ApiError(
      `${provider === 'google' ? 'Google' : 'Apple'} sign-in worked on this device, but there is no backend yet to verify the token, so no session was created. ` +
        'Connect the real API (VITE_USE_MOCKS=false) or, for local testing only, set VITE_MOCK_ACCEPT_UNVERIFIED_ID_TOKENS=true.',
      501,
      'BACKEND_REQUIRED',
    );
  }

  const claims = decodeJwtPayload(idToken);
  if (!claims) throw new ApiError('Malformed identity token.', 401, 'INVALID_TOKEN');
  const iss = String(claims.iss ?? '');
  if (!(ISSUERS[provider] as readonly string[]).includes(iss)) throw new ApiError('Identity token issuer is not trusted.', 401, 'INVALID_TOKEN');
  if (typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now()) throw new ApiError('Identity token has expired. Please sign in again.', 401, 'INVALID_TOKEN');
  if (provider === 'google' && env.auth.google.clientId && claims.aud !== env.auth.google.clientId && claims.azp !== env.auth.google.clientId)
    throw new ApiError('Identity token was issued for a different app.', 401, 'INVALID_TOKEN');

  return {
    provider,
    subject: String(claims.sub),
    email: typeof claims.email === 'string' ? claims.email : null,
    emailVerified: claims.email_verified === true || claims.email_verified === 'true',
    name: typeof claims.name === 'string' ? claims.name : null,
    assurance: 'unverified',
  };
}
