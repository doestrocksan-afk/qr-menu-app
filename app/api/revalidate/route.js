import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

async function handleRevalidate(request) {
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

export async function GET(request) {
  return handleRevalidate(request);
}

export async function POST(request) {
  return handleRevalidate(request);
}