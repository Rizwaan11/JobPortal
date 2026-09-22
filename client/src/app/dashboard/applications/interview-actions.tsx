"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchProtected } from "@/lib/fetch-protected";
import type {
  ApplicationStage,
  RecruiterApplication,
} from "@/types/recruiter-applications";

type FeedbackOutcome = "moved_forward" | "rejected";

type Props = {
  applicationId: string;
  stage: ApplicationStage;
  status: "active" | "withdrawn";
  interview: RecruiterApplication["latestInterview"];
  canSchedule: boolean;
};

const interviewStages: ApplicationStage[] = [
  "applied",
  "screening",
  "interview",
  "final_interview",
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function responseError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null);
  return body?.error?.message ?? fallback;
}

export function InterviewActions({
  applicationId,
  stage,
  status,
  interview,
  canSchedule,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] =
    useState<FeedbackOutcome>("moved_forward");

  async function scheduleInterview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const scheduledAt = String(form.get("scheduledAt") ?? "");
    const meetingLink = String(form.get("meetingLink") ?? "");
    const notes = String(form.get("notes") ?? "").trim();

    try {
      const response = await fetchProtected(
        `/api/applications/${applicationId}/interview`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scheduledAt: new Date(scheduledAt).toISOString(),
            meetingLink,
            notes: notes || undefined,
          }),
        },
      );

      if (!response.ok) {
        setError(
          await responseError(response, "Could not schedule the interview"),
        );
        return;
      }

      router.refresh();
    } catch {
      setError("Could not connect to the server");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!interview) return;

    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const feedback = String(form.get("feedback") ?? "").trim();

    try {
      const response = await fetchProtected(
        `/api/applications/interviews/${interview._id}/feedback`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback, outcome }),
        },
      );

      if (!response.ok) {
        setError(
          await responseError(response, "Could not save interview feedback"),
        );
        return;
      }

      router.refresh();
    } catch {
      setError("Could not connect to the server");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "withdrawn") return null;

  if (interview?.outcome === "pending") {
    return (
      <div className="space-y-4 rounded-md border p-3">
        <div className="space-y-1">
          <p className="font-medium">Scheduled interview</p>
          <p className="text-sm text-muted-foreground">
            {formatDateTime(interview.scheduledAt)}
          </p>
          <a
            href={interview.meetingLink}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium underline"
          >
            Open meeting link
          </a>
          {interview.notes && (
            <p className="text-sm">Notes: {interview.notes}</p>
          )}
        </div>

        <form onSubmit={submitFeedback} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor={`feedback-${interview._id}`}>Feedback</Label>
            <textarea
              id={`feedback-${interview._id}`}
              name="feedback"
              required
              className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="How did the interview go?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`outcome-${interview._id}`}>Decision</Label>
            <select
              id={`outcome-${interview._id}`}
              value={outcome}
              onChange={(event) =>
                setOutcome(event.target.value as FeedbackOutcome)
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="moved_forward">Move forward</option>
              <option value="rejected">Reject</option>
            </select>
          </div>

          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Saving…" : "Save feedback"}
          </Button>
        </form>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (!canSchedule || !interviewStages.includes(stage)) return null;

  return (
    <details className="rounded-md border p-3">
      <summary className="cursor-pointer text-sm font-medium">
        Schedule interview
      </summary>

      <form onSubmit={scheduleInterview} className="mt-4 space-y-3">
        <div className="space-y-2">
          <Label htmlFor={`scheduledAt-${applicationId}`}>Date and time</Label>
          <Input
            id={`scheduledAt-${applicationId}`}
            name="scheduledAt"
            type="datetime-local"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`meetingLink-${applicationId}`}>Meeting link</Label>
          <Input
            id={`meetingLink-${applicationId}`}
            name="meetingLink"
            type="url"
            placeholder="https://meet.google.com/..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`notes-${applicationId}`}>Notes</Label>
          <textarea
            id={`notes-${applicationId}`}
            name="notes"
            className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Optional information for the applicant"
          />
        </div>

        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Scheduling…" : "Schedule interview"}
        </Button>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </form>
    </details>
  );
}
