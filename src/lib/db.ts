import mongoose from "mongoose";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
declare global { var mongooseCache: Cache | undefined; }
const cached: Cache = global.mongooseCache || { conn: null, promise: null };

function assertValidMongoUri(uri: string) {
  if (!uri || uri.trim().length < 10) {
    throw new Error("MONGODB_URI is missing. Add your MongoDB Atlas connection string in Vercel env vars.");
  }
  if (process.env.NODE_ENV === "production" && (uri.includes("127.0.0.1") || uri.includes("localhost"))) {
    throw new Error("MONGODB_URI cannot point to localhost in production. Use MongoDB Atlas.");
  }
}

export async function connectToDatabase() {
  const mongodbUri = process.env.MONGODB_URI?.trim();
  assertValidMongoUri(mongodbUri || "");
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(mongodbUri!, { dbName: "zyoris-mail" });
  cached.conn = await cached.promise;
  global.mongooseCache = cached;
  return cached.conn;
}
