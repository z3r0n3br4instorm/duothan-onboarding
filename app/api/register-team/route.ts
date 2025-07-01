import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    console.log('Attempting to fetch teams from MongoDB')
    const client = await clientPromise
    
    // Test the connection
    await client.db('admin').command({ ping: 1 })
    
    const db = client.db("duothan")
    const teamsCollection = db.collection("teams")

    const teams = await teamsCollection.find({}).sort({ registrationDate: -1 }).toArray()
    console.log(`Successfully fetched ${teams.length} teams`)

    return NextResponse.json({
      success: true,
      count: teams.length,
      teams: teams.map(team => ({
        _id: team._id,
        teamData: {
          teamName: team.teamData.teamName,
          teamEmail: team.teamData.teamEmail,
          memberNames: team.teamData.members.map((member: any) => member.fullName).filter(Boolean)
        },
        registrationDate: team.registrationDate,
        status: team.status
      }))
    })
  } catch (error: any) {
    console.error("Error fetching teams:", {
      message: error.message,
      code: error.code,
      type: error.constructor.name
    })
    
    if (error.message?.includes('SSL') || error.message?.includes('TLS')) {
      return NextResponse.json({ 
        error: "Database SSL connection failed",
        details: "SSL_CONNECTION_ERROR"
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: "Failed to fetch teams",
      details: "DATABASE_ERROR"
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { teamData, submissions } = await request.json()

    // Validate required fields
    if (!teamData.teamName || !teamData.teamEmail) {
      return NextResponse.json({ error: "Team name and email are required" }, { status: 400 })
    }

    if (!teamData.contactNumber || !teamData.university) {
      return NextResponse.json({ error: "Contact number and university are required" }, { status: 400 })
    }

    if (!teamData.members || !Array.isArray(teamData.members)) {
      return NextResponse.json({ error: "Team members data is required" }, { status: 400 })
    }

    // Check if at least 2 members have complete information
    const completeMembersCount = teamData.members.filter((member: any) => 
      member.fullName?.trim() && member.email?.trim() && member.foodChoice
    ).length

    if (completeMembersCount < 2) {
      return NextResponse.json({ error: "At least 2 members must have complete information" }, { status: 400 })
    }

    // Connect to MongoDB with enhanced retry logic
    let client;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`MongoDB connection attempt ${retryCount + 1}/${maxRetries}`)
        client = await clientPromise
        
        // Test the connection
        await client.db('admin').command({ ping: 1 })
        console.log('MongoDB connection successful')
        break;
      } catch (connectionError: any) {
        retryCount++;
        console.error(`MongoDB connection attempt ${retryCount} failed:`, {
          error: connectionError.message,
          code: connectionError.code,
          type: connectionError.constructor.name
        });
        
        if (retryCount >= maxRetries) {
          // Provide more specific error information
          if (connectionError.message?.includes('SSL') || connectionError.message?.includes('TLS')) {
            throw new Error(`SSL/TLS connection error: ${connectionError.message}`);
          } else if (connectionError.message?.includes('ENOTFOUND') || connectionError.message?.includes('ECONNREFUSED')) {
            throw new Error(`Network connection error: ${connectionError.message}`);
          } else {
            throw new Error(`MongoDB connection failed after ${maxRetries} attempts: ${connectionError.message}`);
          }
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!client) {
      throw new Error('Failed to establish MongoDB connection');
    }

    const db = client.db("duothan")
    const teamsCollection = db.collection("teams")

    // Check for duplicate team
    const existingTeam = await teamsCollection.findOne({
      $or: [
        { "teamData.teamName": { $regex: new RegExp(`^${teamData.teamName}$`, "i") } },
        { "teamData.teamEmail": { $regex: new RegExp(`^${teamData.teamEmail}$`, "i") } },
      ],
    })

    if (existingTeam) {
      return NextResponse.json({ error: "A team with this name or email is already registered" }, { status: 409 })
    }

    const registration = {
      teamData: {
        ...teamData,
        // Filter out incomplete members (those without name, email, or food choice)
        members: teamData.members.filter((member: any) => 
          member.fullName?.trim() && member.email?.trim() && member.foodChoice
        ),
      },
      submissions,
      registrationDate: new Date(),
      status: "registered",
    }

    const result = await teamsCollection.insertOne(registration)

    return NextResponse.json({
      success: true,
      teamId: result.insertedId,
      message: "Team registered successfully",
    })
  } catch (error: any) {
    console.error("Registration error:", {
      message: error.message,
      code: error.code,
      type: error.constructor.name,
      stack: error.stack
    })
    
    // Provide more specific error messages based on error type
    if (error.message?.includes('SSL') || error.message?.includes('TLS')) {
      return NextResponse.json({ 
        error: "Database SSL connection failed. Please contact support if this persists.",
        details: "SSL_CONNECTION_ERROR"
      }, { status: 503 })
    }
    
    if (error.message?.includes('MongoServerSelectionError') || error.message?.includes('ENOTFOUND')) {
      return NextResponse.json({ 
        error: "Unable to reach database server. Please try again in a moment.",
        details: "CONNECTION_ERROR"
      }, { status: 503 })
    }
    
    if (error.message?.includes('timeout')) {
      return NextResponse.json({ 
        error: "Request timed out. Please try again.",
        details: "TIMEOUT_ERROR"
      }, { status: 408 })
    }
    
    if (error.message?.includes('authentication') || error.message?.includes('auth')) {
      return NextResponse.json({ 
        error: "Database authentication failed. Please contact support.",
        details: "AUTH_ERROR"
      }, { status: 503 })
    }
    
    return NextResponse.json({ 
      error: "Internal server error during registration. Please try again.",
      details: "INTERNAL_ERROR"
    }, { status: 500 })
  }
}
