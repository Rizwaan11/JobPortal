"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { ActionMessage } from "@/components/action-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyEmailForm({
  initialEmail,
  inviteToken,
}: {
  initialEmail: string;
  inviteToken: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState<"verify" | "resend" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [verified, setVerified] = useState(false);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending("verify");
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, otp }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: { message?: string } };

      if (!response.ok) {
        setError(data.error?.message ?? "Could not verify this code. Please try again.");
        return;
      }

      setVerified(true);
      if (inviteToken) {
        const query = new URLSearchParams({ token: inviteToken, email: cleanEmail });
        router.replace(`/auth/accept-invitation?${query.toString()}`);
      } else {
        setMessage("Email verified. You can now sign in.");
      }
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setPending(null);
    }
  }

  async function handleResend() {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setPending("resend");
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: { message?: string } };

      if (!response.ok) {
        setError(data.error?.message ?? "Could not send a new code. Please try again.");
        return;
      }

      setOtp("");
      setMessage(
        "If this account needs verification, a new code has been sent. Use the newest code.",
      );
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <AuthPanel
      title="Verify your email"
      description={
        inviteToken
          ? "Enter the six-digit code sent to your invited email, then return to your invitation."
          : "Enter the six-digit code sent to your email. Codes expire after 15 minutes."
      }
    >
      {verified ? (
        <div className="space-y-4">
          <p role="status" className="text-sm">
            {message || "Email verified. Returning to your invitation…"}
          </p>
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Go to sign in
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleVerify} className="space-y-4" aria-busy={pending !== null}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
            <div className="space-y-2">
              <Label htmlFor="otp">Verification code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="123456"
                required
              />
            </div>
            {error && <ActionMessage type="error">{error}</ActionMessage>}
            {message && <ActionMessage type="success">{message}</ActionMessage>}
            <Button type="submit" size="lg" className="w-full" disabled={pending !== null}>
              {pending === "verify" ? "Verifying…" : "Verify email"}
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResend}
              disabled={pending !== null}
            >
              {pending === "resend" ? "Sending…" : "Send a new code"}
            </Button>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </>
      )}
    </AuthPanel>
  );
}
