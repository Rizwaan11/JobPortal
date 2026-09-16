import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPublicJobs } from "@/lib/public-jobs";

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    cursor?: string | string[];
  }>;
};

function formatDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function JobsPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const cursor = typeof params.cursor === "string" ? params.cursor : undefined;
  const { jobs, nextCursor } = await getPublicJobs({ q, cursor });

  const nextPageParams = new URLSearchParams();
  if (q) nextPageParams.set("q", q);
  if (nextCursor) nextPageParams.set("cursor", nextCursor);
  const firstPageHref = q ? `/jobs?${new URLSearchParams({ q }).toString()}` : "/jobs";

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">Find your next role</Badge>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Open positions
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Browse opportunities from verified companies and find a role that fits.
        </p>
      </div>

      <form action="/jobs" method="get" className="flex max-w-2xl flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            name="q"
            aria-label="Search jobs"
            placeholder="Search job titles or keywords"
            defaultValue={q}
            className="h-10 pl-9"
          />
        </div>
        <Button type="submit" size="lg" className="h-10 px-5">
          Search jobs
        </Button>
      </form>

      <section aria-label="Job results" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {q ? `Results for “${q}”` : "Latest jobs"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {jobs.length} {jobs.length === 1 ? "position" : "positions"} on this page
            </p>
          </div>
          {q && (
            <Link href="/jobs" className="text-sm font-medium underline underline-offset-4">
              Clear search
            </Link>
          )}
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <h3 className="font-medium">No jobs found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {q ? "Try a different keyword." : "Check back soon for new positions."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => {
              const deadline = formatDate(job.deadline);

              return (
                <li key={job._id}>
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <CardTitle>
                            <h3>
                              <Link href={`/jobs/${job._id}`} className="hover:underline">
                                {job.title}
                              </Link>
                            </h3>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {job.companyId?.name ?? "Company"}
                          </p>
                        </div>
                        <Badge variant="outline">Open</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {job.description}
                      </p>
                    </CardContent>
                    <CardFooter className="justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">
                        {deadline ? `Deadline: ${deadline}` : "No deadline listed"}
                      </span>
                      <Link
                        href={`/jobs/${job._id}`}
                        className="inline-flex shrink-0 items-center gap-1 font-medium hover:underline"
                      >
                        View job <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </CardFooter>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        {nextCursor && (
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href={firstPageHref}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              First page
            </Link>
            <Link
              href={`/jobs?${nextPageParams.toString()}`}
              className="inline-flex h-9 items-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
            >
              Next page <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
