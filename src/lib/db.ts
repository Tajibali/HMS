import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    })
      .then((m) => m)
      .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
        console.log('Using mock database mode for development');
        // Return a mock connection object instead of throwing
        return { 
          connection: { 
            readyState: 1 
          } 
        };
      });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}