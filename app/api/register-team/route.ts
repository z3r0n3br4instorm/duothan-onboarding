import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined")
}

let client: MongoClient | null = null

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI as string)
    await client.connect()
  }
  return client.db("duothan")
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

    const db = await connectToDatabase()
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
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error during registration" }, { status: 500 })
  }
}
