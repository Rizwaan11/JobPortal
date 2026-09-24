import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

import { cn } from "@/lib/utils";

export function BrandLink({ href = "/jobs", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5 font-semibold tracking-tight",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <BriefcaseBusiness className="size-5" aria-hidden="true" />
      </span>
      <span>Job Portal</span>
    </Link>
  );
}
