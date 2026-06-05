import { Schema, model, models } from "mongoose";

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userLimit: { type: Number, default: 25 },
    mailboxLimit: { type: Number, default: 50 },
    storageLimitBytes: { type: Number, default: 10 * 1024 * 1024 * 1024 },
    storageUsedBytes: { type: Number, default: 0 },
    plan: { type: String, enum: ["free", "growth", "enterprise"], default: "free", index: true },
    emailsSentToday: { type: Number, default: 0 },
    emailsSentOn: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Organization = models.Organization || model("Organization", OrganizationSchema);
