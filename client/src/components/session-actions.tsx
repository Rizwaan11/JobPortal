import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { buttonVariants } from "@/components/ui/button";

type SessionActionsProps = {
  email: string;
  contextLabel: string;
  workspace?: {
    href: string;
    label: string;
    shortLabel?: string;
  };
};

export function SessionActions({ email, contextLabel, workspace }: SessionActionsProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="hidden max-w-48 text-right lg:block">
        <p className="truncate text-sm font-medium">{email}</p>
        <p className="truncate text-xs text-muted-foreground">{contextLabel}</p>
      </div>

      {workspace ? (
        <Link href={workspace.href} className={buttonVariants({ variant: "outline" })}>
          <span className="sm:hidden">{workspace.shortLabel ?? workspace.label}</span>
          <span className="hidden sm:inline">{workspace.label}</span>
        </Link>
      ) : null}

      <LogoutButton />
    </div>
  );
}
