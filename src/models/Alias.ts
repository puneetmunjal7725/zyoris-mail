import { Schema, model, models } from "mongoose";

const AliasSchema = new Schema(
  {
    mailboxId: { type: Schema.Types.ObjectId, ref: "Mailbox", required: true, index: true },
    sourceAddress: { type: String, required: true, lowercase: true, trim: true, index: true },
    destinationAddress: { type: String, required: true, lowercase: true, trim: true, index: true },
    isEnabled: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

AliasSchema.index({ sourceAddress: 1 }, { unique: true });

export const Alias = models.Alias || model("Alias", AliasSchema);

