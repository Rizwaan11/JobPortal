import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/jobs" className="inline-flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BriefcaseBusiness className="size-5" aria-hidden="true" />
            </span>
            Job Portal
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm">
            <Link href="/jobs" className="font-medium hover:underline">
              Browse jobs
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
