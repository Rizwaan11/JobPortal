"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Action = "apply" | "shortlist";

export default function ApplyShortlistButtons({ jobId }: { jobId: string }) {
  const [busy, setBusy] = useState<Action | null>(null);
  const [message, setMessage] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  async function submit(action: Action) {
    setBusy(action);
    setMessage("");
    setNeedsLogin(false);

    try {
      const response = await fetch(`/api/applicants/${action === "apply" ? "apply" : "shortlist"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "apply" ? { jobIds: [jobId] } : { jobId }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
        skipped?: string[];
      };

      if (response.status === 401) {
        setNeedsLogin(true);
        setMessage("Sign in as an applicant to continue.");
      } else if (!response.ok) {
        setMessage(data.error?.message ?? "Something went wrong. Please try again.");
      } else if (action === "apply") {
        setMessage(data.skipped?.includes(jobId) ? "You already applied to this job." : "Application submitted.");
      } else {
        setMessage("Job saved to your shortlist.");
      }
    } catch {
      setMessage("Could not connect. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void submit("apply")} disabled={busy !== null}>
          {busy === "apply" ? "Applying…" : "Apply"}
        </Button>
        <Button
          variant="outline"
          onClick={() => void submit("shortlist")}
          disabled={busy !== null}
        >
          {busy === "shortlist" ? "Saving…" : "Save job"}
        </Button>
      </div>
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}{" "}
          {needsLogin && (
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
