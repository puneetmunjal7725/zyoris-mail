import { Schema, model, models } from "mongoose";

const EmailThreadSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    subject: { type: String, required: true },
    participants: [{ type: String, required: true }],
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const EmailThread = models.EmailThread || model("EmailThread", EmailThreadSchema);
