"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { fetchProtected } from "@/lib/fetch-protected";
import type { JobStatus } from "@/types/jobs";

export default function PublishCloseButtons({
  jobId,
  status,
}: {
  jobId: string;
  status: JobStatus;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus(action: "publish" | "close") {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetchProtected(`/api/jobs/${jobId}/${action}`, {
        method: "POST",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error?.message ?? `Could not ${action} the job`);
        return;
      }

      router.refresh();
    } catch {
      setError("Could not connect to the server");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {status !== "open" && (
          <Button disabled={submitting} onClick={() => void updateStatus("publish")}>
            {status === "closed" ? "Reopen" : "Publish"}
          </Button>
        )}

        {status !== "closed" && (
          <Button
            variant="outline"
            disabled={submitting}
            onClick={() => void updateStatus("close")}
          >
            Close
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
