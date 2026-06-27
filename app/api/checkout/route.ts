import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/checkout';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { jobTitle, email } = body as { jobTitle: string; email: string };

  if (!jobTitle?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: 'Job title and email are required.' },
      { status: 400 },
    );
  }

  try {
    const url = await createCheckoutSession(jobTitle, email);
    return NextResponse.json({ url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
