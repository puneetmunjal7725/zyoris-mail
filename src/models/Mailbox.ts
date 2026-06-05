import { Schema, model, models } from "mongoose";

const MailboxSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    domainId: { type: Schema.Types.ObjectId, ref: "Domain", required: true, index: true },
    emailAddress: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    username: { type: String, required: true, trim: true, index: true },
    displayName: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    storageUsedBytes: { type: Number, default: 0 },
    storageLimitBytes: { type: Number, default: 1024 * 1024 * 1024 },
    isActive: { type: Boolean, default: true, index: true },
    isSuspended: { type: Boolean, default: false, index: true },
    lastLoginAt: Date,
    sentCount: { type: Number, default: 0 },
    receivedCount: { type: Number, default: 0 },
    lastActivityAt: Date,
  },
  { timestamps: true }
);

MailboxSchema.index({ organizationId: 1, domainId: 1, username: 1 }, { unique: true });

export const Mailbox = models.Mailbox || model("Mailbox", MailboxSchema);

