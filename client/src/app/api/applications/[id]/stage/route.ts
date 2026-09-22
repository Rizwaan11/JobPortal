import { NextResponse } from "next/server";

import { ApiError, apiFetch } from "@/lib/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (body === null) {
    return NextResponse.json(
      { error: { message: "Invalid request body" } },
      { status: 400 },
    );
  }

  try {
    const application = await apiFetch(`/api/applications/${id}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return NextResponse.json(application);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: { message: "Could not update the application" } },
      { status: 502 },
    );
  }
}
