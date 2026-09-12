import { Queue, type DefaultJobOptions } from "bullmq";
import { config } from "./config.js";

export type JobName =
  | "send-application-confirmation"
  | "send-interview-notification"
  | "process-resume"
  | "cleanup-expired-otps"
  | "cleanup-expired-refresh-tokens"
  | "send-recruiter-digest";

const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
  removeOnComplete: {
    count: 100,
  },
  removeOnFail: {
    count: 50,
  },
};

export const queue = new Queue("jobs", {
  connection: {
    url: config.REDIS_URL,
  },
  defaultJobOptions,
});
