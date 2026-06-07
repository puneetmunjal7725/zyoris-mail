/**
 * Wipes all Zyoris Mail collections for a fresh start.
 * Usage: MONGODB_URI="mongodb+srv://..." npm run db:reset
 */
import mongoose from "mongoose";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI required");
  if (uri.includes("127.0.0.1") || uri.includes("localhost")) {
    throw new Error("Refusing to reset localhost database. Set MONGODB_URI to Atlas.");
  }

  await mongoose.connect(uri, { dbName: "zyoris-mail" });
  const db = mongoose.connection.db;
  if (!db) throw new Error("No database connection");

  await db.dropDatabase();
  console.log("Dropped database: zyoris-mail");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
