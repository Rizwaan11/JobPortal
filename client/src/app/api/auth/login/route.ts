import { NextResponse } from "next/server";
import { cookies } from "next/headers";


export async function POST(request:Request){
    const cookieStore = await cookies();
    const body = await request.json()

    const res = await fetch(
    `${process.env.API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

   if (!res.ok) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: res.status });
  }

  const data = await res.json();

  cookieStore.set("access_token", data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  cookieStore.set("refresh_token", data.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ message: 'Logged in' });
}
