import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function forward(method: 'POST' | 'PATCH', body: unknown) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const res = await fetch(`${process.env.API_URL}/api/applicants/profile`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: accessToken ? `Bearer ${accessToken}` : '' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: Request) {
  return forward('POST', await request.json());
}

export async function PATCH(request: Request) {
  return forward('PATCH', await request.json());
}
