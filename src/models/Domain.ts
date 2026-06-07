import { Schema, model, models } from "mongoose";

const DomainSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    domain: { type: String, required: true, lowercase: true, trim: true },
    verificationToken: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "VERIFIED", "FAILED"], default: "PENDING", index: true },
    catchAllEnabled: { type: Boolean, default: false, index: true },
    catchAllMailboxId: { type: Schema.Types.ObjectId, ref: "Mailbox", default: null },
    diagnostics: {
      txt: { type: String, default: "" },
      spf: { type: String, default: "" },
      dkim: { type: String, default: "" },
      dmarc: { type: String, default: "" },
      mx: { type: String, default: "" },
    },
    dnsStatus: {
      txt: { type: Boolean, default: false },
      spf: { type: Boolean, default: false },
      dkim: { type: Boolean, default: false },
      dmarc: { type: Boolean, default: false },
      mx: { type: Boolean, default: false },
    },
    lastCheckedAt: Date,
  },
  { timestamps: true }
);

DomainSchema.index({ organizationId: 1, domain: 1 }, { unique: true });

export const Domain = models.Domain || model("Domain", DomainSchema);
