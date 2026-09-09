'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminNav() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <nav className="flex gap-4 p-4 border-b items-center">
      <Link href="/admin/companies">Companies</Link>
      <Link href="/admin/jobs">Jobs</Link>
      <Link href="/admin/users">Users</Link>
      <button onClick={handleLogout} className="ml-auto">Logout</button>
    </nav>
  );
}
