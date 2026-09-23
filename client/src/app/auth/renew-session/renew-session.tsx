"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [failed, setFailed] = useState(false);
  const [renewing, setRenewing] = useState(true);

  const attemptRenewal = useCallback(async () => {
    setFailed(false);
    setRenewing(true);

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

      setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setRenewing(false);
    }
  }, [returnTo]);

  useEffect(() => {
    void attemptRenewal();
  }, [attemptRenewal]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Restoring your session</CardTitle>
        <CardDescription>
          Keeping your account signed in before returning to your page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renewing ? (
          <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Checking your session…
          </div>
        ) : null}

        {failed ? (
          <>
            <ActionMessage type="error">
              Your session could not be restored. Check your connection and try again.
            </ActionMessage>
            <Button type="button" onClick={() => void attemptRenewal()}>
              Try again
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
