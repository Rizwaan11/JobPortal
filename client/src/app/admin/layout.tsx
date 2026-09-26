import { AppHeader } from "@/components/app-header";
import { SessionActions } from "@/components/session-actions";
import { getAccountContextLabel, getWorkspaceNavigation } from "@/lib/navigation";
import { requireRole } from "@/lib/server-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        navigation={getWorkspaceNavigation(user.role)}
        navigationLabel="Administration navigation"
        actions={
          <SessionActions
            email={user.email}
            contextLabel={getAccountContextLabel(user.role)}
          />
        }
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
