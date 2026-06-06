import { Queue } from "bullmq";

let queue: Queue | null = null;

export function getMailQueue() {
  if (!queue) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) throw new Error("REDIS_URL is not configured");
    queue = new Queue("scheduled-emails", { connection: { url: redisUrl } });
  }
  return queue;
}
