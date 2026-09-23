"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { ActionMessage } from "@/components/action-message";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { renewSession } from "@/lib/fetch-protected";

export function RenewSession({ returnTo }: { returnTo: string }) {
  const [status, setStatus] = useState<"renewing" | "failed">("renewing");

  async function retryRenewal() {
    setStatus("renewing");

    try {
      const response = await renewSession();

      if (response.ok) {
        window.location.replace(returnTo);
        return;
      }

      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }

      setStatus("failed");
    } catch {
      setStatus("failed");
    }
  }

  useEffect(() => {
    let cancelled = false;

    void renewSession()
      .then((response) => {
        if (cancelled) return;

        if (response.ok) {
          window.location.replace(returnTo);
        } else if (response.status === 401) {
          window.location.replace("/login");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [returnTo]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Restoring your session</CardTitle>
        <CardDescription>
          Keeping your account signed in before returning to your page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "renewing" ? (
          <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Checking your session…
          </div>
        ) : null}

        {status === "failed" ? (
          <>
            <ActionMessage type="error">
              Your session could not be restored. Check your connection and try again.
            </ActionMessage>
            <Button type="button" onClick={() => void retryRenewal()}>
              Try again
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
