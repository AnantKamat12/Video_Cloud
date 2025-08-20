
// Import the Mongoose library, which is used to interact with your MongoDB database.
import mongoose from "mongoose";

// Retrieve the MongoDB connection string from your environment variables.
// The "!" at the end is a TypeScript assertion that tells the compiler this value will not be null or undefined.
const MONGODB_URI = process.env.MONGODB_URI!;

// A crucial check to ensure the application doesn't start without a database connection string.
// If the MONGODB_URI is missing, the server will throw an error and stop.
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// In a serverless environment, functions can be spun up and down for each request.
// Caching the database connection on the global object prevents creating a new connection for every single API call.
// This improves performance significantly.
let cached = global.mongoose;

// If the global cache hasn't been initialized yet, we create it.
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// This is the main function that your API routes will call to get a database connection.
export async function connectToDatabase() {
  // If we already have a connection in our cache, return it immediately.
  // This avoids reconnecting on subsequent calls within the same "hot" function instance.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise doesn't already exist, we create one.
  // This prevents multiple, simultaneous requests from all trying to create a new connection.
  if (!cached.promise) {
    // Mongoose connection options.
    const opts = {
      bufferCommands: true, // Allows Mongoose to buffer commands if the connection is down.
      maxPoolSize: 10,      // Limits the number of open connections to the database.
    };

    // We create the connection promise but don't `await` it here.
    // This promise is stored in the cache.
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(() => mongoose.connection); // Once connected, the promise resolves with the connection object.
  }

  // We `await` the connection promise to resolve. 
  // If multiple requests hit this function at the same time, they will all wait for the single promise to finish.
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // If the connection fails, we nullify the promise so a new attempt can be made on the next request.
    cached.promise = null;
    throw e; // Rethrow the error to be handled by the calling function.
  }

  // Finally, return the active database connection.
  return cached.conn;
}