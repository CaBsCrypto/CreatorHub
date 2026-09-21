export function normalizeUrl(url: string, platform: string): string {
  try {
    const urlObj = new URL(url);

    if (platform === 'youtube') {
      // Handle youtu.be/ID
      if (urlObj.hostname === 'youtu.be') {
        const id = urlObj.pathname.slice(1);
        return `https://www.youtube.com/watch?v=${id}`;
      }
      // Handle youtube.com/shorts/ID
      if (urlObj.pathname.startsWith('/shorts/')) {
        return `https://www.youtube.com/watch?v=${urlObj.pathname.split('/')[2]}`;
      }
      // Handle standard youtube.com/watch?v=ID
      const v = urlObj.searchParams.get('v');
      if (v) return `https://www.youtube.com/watch?v=${v}`;
    }

    if (platform === 'tiktok') {
      // TikTok usually has the format /@username/video/123456789
      // We just need the pathname and origin, stripping all query params
      return urlObj.origin + urlObj.pathname;
    }

    if (platform === 'instagram') {
      const igUrl = normalizeInstagramUrl(url);
      const urlObj = new URL(igUrl);
      // Instagram /p/ID or /reel/ID
      // Strip everything after the ID, including trailing slashes and query params
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return `${urlObj.origin}/${parts[0]}/${parts[1]}`;
      }
      return urlObj.origin + urlObj.pathname;
    }

    if (platform === 'x' || platform === 'x_video') {
      // Convert twitter.com to x.com for consistency
      const origin = urlObj.origin.replace('twitter.com', 'x.com');
      // Strip query parameters
      return origin + urlObj.pathname;
    }

    if (platform === 'linkedin') {
      // LinkedIn post format: /posts/username-activity-12345 or /feed/update/urn:li:activity:12345
      // Clean query params (e.g. ?utm_source=...&rcm=...) and normalize origin
      return urlObj.origin + urlObj.pathname.replace(/\/+$/, '');
    }

    // Default fallback: return origin + pathname (strips all queries and fragments)
    return urlObj.origin + urlObj.pathname;
  } catch (e) {
    // If it's not a valid URL (e.g. they typed nonsense), return it as-is
    return url.split('?')[0]; 
  }
}

export function idToShortcode(id: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let shortcode = '';
  let idBigInt = BigInt(id);
  while (idBigInt > 0n) {
    let remainder = idBigInt % 64n;
    shortcode = alphabet[Number(remainder)] + shortcode;
    idBigInt = idBigInt / 64n;
  }
  return shortcode;
}

export function normalizeInstagramUrl(url: string): string {
  if (url.includes('/insights/media/')) {
    const match = url.match(/\/insights\/media\/(\d+)/);
    if (match && match[1]) {
      const shortcode = idToShortcode(match[1]);
      return `https://www.instagram.com/p/${shortcode}/`;
    }
  }
  return url;
}
