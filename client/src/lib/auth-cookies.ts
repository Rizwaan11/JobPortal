import { cookies } from "next/headers";

export async function setAuthCookies(tokens: { accessToken: string; refreshToken: string }) {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  cookieStore.set("access_token", tokens.accessToken, options);
  cookieStore.set("refresh_token", tokens.refreshToken, options);
}
