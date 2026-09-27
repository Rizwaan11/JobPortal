import { AppHeader } from "@/components/app-header";
import { SessionActions } from "@/components/session-actions";
import { getOptionalCompanyContext } from "@/lib/company";
import { getAccountContextLabel, getWorkspaceNavigation } from "@/lib/navigation";
import { requireRole } from "@/lib/server-auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("recruiter");
  const company = await getOptionalCompanyContext();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        navigation={getWorkspaceNavigation(user.role, company?.companyRole)}
        navigationLabel="Recruiter navigation"
        actions={
          <SessionActions
            email={user.email}
            contextLabel={getAccountContextLabel(user.role, company?.companyRole)}
          />
        }
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
