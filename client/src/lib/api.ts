import { cookies } from "next/headers";
import { apiUrl } from "@/lib/server-config";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(`${status}: ${message}`);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message || "API request failed";
    throw new ApiError(response.status, message);
  }

  return response.json();
}
