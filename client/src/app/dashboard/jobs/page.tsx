import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cursor?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.cursor) query.set('cursor', params.cursor);

  const data = await apiFetch(`/api/jobs?${query.toString()}`);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Jobs</h1>
        <Link href="/dashboard/jobs/new" className="bg-black text-white px-3 py-2 rounded">
          New job
        </Link>
      </div>

      <ul className="flex flex-col gap-2">
        {data.jobs?.map((job: any) => (
          <li key={job._id} className="border p-3 rounded">
            <Link href={`/dashboard/jobs/${job._id}`}>{job.title} — {job.status}</Link>
          </li>
        ))}
      </ul>

      {data.nextCursor && (
        <Link href={`/dashboard/jobs?cursor=${data.nextCursor}`} className="inline-block mt-4 underline">
          Next page
        </Link>
      )}
    </div>
  );
}