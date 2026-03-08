import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  if (slug) {
    revalidatePath(`/r/${slug}`);
  } else {
    revalidatePath('/r/[slug]', 'page');
  }

  return NextResponse.json({ revalidated: true, slug: slug || 'all' });
}