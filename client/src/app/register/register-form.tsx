"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { ActionMessage } from "@/components/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterForm({
  inviteToken,
  initialEmail,
}: {
  inviteToken: string;
  initialEmail: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const role = inviteToken
      ? "recruiter"
      : formData.get("role") === "recruiter"
        ? "recruiter"
        : "applicant";

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: { message?: string } };

      if (!response.ok) {
        setError(data.error?.message ?? "Could not create the account. Please try again.");
        return;
      }

      const query = new URLSearchParams({ email });
      if (inviteToken) query.set("invite", inviteToken);
      router.replace(`/verify-email?${query.toString()}`);
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const verifyQuery = new URLSearchParams();
  if (initialEmail) verifyQuery.set("email", initialEmail);
  if (inviteToken) verifyQuery.set("invite", inviteToken);
  const verifyHref = verifyQuery.size ? `/verify-email?${verifyQuery.toString()}` : "/verify-email";

  return (
    <AuthPanel
      title="Create an account"
      description={
        inviteToken
          ? "Use the email that received the invitation. Create a recruiter account before joining."
          : "Join as a job seeker or recruiter."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={pending}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initialEmail}
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
          />
          <p className="text-xs text-muted-foreground">Use 8–72 characters.</p>
        </div>

        {inviteToken ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm">Account type: recruiter</p>
        ) : (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Account type</legend>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-3 transition-colors hover:bg-muted/60 has-checked:border-primary has-checked:bg-primary/5">
                <input
                  type="radio"
                  name="role"
                  value="applicant"
                  defaultChecked
                  className="accent-primary"
                />
                Job seeker
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-3 transition-colors hover:bg-muted/60 has-checked:border-primary has-checked:bg-primary/5">
                <input type="radio" name="role" value="recruiter" className="accent-primary" />
                Recruiter
              </label>
            </div>
          </fieldset>
        )}

        {error && <ActionMessage type="error">{error}</ActionMessage>}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm">
        <Link
          href={
            inviteToken
              ? `/auth/accept-invitation?token=${encodeURIComponent(inviteToken)}`
              : "/login"
          }
          className="font-medium text-primary hover:underline"
        >
          {inviteToken ? "Already registered? Return to invitation" : "Already registered? Sign in"}
        </Link>
        <Link
          href={verifyHref}
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          Have a code? Verify email
        </Link>
      </div>
    </AuthPanel>
  );
}
