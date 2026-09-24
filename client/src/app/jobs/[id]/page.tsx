import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatLabel } from "@/lib/format";
import { getPublicJob } from "@/lib/public-jobs";
import ApplyShortlistButtons from "./apply-shortlist-buttons";

type Props = { params: Promise<{ id: string }> };

function displayValue(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    const items = value.filter(
      (item): item is string | number => typeof item === "string" || typeof item === "number",
    );
    return items.length ? items.join(", ") : null;
  }
  return null;
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const job = await getPublicJob(id);
  if (!job) notFound();

  const details = Object.entries(job.attributes ?? {})
    .map(([label, value]) => {
      const displayedValue = displayValue(value);
      const formattedValue =
        displayedValue && ["employmentType", "workplaceType", "experienceLevel"].includes(label)
          ? formatLabel(displayedValue)
          : displayedValue;

      return { label, value: formattedValue };
    })
    .filter((item): item is { label: string; value: string } => item.value !== null);
  const deadline = formatDate(job.deadline, null);

  return (
    <div className="space-y-7">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to jobs
      </Link>

      <div className="space-y-4 border-b pb-7">
        <Badge variant="secondary">Open position</Badge>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{job.title}</h1>
        <p className="flex items-center gap-2 text-base text-muted-foreground">
          <Building2 className="size-4" aria-hidden="true" /> {job.companyName}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>About this role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-[0.95rem] leading-7 text-muted-foreground">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {details.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Job details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {details.map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-muted/60 p-3">
                      <dt className="text-xs font-medium text-muted-foreground">
                        {formatLabel(label)}
                      </dt>
                      <dd className="mt-1 text-sm font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="shadow-sm lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Interested?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" aria-hidden="true" />
              {deadline ? `Deadline: ${deadline}` : "No deadline listed"}
            </div>
            <ApplyShortlistButtons jobId={id} screeningQuestions={job.screeningQuestions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
