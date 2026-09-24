"use client";

import { PageError } from "@/components/page-error";

export default function JobsError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <PageError
      title="Jobs are unavailable right now"
      description="We could not load the job board. Try again in a moment."
      onRetry={unstable_retry}
    />
  );
}
