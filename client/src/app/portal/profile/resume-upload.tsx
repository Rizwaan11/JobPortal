'use client';

import { useState } from 'react';

export default function ResumeUpload() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const { uploadUrl, key } = await fetch('/api/applicants/profile/resume-upload', { method: 'POST' }).then((r) => r.json());

      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': 'application/pdf' } });

      await fetch('/api/applicants/profile/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, filename: file.name }),
      });

      setMessage('Résumé uploaded successfully');
    } catch {
      setMessage('Upload failed — please try again');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-4">
      <label className="block mb-1">Résumé (PDF)</label>
      <input type="file" accept="application/pdf" onChange={handleUpload} disabled={uploading} />
      {message && <p>{message}</p>}
    </div>
  );
}
