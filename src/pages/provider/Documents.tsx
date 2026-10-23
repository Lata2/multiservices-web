import { Badge, Button, Card, Icon, LoadingState, PageHeader, type BadgeTone } from '@/components/ui';
import { PROVIDER_STATUS } from '@/constants/status';
import { useProviderProfile } from '@/hooks/api';
import { qk } from '@/hooks/queryKeys';
import { useApiMutation } from '@/hooks/useApiMutation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { providerApi } from '@/services/api';
import type { ProviderDocument } from '@/types/models';

const DOC_TONE: Record<ProviderDocument['status'], BadgeTone> = { verified: 'success', pending: 'warning', rejected: 'danger', missing: 'neutral' };

export default function Documents() {
  usePageMeta({ title: 'Documents & verification', noindex: true });
  const q = useProviderProfile();
  const upload = useApiMutation((docId: string) => providerApi.uploadDocument(docId), { invalidate: [qk.provider_.all], successMessage: 'Document uploaded for review' });
  if (!q.data) return <LoadingState />;
  const p = q.data;
  const status = PROVIDER_STATUS[p.status];
  return (
    <div className="max-w-3xl">
      <PageHeader title="Documents & verification" back="/provider/account" />
      <Card className="mb-5 flex items-center gap-3">
        <span className={p.verified ? 'flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-success-600' : 'flex h-12 w-12 items-center justify-center rounded-full bg-warning-50 text-warning-600'}>
          <Icon name={p.verified ? 'shield-check' : 'hourglass'} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{p.verified ? 'Your account is verified' : 'Verification pending'}</p>
          <p className="text-body-sm text-ink-secondary">{p.verified ? 'Customers see a verified badge on your profile.' : 'Admins review documents within 24–48 hours.'}</p>
        </div>
        <Badge label={status.label} tone={status.tone} />
      </Card>
      <ul className="flex flex-col gap-3">
        {p.documents.map((d) => (
          <li key={d.id}>
            <Card className="flex items-center gap-3">
              <Icon name="document" size={22} className="text-primary-500" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{d.name}</p>
                <Badge label={d.status} tone={DOC_TONE[d.status]} className="mt-1 capitalize" />
              </div>
              {d.status === 'missing' || d.status === 'rejected' ? (
                <Button size="sm" leftIcon="upload" loading={upload.isPending && upload.variables === d.id} onClick={() => upload.mutate(d.id)}>
                  Upload
                </Button>
              ) : d.status === 'pending' ? (
                <span className="text-caption text-ink-muted">In review</span>
              ) : (
                <Icon name="check-circle" size={21} className="text-success-500" label="Verified" />
              )}
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-caption text-ink-muted">Accepted formats: PDF, JPG, PNG up to 10 MB. Uploads go to secure storage once the backend is integrated.</p>
    </div>
  );
}
