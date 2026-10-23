/**
 * Social (federated) sign-in contracts.
 *
 * A `SocialAuthProvider` only obtains an identity credential on the device. It never creates
 * an app session by itself: the credential is always sent to the backend
 * (`authApi.socialLogin`), which must verify it and return the app's own session token.
 */
import type { Role } from '@/types/models';

export type SocialProviderId = 'google' | 'apple';

/**
 * `live` = credential issued by Google/Apple through the real native SDK.
 * `demo` = locally generated, clearly fake credential used only with the mock backend.
 */
export type CredentialKind = 'live' | 'demo';

export interface SocialProfile {
  /** Stable subject identifier at the identity provider (`sub` claim). */
  providerUserId: string;
  /** May be null: Apple only shares the email on the very first authorization. */
  email: string | null;
  name: string | null;
  photo?: string | null;
}

export interface SocialCredential {
  provider: SocialProviderId;
  kind: CredentialKind;
  /** OpenID Connect ID token (JWT) for `live`; an opaque `demo.` token for `demo`. */
  idToken: string;
  /** Raw nonce whose SHA-256 was sent to the IdP (Apple). The backend must compare it to the token's `nonce` claim. */
  rawNonce?: string;
  /** One-time code the backend can exchange for refresh tokens (Apple / Google offline access). */
  authorizationCode?: string | null;
  /** Profile hints from the SDK. Hints only — the backend must trust the verified token claims. */
  profile: SocialProfile;
}

export type Availability = { available: true } | { available: false; reason: string };

/** A selectable fake account shown by the demo provider's account picker. */
export interface DemoIdentity {
  id: string;
  provider: SocialProviderId;
  name: string;
  email: string;
  /** What will happen when this identity is used, shown in the picker. */
  note: string;
  /** Roles this identity is offered for. */
  roles: Role[];
}

export interface SocialSignInOptions {
  /** Demo provider only: which demo identity was picked. */
  demoIdentityId?: string;
}

export interface SocialAuthProvider {
  readonly id: SocialProviderId;
  readonly kind: CredentialKind;
  checkAvailability(): Promise<Availability>;
  signIn(options?: SocialSignInOptions): Promise<SocialCredential>;
  /** Clears the provider's local session (e.g. so Google shows the account chooser next time). */
  signOut(): Promise<void>;
}
