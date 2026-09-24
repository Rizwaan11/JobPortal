import "server-only";
import { z } from "zod";

const env = z
  .object({
    API_URL: z.url(),
  })
  .parse(process.env);

export const apiUrl = env.API_URL.replace(/\/$/, "");
