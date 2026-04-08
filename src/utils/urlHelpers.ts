/**
 * Proxy an external image URL through images.weserv.nl to handle CORS and caching.
 * @param url The original image URL
 * @param fallback A fallback URL if the original is null or empty
 */
export function getProxiedUrl(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  if (url.includes('weserv.nl') || url.includes('base64')) return url;
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=${encodeURIComponent(fallback)}`;
}
