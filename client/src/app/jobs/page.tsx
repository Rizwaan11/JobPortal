import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, Search, SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { getPublicJobs } from "@/lib/public-jobs";

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    cursor?: string | string[];
  }>;
};

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

      <form
        action="/jobs"
        method="get"
        className="flex max-w-2xl flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm sm:flex-row"
      >
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
            <h2 className="text-lg font-semibold">{q ? `Results for “${q}”` : "Latest jobs"}</h2>
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
          <EmptyState
            icon={SearchX}
            title="No jobs found"
            description={
              q
                ? "Try a broader keyword or clear the search to see every open role."
                : "Check back soon for new positions."
            }
            action={
              q ? (
                <Link href="/jobs" className={buttonVariants({ variant: "outline" })}>
                  Clear search
                </Link>
              ) : undefined
            }
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => {
              const deadline = formatDate(job.deadline, null);

              return (
                <li key={job._id}>
                  <Card className="h-full transition-shadow hover:shadow-md">
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
                          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Building2 className="size-4" aria-hidden="true" />
                            {job.companyId?.name ?? "Company"}
                          </p>
                        </div>
                        <Badge variant="outline">Open</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {job.description}
                      </p>
                    </CardContent>
                    <CardFooter className="justify-between gap-3 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <CalendarDays className="size-4" aria-hidden="true" />
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
            <Link href={firstPageHref} className={buttonVariants({ variant: "ghost" })}>
              First page
            </Link>
            <Link
              href={`/jobs?${nextPageParams.toString()}`}
              className={buttonVariants({ variant: "outline" })}
            >
              Next page <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
