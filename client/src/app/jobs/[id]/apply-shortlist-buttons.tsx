'use client';

import { useState } from 'react';

export default function ApplyShortlistButtons({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState('');

  async function handleApply() {
    setStatus('');
    const res = await fetch('/api/applicants/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobIds: [jobId] }),
    });
    const data = await res.json().catch(() => ({}));
    setStatus(res.ok ? 'Applied!' : data.error?.message ?? 'Failed to apply');
  }

  async function handleShortlist() {
    setStatus('');
    const res = await fetch('/api/applicants/shortlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    });
    const data = await res.json().catch(() => ({}));
    setStatus(res.ok ? 'Shortlisted!' : data.error?.message ?? 'Failed to shortlist');
  }

  return (
    <div className="flex gap-2 mt-2">
      <button onClick={handleApply} className="bg-black text-white px-3 py-2 rounded">Apply</button>
      <button onClick={handleShortlist} className="border px-3 py-2 rounded">Shortlist</button>
      {status && <p>{status}</p>}
    </div>
  );
}
