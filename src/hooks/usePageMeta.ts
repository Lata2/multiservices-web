import { useEffect } from 'react';
import { env } from '@/config/env';

interface Meta {
  title: string;
  description?: string;
  /** Private pages (accounts, dashboards) are excluded from search engines. */
  noindex?: boolean;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.append(el);
  }
  el.content = content;
}

const DEFAULT_DESC = 'Book verified professionals for cleaning, AC repair, salon at home, plumbing, laundry and more. Upfront prices, live slots and a 7-day re-work guarantee.';

/** Sets document title, description, Open Graph tags, robots and canonical URL per page. */
export function usePageMeta({ title, description = DEFAULT_DESC, noindex }: Meta) {
  useEffect(() => {
    const full = title ? `${title} · ${env.appName}` : `${env.appName} — Home services, booked in a tap`;
    document.title = full;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', env.siteUrl + window.location.pathname);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = Object.assign(document.createElement('link'), { rel: 'canonical' });
      document.head.append(link);
    }
    link.href = env.siteUrl + window.location.pathname;
  }, [title, description, noindex]);
}
