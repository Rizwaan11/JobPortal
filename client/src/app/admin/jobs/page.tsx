import { BriefcaseBusiness } from "lucide-react";

import { AdminActionButton } from "@/components/admin-action-button";
import { EmptyState } from "@/components/empty-state";
import { FilterPills } from "@/components/filter-pills";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { formatDate, formatLabel } from "@/lib/format";

import { closeJob } from "./actions";

type Job = {
  _id: string;
  title: string;
  status: "draft" | "open" | "closed";
  createdAt: string;
  companyId: { _id: string; name: string } | null;
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const query = status ? `?status=${status}` : "";
  const data = await apiFetch(`/api/admin/jobs${query}`);
  const jobs: Job[] = data.jobs ?? [];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Jobs"
        description="Review published roles and close listings that should no longer accept applications."
      />
      <FilterPills
        label="Job status"
        items={[
          { href: "/admin/jobs", label: "All", active: !status },
          ...["draft", "open", "closed"].map((item) => ({
            href: `/admin/jobs?status=${item}`,
            label: formatLabel(item),
            active: status === item,
          })),
        ]}
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No jobs found"
          description="No job listings match this status filter."
        />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead className="bg-muted/60 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{job.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {job.companyId?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={job.status === "open" ? "default" : "secondary"}>
                          {formatLabel(job.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <AdminActionButton
                            action={closeJob}
                            id={job._id}
                            label="Close job"
                            disabled={job.status === "closed"}
                            confirmation={{
                              title: "Close this job?",
                              description:
                                "Applicants will no longer be able to apply. Existing applications will remain available.",
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
