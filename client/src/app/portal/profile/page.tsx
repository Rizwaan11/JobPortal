import { ApiError, apiFetch } from "@/lib/api";
import type { ApplicantProfile } from "@/types/applicant";

import ProfileForm from "./profile-form";
import ResumeUpload from "./resume-upload";

async function loadProfile(): Promise<ApplicantProfile | null> {
  try {
    return (await apiFetch("/api/applicants/profile")) as ApplicantProfile;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export default async function ProfilePage() {
  const profile = await loadProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep the information recruiters receive with your applications up to
          date.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <ProfileForm existing={profile} />
        {profile && <ResumeUpload resume={profile.resume} />}
      </div>
    </div>
  );
}
