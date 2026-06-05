import { Schema, model, models } from "mongoose";

const EmailSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    mailbox: { type: String, required: true, index: true },
    from: { type: String, required: true },
    to: [{ type: String, required: true }],
    cc: [String],
    bcc: [String],
    subject: { type: String, required: true, trim: true },
    bodyHtml: { type: String, required: true },
    bodyText: { type: String, required: true },
    threadId: { type: Schema.Types.ObjectId, ref: "EmailThread", index: true },
    labels: [{ type: String, index: true }],
    folder: {
      type: String,
      enum: ["INBOX", "SENT", "DRAFT", "TRASH", "SPAM", "STARRED", "ARCHIVE"],
      default: "INBOX",
      index: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    isStarred: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false },
    inReplyToEmailId: { type: Schema.Types.ObjectId, ref: "Email" },
    attachments: [{ type: Schema.Types.ObjectId, ref: "Attachment" }],
    providerMessageId: String,
    scheduledAt: Date,
    sentAt: Date,
    receivedAt: Date,
  },
  { timestamps: true }
);

EmailSchema.index({ organizationId: 1, folder: 1, createdAt: -1 });
EmailSchema.index({ subject: "text", bodyText: "text", from: "text", to: "text" });

export const Email = models.Email || model("Email", EmailSchema);
