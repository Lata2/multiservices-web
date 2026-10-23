import { toast } from '@/store/toast.store';

/** Opens Google Maps directions in a new tab (works on desktop and hands off to the maps app on phones). */
export function openDirections(address: string) {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank', 'noopener,noreferrer');
}

/** Starts a phone call on devices that can, and copies the number elsewhere. */
export function callPhone(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '');
  if (!digits) return toast.error('No phone number available.');
  const touch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  if (touch) {
    window.location.href = `tel:${digits}`;
    return;
  }
  void copyText(phone, `Number copied: ${phone}`);
}

export function sendEmail(to: string, subject?: string) {
  window.location.href = `mailto:${to}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
}

export async function copyText(text: string, message = 'Copied to clipboard') {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(message);
  } catch {
    toast.error('Could not copy. Please copy it manually.');
  }
}

/** Web Share API with a clipboard fallback for desktop browsers. */
export async function shareContent(data: { title?: string; text: string; url?: string }) {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
  }
  await copyText([data.text, data.url].filter(Boolean).join('\n'), 'Link copied to clipboard');
}

/** Triggers a file download for generated content (reports, invoices). */
export function downloadFile(filename: string, content: string, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
