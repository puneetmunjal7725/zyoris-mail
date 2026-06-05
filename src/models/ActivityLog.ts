import { Schema, model, models } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true, index: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: String,
    userAgent: String,
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "LOW" },
  },
  { timestamps: true }
);

export const ActivityLog = models.ActivityLog || model("ActivityLog", ActivityLogSchema);
