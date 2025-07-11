import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Validate teamcode endpoint
export async function POST(request: NextRequest) {
  try {
    const { teamCode } = await request.json()
    
    if (!teamCode || typeof teamCode !== 'string') {
      return NextResponse.json({ 
        valid: false,
        error: "Invalid team code format" 
      }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("duothan")
    const teamCodesCollection = db.collection("team_codes")

    // Check if team code exists
    const teamCodeDoc = await teamCodesCollection.findOne({ code: teamCode.toLowerCase() })

    if (!teamCodeDoc) {
      return NextResponse.json({ 
        valid: false,
        error: "Invalid team code" 
      }, { status: 404 })
    }

    // Check if team is already registered
    if (teamCodeDoc.isRegistered) {
      return NextResponse.json({ 
        valid: true,
        isRegistered: true,
        message: "Team code is valid and already registered",
        teamCode: teamCodeDoc
      })
    }

    return NextResponse.json({
      valid: true,
      isRegistered: false,
      message: "Team code is valid",
      teamCode: teamCodeDoc
    })
    
  } catch (error: any) {
    console.error("Team code validation error:", error)
    return NextResponse.json({ 
      valid: false,
      error: "Server error during validation", 
      details: error.message 
    }, { status: 500 })
  }
}
