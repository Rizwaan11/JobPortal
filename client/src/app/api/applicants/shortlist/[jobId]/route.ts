import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;

  try {
    const data = await apiFetch(`/api/applicants/shortlist/${jobId}`, {
      method: "DELETE",
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: "Request failed" } }, { status: 502 });
  }
}
