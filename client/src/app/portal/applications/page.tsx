import Link from "next/link";
import { BriefcaseBusiness, CalendarDays, ExternalLink, FileSearch, Video } from "lucide-react";

import { ApiError, apiFetch } from "@/lib/api";
import { EmptyState } from "@/components/empty-state";
import { FilterPills } from "@/components/filter-pills";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime, formatLabel } from "@/lib/format";

type ApplicationStage =
  "applied" | "screening" | "interview" | "final_interview" | "offer" | "hired" | "rejected";

type UpcomingInterview = {
  _id: string;
  scheduledAt: string;
  meetingLink: string;
  notes: string | null;
};

type Application = {
  _id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  stage: ApplicationStage;
  status: "active" | "withdrawn";
  createdAt: string;
  upcomingInterview: UpcomingInterview | null;
};

type ApplicationsResponse = {
  applications: Application[];
};

const stages: ApplicationStage[] = [
  "applied",
  "screening",
  "interview",
  "final_interview",
  "offer",
  "hired",
  "rejected",
];

async function loadApplications(): Promise<ApplicationsResponse | null> {
  try {
    return (await apiFetch("/api/applicants/applications")) as ApplicationsResponse;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage } = await searchParams;
  const data = await loadApplications();

  if (data === null) {
    return (
      <EmptyState
        icon={FileSearch}
        title="Complete your profile first"
        description="You need an applicant profile before you can apply for jobs."
        className="max-w-2xl"
        action={
          <Link href="/portal/profile" className={buttonVariants()}>
            Create profile
          </Link>
        }
      />
    );
  }

  if (data.applications.length === 0) {
    return (
      <EmptyState
        icon={BriefcaseBusiness}
        title="No applications yet"
        description="Jobs you apply for will appear here, together with interview updates."
        className="max-w-2xl"
        action={
          <Link href="/jobs" className={buttonVariants()}>
            Browse jobs
          </Link>
        }
      />
    );
  }

  const activeStage = stages.includes(stage as ApplicationStage)
    ? (stage as ApplicationStage)
    : undefined;
  const applications = activeStage
    ? data.applications.filter((application) => application.stage === activeStage)
    : data.applications;

  return (
    <div className="space-y-7">
      <PageHeader
        title="My applications"
        description={`${data.applications.length} ${data.applications.length === 1 ? "application" : "applications"} · Track progress and upcoming interviews.`}
      />

      <FilterPills
        label="Application stage"
        items={[
          {
            href: "/portal/applications",
            label: "All",
            active: !activeStage,
          },
          ...stages.map((item) => ({
            href: `/portal/applications?stage=${item}`,
            label: formatLabel(item),
            active: activeStage === item,
          })),
        ]}
      />

      {applications.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="No applications in this stage"
          description="Choose another stage to see the rest of your applications."
          action={
            <Link href="/portal/applications" className={buttonVariants({ variant: "outline" })}>
              View all applications
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => (
            <Card key={application._id} className="shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{application.jobTitle}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <BriefcaseBusiness className="size-4" />
                      {application.companyName}
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        application.stage === "rejected"
                          ? "destructive"
                          : application.stage === "offer" || application.stage === "hired"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {formatLabel(application.stage)}
                    </Badge>

                    {application.status === "withdrawn" && (
                      <Badge variant="destructive">Withdrawn</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" />
                  Applied on {formatDate(application.createdAt)}
                </p>

                {application.upcomingInterview && (
                  <div className="space-y-3 rounded-lg border border-primary/15 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 font-medium">
                      <Video className="size-4" />
                      Upcoming interview
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(application.upcomingInterview.scheduledAt, {
                        timeZone: "UTC",
                      })}
                    </p>

                    {application.upcomingInterview.notes && (
                      <p className="text-sm">{application.upcomingInterview.notes}</p>
                    )}

                    <a
                      href={application.upcomingInterview.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Join meeting
                      <ExternalLink className="size-4" />
                    </a>
                  </div>
                )}

                <Link
                  href={`/jobs/${application.jobId}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  View job
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
