"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { fetchProtected } from "@/lib/fetch-protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateCompanyResponse = {
  error?: {
    message?: string;
  };
};

export default function CompanyForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim();
    const body = website ? { name, website } : { name };

    try {
      const response = await fetchProtected("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json().catch(() => ({}))) as CreateCompanyResponse;

      if (!response.ok) {
        setError(data.error?.message ?? "Could not create the company.");
        return;
      }

      router.refresh();
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-busy={pending}>
      <div className="space-y-2">
        <Label htmlFor="name">Company name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          minLength={2}
          maxLength={100}
          placeholder="Acme Technologies"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" type="url" placeholder="https://example.com" />
        <p className="text-xs text-muted-foreground">
          Optional. Include https:// at the beginning.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Creating company…" : "Create company"}
      </Button>
    </form>
  );
}
