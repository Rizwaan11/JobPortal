import { apiFetch } from '@/lib/api';
import { closeJob } from './actions';

type Job = {
  _id: string;
  title: string;
  status: 'draft' | 'open' | 'closed';
  createdAt: string;
  companyId: { _id: string; name: string } | null;
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const query = status ? `?status=${status}` : '';
  const data = await apiFetch(`/api/admin/jobs${query}`);
  const jobs: Job[] = data.jobs ?? [];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Jobs</h1>
      <div className="flex gap-4 mb-4">
        <a href="/admin/jobs">All</a>
        <a href="/admin/jobs?status=draft">Draft</a>
        <a href="/admin/jobs?status=open">Open</a>
        <a href="/admin/jobs?status=closed">Closed</a>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Title</th>
            <th className="p-2">Company</th>
            <th className="p-2">Status</th>
            <th className="p-2">Created</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j._id} className="border-b">
              <td className="p-2">{j.title}</td>
              <td className="p-2">{j.companyId?.name ?? '—'}</td>
              <td className="p-2">{j.status}</td>
              <td className="p-2">{new Date(j.createdAt).toLocaleDateString()}</td>
              <td className="p-2">
                <form action={closeJob}>
                  <input type="hidden" name="id" value={j._id} />
                  <button type="submit" disabled={j.status === 'closed'} className="border px-2 py-1 rounded disabled:opacity-40">
                    Close
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
