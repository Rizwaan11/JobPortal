import type { CompanyRole } from "@/types/company-members";
import { canManageMembers } from "@/lib/company-permissions";
import { getRoleHome, type UserRole } from "@/lib/roles";

export type NavigationItem = {
  href: string;
  label: string;
};

export const publicNavigation: NavigationItem[] = [{ href: "/jobs", label: "Job board" }];

const applicantNavigation: NavigationItem[] = [
  { href: "/jobs", label: "Job board" },
  { href: "/portal/applications", label: "Applications" },
  { href: "/portal/shortlist", label: "Saved jobs" },
  { href: "/portal/profile", label: "Profile" },
];

const adminNavigation: NavigationItem[] = [
  { href: "/jobs", label: "Job board" },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/users", label: "Users" },
];

const companyRoleLabels: Record<CompanyRole, string> = {
  owner: "Company owner",
  hr_manager: "HR manager",
  recruiter: "Recruiter",
  hiring_manager: "Hiring manager",
};

export function getRecruiterNavigation(companyRole?: CompanyRole): NavigationItem[] {
  const items: NavigationItem[] = [
    { href: "/jobs", label: "Job board" },
    {
      href: "/dashboard/company",
      label: companyRole ? "Company" : "Company setup",
    },
  ];

  if (!companyRole) return items;

  items.push(
    { href: "/dashboard/jobs", label: "Jobs" },
    { href: "/dashboard/applications", label: "Applications" },
  );

  if (canManageMembers(companyRole)) {
    items.push({ href: "/dashboard/members", label: "Team" });
  }

  return items;
}

export function getWorkspaceNavigation(
  role: UserRole,
  companyRole?: CompanyRole,
): NavigationItem[] {
  if (role === "applicant") return applicantNavigation;
  if (role === "admin") return adminNavigation;
  return getRecruiterNavigation(companyRole);
}

export function getWorkspaceLink(role: UserRole) {
  const labels: Record<UserRole, { label: string; shortLabel: string }> = {
    applicant: { label: "Applicant portal", shortLabel: "Portal" },
    recruiter: { label: "Hiring dashboard", shortLabel: "Dashboard" },
    admin: { label: "Admin panel", shortLabel: "Admin" },
  };

  return { href: getRoleHome(role), ...labels[role] };
}

export function getAccountContextLabel(role: UserRole, companyRole?: CompanyRole) {
  if (role === "applicant") return "Job seeker";
  if (role === "admin") return "Administrator";
  return companyRole ? companyRoleLabels[companyRole] : "Recruiter account";
}
