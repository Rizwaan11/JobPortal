"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { ActionMessage } from "@/components/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AcceptInvitationForm({
  token,
  initialEmail,
}: {
  token: string;
  initialEmail: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <AuthPanel
        title="Invitation link needed"
        description="Open the invitation link from your email to join a company workspace."
      >
        <Link href="/jobs" className="text-sm font-medium text-primary hover:underline">
          Browse jobs
        </Link>
      </AuthPanel>
    );
  }

  const registerQuery = new URLSearchParams({ invite: token });
  const verifyQuery = new URLSearchParams({ invite: token });
  if (email.trim()) {
    registerQuery.set("email", email.trim());
    verifyQuery.set("email", email.trim());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email: email.trim().toLowerCase() }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: { message?: string } };

      if (!response.ok) {
        setError(data.error?.message ?? "Could not accept this invitation.");
        return;
      }

      router.replace("/dashboard");
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPanel
      title="Join the company"
      description="Use the email address that received this invitation. Your recruiter account must be verified first."
    >
      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={pending}>
        <div className="space-y-2">
          <Label htmlFor="email">Invited email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        {error && <ActionMessage type="error">{error}</ActionMessage>}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Joining…" : "Accept invitation"}
        </Button>
      </form>
      <p className="mt-4 text-xs text-muted-foreground">
        Invitation links expire and can be used once. If yours no longer works, ask the inviter for
        a new one.
      </p>
      <div className="mt-5 space-y-2 text-sm">
        <p>
          Need an account?{" "}
          <Link
            href={`/register?${registerQuery.toString()}`}
            className="font-medium text-primary hover:underline"
          >
            Create a recruiter account
          </Link>
        </p>
        <p>
          Have an account but not verified?{" "}
          <Link
            href={`/verify-email?${verifyQuery.toString()}`}
            className="font-medium text-primary hover:underline"
          >
            Verify your email
          </Link>
        </p>
        <p>
          Already joined?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthPanel>
  );
}
