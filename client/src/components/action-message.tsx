import { CircleAlert, CircleCheck } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "cn";

type ActionMessageProps = {
  type: "success" | "error";
  children: ReactNode;
  className?: string;
};

export function ActionMessage({ type, children, className }: ActionMessageProps) {
  const success = type === "success";
  const Icon = success ? CircleCheck : CircleAlert;

  return (
    <div
      role={success ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-destructive/20 bg-destructive/5 text-destructive",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
