import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookies";
import { apiUrl } from "@/lib/server-config";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    cookieStore.delete("access_token");
    return NextResponse.json(
      { error: { message: "Please sign in again." } },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (response.status === 401) {
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      return NextResponse.json(
        { error: { message: "Please sign in again." } },
        { status: 401 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: { message: "Could not renew your session." } },
        { status: 502 },
      );
    }

    const tokens = await response.json().catch(() => null);
    if (
      typeof tokens?.accessToken !== "string" ||
      typeof tokens?.refreshToken !== "string"
    ) {
      cookieStore.delete("access_token");
      cookieStore.delete("refresh_token");
      return NextResponse.json(
        { error: { message: "Please sign in again." } },
        { status: 401 },
      );
    }

    await setAuthCookies(tokens);
    return NextResponse.json({ message: "Session renewed" });
  } catch {
    return NextResponse.json(
      { error: { message: "Could not renew your session." } },
      { status: 502 },
    );
  }
}
