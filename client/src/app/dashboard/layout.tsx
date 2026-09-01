'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div>
      <nav className="flex gap-4 p-4 border-b items-center">
        <Link href="/dashboard/jobs">Jobs</Link>
        <Link href="/dashboard/members">Members</Link>
        <button onClick={handleLogout} className="ml-auto">Logout</button>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
}