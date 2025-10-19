import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string | undefined;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI. Add it to your .env file at the project root.');
}

// Keep a cached connection across hot reloads in development
type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalAny = global as unknown as { mongoose?: MongooseCache };
let cached: MongooseCache = globalAny.mongoose || { conn: null, promise: null };
globalAny.mongoose = cached;

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts: Parameters<typeof mongoose.connect>[1] = { bufferCommands: false };
  cached.promise = mongoose.connect(MONGODB_URI as string, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

export default dbConnect;