import { Schema, model, models } from "mongoose";

const InvitationSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    email: { type: String, required: true, lowercase: true, index: true },
    role: { type: String, enum: ["ORG_ADMIN", "USER"], default: "USER" },
    tokenHash: { type: String, required: true, unique: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true, index: true },
    acceptedAt: Date,
  },
  { timestamps: true }
);

InvitationSchema.index({ email: 1, organizationId: 1, acceptedAt: 1 });

export const Invitation = models.Invitation || model("Invitation", InvitationSchema);
