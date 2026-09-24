import { CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const completedFields = profile
    ? [
        profile.fullName,
        profile.headline,
        profile.location,
        profile.attributes.skills.length > 0,
        profile.attributes.portfolioLinks.length > 0,
        profile.resume,
      ].filter(Boolean).length
    : 0;
  const completeness = Math.round((completedFields / 6) * 100);

  return (
    <div className="space-y-7">
      <PageHeader
        title="My profile"
        description="Keep the information recruiters receive with your applications up to date."
      />

      <div
        className={
          profile ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start" : "max-w-3xl"
        }
      >
        <ProfileForm existing={profile} />
        {profile && (
          <aside className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
                  Profile completeness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {completeness}% complete. Add details that help recruiters understand your
                  experience.
                </p>
              </CardContent>
            </Card>
            <ResumeUpload resume={profile.resume} />
          </aside>
        )}
      </div>
    </div>
  );
}
