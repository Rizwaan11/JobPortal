import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/server-config";

export async function forwardAuth(request: Request, endpoint: string) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body" } }, { status: 400 });
  }

  try {
    const response = await fetch(`${apiUrl}/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: { message: "Authentication is unavailable" } },
      { status: 502 },
    );
  }
}
