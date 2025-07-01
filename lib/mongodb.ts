import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  // Only throw error if not in build time
  if (process.env.NODE_ENV !== 'development' && typeof window === 'undefined') {
    console.warn('MONGODB_URI environment variable not set. Database connections will fail.')
  }
}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/duothan'

// MongoDB connection options to fix SSL/TLS issues
const options = {
  // SSL/TLS Configuration
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  
  // Connection settings
  serverSelectionTimeoutMS: 10000, // 10 seconds
  connectTimeoutMS: 10000,
  socketTimeoutMS: 10000,
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 1,
  
  // Additional options for serverless environments
  maxIdleTimeMS: 30000,
  bufferMaxEntries: 0,
  useUnifiedTopology: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Create a connection with error handling
const createMongoConnection = async (): Promise<MongoClient> => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set. Please check your environment configuration.')
  }
  
  try {
    const client = new MongoClient(uri, options)
    await client.connect()
    
    // Test the connection
    await client.db('admin').command({ ping: 1 })
    console.log('MongoDB connection established successfully')
    
    return client
  } catch (error: any) {
    console.error('MongoDB connection error:', error)
    
    // Handle specific SSL errors
    if (error.message?.includes('SSL') || error.message?.includes('TLS')) {
      console.log('Attempting connection with relaxed SSL settings...')
      
      // Fallback options for SSL issues
      const fallbackOptions = {
        ...options,
        tlsAllowInvalidCertificates: true,
        ssl: true,
        sslValidate: false,
      }
      
      const fallbackClient = new MongoClient(uri, fallbackOptions)
      await fallbackClient.connect()
      await fallbackClient.db('admin').command({ ping: 1 })
      console.log('MongoDB connection established with fallback SSL settings')
      
      return fallbackClient
    }
    
    throw error
  }
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createMongoConnection()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = createMongoConnection()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise
