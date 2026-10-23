import { useState } from 'react';
import { ActionBar, Button, Card, Chip, Icon, Input, PageHeader, Textarea } from '@/components/ui';
import { LogoMark } from '@/components/layout/Logo';
import { ROLES } from '@/constants/roles';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { adminApi } from '@/services/api';
import type { Role } from '@/types/models';

export default function Broadcast() {
  usePageMeta({ title: 'Broadcast', noindex: true });
  const [audience, setAudience] = useState<Role | 'all'>('customer');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const send = useApiMutation(() => adminApi.broadcast(audience, title.trim(), body.trim()), { successMessage: (r) => `Sent to ${r.sent} users`, onSuccess: () => (setTitle(''), setBody('')) });
  const submit = () => {
    const e = { title: title.trim().length < 4 ? 'Title is too short' : undefined, body: body.trim().length < 10 ? 'Message is too short' : undefined };
    setErrors(e);
    if (!e.title && !e.body) send.mutate();
  };
  return (
    <div className="max-w-4xl">
      <PageHeader title="Broadcast" subtitle="Send an in-app & push notification" back="/admin/more" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="flex flex-col gap-4">
          <fieldset>
            <legend className="mb-2 text-body-sm font-medium text-ink-secondary">Audience</legend>
            <div className="flex flex-wrap gap-2">
              {(['customer', 'provider', 'delivery', 'all'] as const).map((r) => (
                <Chip key={r} label={r === 'all' ? 'Everyone' : `${ROLES[r].title}s`} selected={audience === r} onClick={() => setAudience(r)} />
              ))}
            </div>
          </fieldset>
          <Input label="Title" placeholder="Weekend offer: 20% off cleaning" value={title} onValueChange={setTitle} maxLength={60} error={errors.title} />
          <Textarea label="Message" placeholder="Write a short, clear message" value={body} onValueChange={setBody} rows={4} maxLength={180} hint={`${body.length}/180`} error={errors.body} />
        </Card>
        <aside>
          <p className="mb-2 text-caption font-semibold text-ink-muted">Preview</p>
          <Card className="flex gap-3">
            <LogoMark size={40} />
            <div className="min-w-0">
              <p className="font-semibold">{title || 'Notification title'}</p>
              <p className="text-body-sm text-ink-secondary">{body || 'Your message will appear here.'}</p>
            </div>
          </Card>
          <p className="mt-3 flex items-start gap-2 text-caption text-ink-muted">
            <Icon name="info" size={14} className="mt-px" />
            Delivered to the in-app notification centre now; push delivery activates when FCM/APNs is connected.
          </p>
        </aside>
      </div>
      <ActionBar>
        <Button leftIcon="send" size="lg" fullWidth loading={send.isPending} onClick={submit}>
          Send notification
        </Button>
      </ActionBar>
    </div>
  );
}
