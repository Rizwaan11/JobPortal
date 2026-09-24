import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookies";
import { apiUrl } from "@/lib/server-config";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body" } }, { status: 400 });
  }

  try {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) return NextResponse.json(data, { status: response.status });
    if (!data.accessToken || !data.refreshToken || !data.role) {
      return NextResponse.json({ error: { message: "Invalid login response" } }, { status: 502 });
    }

    await setAuthCookies(data);
    return NextResponse.json({ role: data.role });
  } catch {
    return NextResponse.json(
      { error: { message: "Authentication is unavailable" } },
      { status: 502 },
    );
  }
}
