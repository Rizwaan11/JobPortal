import { cookies } from 'next/headers';
import ProfileForm from './profile-form';
import ResumeUpload from './resume-upload';

async function fetchProfile() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const res = await fetch(`${process.env.API_URL}/api/applicants/profile`, {
    headers: { Authorization: accessToken ? `Bearer ${accessToken}` : '' },
    cache: 'no-store',
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export default async function ProfilePage() {
  const profile = await fetchProfile();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">My Profile</h1>
      <ProfileForm existing={profile} />
      {profile && <ResumeUpload />}
    </div>
  );
}
