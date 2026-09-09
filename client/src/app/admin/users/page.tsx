import { apiFetch } from '@/lib/api';
import { activateUser, suspendUser } from './actions';

type User = {
  _id: string;
  email: string;
  role: 'recruiter' | 'applicant' | 'admin';
  status: 'unverified' | 'active' | 'suspended';
  createdAt: string;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; role?: string }>;
}) {
  const { status, role } = await searchParams;
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (role) query.set('role', role);
  const qs = query.toString();
  const data = await apiFetch(`/api/admin/users${qs ? `?${qs}` : ''}`);
  const users: User[] = data.users ?? [];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Users</h1>
      <div className="flex gap-4 mb-4">
        <a href="/admin/users">All</a>
        <a href="/admin/users?status=unverified">Unverified</a>
        <a href="/admin/users?status=active">Active</a>
        <a href="/admin/users?status=suspended">Suspended</a>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Status</th>
            <th className="p-2">Created</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.status}</td>
              <td className="p-2">{new Date(u.createdAt).toLocaleDateString()}</td>
              <td className="p-2">
                <div className="flex gap-2">
                  <form action={suspendUser}>
                    <input type="hidden" name="id" value={u._id} />
                    <button type="submit" disabled={u.status === 'suspended'} className="border px-2 py-1 rounded disabled:opacity-40">
                      Suspend
                    </button>
                  </form>
                  <form action={activateUser}>
                    <input type="hidden" name="id" value={u._id} />
                    <button type="submit" disabled={u.status !== 'suspended'} className="border px-2 py-1 rounded disabled:opacity-40">
                      Activate
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
