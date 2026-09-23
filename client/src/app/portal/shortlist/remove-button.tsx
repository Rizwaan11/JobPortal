"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fetchProtected } from "@/lib/fetch-protected";

type RemoveButtonProps = {
  jobId: string;
};

export default function RemoveButton({ jobId }: RemoveButtonProps) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  async function handleRemove() {
    setRemoving(true);
    setError("");

    try {
      const response = await fetchProtected(
        `/api/applicants/shortlist/${jobId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error?.message ?? "Could not remove this job");
        return;
      }

      router.refresh();
    } catch {
      setError("Could not connect to the server");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={removing}
        onClick={() => void handleRemove()}
      >
        {removing ? "Removing…" : "Remove"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
