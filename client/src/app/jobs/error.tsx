"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function JobsError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 py-10 text-center">
        <div>
          <h1 className="text-lg font-semibold">Jobs are unavailable right now</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We could not load the job board. Please try again.
          </p>
        </div>
        <Button onClick={unstable_retry}>Try again</Button>
      </CardContent>
    </Card>
  );
}
