import type { ReactNode } from "react";

import { BrandLink } from "@/components/brand-link";
import { NavLink } from "@/components/nav-link";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/lib/navigation";

type AppHeaderProps = {
  navigation: NavigationItem[];
  navigationLabel: string;
  actions: ReactNode;
  width?: "6xl" | "7xl";
};

export function AppHeader({
  navigation,
  navigationLabel,
  actions,
  width = "7xl",
}: AppHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div
        className={cn(
          "mx-auto flex w-full flex-wrap items-center gap-3 px-4 py-3 sm:px-6",
          width === "6xl" ? "max-w-6xl" : "max-w-7xl",
        )}
      >
        <BrandLink href="/jobs" />

        <div className="scrollbar-none order-3 w-full overflow-x-auto border-t pt-3 sm:order-none sm:w-auto sm:border-0 sm:pt-0">
          <nav aria-label={navigationLabel} className="flex min-w-max items-center gap-1">
            {navigation.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="ml-auto">{actions}</div>
      </div>
    </header>
  );
}
