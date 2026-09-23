"use client";

import { PageError } from "@/components/page-error";

export default function ErrorPage({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <PageError onRetry={unstable_retry} />
    </main>
  );
}
