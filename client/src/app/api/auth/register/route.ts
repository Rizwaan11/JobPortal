import { forwardAuth } from "@/lib/forward-auth";

export async function POST(request: Request) {
  return forwardAuth(request, "register");
}
