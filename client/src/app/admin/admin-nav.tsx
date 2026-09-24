import { NavLink } from "@/components/nav-link";

const links = [
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminNav() {
  return (
    <nav aria-label="Administration navigation" className="flex min-w-max items-center gap-1">
      {links.map((link) => (
        <NavLink key={link.href} href={link.href}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
