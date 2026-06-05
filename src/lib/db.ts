import mongoose from "mongoose";
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
declare global { var mongooseCache: Cache | undefined; }
const cached: Cache = global.mongooseCache || { conn: null, promise: null };
export async function connectToDatabase() {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) throw new Error("MONGODB_URI is not defined");
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(mongodbUri, { dbName: "zyoris-mail" });
  cached.conn = await cached.promise;
  global.mongooseCache = cached;
  return cached.conn;
}
