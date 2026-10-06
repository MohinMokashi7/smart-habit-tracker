/**
 * Minimal JWT payload reader (no signature verification — that is the
 * backend's job). Used only to read `sub` (email), `userId` and `exp`.
 */

export interface JwtPayload {
  sub?: string;
  userId?: number;
  iat?: number;
  exp?: number;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < normalized.length; i += 1) {
    const idx = B64.indexOf(normalized.charAt(i));
    if (idx === -1) throw new Error('Invalid base64');
    value = (value << 6) | idx;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += `%${((value >> bits) & 0xff).toString(16).padStart(2, '0')}`;
    }
  }
  return decodeURIComponent(output);
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1])) as JwtPayload;
  } catch {
    return null;
  }
}

/** True when the token is unreadable or its `exp` is in the past (with a small skew). */
export function isTokenExpired(token: string, skewSeconds = 15): boolean {
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}
