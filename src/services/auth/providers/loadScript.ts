const cache = new Map<string, Promise<void>>();

/** Loads a third-party script once (Google Identity Services, Apple JS). */
export function loadScript(src: string): Promise<void> {
  const existing = cache.get(src);
  if (existing) return existing;
  const p = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      cache.delete(src);
      reject(new Error(`Failed to load ${src}`));
    };
    document.head.append(s);
  });
  cache.set(src, p);
  return p;
}

/** Random URL-safe nonce + its SHA-256 hex digest (Apple expects the hash, backend verifies the raw value). */
export async function createNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const raw = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  return { raw, hashed };
}
