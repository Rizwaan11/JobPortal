import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanyContext } from "@/lib/company";
import { canManageJobs } from "@/lib/company-permissions";

import { JobForm } from "../job-form";

export default async function NewJobPage() {
  const company = await getCompanyContext();

  if (!canManageJobs(company.companyRole)) {
    return (
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Job editing is unavailable</CardTitle>
          <CardDescription>
            Hiring managers can review candidates but cannot create or edit jobs.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <JobForm />;
}
