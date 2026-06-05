import { Worker } from "bullmq";
import { getEnv } from "@/lib/env";
import { connectToDatabase } from "@/lib/db";
import { Email, ScheduledEmail } from "@/models";
import { sendProviderEmail } from "@/lib/services/mailer";

const connection = { url: getEnv().REDIS_URL };

new Worker(
  "scheduled-emails",
  async (job) => {
    const { scheduledEmailId } = job.data as { scheduledEmailId: string };
    await connectToDatabase();
    const scheduled = await ScheduledEmail.findById(scheduledEmailId);
    if (!scheduled || scheduled.status === "SENT") return;

    scheduled.status = "PROCESSING";
    scheduled.attempts += 1;
    await scheduled.save();

    const email = await Email.findById(scheduled.emailId);
    if (!email) throw new Error("Email not found");

    try {
      const providerMessageId = await sendProviderEmail({
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject,
        html: email.bodyHtml,
        text: email.bodyText,
        from: email.from,
      });
      email.providerMessageId = providerMessageId;
      email.folder = "SENT";
      email.sentAt = new Date();
      await email.save();
      scheduled.status = "SENT";
      await scheduled.save();
    } catch (error) {
      scheduled.status = "FAILED";
      scheduled.lastError = error instanceof Error ? error.message : "Unknown error";
      await scheduled.save();
      throw error;
    }
  },
  { connection }
);

console.log("Scheduled email worker started");
