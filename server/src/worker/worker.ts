import { Worker, type Job } from "bullmq";
import mongoose from "mongoose";
import { config } from "../shared/config.js";
import { connectDB } from "../shared/db.js";
import {
  sendApplicationConfirmationEmail,
  sendInterviewNotification,
} from "../shared/mailer.js";
import { queue, type JobName } from "../shared/queue.js";
import { processResume } from "./handlers/processResume.js";
import { sendRecruiterDigest } from "./handlers/sendRecruiterDigest.js";

await connectDB();

await queue.upsertJobScheduler(
  "weekly-recruiter-digest",
  {
    pattern: "0 8 * * 1",
    tz: "UTC",
  },
  {
    name: "send-recruiter-digest",
    data: {},
  }
);

const worker = new Worker(
  "jobs",
  async (job: Job) => {
    console.log(
      `[worker] Processing ${job.name} (id: ${job.id})`
    );

    switch (job.name as JobName) {
      case "send-application-confirmation": {
        const { applicantEmail, jobTitle, companyName } = job.data;

        await sendApplicationConfirmationEmail(
          applicantEmail,
          jobTitle,
          companyName
        );
        break;
      }

      case "send-interview-notification": {
        const {
          applicantEmail,
          jobTitle,
          scheduledAt,
          meetingLink,
          notes,
        } = job.data;

        await sendInterviewNotification(
          applicantEmail,
          jobTitle,
          new Date(scheduledAt),
          meetingLink,
          notes
        );
        break;
      }

      case "process-resume": {
        const { resumeId, s3Key } = job.data;
        await processResume(resumeId, s3Key);
        break;
      }

      case "send-recruiter-digest": {
        await sendRecruiterDigest();
        break;
      }

      default:
        console.warn(
          `[worker] Unknown job: ${job.name}`
        );
    }
  },
  {
    connection: {
      url: config.REDIS_URL,
    },
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(
    `[worker] Completed ${job.name} (id: ${job.id})`
  );
});

worker.on("failed", (job, error) => {
  console.error(
    `[worker] Failed ${job?.name} (id: ${job?.id})`,
    error.message
  );
});

worker.on("error", (error) => {
  console.error("[worker] Error:", error);
});

console.log("[worker] Waiting for jobs...");

let isShuttingDown = false;

async function shutdownWorker(): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log("[worker] Shutting down...");

  const forceExitTimer = setTimeout(() => {
    console.error("[worker] Shutdown timed out");
    process.exit(1);
  }, 10_000);

  forceExitTimer.unref();

  try {
    await worker.close();
    await queue.close();
    await mongoose.disconnect();

    clearTimeout(forceExitTimer);
    console.log("[worker] Shutdown completed");
    process.exit(0);
  } catch (error) {
    clearTimeout(forceExitTimer);
    console.error("[worker] Shutdown failed", error);
    process.exit(1);
  }
}

process.once("SIGINT", () => {
  void shutdownWorker();
});

process.once("SIGTERM", () => {
  void shutdownWorker();
});
