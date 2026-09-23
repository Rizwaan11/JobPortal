import Link from "next/link";
import { SearchX } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <Card className="mx-auto max-w-xl">
        <CardContent className="space-y-5 py-10 text-center">
          <SearchX
            className="mx-auto size-9 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Page not found</h1>
            <p className="text-sm text-muted-foreground">
              The page may have moved or the address may be incorrect.
            </p>
          </div>
          <Link href="/jobs" className={buttonVariants()}>
            Browse jobs
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
