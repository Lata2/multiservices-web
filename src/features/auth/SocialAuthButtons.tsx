import { useQuery } from '@tanstack/react-query';
import { env } from '@/config/env';
import { getSocialProvider, listDemoIdentities, socialAuthMode, socialProviderOrder, socialRoles, type SocialProviderId } from '@/services/auth';
import type { Role } from '@/types/models';
import { Avatar, Badge, cn, Divider, Icon, Modal } from '@/components/ui';
import { useSocialSignIn } from './useSocialSignIn';

export function OrDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3" role="separator">
      <Divider className="flex-1" />
      <span className="text-caption text-ink-muted">{label}</span>
      <Divider className="flex-1" />
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.75.73 1.05 1.6 2.24 2.73 2.2 1.1-.05 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.32-3.52zM14.2 6.13c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.65-1.05 1.69-.92 2.68.97.08 1.96-.49 2.56-1.23z" />
    </svg>
  );
}

const META: Record<SocialProviderId, { label: string }> = { google: { label: 'Google' }, apple: { label: 'Apple' } };

function ProviderButton({ id, demo, loading, disabled, onClick }: { id: SocialProviderId; demo: boolean; loading: boolean; disabled: boolean; onClick: () => void }) {
  const availability = useQuery({
    queryKey: ['social-availability', id, socialAuthMode()],
    queryFn: async () => (await getSocialProvider(id)?.checkAvailability()) ?? { available: false as const, reason: 'Disabled' },
    staleTime: Infinity,
  });
  if (availability.isPending) return <div className="h-12 animate-shimmer rounded-full bg-surface-muted" />;
  if (!availability.data?.available) {
    return env.isDev ? <p className="text-center text-caption text-ink-muted">{META[id].label} sign-in hidden: {availability.data && !availability.data.available ? availability.data.reason : 'unavailable'}</p> : null;
  }
  const dark = id === 'apple';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading || undefined}
      className={cn(
        'focus-ring flex h-12 w-full items-center justify-center gap-2.5 rounded-full px-4 font-semibold transition-colors disabled:opacity-60',
        dark ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'border border-border-strong bg-surface text-ink hover:bg-neutral-50',
      )}
    >
      {loading ? <Icon name="spinner" size={18} className="animate-spin" /> : id === 'google' ? <GoogleGlyph /> : <AppleGlyph />}
      Continue with {META[id].label}
      {demo ? <Badge label="Demo" tone={dark ? 'neutral' : 'warning'} /> : null}
    </button>
  );
}

/** Google / Apple sign-in block for login & signup pages, incl. the demo account picker. */
export function SocialAuthButtons({ role, next, className }: { role: Role; next?: string | null; className?: string }) {
  const social = useSocialSignIn(role, next);
  const mode = socialAuthMode();
  if (mode === 'off' || !socialRoles.includes(role)) return null;
  const demo = mode === 'demo';
  const providers = socialProviderOrder().filter((id) => !!getSocialProvider(id));
  if (!providers.length) return null;
  const identities = social.pickerFor ? listDemoIdentities(social.pickerFor, role) : [];
  const pickerLabel = social.pickerFor ? META[social.pickerFor].label : '';

  return (
    <div className={className}>
      <div className="grid gap-3">
        {providers.map((id) => (
          <ProviderButton key={id} id={id} demo={demo} disabled={social.busy} loading={social.pendingProvider === id} onClick={() => social.start(id)} />
        ))}
      </div>
      {demo ? (
        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-caption text-ink-muted">
          <Icon name="info" size={13} />
          Demo mode: you’ll pick a test account
        </p>
      ) : null}
      {social.notice ? (
        <div role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-danger-50 p-3 text-caption text-danger-700">
          <Icon name="alert" size={15} className="mt-px" />
          <span className="flex-1">{social.notice}</span>
          <button type="button" onClick={social.dismissNotice} aria-label="Dismiss" className="focus-ring rounded">
            <Icon name="x" size={14} />
          </button>
        </div>
      ) : null}
      <Modal open={!!social.pickerFor} onClose={social.closePicker} title={`Choose a demo ${pickerLabel} account`} subtitle={`Simulated — ${pickerLabel} is not contacted and no real credentials are used.`}>
        <ul className="flex flex-col gap-2.5">
          {identities.map((d) => (
            <li key={d.id}>
              <button type="button" onClick={() => social.chooseDemoIdentity(d.id)} className="focus-ring flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left hover:border-primary-300 hover:bg-primary-50">
                <Avatar name={d.name} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{d.name}</span>
                  <span className="block truncate text-caption text-ink-secondary">{d.email}</span>
                  <span className="mt-0.5 block text-caption text-ink-muted">{d.note}</span>
                </span>
                <Icon name="chevron-right" size={16} className="text-ink-muted" />
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
