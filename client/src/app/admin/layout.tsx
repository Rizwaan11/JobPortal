import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminNav from './admin-nav';
import { apiUrl } from '@/lib/server-config';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) redirect('/login');

  const response = await fetch(`${apiUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) redirect('/login');

  const { user } = await response.json();
  if (user.role !== 'admin') redirect('/');

  return (
    <div>
      <AdminNav />
      <main className="p-4">{children}</main>
    </div>
  );
}
