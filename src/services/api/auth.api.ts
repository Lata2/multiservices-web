import { env } from '@/config/env';
import { db } from '@/mocks/db';
import { avatar, uid } from '@/mocks/helpers';
import { verifyMockIdentityToken } from '@/mocks/identityVerification';
import type { SocialCredential } from '@/services/auth/types';
import type { DeliveryPartner, Provider, Role, User } from '@/types/models';
import { ApiError, mock, requireUser } from '../http';

export interface AuthResponse {
  user: User;
  token: string;
}

/** How the current session was created (drives provider sign-out and UI hints). */
export type AuthMethod = 'password' | 'otp' | 'signup' | 'google' | 'apple';

/** Body of `POST /auth/social/:provider`. */
export interface SocialLoginPayload {
  credential: SocialCredential;
  /** Role the user is signing in to. New social users can only self-register as customers. */
  role: Role;
}

/** Details attached to a `SIGNUP_REQUIRED` error so the signup form can be prefilled. */
export interface SignupPrefill {
  name?: string;
  email?: string;
  provider?: 'google' | 'apple';
}

export const DEMO_PASSWORD = 'Demo@1234';
export const DEMO_ACCOUNTS: Record<Role, string> = {
  customer: 'customer@servio.app',
  provider: 'provider@servio.app',
  delivery: 'delivery@servio.app',
  admin: 'admin@servio.app',
};

const token = (u: User) => `mock.${u.id}.${Date.now().toString(36)}`;

function assertCanSignIn(user: User) {
  if (user.status === 'blocked') throw new ApiError('This account has been blocked. Contact support.', 403, 'BLOCKED');
  if (user.status === 'rejected') throw new ApiError('Your application was not approved. Contact support.', 403, 'REJECTED');
}

export interface SignupPayload {
  role: Exclude<Role, 'admin'>;
  name: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
  // provider
  businessName?: string;
  providerType?: 'individual' | 'organization';
  categoryIds?: string[];
  city?: string;
  yearsExperience?: number;
  // delivery
  vehicleType?: DeliveryPartner['vehicleType'];
  vehicleNumber?: string;
  licenseNumber?: string;
}

export const authApi = {
  login: (email: string, password: string, role: Role) =>
    mock<AuthResponse>(() => {
      const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) throw new ApiError('No account found with this email.', 404, 'NOT_FOUND', { email: 'No account found' });
      if (user.role !== role)
        throw new ApiError(`This email is registered as a ${user.role}. Switch role to continue.`, 403, 'WRONG_ROLE');
      const expected = db.passwords[user.id] ?? DEMO_PASSWORD;
      if (password !== expected) throw new ApiError('Incorrect password.', 401, 'BAD_CREDENTIALS', { password: 'Incorrect password' });
      assertCanSignIn(user);
      return { user, token: token(user) };
    }),

  /** Sends an OTP (mock: always succeeds; code is `env.demoOtp`). */
  requestOtp: (phone: string) =>
    mock(() => {
      if (phone.replace(/\D/g, '').length < 10) throw new ApiError('Enter a valid phone number', 422);
      return { sent: true, expiresIn: 60 };
    }, 600),

  /** Verifies OTP; logs into an existing customer by phone or creates a new one. */
  verifyOtp: (phone: string, code: string, role: Role) =>
    mock<AuthResponse>(() => {
      if (code !== env.demoOtp) throw new ApiError('Invalid code. Please try again.', 401, 'BAD_OTP');
      const digits = phone.replace(/\D/g, '').slice(-10);
      let user = db.users.find((u) => u.phone.replace(/\D/g, '').endsWith(digits) && u.role === role);
      if (!user) {
        if (role !== 'customer') throw new ApiError(`No ${role} account is linked to this number.`, 404);
        user = {
          id: uid('u'),
          role: 'customer',
          name: 'New Customer',
          email: `${digits}@phone.servio.app`,
          phone: `+91 ${digits}`,
          status: 'active',
          createdAt: new Date().toISOString(),
          referralCode: `SRV${digits.slice(-4)}`,
        };
        db.users.push(user);
      }
      assertCanSignIn(user);
      return { user, token: token(user) };
    }),

  signup: (p: SignupPayload) =>
    mock<AuthResponse>(() => {
      if (db.users.some((u) => u.email.toLowerCase() === p.email.toLowerCase()))
        throw new ApiError('An account with this email already exists.', 409, 'EXISTS', { email: 'Email already registered' });
      const id = uid('u');
      const now = new Date().toISOString();
      const user: User = {
        id,
        role: p.role,
        name: p.name.trim(),
        email: p.email.trim().toLowerCase(),
        phone: p.phone,
        status: p.role === 'customer' ? 'active' : 'pending',
        city: p.city ?? 'Bengaluru',
        createdAt: now,
        referralCode: p.role === 'customer' ? `${p.name.split(' ')[0].toUpperCase().slice(0, 6)}50` : undefined,
      };

      if (p.role === 'provider') {
        const providerId = uid('prov');
        const provider: Provider = {
          id: providerId,
          userId: id,
          businessName: p.businessName!,
          ownerName: p.name,
          type: p.providerType ?? 'individual',
          avatar: avatar(5),
          cover: '',
          about: '',
          city: p.city ?? 'Bengaluru',
          address: '',
          phone: p.phone,
          email: p.email,
          categoryIds: p.categoryIds ?? [],
          rating: 0,
          reviewCount: 0,
          jobsCompleted: 0,
          yearsExperience: p.yearsExperience ?? 0,
          distanceKm: 3,
          verified: false,
          status: 'pending',
          commissionRate: db.settings.defaultCommission,
          startingPrice: 0,
          visitingCharge: 0,
          hours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: day !== 0, start: '09:00', end: '18:00' })),
          holidays: [],
          slotDurationMin: 60,
          advanceBookingDays: 14,
          documents: [
            { id: 'doc_id', name: 'Government ID', status: 'pending' },
            { id: 'doc_addr', name: 'Address Proof', status: 'missing' },
            { id: 'doc_biz', name: p.providerType === 'organization' ? 'GST / Business Registration' : 'Skill Certificate', status: 'missing' },
          ],
          joinedAt: now,
        };
        db.providers.push(provider);
        user.profileId = providerId;
      }

      if (p.role === 'delivery') {
        const partnerId = uid('dp');
        db.deliveryPartners.push({
          id: partnerId,
          userId: id,
          name: p.name,
          phone: p.phone,
          avatar: avatar(8),
          vehicleType: p.vehicleType ?? 'bike',
          vehicleNumber: p.vehicleNumber ?? '',
          licenseNumber: p.licenseNumber ?? '',
          rating: 0,
          completedTasks: 0,
          online: false,
          status: 'pending',
          city: p.city ?? 'Bengaluru',
          joinedAt: now,
        });
        user.profileId = partnerId;
      }

      db.users.push(user);
      db.passwords[id] = p.password;
      db.notifications.unshift({
        id: uid('nt'),
        userId: id,
        type: 'system',
        title: p.role === 'customer' ? 'Welcome to Servio! 🎉' : 'Application received',
        body:
          p.role === 'customer'
            ? 'Use code WELCOME500 for ₹500 off your first booking above ₹1,999.'
            : 'Our team will verify your documents within 24–48 hours. You can explore the app meanwhile.',
        read: false,
        createdAt: now,
      });
      return { user, token: token(user) };
    }, 900),

  /**
   * Exchanges a Google/Apple credential for an app session. The backend verifies the ID token
   * (signature, issuer, audience, expiry, nonce), then finds the user by linked identity → verified
   * email, or registers a new customer. Providers/partners without an account get `SIGNUP_REQUIRED`.
   */
  socialLogin: ({ credential, role }: SocialLoginPayload) =>
    mock<AuthResponse>(() => {
      if (role === 'admin') throw new ApiError('Administrators must sign in with email and password.', 403, 'SOCIAL_NOT_ALLOWED');
      const identity = verifyMockIdentityToken(credential.provider, credential.idToken);
      const providerName = identity.provider === 'google' ? 'Google' : 'Apple';

      const link = db.identities.find((i) => i.provider === identity.provider && i.subject === identity.subject);
      let user = link ? db.users.find((u) => u.id === link.userId) : undefined;
      // Only auto-link by email when the IdP vouches for it.
      if (!user && identity.email && identity.emailVerified) user = db.users.find((u) => u.email.toLowerCase() === identity.email!.toLowerCase());

      if (user && user.role !== role)
        throw new ApiError(`This ${providerName} account belongs to a ${user.role} account. Switch role to continue.`, 403, 'WRONG_ROLE');

      // Apple sends the name only on first authorization; the client forwards it as a hint.
      const name = identity.name ?? credential.profile.name ?? null;

      if (!user) {
        if (role !== 'customer') {
          const prefill: SignupPrefill = { name: name ?? undefined, email: identity.email ?? undefined, provider: identity.provider };
          throw new ApiError(
            `No ${role === 'provider' ? 'service provider' : 'delivery partner'} account is linked to this ${providerName} account yet. Complete your application to continue.`,
            404,
            'SIGNUP_REQUIRED',
            undefined,
            prefill as Record<string, unknown>,
          );
        }
        const id = uid('u');
        user = {
          id,
          role: 'customer',
          name: name ?? 'Servio customer',
          email: identity.email ?? `${identity.subject}@users.servio.app`,
          phone: '',
          status: 'active',
          city: 'Bengaluru',
          createdAt: new Date().toISOString(),
          referralCode: `SRV${id.slice(-4).toUpperCase()}`,
        };
        db.users.push(user);
        db.notifications.unshift({
          id: uid('nt'),
          userId: id,
          type: 'system',
          title: 'Welcome to Servio! 🎉',
          body: 'Use code WELCOME500 for ₹500 off your first booking above ₹1,999. Add your phone number in Edit profile.',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }

      if (!link) db.identities.push({ provider: identity.provider, subject: identity.subject, userId: user.id, email: identity.email, linkedAt: new Date().toISOString() });
      assertCanSignIn(user);
      return { user, token: token(user) };
    }, 700),

  forgotPassword: (email: string) =>
    mock(() => {
      // Always succeed to avoid account enumeration.
      return { sent: true, email };
    }, 700),

  updateProfile: (patch: Partial<Pick<User, 'name' | 'email' | 'phone' | 'avatar' | 'city'>>) =>
    mock<User>(() => {
      const me = requireUser();
      const user = db.users.find((u) => u.id === me.id)!;
      if (patch.email && db.users.some((u) => u.id !== me.id && u.email.toLowerCase() === patch.email!.toLowerCase()))
        throw new ApiError('This email is already in use.', 409, 'EXISTS', { email: 'Email already in use' });
      Object.assign(user, patch);
      return user;
    }),

  changePassword: (current: string, next: string) =>
    mock(() => {
      const me = requireUser();
      const expected = db.passwords[me.id] ?? DEMO_PASSWORD;
      if (current !== expected) throw new ApiError('Current password is incorrect.', 401, 'BAD_CREDENTIALS', { current: 'Incorrect password' });
      db.passwords[me.id] = next;
      return { ok: true };
    }),

  deleteAccount: () =>
    mock(() => {
      const me = requireUser();
      const u = db.users.find((x) => x.id === me.id);
      if (u) u.status = 'blocked';
      return { ok: true };
    }),

  me: () => mock<User>(() => db.users.find((u) => u.id === requireUser().id)!),

  /**
   * Called synchronously when a persisted session is restored on app start. With a real backend the
   * stored token is simply reused (an expired token yields a 401 → global sign-out). The mock DB is
   * in memory and resets on reload, so a customer created in a previous run is re-registered;
   * other roles must sign in again because their linked profiles no longer exist.
   */
  restoreSession: (user: User, sessionToken: string): AuthResponse | null => {
    if (!env.useMocks) return { user, token: sessionToken };
    if (db.users.some((u) => u.id === user.id)) return { user, token: sessionToken };
    if (user.role !== 'customer') return null;
    db.users.push(user);
    return { user, token: sessionToken };
  },
};
