"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ActionMessage } from "@/components/action-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchProtected } from "@/lib/fetch-protected";
import type { ScreeningQuestion } from "@/types/jobs";

type Props = {
  jobId: string;
  screeningQuestions: ScreeningQuestion[];
};

type Action = "apply" | "shortlist";

export default function ApplyShortlistButtons({ jobId, screeningQuestions }: Props) {
  const [busy, setBusy] = useState<Action | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [needsLogin, setNeedsLogin] = useState(false);

  async function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("apply");
    setMessage("");
    setNeedsLogin(false);

    const form = new FormData(event.currentTarget);
    const answers = screeningQuestions
      .map((question) => {
        const value = form.get(question.id);

        if (value === null || String(value).trim() === "") {
          return null;
        }

        let answer: string | number | boolean = String(value).trim();

        if (question.answerType === "number") {
          answer = Number(value);
        }

        if (question.answerType === "yes_no") {
          answer = value === "true";
        }

        return {
          questionId: question.id,
          answer,
        };
      })
      .filter(
        (
          answer,
        ): answer is {
          questionId: string;
          answer: string | number | boolean;
        } => answer !== null,
      );

    try {
      const response = await fetchProtected("/api/applicants/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobIds: [jobId],
          answers: {
            [jobId]: answers,
          },
        }),
      });
      const body = await response.json().catch(() => null);

      if (response.status === 401) {
        setMessageType("error");
        setNeedsLogin(true);
        setMessage("Sign in as an applicant to continue.");
      } else if (!response.ok) {
        setMessageType("error");
        setMessage(body?.error?.message ?? "Could not submit the application.");
      } else if (body?.skipped?.includes(jobId)) {
        setMessageType("error");
        setMessage("You have already applied to this job.");
      } else {
        setMessageType("success");
        setMessage("Application submitted.");
      }
    } catch {
      setMessageType("error");
      setMessage("Could not connect to the server.");
    } finally {
      setBusy(null);
    }
  }

  async function saveToShortlist() {
    setBusy("shortlist");
    setMessage("");
    setNeedsLogin(false);

    try {
      const response = await fetchProtected("/api/applicants/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const body = await response.json().catch(() => null);

      if (response.status === 401) {
        setMessageType("error");
        setNeedsLogin(true);
        setMessage("Sign in as an applicant to continue.");
      } else if (!response.ok) {
        setMessageType("error");
        setMessage(body?.error?.message ?? "Could not save this job.");
      } else {
        setMessageType("success");
        setMessage("Job saved to your shortlist.");
      }
    } catch {
      setMessageType("error");
      setMessage("Could not connect to the server.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={apply} className="space-y-4">
        {screeningQuestions.map((question, index) => (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id}>
              {index + 1}. {question.question}
              {question.required ? " *" : ""}
            </Label>

            {question.answerType === "text" ? (
              <textarea
                id={question.id}
                name={question.id}
                required={question.required}
                className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            ) : question.answerType === "number" ? (
              <Input
                id={question.id}
                name={question.id}
                type="number"
                required={question.required}
              />
            ) : (
              <select
                id={question.id}
                name={question.id}
                required={question.required}
                defaultValue=""
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select an answer</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            )}
          </div>
        ))}

        <Button type="submit" size="lg" className="w-full" disabled={busy !== null}>
          {busy === "apply" ? "Applying…" : "Apply"}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={busy !== null}
        onClick={() => void saveToShortlist()}
      >
        {busy === "shortlist" ? "Saving…" : "Save job"}
      </Button>

      {message && (
        <ActionMessage type={messageType}>
          {message}{" "}
          {needsLogin && (
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>
          )}
        </ActionMessage>
      )}
    </div>
  );
}
