"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ActionMessage } from "@/components/action-message";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { fetchProtected } from "@/lib/fetch-protected";
import type {
  CompanyRole,
  EditableCompanyRole,
} from "@/types/company-members";

type Props = {
  memberId: string;
  memberRole: CompanyRole;
  memberUserId: string;
  currentUserId: string;
  currentCompanyRole: CompanyRole;
};

export function MemberActions({
  memberId,
  memberRole,
  memberUserId,
  currentUserId,
  currentCompanyRole,
}: Props) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<EditableCompanyRole>(
    memberRole === "owner" ? "recruiter" : memberRole,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [removeOpen, setRemoveOpen] = useState(false);

  const isCurrentUser = memberUserId === currentUserId;
  const isOwner = memberRole === "owner";
  const canChangeRole =
    currentCompanyRole === "owner" && !isOwner && !isCurrentUser;
  const canRemove =
    (currentCompanyRole === "owner" || currentCompanyRole === "hr_manager") &&
    !isOwner &&
    !isCurrentUser;

  async function updateRole() {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetchProtected(
        `/api/companies/members/${memberId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: selectedRole }),
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error?.message ?? "Could not update member");
        return;
      }

      router.refresh();
    } catch {
      setError("Could not connect to the server");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeCompanyMember() {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetchProtected(
        `/api/companies/members/${memberId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error?.message ?? "Could not remove member");
        return;
      }

      setRemoveOpen(false);
      router.refresh();
    } catch {
      setError("Could not connect to the server");
    } finally {
      setSubmitting(false);
    }
  }

  if (!canChangeRole && !canRemove) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {canChangeRole && (
          <>
            <select
              value={selectedRole}
              onChange={(event) =>
                setSelectedRole(event.target.value as EditableCompanyRole)
              }
              className="h-9 rounded-md border bg-background px-3 text-sm"
              disabled={submitting}
            >
              <option value="hr_manager">HR manager</option>
              <option value="recruiter">Recruiter</option>
              <option value="hiring_manager">Hiring manager</option>
            </select>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={submitting || selectedRole === memberRole}
              onClick={() => void updateRole()}
            >
              Save role
            </Button>
          </>
        )}

        {canRemove && (
          <AlertDialog
            open={removeOpen}
            onOpenChange={(open) => {
              setRemoveOpen(open);
              if (!open) setError("");
            }}
          >
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={submitting}
                />
              }
            >
              Remove
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove member?</AlertDialogTitle>
                <AlertDialogDescription>
                  This person will lose access to the company workspace. You can
                  invite them again later.
                </AlertDialogDescription>
              </AlertDialogHeader>

              {error ? (
                <ActionMessage type="error">{error}</ActionMessage>
              ) : null}

              <AlertDialogFooter>
                <AlertDialogCancel disabled={submitting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  type="button"
                  variant="destructive"
                  disabled={submitting}
                  onClick={() => void removeCompanyMember()}
                >
                  {submitting ? "Removing…" : "Remove member"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {error && !removeOpen ? (
        <ActionMessage type="error">{error}</ActionMessage>
      ) : null}
    </div>
  );
}
