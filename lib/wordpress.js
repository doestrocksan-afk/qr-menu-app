import { cache } from 'react';
import { validSlug } from './menu-utils.mjs';

// One request per server render, never a cross-request cached entitlement.
export const getMenuData = cache(async (slug) => {
  if (!validSlug(slug)) return null;
  const base = process.env.WORDPRESS_URL || 'https://easydishmenu.com';
  const url = new URL(`/wp-json/qrmenu/v1/menu/${encodeURIComponent(slug)}`, base);
  if (url.protocol !== 'https:') throw new Error('WORDPRESS_URL must use HTTPS');
  const response = await fetch(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000) });
  if (response.status === 404 || response.status === 403) return null;
  if (!response.ok) throw new Error('WordPress is temporarily unavailable');
  const data = await response.json();
  if (!data?.restaurant || !Array.isArray(data.categories)) throw new Error('Invalid menu response');
  return data;
});
