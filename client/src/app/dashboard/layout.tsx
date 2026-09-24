import { BrandLink } from "@/components/brand-link";
import { LogoutButton } from "@/components/logout-button";
import { requireRole } from "@/lib/server-auth";

import { DashboardNav } from "./dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole("recruiter");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <BrandLink href="/dashboard/company" />
          <div className="scrollbar-none order-3 w-full overflow-x-auto border-t pt-3 sm:order-none sm:w-auto sm:border-0 sm:pt-0">
            <DashboardNav />
          </div>
          <div className="ml-auto">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
