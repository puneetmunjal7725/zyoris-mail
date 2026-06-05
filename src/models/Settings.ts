import { Schema, model, models } from "mongoose";

const SettingsSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, unique: true },
    retentionDays: { type: Number, default: 365 },
    mfaRequired: { type: Boolean, default: false },
    allowedDomains: [String],
    spamThreshold: { type: Number, default: 5 },
    forwardingRules: [{ from: String, to: String }],
  },
  { timestamps: true }
);

export const Settings = models.Settings || model("Settings", SettingsSchema);
