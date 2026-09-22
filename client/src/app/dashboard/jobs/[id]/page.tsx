import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { canManageJobs, getCompanyContext } from "@/lib/company";
import type { RecruiterJob } from "@/types/jobs";

import PublishCloseButtons from "./publish-close-buttons";

type Props = {
  params: Promise<{ id: string }>;
};

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function JobsPage({ params }: Props) {
  const { id } = await params;
  const [job, company] = await Promise.all([
    apiFetch(`/api/jobs/${id}`) as Promise<RecruiterJob>,
    getCompanyContext(),
  ]);
  const canManage = canManageJobs(company.companyRole);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant={job.status === "open" ? "default" : "secondary"}>
            {job.status}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">{job.title}</h1>
        </div>

        {canManage && (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/jobs/${id}/edit`}
              className={buttonVariants({ variant: "outline" })}
            >
              Edit
            </Link>
            <PublishCloseButtons jobId={id} status={job.status} />
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {job.description}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium">Location</dt>
              <dd className="text-sm text-muted-foreground">
                {job.attributes.location ?? "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium">Employment type</dt>
              <dd className="text-sm text-muted-foreground">
                {job.attributes.employmentType
                  ? formatLabel(job.attributes.employmentType)
                  : "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium">Workplace type</dt>
              <dd className="text-sm text-muted-foreground">
                {job.attributes.workplaceType
                  ? formatLabel(job.attributes.workplaceType)
                  : "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium">Experience level</dt>
              <dd className="text-sm text-muted-foreground">
                {job.attributes.experienceLevel
                  ? formatLabel(job.attributes.experienceLevel)
                  : "Not specified"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Screening questions</CardTitle>
        </CardHeader>
        <CardContent>
          {job.screeningQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This job has no screening questions.
            </p>
          ) : (
            <ol className="space-y-3">
              {job.screeningQuestions.map((question) => (
                <li key={question.id} className="rounded-md border p-3">
                  <p className="font-medium">{question.question}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatLabel(question.answerType)}
                    {question.required ? " · Required" : " · Optional"}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default JobsPage;
