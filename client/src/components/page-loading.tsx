import { Skeleton } from "@/components/ui/skeleton";

export function PageLoading() {
  return (
    <div role="status" className="space-y-6" aria-label="Loading page">
      <span className="sr-only">Loading page…</span>

      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
