import type { CompanyRole } from "@/types/company-members";

export function canManageJobs(role: CompanyRole) {
  return role === "owner" || role === "hr_manager" || role === "recruiter";
}

export function canManageMembers(role: CompanyRole) {
  return role === "owner" || role === "hr_manager";
}
