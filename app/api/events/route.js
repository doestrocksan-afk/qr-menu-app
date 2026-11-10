// Legacy endpoint intentionally closed until authenticated reporting and RLS are deployed.
// This release does not collect visitor events or expose analytics data.
export function GET() {
  return Response.json({ error: 'Analytics is not enabled in this release' }, { status: 410, headers: { 'Cache-Control': 'no-store' } });
}
export const POST = GET;
