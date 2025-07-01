import { NextRequest, NextResponse } from "next/server"
import { checkMongoConnection, testDatabaseOperations } from "@/lib/mongodb-health"

export async function GET(request: NextRequest) {
  try {
    console.log('Starting database health check...')
    
    // Check basic connection
    const connectionResult = await checkMongoConnection()
    
    if (!connectionResult.connected) {
      return NextResponse.json({
        status: 'unhealthy',
        connection: connectionResult,
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }
    
    // Test database operations
    const operationsResult = await testDatabaseOperations()
    
    const healthStatus = {
      status: connectionResult.connected && operationsResult.canRead && operationsResult.canWrite 
        ? 'healthy' 
        : 'degraded',
      connection: connectionResult,
      operations: operationsResult,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      mongoUri: process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') // Hide credentials
    }
    
    console.log('Database health check completed:', healthStatus)
    
    return NextResponse.json(healthStatus, { 
      status: healthStatus.status === 'healthy' ? 200 : 206 
    })
    
  } catch (error: any) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
