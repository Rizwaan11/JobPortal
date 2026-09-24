import "server-only";

import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import { getRoleHome, getSafeReturnPath, type UserRole } from "@/lib/roles";

type CurrentUser = {
  id: string;
  email: string;
  role: UserRole;
  status: "active";
};

const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  try {
    const data = (await apiFetch("/api/auth/me")) as {
      user: CurrentUser;
    };

    return data.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
});

export async function requireRole(requiredRole: UserRole) {
  const user = await getCurrentUser();

  if (!user) {
    const cookieStore = await cookies();

    if (cookieStore.has("refresh_token")) {
      const headerStore = await headers();
      const returnTo = getSafeReturnPath(
        headerStore.get("x-current-path"),
        getRoleHome(requiredRole),
      );

      redirect(`/auth/renew-session?returnTo=${encodeURIComponent(returnTo)}`);
    }

    redirect("/login");
  }

  if (user.role !== requiredRole) {
    redirect(getRoleHome(user.role));
  }

  return user;
}
