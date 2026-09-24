import { NavLink } from "@/components/nav-link";

const links = [
  { href: "/dashboard/company", label: "Company" },
  { href: "/dashboard/jobs", label: "Jobs" },
  { href: "/dashboard/applications", label: "Applications" },
  { href: "/dashboard/members", label: "Members" },
];

export function DashboardNav() {
  return (
    <nav aria-label="Recruiter navigation" className="flex min-w-max items-center gap-1">
      {links.map((link) => (
        <NavLink key={link.href} href={link.href}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
