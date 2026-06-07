import { Schema, model, models } from "mongoose";

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userLimit: { type: Number, default: 5 },
    mailboxLimit: { type: Number, default: 10 },
    domainLimit: { type: Number, default: 1 },
    aliasLimit: { type: Number, default: 5 },
    storageLimitBytes: { type: Number, default: 2 * 1024 * 1024 * 1024 },
    storageUsedBytes: { type: Number, default: 0 },
    plan: { type: String, enum: ["free", "growth", "business", "enterprise"], default: "free", index: true },
    emailsSentToday: { type: Number, default: 0 },
    emailsSentOn: { type: Date },
    emailsPerDayLimit: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    isPlatform: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Organization = models.Organization || model("Organization", OrganizationSchema);
