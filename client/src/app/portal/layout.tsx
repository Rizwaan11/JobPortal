import { LogoutButton } from "@/components/logout-button";
import { requireRole } from "@/lib/server-auth";

import { PortalNav } from "./portal-nav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("applicant");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <PortalNav />
          <div className="ml-auto">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
