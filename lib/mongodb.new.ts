import { MongoClient } from 'mongodb'

// Log warning if MongoDB URI is not set
if (!process.env.MONGODB_URI && typeof window === 'undefined') {
  console.warn('MONGODB_URI environment variable not set. Database operations will fail.')
}

// Minimal MongoDB client options for MongoDB 6.x driver
const options = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 10
}

// Type declaration for global connection cache
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

// Function to get MongoDB client
async function connectToDatabase(): Promise<MongoClient> {
  // If no URI is provided, throw an error
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable')
  }

  // In development mode we use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(process.env.MONGODB_URI, options)
      global._mongoClientPromise = client.connect()
    }
    return global._mongoClientPromise
  }

  // In production mode, it's best to not use a global variable.
  const client = new MongoClient(process.env.MONGODB_URI, options)
  return client.connect()
}

// Client promise that can be imported into other modules
const clientPromise = connectToDatabase()

export default clientPromise
