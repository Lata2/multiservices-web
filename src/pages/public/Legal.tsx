import { useParams } from 'react-router';
import { PageBody } from '@/components/layout/SiteLayout';
import { Card, PageHeader } from '@/components/ui';
import { APP_VERSION } from '@/features/account';
import { usePageMeta } from '@/hooks/usePageMeta';

const DOCS: Record<string, { title: string; body: string[] }> = {
  terms: {
    title: 'Terms of Service',
    body: [
      'By using Servio you agree to these terms. Servio is a marketplace that connects customers with independent service providers and delivery partners.',
      'Bookings are contracts between the customer and the provider. Servio facilitates payment, scheduling and dispute resolution.',
      'Cancellations made at least 3 hours before the scheduled slot are free. Late cancellations may attract a visiting fee.',
      'Providers must hold the licences required for their services and keep their documents current. Accounts may be suspended for policy violations.',
      'These terms are a placeholder for your legal team to replace before launch.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'We collect the information needed to deliver services: name, contact details, addresses and booking history.',
      'Location is used only to show nearby providers and route delivery partners. Payment details are processed by PCI-compliant gateways and are never stored on our servers.',
      'You can download or delete your data at any time from Settings.',
      'This policy is a placeholder for your legal team to replace before launch.',
    ],
  },
  about: {
    title: 'About Servio',
    body: [
      'Servio is a multi-service marketplace for home and doorstep services — cleaning, repairs, beauty, laundry, car care and more.',
      'Customers book in minutes, providers grow their business with smart scheduling and payouts, delivery partners earn on flexible hours, and admins run the whole marketplace from one place.',
      `Website version ${APP_VERSION}.`,
    ],
  },
};

export default function Legal() {
  const { doc = 'about' } = useParams();
  const d = DOCS[doc] ?? DOCS.about;
  usePageMeta({ title: d.title, description: d.body[0] });
  return (
    <PageBody narrow>
      <PageHeader title={d.title} back="/" />
      <Card className="flex flex-col gap-4 leading-7 text-ink-secondary">
        {d.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Card>
    </PageBody>
  );
}
