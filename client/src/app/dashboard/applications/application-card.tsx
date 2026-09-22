"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchProtected } from "@/lib/fetch-protected";
import type { CompanyRole } from "@/types/company-members";
import type {
  ApplicationStage,
  RecruiterApplication,
} from "@/types/recruiter-applications";

import { InterviewActions } from "./interview-actions";

const nextStage: Partial<Record<ApplicationStage, ApplicationStage>> = {
  applied: "screening",
  screening: "interview",
  interview: "final_interview",
  final_interview: "offer",
  offer: "hired",
};

function formatStage(stage: ApplicationStage) {
  return stage.replaceAll("_", " ");
}

export function ApplicationCard({
  application,
  companyRole,
}: {
  application: RecruiterApplication;
  companyRole: CompanyRole;
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [openingResume, setOpeningResume] = useState(false);
  const [error, setError] = useState("");

  async function changeStage(stage: ApplicationStage) {
    setUpdating(true);
    setError("");

    try {
      const response = await fetchProtected(
        `/api/applications/${application._id}/stage`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage }),
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error?.message ?? "Could not update the application");
        return;
      }

      router.refresh();
    } catch {
      setError("Could not connect to the server");
    } finally {
      setUpdating(false);
    }
  }

  async function openResume() {
    setOpeningResume(true);
    setError("");
    const resumeWindow = window.open("about:blank", "_blank");

    try {
      const response = await fetchProtected(
        `/api/applications/${application._id}/resume`,
      );
      const body = await response.json().catch(() => null);

      if (!response.ok || !body?.url) {
        resumeWindow?.close();
        setError(body?.error?.message ?? "Could not open the resume");
        return;
      }

      if (!resumeWindow) {
        setError("Allow pop-ups to open the resume");
        return;
      }

      resumeWindow.opener = null;
      resumeWindow.location.href = body.url;
    } catch {
      resumeWindow?.close();
      setError("Could not connect to the server");
    } finally {
      setOpeningResume(false);
    }
  }

  const followingStage = nextStage[application.stage];
  const hasPendingInterview =
    application.latestInterview?.outcome === "pending";
  const canManagePipeline =
    companyRole === "owner" ||
    companyRole === "hr_manager" ||
    companyRole === "recruiter";

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            {application.applicant.fullName}
          </CardTitle>
          <Badge variant="secondary">{formatStage(application.stage)}</Badge>
        </div>

        <p className="text-sm text-muted-foreground">{application.jobTitle}</p>
        {application.applicant.headline && (
          <p className="text-sm">{application.applicant.headline}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <details>
          <summary className="cursor-pointer text-sm font-medium">
            View applicant details
          </summary>

          <div className="mt-3 space-y-3 text-sm">
            {application.applicant.location && (
              <p>Location: {application.applicant.location}</p>
            )}

            {application.applicant.yearsOfExperience !== null && (
              <p>
                Experience: {application.applicant.yearsOfExperience} years
              </p>
            )}

            {application.applicant.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {application.applicant.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            {application.answers.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">Screening answers</p>
                {application.answers.map((answer) => {
                  const question = application.screeningQuestions.find(
                    (item) => item.id === answer.questionId,
                  );

                  return (
                    <div
                      key={answer.questionId}
                      className="rounded-md border p-2"
                    >
                      <p className="text-muted-foreground">
                        {question?.question ?? answer.questionId}
                      </p>
                      <p>{String(answer.answer)}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {application.applicant.hasResume && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={openingResume}
                onClick={() => void openResume()}
              >
                {openingResume ? "Opening…" : "View resume"}
              </Button>
            )}
          </div>
        </details>

        <InterviewActions
          applicationId={application._id}
          stage={application.stage}
          status={application.status}
          interview={application.latestInterview}
          canSchedule={canManagePipeline}
        />

        {application.status === "withdrawn" ? (
          <Badge variant="destructive">Withdrawn</Badge>
        ) : canManagePipeline && !hasPendingInterview ? (
          <div className="flex flex-wrap gap-2">
            {followingStage && (
              <Button
                size="sm"
                disabled={updating}
                onClick={() => void changeStage(followingStage)}
              >
                Move to {formatStage(followingStage)}
              </Button>
            )}

            {application.stage !== "rejected" &&
              application.stage !== "hired" && (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={updating}
                  onClick={() => void changeStage("rejected")}
                >
                  Reject
                </Button>
              )}
          </div>
        ) : null}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
