'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Existing = {
  fullName: string;
  headline?: string;
  location?: string;
  attributes: { skills: string[]; portfolioLinks: string[]; yearsOfExperience?: number };
} | null;

export default function ProfileForm({ existing }: { existing: Existing }) {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const headline = formData.get('headline') as string;
    const location = formData.get('location') as string;
    const skills = (formData.get('skills') as string).split(',').map((s) => s.trim()).filter(Boolean);

    const body = existing
      ? { fullName, headline, location, attributes: { skills } }
      : { fullName, headline, location, attributes: { skills, portfolioLinks: [] } };

    const res = await fetch('/api/applicants/profile', {
      method: existing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      setError('Failed to save profile');
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
      <input name="fullName" placeholder="Full name" defaultValue={existing?.fullName} className="border p-2 rounded" />
      <input name="headline" placeholder="Headline" defaultValue={existing?.headline} className="border p-2 rounded" />
      <input name="location" placeholder="Location" defaultValue={existing?.location} className="border p-2 rounded" />
      <input name="skills" placeholder="Skills (comma separated)" defaultValue={existing?.attributes.skills.join(', ')} className="border p-2 rounded" />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" className="bg-black text-white p-2 rounded">{existing ? 'Save changes' : 'Create profile'}</button>
    </form>
  );
}
