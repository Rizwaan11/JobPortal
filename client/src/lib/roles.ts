export const roleHome = {
  applicant: "/portal",
  recruiter: "/dashboard",
  admin: "/admin",
} as const;

export type UserRole = keyof typeof roleHome;

export function getRoleHome(role: UserRole) {
  return roleHome[role];
}

export function getSafeReturnPath(value: string | null | undefined, fallback: string) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
