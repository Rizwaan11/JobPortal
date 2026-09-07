import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const res = await fetch(`${process.env.API_URL}/api/applicants/shortlist/${jobId}`, {
    method: 'DELETE',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
