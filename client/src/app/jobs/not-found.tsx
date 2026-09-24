import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function JobNotFound() {
  return (
    <Card>
      <CardContent className="space-y-3 py-10 text-center">
        <h1 className="text-lg font-semibold">Job not found</h1>
        <p className="text-sm text-muted-foreground">
          This position may have been closed or is no longer available.
        </p>
        <Link
          href="/jobs"
          className="inline-block text-sm font-medium underline underline-offset-4"
        >
          Browse open jobs
        </Link>
      </CardContent>
    </Card>
  );
}
