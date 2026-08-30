
import { cookies } from 'next/headers';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const res = await fetch(`${process.env.API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}