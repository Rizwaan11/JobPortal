"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/jobs", label: "Browse jobs" },
  { href: "/portal/applications", label: "Applications" },
  { href: "/portal/shortlist", label: "Shortlist" },
  { href: "/portal/profile", label: "Profile" },
];

export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {links.map((link) => {
        const active =
          link.href === "/jobs"
            ? pathname === "/jobs" || pathname.startsWith("/jobs/")
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground"
                : "rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
