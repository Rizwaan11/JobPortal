import { Building2 } from "lucide-react";

import { AdminActionButton } from "@/components/admin-action-button";
import { EmptyState } from "@/components/empty-state";
import { FilterPills } from "@/components/filter-pills";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { formatDate, formatLabel } from "@/lib/format";

import { suspendCompany, verifyCompany } from "./actions";

type Company = {
  _id: string;
  name: string;
  verified: boolean;
  suspended: boolean;
  ownerEmail: string | null;
  createdAt: string;
};

function statusLabel(c: Company) {
  if (c.suspended) return "suspended";
  if (c.verified) return "verified";
  return "pending";
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const query = status ? `?status=${status}` : "";
  const data = await apiFetch(`/api/admin/companies${query}`);
  const companies: Company[] = data.companies ?? [];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Companies"
        description="Review company workspaces, verification and access status."
      />
      <FilterPills
        label="Company status"
        items={[
          { href: "/admin/companies", label: "All", active: !status },
          ...["pending", "verified", "suspended"].map((item) => ({
            href: `/admin/companies?status=${item}`,
            label: formatLabel(item),
            active: status === item,
          })),
        ]}
      />

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies found"
          description="No company workspaces match this status filter."
        />
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead className="bg-muted/60 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {companies.map((company) => {
                    const companyStatus = statusLabel(company);
                    return (
                      <tr key={company._id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{company.name}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              companyStatus === "suspended"
                                ? "destructive"
                                : companyStatus === "verified"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {formatLabel(companyStatus)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {company.ownerEmail ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(company.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <AdminActionButton
                              action={verifyCompany}
                              id={company._id}
                              label="Verify"
                              disabled={company.verified}
                            />
                            <AdminActionButton
                              action={suspendCompany}
                              id={company._id}
                              label="Suspend"
                              disabled={company.suspended}
                              confirmation={{
                                title: "Suspend company?",
                                description:
                                  "The company will lose access to active hiring features until its status changes.",
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
