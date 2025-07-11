import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Start or retrieve an onboarding session
export async function POST(request: NextRequest) {
  try {
    const { teamCode, questionType, forceRestart } = await request.json()
    
    if (!teamCode || typeof teamCode !== 'string') {
      return NextResponse.json({ 
        success: false,
        error: "Invalid team code format" 
      }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("duothan")
    const sessionCollection = db.collection("onboarding_session")
    const teamCodesCollection = db.collection("team_codes")

    // Check if team code exists and is registered
    const teamCodeDoc = await teamCodesCollection.findOne({ code: teamCode.toLowerCase() })

    if (!teamCodeDoc || !teamCodeDoc.isRegistered) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid or unregistered team code" 
      }, { status: 404 })
    }

    // Check if a session already exists for this team
    const existingSession = await sessionCollection.findOne({ teamCode: teamCode.toLowerCase() })

    // If forceRestart is true, we'll create a new session regardless of existing one
    if (existingSession && !forceRestart) {
      // Check if session is still valid (within 12 hours)
      const sessionStart = new Date(existingSession.startTime)
      const currentTime = new Date()
      const timeDifferenceMs = currentTime.getTime() - sessionStart.getTime()
      const hoursDifference = timeDifferenceMs / (1000 * 60 * 60)
      
      // If session is still valid and not forcing a restart
      if (hoursDifference <= 12) {
        // If the session already has a submission and not forcing restart
        if (existingSession.isCompleted) {
          return NextResponse.json({ 
            success: false,
            error: "Your team has already completed the onboarding" 
          }, { status: 409 })
        }
        
        // Calculate remaining time only if the session has started
        let remainingTimeMs = 12 * 60 * 60 * 1000; // Default to full time
        if (existingSession.startTime) {
          remainingTimeMs = Math.max(0, 12 * 60 * 60 * 1000 - timeDifferenceMs);
        }
        
        // Return existing session
        return NextResponse.json({
          success: true,
          session: {
            ...existingSession,
            remainingTimeMs: remainingTimeMs
          }
        })
      }
      
      // Session is expired, continue to create a new session
    }
    
    // If we're here, either there's no existing session, the session has expired, 
    // or forceRestart is true - delete any existing session
    if (existingSession) {
      await sessionCollection.deleteOne({ teamCode: teamCode.toLowerCase() })
    }

    // Create a new session - if questionType is provided, start the session timer
    // Otherwise, just create a placeholder session without starting the timer
    const session = {
      teamCode: teamCode.toLowerCase(),
      teamId: teamCodeDoc.teamId,
      questionType: questionType || null,
      startTime: questionType !== null ? new Date() : null, // Only set start time if question is selected
      endTime: null,
      isCompleted: false
    }

    const result = await sessionCollection.insertOne(session)

    return NextResponse.json({
      success: true,
      session: {
        ...session,
        _id: result.insertedId,
        // Always provide the full 12 hours, the frontend will handle the timing logic
        remainingTimeMs: 12 * 60 * 60 * 1000
      }
    })
    
  } catch (error: any) {
    console.error("Session creation error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Server error during session creation", 
      details: error.message 
    }, { status: 500 })
  }
}

// Endpoint to update session with chosen question type
export async function PUT(request: NextRequest) {
  try {
    const { teamCode, questionType, isCompleted } = await request.json()
    
    if (!teamCode || typeof teamCode !== 'string' || (questionType === undefined && isCompleted === undefined)) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid request parameters" 
      }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("duothan")
    const sessionCollection = db.collection("onboarding_session")

    // Find the existing session
    const existingSession = await sessionCollection.findOne({ teamCode: teamCode.toLowerCase() });
    
    if (!existingSession) {
      return NextResponse.json({ 
        success: false,
        error: "Session not found" 
      }, { status: 404 });
    }
    
    // If the session hasn't started yet (no start time), set it now
    const updateFields: any = {};
    
    // Only update questionType if it was provided
    if (questionType !== undefined) {
      updateFields.questionType = questionType;
    }
    
    // Set isCompleted flag if provided
    if (isCompleted !== undefined) {
      updateFields.isCompleted = isCompleted;
      // If we're marking as completed, also set the end time
      if (isCompleted === true) {
        updateFields.endTime = new Date();
      }
    }
    
    if (existingSession.startTime === null && questionType !== undefined) {
      updateFields.startTime = new Date();
    }
    
    // Update the session with the new fields
    const result = await sessionCollection.updateOne(
      { teamCode: teamCode.toLowerCase() },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false,
        error: "Session not found" 
      }, { status: 404 });
    }
    
    // Get the updated session to return
    const updatedSession = await sessionCollection.findOne({ teamCode: teamCode.toLowerCase() });
    
    if (!updatedSession) {
      return NextResponse.json({ 
        success: false,
        error: "Failed to retrieve updated session" 
      }, { status: 500 });
    }
    
    // Calculate remaining time only if there's a valid start time
    let remainingTimeMs = 12 * 60 * 60 * 1000; // Default to full 12 hours
    
    if (updatedSession.startTime) {
      const startTime = new Date(updatedSession.startTime);
      const currentTime = new Date();
      const elapsedMs = currentTime.getTime() - startTime.getTime();
      remainingTimeMs = Math.max(0, 12 * 60 * 60 * 1000 - elapsedMs);
    }

    return NextResponse.json({
      success: true,
      message: "Session updated successfully",
      session: {
        ...updatedSession,
        remainingTimeMs
      }
    })
    
  } catch (error: any) {
    console.error("Session update error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Server error during session update", 
      details: error.message 
    }, { status: 500 })
  }
}

// Complete the onboarding session
export async function PATCH(request: NextRequest) {
  try {
    const { teamCode, submission } = await request.json()
    
    if (!teamCode || !submission) {
      return NextResponse.json({ 
        success: false,
        error: "Invalid request parameters" 
      }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("duothan")
    const sessionCollection = db.collection("onboarding_session")
    const submissionCollection = db.collection("submissions")

    // Find the session
    const session = await sessionCollection.findOne({ teamCode: teamCode.toLowerCase() })

    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: "Session not found" 
      }, { status: 404 })
    }

    if (session.isCompleted) {
      return NextResponse.json({ 
        success: false,
        error: "Session is already completed" 
      }, { status: 409 })
    }

    // Save the submission
    const submissionDoc = {
      teamCode: teamCode.toLowerCase(),
      teamId: session.teamId,
      questionType: session.questionType,
      data: submission,
      submittedAt: new Date()
    }

    await submissionCollection.insertOne(submissionDoc)

    // Update the session as completed
    await sessionCollection.updateOne(
      { _id: session._id },
      { 
        $set: { 
          isCompleted: true,
          endTime: new Date()
        } 
      }
    )

    return NextResponse.json({
      success: true,
      message: "Submission received and session completed"
    })
    
  } catch (error: any) {
    console.error("Session completion error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Server error during submission", 
      details: error.message 
    }, { status: 500 })
  }
}
