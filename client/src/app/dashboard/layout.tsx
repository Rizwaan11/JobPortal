import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="flex items-center gap-4 border-b p-4">
        <Link href="/dashboard/company">Company</Link>
        <Link href="/dashboard/jobs">Jobs</Link>
        <Link href="/dashboard/applications">Applications</Link>
        <Link href="/dashboard/members">Members</Link>
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
}
