import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

type CursorPaginationProps = {
  previousHref: string | null;
  nextHref: string | null;
};

export function CursorPagination({ previousHref, nextHref }: CursorPaginationProps) {
  if (!previousHref && !nextHref) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3 pt-2">
      {previousHref ? (
        <Link href={previousHref} className={buttonVariants({ variant: "outline" })}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <Button variant="outline" disabled>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Previous
        </Button>
      )}

      {nextHref ? (
        <Link href={nextHref} className={buttonVariants({ variant: "outline" })}>
          Next
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <Button variant="outline" disabled>
          Next
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      )}
    </nav>
  );
}
