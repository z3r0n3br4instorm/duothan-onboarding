import clientPromise from './mongodb'

export async function checkMongoConnection(): Promise<{ 
  connected: boolean; 
  error?: string; 
  latency?: number 
}> {
  try {
    const startTime = Date.now()
    const client = await clientPromise
    
    // Test the connection with a ping
    await client.db('admin').command({ ping: 1 })
    
    const latency = Date.now() - startTime
    
    return {
      connected: true,
      latency
    }
  } catch (error: any) {
    console.error('MongoDB health check failed:', error)
    
    return {
      connected: false,
      error: error.message || 'Unknown connection error'
    }
  }
}

export async function testDatabaseOperations(): Promise<{
  canRead: boolean;
  canWrite: boolean;
  error?: string;
}> {
  try {
    const client = await clientPromise
    const db = client.db('duothan')
    const testCollection = db.collection('health-check')
    
    // Test write operation
    const testDoc = { 
      test: true, 
      timestamp: new Date(),
      _id: 'health-check-' + Date.now()
    }
    
    await testCollection.insertOne(testDoc)
    
    // Test read operation
    const found = await testCollection.findOne({ _id: testDoc._id })
    
    // Clean up
    await testCollection.deleteOne({ _id: testDoc._id })
    
    return {
      canRead: !!found,
      canWrite: true
    }
  } catch (error: any) {
    console.error('Database operations test failed:', error)
    
    return {
      canRead: false,
      canWrite: false,
      error: error.message || 'Unknown database error'
    }
  }
}
