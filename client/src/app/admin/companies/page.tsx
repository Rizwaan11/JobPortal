import { apiFetch } from '@/lib/api';
import { suspendCompany, verifyCompany } from './actions';

type Company = {
  _id: string;
  name: string;
  verified: boolean;
  suspended: boolean;
  ownerEmail: string | null;
  createdAt: string;
};

function statusLabel(c: Company) {
  if (c.suspended) return 'suspended';
  if (c.verified) return 'verified';
  return 'pending';
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const query = status ? `?status=${status}` : '';
  const data = await apiFetch(`/api/admin/companies${query}`);
  const companies: Company[] = data.companies ?? [];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Companies</h1>
      <div className="flex gap-4 mb-4">
        <a href="/admin/companies">All</a>
        <a href="/admin/companies?status=pending">Pending</a>
        <a href="/admin/companies?status=verified">Verified</a>
        <a href="/admin/companies?status=suspended">Suspended</a>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Name</th>
            <th className="p-2">Status</th>
            <th className="p-2">Owner</th>
            <th className="p-2">Created</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c._id} className="border-b">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{statusLabel(c)}</td>
              <td className="p-2">{c.ownerEmail ?? '—'}</td>
              <td className="p-2">{new Date(c.createdAt).toLocaleDateString()}</td>
              <td className="p-2">
                <div className="flex gap-2">
                  <form action={verifyCompany}>
                    <input type="hidden" name="id" value={c._id} />
                    <button type="submit" disabled={c.verified} className="border px-2 py-1 rounded disabled:opacity-40">
                      Verify
                    </button>
                  </form>
                  <form action={suspendCompany}>
                    <input type="hidden" name="id" value={c._id} />
                    <button type="submit" disabled={c.suspended} className="border px-2 py-1 rounded disabled:opacity-40">
                      Suspend
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
