import { describe, it, expect } from 'vitest';
/**
 * Social sign-in: demo provider + mock backend contract.
 */
import { decodeJwtPayload } from '@/mocks/identityVerification';
import { authApi, bookingsApi, type SignupPrefill } from '@/services/api';
import { SocialAuthError } from '@/services/auth/errors';
import { demoAppleProvider, demoGoogleProvider, listDemoIdentities } from '@/services/auth/providers/demo';
import type { SocialCredential } from '@/services/auth/types';
import { ApiError } from '@/services/http';
import { session } from '@/services/session';

const demoCredential = (provider: typeof demoGoogleProvider, id: string) => provider.signIn({ demoIdentityId: id });

function fakeJwt(payload: Record<string, unknown>) {
  const enc = (o: object) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${enc({ alg: 'RS256' })}.${enc(payload)}.signature`;
}

async function expectApiError(p: Promise<unknown>, code: string) {
  const err = await p.then(
    () => null,
    (e: unknown) => e,
  );
  expect(err).toBeInstanceOf(ApiError);
  expect((err as ApiError).code).toBe(code);
  return err as ApiError;
}

describe('demo social provider', () => {
  it('lists identities per provider and role', () => {
    expect(listDemoIdentities('google', 'customer').map((d) => d.id)).toEqual(['g_aarav', 'g_priya']);
    expect(listDemoIdentities('apple', 'admin')).toEqual([]);
  });

  it('requires a picked identity (treated as cancellation)', async () => {
    await expect(demoGoogleProvider.signIn()).rejects.toBeInstanceOf(SocialAuthError);
    await expect(demoGoogleProvider.signIn()).rejects.toMatchObject({ code: 'CANCELLED' });
  });

  it('issues clearly non-JWT demo tokens', async () => {
    const cred = await demoCredential(demoGoogleProvider, 'g_aarav');
    expect(cred.kind).toBe('demo');
    expect(cred.idToken.startsWith('demo.')).toBe(true);
    expect(decodeJwtPayload(cred.idToken)).toBeNull();
  });
});

describe('authApi.socialLogin (mock backend)', () => {
  it('links an existing account by verified email, then by identity', async () => {
    const credential = await demoCredential(demoGoogleProvider, 'g_aarav');
    const first = await authApi.socialLogin({ credential, role: 'customer' });
    expect(first.user.id).toBe('u_c1');
    const again = await authApi.socialLogin({ credential, role: 'customer' });
    expect(again.user.id).toBe('u_c1');
    expect(again.token).toMatch(/^mock\./);
  });

  it('creates a new customer for an unknown identity (Apple relay email)', async () => {
    const credential = await demoCredential(demoAppleProvider, 'a_relay');
    const { user } = await authApi.socialLogin({ credential, role: 'customer' });
    expect(user.role).toBe('customer');
    expect(user.email).toBe('x7k2p9qz4m@privaterelay.appleid.com');
    expect(user.phone).toBe('');
  });

  it('asks providers without an account to complete an application', async () => {
    const credential = await demoCredential(demoGoogleProvider, 'g_newpro');
    const err = await expectApiError(authApi.socialLogin({ credential, role: 'provider' }), 'SIGNUP_REQUIRED');
    expect(err.details as SignupPrefill).toMatchObject({ name: 'Karan Mehta', email: 'karan.mehta.demo@gmail.com', provider: 'google' });
  });

  it('rejects the wrong role and admin social sign-in', async () => {
    const credential = await demoCredential(demoGoogleProvider, 'g_aarav');
    await expectApiError(authApi.socialLogin({ credential, role: 'provider' }), 'WRONG_ROLE');
    await expectApiError(authApi.socialLogin({ credential, role: 'admin' }), 'SOCIAL_NOT_ALLOWED');
  });

  it('rejects a credential presented for a different provider', async () => {
    const google = await demoCredential(demoGoogleProvider, 'g_aarav');
    await expectApiError(authApi.socialLogin({ credential: { ...google, provider: 'apple' }, role: 'customer' }), 'INVALID_TOKEN');
  });

  it('never accepts a real ID token without a backend to verify it', async () => {
    const credential: SocialCredential = {
      provider: 'google',
      kind: 'live',
      idToken: fakeJwt({ iss: 'https://accounts.google.com', sub: '123', email: 'real@gmail.com', exp: Date.now() / 1000 + 600 }),
      profile: { providerUserId: '123', email: 'real@gmail.com', name: 'Real User' },
    };
    await expectApiError(authApi.socialLogin({ credential, role: 'customer' }), 'BACKEND_REQUIRED');
  });

  it('requires a phone number before booking (social accounts start without one)', async () => {
    const credential = await demoCredential(demoGoogleProvider, 'g_priya');
    const { user, token } = await authApi.socialLogin({ credential, role: 'customer' });
    session.set(user, token);
    await expectApiError(
      bookingsApi.create({ items: [{ serviceId: 'svc_1', quantity: 1 }], addressId: 'any', date: '2099-01-01', slot: '10:00', paymentMethod: 'cash' }),
      'PHONE_REQUIRED',
    );
    session.set(null, null);
  });
});

describe('session restore & JWT helpers', () => {
  it('keeps known users and drops unknown non-customer sessions', () => {
    const known = { id: 'u_p1', role: 'provider' as const, name: 'Meera', email: 'provider@servio.app', phone: '', status: 'active' as const, createdAt: '' };
    expect(authApi.restoreSession(known, 't')).toEqual({ user: known, token: 't' });
    expect(authApi.restoreSession({ ...known, id: 'u_gone' }, 't')).toBeNull();
    const customer = { ...known, id: 'u_restored', role: 'customer' as const };
    expect(authApi.restoreSession(customer, 't')?.user.id).toBe('u_restored');
  });

  it('decodes UTF-8 JWT payloads', () => {
    expect(decodeJwtPayload(fakeJwt({ name: 'Zoë Ångström' }))).toEqual({ name: 'Zoë Ångström' });
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
  });
});
