import { NavLink } from "@/components/nav-link";

const links = [
  { href: "/jobs", label: "Browse jobs" },
  { href: "/portal/applications", label: "Applications" },
  { href: "/portal/shortlist", label: "Shortlist" },
  { href: "/portal/profile", label: "Profile" },
];

export function PortalNav() {
  return (
    <nav aria-label="Applicant navigation" className="flex min-w-max items-center gap-1">
      {links.map((link) => (
        <NavLink key={link.href} href={link.href}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
