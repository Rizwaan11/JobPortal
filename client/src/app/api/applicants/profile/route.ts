import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

async function forwardProfile(method: "POST" | "PATCH", request: Request) {
  const body = await request.json().catch(() => null);
  if (body === null) {
    return NextResponse.json({ error: { message: "Invalid request body" } }, { status: 400 });
  }

  try {
    const data = await apiFetch("/api/applicants/profile", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: "Request failed" } }, { status: 502 });
  }
}

export async function POST(request: Request) {
  return forwardProfile("POST", request);
}

export async function PATCH(request: Request) {
  return forwardProfile("PATCH", request);
}
