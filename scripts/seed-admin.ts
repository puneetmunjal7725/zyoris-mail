import bcrypt from "bcryptjs";
import mongoose from "mongoose";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI required");

  await mongoose.connect(uri, { dbName: "zyoris-mail" });

  const email = process.env.SUPER_ADMIN_EMAIL || "admin@zyoris.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "ChangeMeNow123!";
  const name = process.env.SUPER_ADMIN_NAME || "Zyoris Super Admin";

  const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: String,
    isVerified: Boolean,
  }));

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log("Super admin already exists:", email);
    process.exit(0);
  }

  await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 12),
    role: "SUPER_ADMIN",
    isVerified: true,
  });

  console.log("Created super admin:", email);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
