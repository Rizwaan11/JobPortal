import { Resume } from "../../modules/applicants/resume.model.js";
import { downloadObject } from "../../shared/storage.js";

export async function processResume(
  resumeId: string,
  s3Key: string
): Promise<void> {
  const buffer = await downloadObject(s3Key);
  const text = buffer.toString(
    "utf-8",
    0,
    Math.min(buffer.length, 100_000)
  );
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const result = await Resume.updateOne(
    { _id: resumeId },
    { $set: { wordCount } }
  );

  if (result.matchedCount === 0) {
    throw new Error("Resume not found");
  }
}
