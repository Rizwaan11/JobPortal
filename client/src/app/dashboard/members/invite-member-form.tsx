"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchProtected } from "@/lib/fetch-protected";
import type { EditableCompanyRole } from "@/types/company-members";

export function InviteMemberForm() {
  const [role, setRole] = useState<EditableCompanyRole>("recruiter");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetchProtected("/api/companies/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setError(body?.error?.message ?? "Could not send invitation");
        return;
      }

      formElement.reset();
      setRole("recruiter");
      setMessage("Invitation sent.");
    } catch {
      setError("Could not connect to the server");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invitation-email">Email</Label>
        <Input
          id="invitation-email"
          name="email"
          type="email"
          placeholder="member@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="invitation-role">Company role</Label>
        <select
          id="invitation-role"
          value={role}
          onChange={(event) => setRole(event.target.value as EditableCompanyRole)}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="hr_manager">HR manager</option>
          <option value="recruiter">Recruiter</option>
          <option value="hiring_manager">Hiring manager</option>
        </select>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Send invitation"}
      </Button>

      {message && (
        <p role="status" className="text-sm text-green-700">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
