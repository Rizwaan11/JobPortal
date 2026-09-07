import { apiFetch } from '@/lib/api';
import RemoveButton from './remove-button';

export default async function ShortlistPage() {
  const items = await apiFetch('/api/applicants/shortlist');

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">My Shortlist</h1>
      <ul className="flex flex-col gap-2">
        {items.map((item: any) => (
          <li key={item._id} className="border p-3 rounded flex justify-between items-center">
            <span>{item.jobId?.title} — {item.jobId?.companyId?.name} ({item.jobId?.status})</span>
            <RemoveButton jobId={item.jobId?._id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
