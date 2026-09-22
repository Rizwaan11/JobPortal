"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchProtected } from "@/lib/fetch-protected";
import type {
  AnswerType,
  EmploymentType,
  ExperienceLevel,
  JobAttributes,
  RecruiterJob,
  ScreeningQuestion,
  WorkplaceType,
} from "@/types/jobs";

type Props = {
  job?: RecruiterJob;
};

export function JobForm({ job }: Props) {
  const router = useRouter();
  const [questions, setQuestions] = useState<ScreeningQuestion[]>(
    job?.screeningQuestions ?? [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const editing = Boolean(job);

  function addQuestion() {
    setQuestions((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        question: "",
        answerType: "text",
        required: false,
      },
    ]);
  }

  function updateQuestion(
    id: string,
    changes: Partial<ScreeningQuestion>,
  ) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id ? { ...question, ...changes } : question,
      ),
    );
  }

  function removeQuestion(id: string) {
    setQuestions((current) =>
      current.filter((question) => question.id !== id),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const location = String(form.get("location") ?? "").trim();
    const employmentType = String(form.get("employmentType") ?? "");
    const workplaceType = String(form.get("workplaceType") ?? "");
    const experienceLevel = String(form.get("experienceLevel") ?? "");
    const deadline = String(form.get("deadline") ?? "");

    const attributes: JobAttributes = {};
    if (location) attributes.location = location;
    if (employmentType) {
      attributes.employmentType = employmentType as EmploymentType;
    }
    if (workplaceType) {
      attributes.workplaceType = workplaceType as WorkplaceType;
    }
    if (experienceLevel) {
      attributes.experienceLevel = experienceLevel as ExperienceLevel;
    }

    const body = {
      title: String(form.get("title") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      deadline: deadline || undefined,
      attributes,
      screeningQuestions: questions,
    };

    try {
      const response = await fetchProtected(
        editing ? `/api/jobs/${job?._id}` : "/api/jobs",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        setError(responseBody?.error?.message ?? "Could not save the job");
        return;
      }

      const jobId = job?._id ?? responseBody?._id;
      router.push(`/dashboard/jobs/${jobId}`);
      router.refresh();
    } catch {
      setError("Could not connect to the server");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {editing ? "Edit job" : "Create a job"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Save the role as a draft, then publish it when it is ready.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role</CardTitle>
          <CardDescription>
            Describe the position and when applications close.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={job?.title}
              placeholder="Frontend developer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={job?.description}
              className="min-h-48 w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Responsibilities, requirements and what the candidate will work on"
              required
            />
          </div>

          <div className="max-w-xs space-y-2">
            <Label htmlFor="deadline">Application deadline</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              defaultValue={job?.deadline?.slice(0, 10)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work details</CardTitle>
          <CardDescription>
            These details help applicants understand the role quickly.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={job?.attributes.location}
              placeholder="Lahore"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentType">Employment type</Label>
            <select
              id="employmentType"
              name="employmentType"
              defaultValue={job?.attributes.employmentType ?? ""}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Not specified</option>
              <option value="full_time">Full time</option>
              <option value="part_time">Part time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workplaceType">Workplace type</Label>
            <select
              id="workplaceType"
              name="workplaceType"
              defaultValue={job?.attributes.workplaceType ?? ""}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Not specified</option>
              <option value="onsite">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceLevel">Experience level</Label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              defaultValue={job?.attributes.experienceLevel ?? ""}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Not specified</option>
              <option value="entry">Entry</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Screening questions</CardTitle>
          <CardDescription>
            Add up to 10 questions applicants must answer when applying.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 && (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No screening questions. Applicants can apply immediately.
            </p>
          )}

          {questions.map((question, index) => (
            <div key={question.id} className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">Question {index + 1}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeQuestion(question.id)}
                >
                  Remove
                </Button>
              </div>

              <Input
                value={question.question}
                onChange={(event) =>
                  updateQuestion(question.id, { question: event.target.value })
                }
                placeholder="What would you like to ask?"
                required
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`answer-type-${question.id}`}>
                    Answer type
                  </Label>
                  <select
                    id={`answer-type-${question.id}`}
                    value={question.answerType}
                    onChange={(event) =>
                      updateQuestion(question.id, {
                        answerType: event.target.value as AnswerType,
                      })
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="yes_no">Yes or no</option>
                  </select>
                </div>

                <label className="flex items-end gap-2 pb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(event) =>
                      updateQuestion(question.id, {
                        required: event.target.checked,
                      })
                    }
                  />
                  Required question
                </label>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            disabled={questions.length >= 10}
            onClick={addQuestion}
          >
            Add question
          </Button>
        </CardContent>
      </Card>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving…"
            : editing
              ? "Save changes"
              : "Create draft"}
        </Button>
        <Link
          href={job ? `/dashboard/jobs/${job._id}` : "/dashboard/jobs"}
          className={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
