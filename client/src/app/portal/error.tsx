"use client";

import { PageError } from "@/components/page-error";

export default function PortalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <PageError
      title="Your portal could not be loaded"
      description="Your information is safe. Try loading this page again."
      onRetry={unstable_retry}
    />
  );
}
