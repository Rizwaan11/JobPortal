"use client";

import { PageError } from "@/components/page-error";

export default function DashboardError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <PageError
      title="The hiring workspace could not be loaded"
      description="Try loading this page again. Your saved hiring data has not changed."
      onRetry={unstable_retry}
    />
  );
}
