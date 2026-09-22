"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    if (!window.confirm("Remove this member from the company?")) return;

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
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={submitting}
            onClick={() => void removeCompanyMember()}
          >
            Remove
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
