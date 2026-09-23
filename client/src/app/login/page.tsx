"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRoleHome, type UserRole } from "@/lib/roles";

type LoginResponse = {
  role?: UserRole;
  error?: { message?: string };
};

export default function LoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json().catch(() => ({}))) as LoginResponse;

      if (!response.ok) {
        setError(data.error?.message ?? "Could not sign in. Please try again.");
        return;
      }

      if (!data.role) {
        setError("Could not sign in. Please try again.");
        return;
      }

      router.replace(getRoleHome(data.role));
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPanel title="Sign in" description="Access your applications or hiring workspace.">
      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={pending}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="mt-5 flex flex-wrap justify-between gap-2 text-sm">
        <Link href="/register" className="font-medium text-primary hover:underline">Create an account</Link>
        <Link href="/verify-email" className="text-muted-foreground hover:text-foreground hover:underline">Verify email</Link>
      </div>
    </AuthPanel>
  );
}
