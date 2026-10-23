import { Button, Card, Icon, PageHeader, type IconName } from '@/components/ui';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuthStore } from '@/store/auth.store';
import { copyText, shareContent } from '@/utils/linking';
import { env } from '@/config/env';

export default function Refer() {
  usePageMeta({ title: 'Refer & earn', noindex: true });
  const user = useAuthStore((s) => s.user)!;
  const code = user.referralCode ?? 'SERVIO50';
  const message = `Book trusted home services on Servio! Use my code ${code} to get ₹100 off your first booking.`;
  return (
    <div className="max-w-[var(--container-narrow)]">
      <PageHeader title="Refer & earn" back="/account" />
      <div className="flex flex-col items-center py-6 text-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-50 text-accent-500">
          <Icon name="gift" size={46} />
        </span>
        <h2 className="mt-5 text-h2 font-bold">Give ₹100, get ₹150</h2>
        <p className="mt-2 max-w-sm text-ink-secondary">Your friend gets ₹100 off their first booking. You get ₹150 in your wallet once their service is completed.</p>
      </div>
      <Card className="flex items-center justify-between gap-3 border-dashed border-primary-300 bg-primary-50">
        <div>
          <p className="text-caption text-ink-secondary">Your referral code</p>
          <p className="text-h2 font-bold tracking-[0.2em] text-primary-700">{code}</p>
        </div>
        <Button variant="outline" size="sm" leftIcon="copy" onClick={() => void copyText(code, 'Code copied')}>
          Copy
        </Button>
      </Card>
      <Button size="lg" fullWidth leftIcon="share" className="mt-4" onClick={() => void shareContent({ title: 'Servio', text: message, url: `${env.siteUrl}/signup?ref=${code}` })}>
        Invite friends
      </Button>
      <h2 className="mb-4 mt-8 text-title font-semibold">How it works</h2>
      <ol className="flex flex-col gap-4">
        {([['share', 'Share your code with friends & family'], ['user-plus', 'They sign up and book their first service'], ['wallet', '₹150 is credited to your wallet after completion']] as [IconName, string][]).map(([icon, text], i) => (
          <li key={text} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 font-bold text-white">{i + 1}</span>
            <Icon name={icon} size={18} className="text-ink-secondary" />
            <span>{text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
