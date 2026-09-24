let refreshInFlight: Promise<Response> | null = null;

export function renewSession() {
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/auth/refresh", { method: "POST" }).finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

export async function fetchProtected(path: string, options?: RequestInit) {
  const response = await fetch(path, options);
  if (response.status !== 401) return response;

  const renewal = await renewSession().catch(() => null);
  if (renewal?.ok) return fetch(path, options);
  if (renewal?.status === 401) return response;

  return Response.json(
    { error: { message: "Could not renew your session. Please try again." } },
    { status: 503 },
  );
}
