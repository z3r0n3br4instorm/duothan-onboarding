import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import crypto from "crypto"

// Function to generate a unique team code
function generateTeamCode(): string {
  return crypto.randomBytes(5).toString('base64')
    .replace(/[+/=]/g, '') // Remove non-alphanumeric characters
    .toLowerCase()
    .substring(0, 9) // Get first 9 characters for consistent length
}

// Register team with team code
export async function POST(request: NextRequest) {
  try {
    const { teamData } = await request.json()

    // Validate required fields
    if (!teamData.teamName) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    if (!teamData.phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    if (!teamData.members || !Array.isArray(teamData.members)) {
      return NextResponse.json({ error: "Team members data is required" }, { status: 400 })
    }

    // Check if all members have complete information
    for (const member of teamData.members) {
      if (!member.fullName || !member.email || !member.gender || !member.foodPreference) {
        return NextResponse.json({ 
          error: "All members must have complete information (full name, email, gender, food preference)" 
        }, { status: 400 })
      }
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("duothan")
    const teamsCollection = db.collection("teams")
    const teamCodesCollection = db.collection("team_codes")

    // Check for duplicate team
    const existingTeam = await teamsCollection.findOne({
      "teamData.teamName": teamData.teamName
    })

    if (existingTeam) {
      return NextResponse.json({ error: "A team with this name is already registered" }, { status: 409 })
    }

    // Generate a unique team code
    let teamCode;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      teamCode = generateTeamCode();
      // Check if code already exists
      const existingCode = await teamCodesCollection.findOne({ code: teamCode });
      if (!existingCode) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Failed to generate unique team code" }, { status: 500 })
    }

    // Create team code document
    const teamCodeDoc = {
      code: teamCode,
      isRegistered: true,
      createdAt: new Date(),
      teamId: null
    }

    const teamCodeResult = await teamCodesCollection.insertOne(teamCodeDoc)

    // Create team registration document
    const registration = {
      teamData: {
        ...teamData
      },
      teamCode,
      registrationDate: new Date(),
      status: "registered"
    }

    const teamResult = await teamsCollection.insertOne(registration)

    // Update team code document with team ID
    await teamCodesCollection.updateOne(
      { _id: teamCodeResult.insertedId },
      { $set: { teamId: teamResult.insertedId } }
    )

    return NextResponse.json({
      success: true,
      teamId: teamResult.insertedId,
      teamCode,
      message: "Team registered successfully"
    })
    
  } catch (error: any) {
    console.error("Team registration error:", error)
    return NextResponse.json({ 
      error: "Registration failed", 
      details: error.message 
    }, { status: 500 })
  }
}
