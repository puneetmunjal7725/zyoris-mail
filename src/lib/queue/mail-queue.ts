import { Queue } from "bullmq";
import { getEnv } from "@/lib/env";

let queue: Queue | null = null;

export function getMailQueue() {
  if (!queue) {
    const connection = { url: getEnv().REDIS_URL };
    queue = new Queue("scheduled-emails", { connection });
  }
  return queue;
}
