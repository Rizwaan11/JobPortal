'use client';

import { useRouter } from 'next/navigation';

export default function RemoveButton({ jobId }: { jobId: string }) {
  const router = useRouter();

  async function handleRemove() {
    await fetch(`/api/applicants/shortlist/${jobId}`, { method: 'DELETE' });
    router.refresh();
  }

  return <button onClick={handleRemove} className="border px-2 py-1 rounded">Remove</button>;
}
