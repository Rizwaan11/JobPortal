"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
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
import type { ResumeSummary } from "@/types/applicant";

type UploadStatus =
  | "idle"
  | "preparing"
  | "uploading"
  | "confirming"
  | "complete";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const statusMessage: Record<Exclude<UploadStatus, "idle">, string> = {
  preparing: "Preparing upload…",
  uploading: "Uploading PDF…",
  confirming: "Saving résumé…",
  complete: "Résumé uploaded. It is ready to use.",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function ResumeUpload({
  resume,
}: {
  resume: ResumeSummary | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(false);
  const uploading = status !== "idle" && status !== "complete";

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Select a PDF file.");
      input.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("The PDF must be smaller than 5 MB.");
      input.value = "";
      return;
    }

    setError("");

    try {
      setStatus("preparing");
      const detailsResponse = await fetchProtected(
        "/api/applicants/profile/resume-upload",
        { method: "POST" },
      );
      const details = await detailsResponse.json().catch(() => null);

      if (!detailsResponse.ok) {
        throw new Error(details?.error?.message ?? "Could not prepare upload");
      }

      setStatus("uploading");
      const uploadBody = new FormData();
      uploadBody.append("file", file);
      uploadBody.append("public_id", details.key);
      uploadBody.append("timestamp", String(details.timestamp));
      uploadBody.append("signature", details.signature);
      uploadBody.append("api_key", details.apiKey);
      uploadBody.append("type", details.type);
      uploadBody.append("allowed_formats", details.allowedFormats);

      const uploadResponse = await fetch(details.uploadUrl, {
        method: "POST",
        body: uploadBody,
      });

      if (!uploadResponse.ok) {
        throw new Error("Cloud upload failed");
      }

      setStatus("confirming");
      const confirmResponse = await fetchProtected(
        "/api/applicants/profile/resume",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: details.key, filename: file.name }),
        },
      );
      const confirmation = await confirmResponse.json().catch(() => null);

      if (!confirmResponse.ok) {
        throw new Error(confirmation?.error?.message ?? "Could not save résumé");
      }

      setStatus("complete");
      input.value = "";
      router.refresh();
    } catch (uploadError) {
      setStatus("idle");
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed. Try again.",
      );
    }
  }

  async function openResume() {
    setOpening(true);
    setError("");
    const resumeWindow = window.open("about:blank", "_blank");

    try {
      const response = await fetchProtected("/api/applicants/profile/resume");
      const body = await response.json().catch(() => null);

      if (!response.ok || !body?.url) {
        resumeWindow?.close();
        setError(body?.error?.message ?? "Could not open the résumé");
        return;
      }

      if (!resumeWindow) {
        setError("Allow pop-ups to open the résumé");
        return;
      }

      resumeWindow.opener = null;
      resumeWindow.location.href = body.url;
    } catch {
      resumeWindow?.close();
      setError("Could not connect to the server");
    } finally {
      setOpening(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Résumé</CardTitle>
            <CardDescription className="mt-1">
              Upload a PDF smaller than 5 MB.
            </CardDescription>
          </div>
          {resume && <Badge>Uploaded</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {resume ? (
          <div className="space-y-2 rounded-md border p-4">
            <p className="font-medium">{resume.filename}</p>
            <p className="text-sm text-muted-foreground">
              Uploaded {formatDate(resume.uploadedAt)}
            </p>
            <p className="text-sm text-muted-foreground">
              {resume.wordCount === null
                ? "Analysis is not available yet. Your résumé is already ready to use."
                : `Analysis complete · ${resume.wordCount} words`}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={opening}
                onClick={() => void openResume()}
              >
                {opening ? "Opening…" : "View résumé"}
              </Button>
              {resume.wordCount === null && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => router.refresh()}
                >
                  Refresh analysis
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            No résumé uploaded yet.
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="resume-file">
            {resume ? "Replace résumé" : "Choose résumé"}
          </Label>
          <Input
            id="resume-file"
            type="file"
            accept="application/pdf,.pdf"
            disabled={uploading}
            onChange={(event) => void handleUpload(event)}
          />
          <p className="text-xs text-muted-foreground">
            PDF only · Maximum file size 5 MB
          </p>
        </div>

        {status !== "idle" && (
          <p role="status" className="text-sm text-muted-foreground">
            {statusMessage[status]}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
