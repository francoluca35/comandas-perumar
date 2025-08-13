import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Falta la variable MONGODB_URI en .env.local");
}

// Cache de conexión global para evitar múltiples conexiones en dev
let cached = global.mongoose || { conn: null, promise: null };

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

if (process.env.NODE_ENV !== "production") {
  global.mongoose = cached;
}
