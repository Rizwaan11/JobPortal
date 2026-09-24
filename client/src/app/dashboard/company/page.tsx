import Link from "next/link";
import { Building2, ExternalLink, Globe2 } from "lucide-react";

import { ApiError, apiFetch } from "@/lib/api";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import CompanyForm from "./company-form";

type Company = {
  _id: string;
  name: string;
  slug: string;
  website?: string;
  verified: boolean;
  suspended: boolean;
  createdAt: string;
};

async function loadCompany(): Promise<Company | null> {
  try {
    return (await apiFetch("/api/companies/me")) as Company;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export default async function CompanyPage() {
  const company = await loadCompany();

  if (company === null) {
    return (
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Create your company workspace</CardTitle>
          <CardDescription>
            Your company workspace is required before you can create jobs and manage applicants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyForm />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Company"
        description="View your hiring workspace and verification status."
      />

      <Card className="max-w-3xl shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                {company.name}
              </CardTitle>
              <CardDescription className="mt-1">Workspace: {company.slug}</CardDescription>
            </div>

            {company.suspended ? (
              <Badge variant="destructive">Suspended</Badge>
            ) : company.verified ? (
              <Badge>Verified</Badge>
            ) : (
              <Badge variant="secondary">Pending verification</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {company.website ? (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Globe2 className="size-4" />
              {company.website}
              <ExternalLink className="size-3" />
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No company website was provided.</p>
          )}

          {!company.verified && !company.suspended && (
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="font-medium">Verification pending</p>
              <p className="mt-1 text-sm text-muted-foreground">
                An administrator must verify your company.
              </p>
            </div>
          )}

          {company.suspended && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="font-medium text-destructive">Company suspended</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This company has been suspended by an administrator.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row">
            <Link href="/dashboard/jobs" className={buttonVariants()}>
              Manage jobs
            </Link>
            <Link href="/dashboard/members" className={buttonVariants({ variant: "outline" })}>
              View members
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
