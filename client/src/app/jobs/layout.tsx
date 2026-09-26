import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { SessionActions } from "@/components/session-actions";
import { buttonVariants } from "@/components/ui/button";
import { getPublicCompanyContext } from "@/lib/company";
import {
  getAccountContextLabel,
  getWorkspaceLink,
  publicNavigation,
} from "@/lib/navigation";
import { getPublicSessionUser } from "@/lib/server-auth";

export default async function JobsLayout({ children }: { children: React.ReactNode }) {
  const user = await getPublicSessionUser("/jobs");
  const company = user?.role === "recruiter" ? await getPublicCompanyContext() : null;

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        width="6xl"
        navigation={publicNavigation}
        navigationLabel="Main navigation"
        actions={
          user ? (
            <SessionActions
              email={user.email}
              contextLabel={getAccountContextLabel(user.role, company?.companyRole)}
              workspace={getWorkspaceLink(user.role)}
            />
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
                Sign in
              </Link>
              <Link href="/register" className={buttonVariants()}>
                Create account
              </Link>
            </div>
          )
        }
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
