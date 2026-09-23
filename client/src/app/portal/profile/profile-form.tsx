"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchProtected } from "@/lib/fetch-protected";
import type { ApplicantProfile } from "@/types/applicant";

export default function ProfileForm({
  existing,
}: {
  existing: ApplicantProfile | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const years = String(form.get("yearsOfExperience") ?? "");
    const skills = String(form.get("skills") ?? "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
    const portfolioLinks = String(form.get("portfolioLinks") ?? "")
      .split("\n")
      .map((link) => link.trim())
      .filter(Boolean);

    const attributes: {
      skills: string[];
      portfolioLinks: string[];
      yearsOfExperience?: number;
    } = {
      skills,
      portfolioLinks,
    };
    if (years) attributes.yearsOfExperience = Number(years);

    try {
      const response = await fetchProtected("/api/applicants/profile", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: String(form.get("fullName") ?? "").trim(),
          headline: String(form.get("headline") ?? "").trim(),
          location: String(form.get("location") ?? "").trim(),
          attributes,
        }),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setError(body?.error?.message ?? "Could not save your profile");
        return;
      }

      setMessage(existing ? "Profile saved." : "Profile created.");
      router.refresh();
    } catch {
      setError("Could not connect to the server");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existing ? "Profile details" : "Create your profile"}</CardTitle>
        <CardDescription>
          Recruiters receive a snapshot of this information when you apply.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={existing?.fullName}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              name="headline"
              defaultValue={existing?.headline}
              placeholder="Junior full-stack developer"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={existing?.location}
                placeholder="Lahore"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of experience</Label>
              <Input
                id="yearsOfExperience"
                name="yearsOfExperience"
                type="number"
                min="0"
                step="1"
                defaultValue={existing?.attributes.yearsOfExperience}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Input
              id="skills"
              name="skills"
              defaultValue={existing?.attributes.skills.join(", ")}
              placeholder="React, Node.js, MongoDB"
            />
            <p className="text-xs text-muted-foreground">
              Separate skills with commas.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioLinks">Portfolio links</Label>
            <textarea
              id="portfolioLinks"
              name="portfolioLinks"
              defaultValue={existing?.attributes.portfolioLinks.join("\n")}
              className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder={"https://github.com/your-name\nhttps://your-portfolio.com"}
            />
            <p className="text-xs text-muted-foreground">
              Enter one link per line.
            </p>
          </div>

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

          <Button type="submit" disabled={saving}>
            {saving
              ? "Saving…"
              : existing
                ? "Save changes"
                : "Create profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
