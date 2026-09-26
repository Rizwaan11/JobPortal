import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { getCompanyContext } from "@/lib/company";
import { canManageJobs } from "@/lib/company-permissions";
import type { RecruiterJob } from "@/types/jobs";

import { JobForm } from "../../job-form";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [company, job] = await Promise.all([
    getCompanyContext(),
    apiFetch(`/api/jobs/${id}`) as Promise<RecruiterJob>,
  ]);

  if (!canManageJobs(company.companyRole)) {
    return (
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Job editing is unavailable</CardTitle>
          <CardDescription>Hiring managers can view jobs but cannot edit them.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <JobForm job={job} />;
}
