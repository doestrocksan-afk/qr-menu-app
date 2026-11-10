// Menus are read directly from WordPress. No unauthenticated duplicate database writes.
export function POST() {
  return Response.json({ error: 'Legacy synchronization is disabled' }, { status: 410, headers: { 'Cache-Control': 'no-store' } });
}
