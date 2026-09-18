'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProtected } from '@/lib/fetch-protected';

export default function RemoveButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleRemove() {
    setError('');
    const response = await fetchProtected(`/api/applicants/shortlist/${jobId}`, { method: 'DELETE' });
    if (!response.ok) {
      setError('Could not remove job. Please try again.');
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button onClick={handleRemove} className="border px-2 py-1 rounded">Remove</button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
