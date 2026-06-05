import { Schema, model, models } from "mongoose";

const ScheduledEmailSchema = new Schema(
  {
    emailId: { type: Schema.Types.ObjectId, ref: "Email", required: true, unique: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    scheduledFor: { type: Date, required: true, index: true },
    status: { type: String, enum: ["QUEUED", "PROCESSING", "SENT", "FAILED"], default: "QUEUED", index: true },
    attempts: { type: Number, default: 0 },
    lastError: String,
  },
  { timestamps: true }
);

export const ScheduledEmail = models.ScheduledEmail || model("ScheduledEmail", ScheduledEmailSchema);
