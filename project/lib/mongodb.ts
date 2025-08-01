import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;


// lib/mongodb.ts

// import { MongoClient } from "mongodb";

// const uri = process.env.MONGODB_URI!;
// if (!uri) throw new Error("Please define the MONGODB_URI in .env.local");

// let client: MongoClient;
// let clientPromise: Promise<MongoClient>;

// declare global {
//   var _mongoClientPromise: Promise<MongoClient>;
// }

// if (!global._mongoClientPromise) {
//   client = new MongoClient(uri);
//   global._mongoClientPromise = client.connect();
// }

// clientPromise = global._mongoClientPromise;
// export default clientPromise;
