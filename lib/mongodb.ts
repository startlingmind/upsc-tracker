import mongoose from 'mongoose';
import dns from 'dns';

// 🔧 FORCE RELIABLE DNS SERVERS (Google & Cloudflare)
// This bypasses ISP DNS issues that cause ECONNREFUSED errors
dns.setServers([
  '8.8.8.8',       // Google DNS Primary
  '8.8.4.4',       // Google DNS Secondary
  '1.1.1.1',       // Cloudflare DNS Primary
  '1.0.0.1',       // Cloudflare DNS Secondary
]);

const MONGODB_URI = process.env.MONGO_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env');
}

// Set DNS to use IPv4 first (helps with some DNS resolution issues)
dns.setDefaultResultOrder('ipv4first');

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

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB Connected:', mongoose.connection.db.databaseName);
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB Connection Failed:', error.message);
      if (error.code) {
        console.error(`   Error Code: ${error.code}`);
      }
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
