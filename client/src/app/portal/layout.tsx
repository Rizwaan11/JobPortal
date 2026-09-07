'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div>
      <nav className="flex gap-4 p-4 border-b items-center">
        <Link href="/jobs">Jobs</Link>
        <Link href="/portal/shortlist">Shortlist</Link>
        <Link href="/portal/applications">Applications</Link>
        <Link href="/portal/profile">Profile</Link>
        <button onClick={handleLogout} className="ml-auto">Logout</button>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
}
