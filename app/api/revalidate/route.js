import { revalidatePath } from 'next/cache';
import { authenticated, strongSecret } from '@/lib/revalidation-auth.mjs';
import { validSlug } from '@/lib/menu-utils.mjs';

export const runtime = 'nodejs';
export function GET() {
  return Response.json({ error: 'Use POST with bearer authentication' }, { status: 405, headers: { Allow: 'POST' } });
}
export async function POST(request) {
  if (!strongSecret(process.env.REVALIDATE_SECRET)) return Response.json({ error: 'Revalidation not configured' }, { status: 503 });
  if (!authenticated(request, process.env.REVALIDATE_SECRET)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // A single bounded slug only; no arbitrary paths or global cache purge.
  const text = await request.text();
  if (text.length > 1024) return Response.json({ error: 'Body too large' }, { status: 413 });
  let payload;
  try { payload = JSON.parse(text); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!validSlug(payload?.slug)) return Response.json({ error: 'Invalid slug' }, { status: 400 });
  revalidatePath(`/r/${payload.slug}`);
  return Response.json({ revalidated: true }, { headers: { 'Cache-Control': 'no-store' } });
}
