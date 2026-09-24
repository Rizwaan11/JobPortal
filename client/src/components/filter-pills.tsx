import Link from "next/link";

import { cn } from "@/lib/utils";

type FilterItem = {
  href: string;
  label: string;
  active: boolean;
};

export function FilterPills({ items, label = "Filters" }: { items: FilterItem[]; label?: string }) {
  return (
    <nav aria-label={label} className="scrollbar-none -mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex min-w-max gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors sm:text-sm",
              item.active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
