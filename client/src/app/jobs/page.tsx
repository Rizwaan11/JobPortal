import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default async function JobsPage() {
  const data = await apiFetch('/api/public/jobs');

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Open Positions</h1>
      <ul className="flex flex-col gap-2">
        {data.jobs?.map((job: any) => (
          <li key={job._id} className="border p-3 rounded">
            <Link href={`/jobs/${job._id}`}>{job.title} — {job.companyId?.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
