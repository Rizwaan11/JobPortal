import { apiFetch } from "@/lib/api";
import { getCompanyContext } from "@/lib/company";
import { formatLabel } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { applicationStages, type ApplicationPipeline } from "@/types/recruiter-applications";

import { ApplicationCard } from "./application-card";

export default async function ApplicationsPage() {
  const [data, company] = await Promise.all([
    apiFetch("/api/companies/applications") as Promise<{
      pipeline: ApplicationPipeline;
    }>,
    getCompanyContext(),
  ]);

  const totalApplications = applicationStages.reduce(
    (total, stage) => total + data.pipeline[stage].length,
    0,
  );

  return (
    <div className="space-y-7">
      <PageHeader
        title="Hiring pipeline"
        description={`${totalApplications} ${totalApplications === 1 ? "application" : "applications"} across every hiring stage.`}
      />

      <div className="scrollbar-none -mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div className="flex min-w-max gap-4">
          {applicationStages.map((stage) => {
            const applications = data.pipeline[stage];

            return (
              <section
                key={stage}
                className="w-72 space-y-3 rounded-xl border border-border/80 bg-muted/50 p-3 sm:w-80"
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <h2 className="font-medium capitalize">{formatLabel(stage)}</h2>
                  <span className="text-sm text-muted-foreground">{applications.length}</span>
                </div>

                {applications.length === 0 ? (
                  <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No applications
                  </p>
                ) : (
                  applications.map((application) => (
                    <ApplicationCard
                      key={application._id}
                      application={application}
                      companyRole={company.companyRole}
                    />
                  ))
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
