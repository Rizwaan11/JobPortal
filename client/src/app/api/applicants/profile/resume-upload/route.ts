import { NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

export async function POST() {
  try {
    const data = await apiFetch("/api/applicants/profile/resume-upload", {
      method: "POST",
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: { message: error.message } }, { status: error.status });
    }
    return NextResponse.json({ error: { message: "Request failed" } }, { status: 502 });
  }
}
