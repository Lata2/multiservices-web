export type SocialAuthErrorCode =
  /** User dismissed the system sheet — not an error worth showing. */
  | 'CANCELLED'
  | 'IN_PROGRESS'
  /** Platform / runtime can't run this provider (e.g. blocked third-party script, unsupported browser). */
  | 'UNAVAILABLE'
  /** Required client IDs are missing from the environment. */
  | 'NOT_CONFIGURED'
  | 'PLAY_SERVICES'
  | 'NO_ID_TOKEN'
  | 'FAILED';

export class SocialAuthError extends Error {
  readonly code: SocialAuthErrorCode;
  readonly cause?: unknown;
  constructor(code: SocialAuthErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'SocialAuthError';
    this.code = code;
    this.cause = cause;
  }
}

export const isSocialAuthError = (e: unknown): e is SocialAuthError => e instanceof SocialAuthError;
export const isCancellation = (e: unknown) => isSocialAuthError(e) && e.code === 'CANCELLED';
