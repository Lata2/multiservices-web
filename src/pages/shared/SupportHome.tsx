import { useState } from 'react';
import { Link } from 'react-router';
import { Card, cn, Divider, EmptyState, Icon, ListSkeleton, PageHeader, QueryView, SectionHeader, type IconName } from '@/components/ui';
import { TicketRow } from '@/features/TicketRow';
import { useFaqs, useMyTickets } from '@/hooks/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useRoleBase } from '@/hooks/useRole';
import { callPhone, sendEmail } from '@/utils/linking';

export default function SupportHome() {
  usePageMeta({ title: 'Help & support', noindex: true });
  const { role, base } = useRoleBase();
  const faqs = useFaqs(role === 'admin' ? 'all' : role);
  const tickets = useMyTickets();
  const [open, setOpen] = useState<string | null>(null);
  const actions: { icon: IconName; label: string; to?: string; onClick?: () => void }[] = [
    { icon: 'chats', label: 'New ticket', to: `${base}/support/new` },
    { icon: 'phone', label: 'Call us', onClick: () => callPhone('+91 98765 43210') },
    { icon: 'mail', label: 'Email', onClick: () => sendEmail('support@servio.app', 'Servio support') },
  ];
  const cls = 'focus-ring flex flex-1 flex-col items-center gap-1.5 py-4 text-caption font-semibold hover:bg-primary-50';

  return (
    <div>
      <PageHeader title="Help & support" back={base === '/account' ? '/account' : `${base}/account`} />
      <Card padded={false} elevation="md" className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-5 text-white">
          <h2 className="text-h3 font-semibold">How can we help?</h2>
          <p className="mt-1 text-body-sm text-white/80">Our team typically replies within 4 working hours.</p>
        </div>
        <div className="flex divide-x divide-border">
          {actions.map((a) =>
            a.to ? (
              <Link key={a.label} to={a.to} className={cls}>
                <Icon name={a.icon} size={21} className="text-primary-600" />
                {a.label}
              </Link>
            ) : (
              <button key={a.label} type="button" onClick={a.onClick} className={cls}>
                <Icon name={a.icon} size={21} className="text-primary-600" />
                {a.label}
              </button>
            ),
          )}
        </div>
      </Card>
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <SectionHeader title="Your tickets" />
          <QueryView query={tickets} loading={<ListSkeleton rows={2} height={96} />} empty={<EmptyState compact icon="chats" title="No tickets yet" message="Raise a ticket if something isn’t right." />}>
            {(list) => (
              <div className="flex flex-col gap-3">
                {list.map((t) => (
                  <TicketRow key={t.id} ticket={t} to={`${base}/support/${t.id}`} />
                ))}
              </div>
            )}
          </QueryView>
        </section>
        <section>
          <SectionHeader title="Frequently asked questions" />
          <Card padded={false}>
            <QueryView query={faqs} loading={<ListSkeleton rows={4} height={44} className="p-3" />}>
              {(list) => (
                <ul>
                  {list.map((f, i) => {
                    const isOpen = open === f.id;
                    return (
                      <li key={f.id}>
                        {i > 0 ? <Divider /> : null}
                        <h3>
                          <button type="button" onClick={() => setOpen(isOpen ? null : f.id)} aria-expanded={isOpen} aria-controls={`faq-${f.id}`} className="focus-ring flex w-full items-center gap-3 px-4 py-4 text-left font-medium hover:bg-surface-muted/50">
                            <span className="flex-1">{f.question}</span>
                            <Icon name="chevron-down" size={17} className={cn('text-ink-muted transition-transform', isOpen && 'rotate-180')} />
                          </button>
                        </h3>
                        <div id={`faq-${f.id}`} hidden={!isOpen} className="px-4 pb-4 text-body-sm leading-6 text-ink-secondary">
                          {f.answer}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </QueryView>
          </Card>
        </section>
      </div>
    </div>
  );
}
