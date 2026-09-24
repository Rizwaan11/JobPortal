"use client";

import { PageError } from "@/components/page-error";

export default function AdminError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <PageError
      title="Administration data could not be loaded"
      description="Try loading this page again. No administrative action was completed."
      onRetry={unstable_retry}
    />
  );
}
