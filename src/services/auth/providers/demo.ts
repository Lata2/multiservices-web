/**
 * DEMO social provider. Simulates the *device side* of Google / Apple sign-in by letting the
 * user pick a fake account from `src/mocks/socialIdentities.ts`.
 *
 * It does not contact Google or Apple and its tokens are not JWTs. Only the mock backend
 * accepts them, so this mode can never authenticate against a real server.
 */
import { decodeDemoToken, demoIdentities, encodeDemoToken, findDemoIdentity } from '@/mocks/socialIdentities';
import type { Role } from '@/types/models';
import { SocialAuthError } from '../errors';
import type { DemoIdentity, SocialAuthProvider, SocialCredential, SocialProviderId } from '../types';

export function listDemoIdentities(provider: SocialProviderId, role: Role): DemoIdentity[] {
  return demoIdentities.filter((d) => d.provider === provider && d.roles.includes(role));
}

export { decodeDemoToken };

function createDemoProvider(id: SocialProviderId): SocialAuthProvider {
  return {
    id,
    kind: 'demo',
    async checkAvailability() {
      return { available: true };
    },
    async signIn(options): Promise<SocialCredential> {
      const identity = options?.demoIdentityId ? findDemoIdentity(id, options.demoIdentityId) : undefined;
      if (!identity) throw new SocialAuthError('CANCELLED', 'No demo account selected');
      const sub = `demo-${id}-${identity.id}`;
      return {
        provider: id,
        kind: 'demo',
        idToken: encodeDemoToken({ iss: 'servio-demo-idp', provider: id, sub, email: identity.email, name: identity.name, iat: Date.now() }),
        profile: { providerUserId: sub, email: identity.email, name: identity.name },
      };
    },
    async signOut() {},
  };
}

export const demoGoogleProvider = createDemoProvider('google');
export const demoAppleProvider = createDemoProvider('apple');
