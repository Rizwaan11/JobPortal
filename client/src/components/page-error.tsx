"use client";

import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PageErrorProps = {
  title?: string;
  description?: string;
  onRetry: () => void;
};

export function PageError({
  title = "Something went wrong",
  description = "This page could not be loaded. Try again.",
  onRetry,
}: PageErrorProps) {
  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="space-y-5 py-10 text-center">
        <CircleAlert
          className="mx-auto size-9 text-destructive"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button type="button" onClick={onRetry}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
