/**
 * Fake Google / Apple accounts for DEMO social sign-in. These never touch Google or Apple —
 * they exist so the full social-login UX (existing account, brand-new account, application
 * required) can be exercised before OAuth credentials and a backend exist.
 */
import type { DemoIdentity, SocialProviderId } from '@/services/auth/types';

export const demoIdentities: DemoIdentity[] = [
  // Google
  { id: 'g_aarav', provider: 'google', name: 'Aarav Sharma', email: 'customer@servio.app', note: 'Existing customer — links to the demo account', roles: ['customer'] },
  { id: 'g_priya', provider: 'google', name: 'Priya Nair', email: 'priya.nair.demo@gmail.com', note: 'New user — creates a customer account', roles: ['customer'] },
  { id: 'g_meera', provider: 'google', name: 'Meera Iyer', email: 'provider@servio.app', note: 'Existing provider — links to the demo account', roles: ['provider'] },
  { id: 'g_newpro', provider: 'google', name: 'Karan Mehta', email: 'karan.mehta.demo@gmail.com', note: 'No provider account — continues to the application form', roles: ['provider'] },
  { id: 'g_ravi', provider: 'google', name: 'Ravi Kumar', email: 'delivery@servio.app', note: 'Existing partner — links to the demo account', roles: ['delivery'] },
  { id: 'g_newdp', provider: 'google', name: 'Sana Shaikh', email: 'sana.shaikh.demo@gmail.com', note: 'No partner account — continues to the application form', roles: ['delivery'] },
  // Apple (includes a "Hide My Email" relay address, as Apple users often choose)
  { id: 'a_aarav', provider: 'apple', name: 'Aarav Sharma', email: 'customer@servio.app', note: 'Existing customer — links to the demo account', roles: ['customer'] },
  { id: 'a_relay', provider: 'apple', name: 'Ishaan Rao', email: 'x7k2p9qz4m@privaterelay.appleid.com', note: 'New user with “Hide My Email” — creates a customer account', roles: ['customer'] },
  { id: 'a_meera', provider: 'apple', name: 'Meera Iyer', email: 'provider@servio.app', note: 'Existing provider — links to the demo account', roles: ['provider'] },
  { id: 'a_ravi', provider: 'apple', name: 'Ravi Kumar', email: 'delivery@servio.app', note: 'Existing partner — links to the demo account', roles: ['delivery'] },
];

export const findDemoIdentity = (provider: SocialProviderId, id: string) => demoIdentities.find((d) => d.provider === provider && d.id === id);

/* Demo tokens are deliberately NOT JWTs, so they can never be mistaken for real IdP tokens. */
const PREFIX = 'demo.';

export interface DemoTokenClaims {
  iss: 'servio-demo-idp';
  provider: SocialProviderId;
  sub: string;
  email: string;
  name: string;
  iat: number;
}

export function encodeDemoToken(claims: DemoTokenClaims): string {
  return PREFIX + encodeURIComponent(JSON.stringify(claims));
}

export function decodeDemoToken(token: string): DemoTokenClaims | null {
  if (!token.startsWith(PREFIX)) return null;
  try {
    const claims = JSON.parse(decodeURIComponent(token.slice(PREFIX.length))) as DemoTokenClaims;
    return claims.iss === 'servio-demo-idp' ? claims : null;
  } catch {
    return null;
  }
}
