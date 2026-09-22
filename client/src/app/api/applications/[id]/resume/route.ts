import { NextResponse } from "next/server";

import { ApiError, apiFetch } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const result = await apiFetch(`/api/applications/${id}/resume`);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { message: error.message } },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: { message: "Could not open the resume" } },
      { status: 502 },
    );
  }
}
