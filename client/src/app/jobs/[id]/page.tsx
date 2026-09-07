import { apiFetch } from '@/lib/api';
import ApplyShortlistButtons from './apply-shortlist-buttons';

type Props = { params: Promise<{ id: string }> };

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const job = await apiFetch(`/api/public/jobs/${id}`);

  return (
    <div>
      <h1 className="text-xl font-semibold">{job.title}</h1>
      <p>{job.companyName}</p>
      <p>{job.description}</p>
      <ApplyShortlistButtons jobId={id} />
    </div>
  );
}
