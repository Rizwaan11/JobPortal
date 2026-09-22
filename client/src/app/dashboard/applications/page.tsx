import { apiFetch } from "@/lib/api";
import {
  applicationStages,
  type ApplicationPipeline,
} from "@/types/recruiter-applications";

import { ApplicationCard } from "./application-card";

function formatStage(stage: string) {
  return stage.replaceAll("_", " ");
}

export default async function ApplicationsPage() {
  const data = (await apiFetch("/api/companies/applications")) as {
    pipeline: ApplicationPipeline;
  };

  const totalApplications = applicationStages.reduce(
    (total, stage) => total + data.pipeline[stage].length,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hiring pipeline
        </h1>
        <p className="text-sm text-muted-foreground">
          {totalApplications} applications
        </p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-4">
          {applicationStages.map((stage) => {
            const applications = data.pipeline[stage];

            return (
              <section
                key={stage}
                className="w-80 space-y-3 rounded-lg bg-muted/40 p-3"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-medium capitalize">
                    {formatStage(stage)}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {applications.length}
                  </span>
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
