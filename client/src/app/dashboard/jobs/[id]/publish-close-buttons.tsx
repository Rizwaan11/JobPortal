// src/app/dashboard/jobs/[id]/publish-close-buttons.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PublishCloseButtons({ jobId, status }: { jobId: string; status: string }) {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handlePublish() {
    setError('');
    const res = await fetch(`/api/jobs/${jobId}/publish`, { method: 'POST' });
    if (!res.ok) {
      setError('Failed to publish job');
      return;
    }
    router.refresh();
  }

  async function handleClose() {
    setError('');
    const res = await fetch(`/api/jobs/${jobId}/close`, { method: 'POST' });
    if (!res.ok) {
      setError('Failed to close job');
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-2">
        {status !== 'open' && (
          <button onClick={handlePublish} className="bg-black text-white px-3 py-2 rounded">
            Publish
          </button>
        )}
        {status !== 'closed' && (
          <button onClick={handleClose} className="border px-3 py-2 rounded">
            Close
          </button>
        )}
      </div>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
