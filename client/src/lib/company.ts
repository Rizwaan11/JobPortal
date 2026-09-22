import "server-only";

import { apiFetch } from "@/lib/api";
import type { CompanyRole } from "@/types/company-members";

type CompanyContext = {
  companyRole: CompanyRole;
};

export async function getCompanyContext(): Promise<CompanyContext> {
  return (await apiFetch("/api/companies/me")) as CompanyContext;
}

export function canManageJobs(role: CompanyRole) {
  return role === "owner" || role === "hr_manager" || role === "recruiter";
}
