import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("duothan")
    const teamsCollection = db.collection("teams")

    const teams = await teamsCollection.find({}).sort({ registrationDate: -1 }).toArray()

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
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
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

    const client = await clientPromise
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
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error during registration" }, { status: 500 })
  }
}
