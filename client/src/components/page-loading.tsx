import { Skeleton } from "@/components/ui/skeleton";

function LoadingHeader() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  );
}

export function JobListLoading() {
  return (
    <div role="status" className="space-y-6" aria-label="Loading page">
      <span className="sr-only">Loading page…</span>
      <LoadingHeader />
      <Skeleton className="h-16 w-full max-w-2xl rounded-xl" />
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="space-y-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <div className="space-y-2 py-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="flex justify-between border-t pt-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortalLoadingSkeleton() {
  return (
    <div role="status" className="space-y-7" aria-label="Loading portal">
      <span className="sr-only">Loading portal…</span>
      <LoadingHeader />
      <div className="flex gap-2">
        {["w-20", "w-24", "w-28", "w-20"].map((width, index) => (
          <Skeleton key={index} className={`h-8 ${width} rounded-full`} />
        ))}
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((item) => (
          <div key={item} className="space-y-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="flex justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div role="status" className="space-y-7" aria-label="Loading dashboard">
      <span className="sr-only">Loading dashboard…</span>
      <LoadingHeader />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="space-y-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-28" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminTableLoadingSkeleton() {
  return (
    <div role="status" className="space-y-7" aria-label="Loading administration page">
      <span className="sr-only">Loading administration page…</span>
      <LoadingHeader />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <Skeleton className="h-11 w-full rounded-none" />
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="grid grid-cols-5 gap-4 border-t px-4 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-7 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileLoadingSkeleton() {
  return (
    <div role="status" className="space-y-7" aria-label="Loading profile">
      <span className="sr-only">Loading profile…</span>
      <LoadingHeader />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="space-y-6">
          {[0, 1].map((item) => (
            <div key={item} className="space-y-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function KanbanLoadingSkeleton() {
  return (
    <div role="status" className="space-y-7" aria-label="Loading hiring pipeline">
      <span className="sr-only">Loading hiring pipeline…</span>
      <LoadingHeader />
      <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {[0, 1, 2].map((column) => (
          <div
            key={column}
            className="w-72 shrink-0 space-y-3 rounded-xl bg-muted/50 p-3 ring-1 ring-foreground/10 sm:w-80"
          >
            <div className="flex justify-between border-b pb-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-6" />
            </div>
            {[0, 1].map((card) => (
              <div
                key={card}
                className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              >
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-36" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function JobDetailLoadingSkeleton() {
  return (
    <div role="status" className="space-y-7" aria-label="Loading job details">
      <span className="sr-only">Loading job details…</span>
      <Skeleton className="h-5 w-28" />
      <div className="space-y-3 border-b pb-7">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-10 w-full max-w-lg" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          {["h-48", "h-52"].map((height) => (
            <div
              key={height}
              className={`rounded-xl bg-card p-5 ring-1 ring-foreground/10 ${height}`}
            >
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-5 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
            </div>
          ))}
        </div>
        <div className="h-56 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-5 h-4 w-full" />
          <Skeleton className="mt-6 h-10 w-full" />
          <Skeleton className="mt-3 h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

export function FormLoadingSkeleton() {
  return (
    <div role="status" className="max-w-5xl space-y-7" aria-label="Loading form">
      <span className="sr-only">Loading form…</span>
      <LoadingHeader />
      {[0, 1, 2].map((section) => (
        <div key={section} className="space-y-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-64 max-w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
