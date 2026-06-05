import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["SUPER_ADMIN", "ORG_ADMIN", "USER"], default: "USER", index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", index: true },
    isVerified: { type: Boolean, default: false },
    emailVerifiedAt: Date,
    lastLoginAt: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
  },
  { timestamps: true }
);

UserSchema.index({ organizationId: 1, role: 1 });

export const User = models.User || model("User", UserSchema);
