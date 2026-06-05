import { Schema, model, models } from "mongoose";

const OTPSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purpose: { type: String, enum: ["VERIFY_EMAIL", "RESET_PASSWORD", "LOGIN_2FA"], required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: Date,
  },
  { timestamps: true }
);

OTPSchema.index({ userId: 1, purpose: 1, expiresAt: -1 });

export const OTP = models.OTP || model("OTP", OTPSchema);
