import { timingSafeEqual } from 'node:crypto';
export function strongSecret(secret) {
  return typeof secret === 'string' && secret.length >= 32 && secret.length <= 256 && new Set(secret).size >= 12;
}
export function authenticated(request, expected) {
  if (!strongSecret(expected)) return false;
  const actual = request.headers.get('authorization');
  const wanted = `Bearer ${expected}`;
  if (!actual || Buffer.byteLength(actual) !== Buffer.byteLength(wanted)) return false;
  return timingSafeEqual(Buffer.from(actual), Buffer.from(wanted));
}
