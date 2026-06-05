import { Schema, model, models } from "mongoose";

const AttachmentSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    storageKey: { type: String, required: true, unique: true },
    provider: { type: String, enum: ["S3", "R2"], required: true },
  },
  { timestamps: true }
);

export const Attachment = models.Attachment || model("Attachment", AttachmentSchema);
