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
      const uploadDetailsResponse = await fetch('/api/applicants/profile/resume-upload', { method: 'POST' });
      if (!uploadDetailsResponse.ok) throw new Error('Could not prepare upload');

      const { uploadUrl, key, timestamp, signature, apiKey, type, allowedFormats } = await uploadDetailsResponse.json();

      const uploadBody = new FormData();
      uploadBody.append('file', file);
      uploadBody.append('public_id', key);
      uploadBody.append('timestamp', String(timestamp));
      uploadBody.append('signature', signature);
      uploadBody.append('api_key', apiKey);
      uploadBody.append('type', type);
      uploadBody.append('allowed_formats', allowedFormats);

      const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: uploadBody });
      if (!uploadResponse.ok) throw new Error('Cloud upload failed');

      const confirmResponse = await fetch('/api/applicants/profile/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, filename: file.name }),
      });
      if (!confirmResponse.ok) throw new Error('Could not save résumé');

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
