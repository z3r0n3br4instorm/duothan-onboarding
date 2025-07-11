import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Check if a team has already submitted
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamCode = searchParams.get('teamCode');
    
    if (!teamCode) {
      return NextResponse.json({ 
        success: false,
        error: "Team code is required" 
      }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("duothan");
    const sessionCollection = db.collection("onboarding_session");
    const submissionsCollection = db.collection("team_submissions");

    // Check if the session exists and is completed
    const session = await sessionCollection.findOne({ 
      teamCode: teamCode.toLowerCase(),
    });

    if (!session) {
      return NextResponse.json({ 
        success: false,
        error: "No session found for this team" 
      }, { status: 404 });
    }

    // Check if there's a submission
    const submission = await submissionsCollection.findOne({
      teamCode: teamCode.toLowerCase()
    });

    // Check if the submission has file content
    const hasFileContent = submission && (
      (submission.files && Array.isArray(submission.files) && submission.files.length > 0) || 
      (submission.fileNames && Array.isArray(submission.fileNames) && submission.fileNames.length > 0)
    );

    return NextResponse.json({
      success: true,
      hasSubmission: !!submission,
      hasFileContent: !!hasFileContent,
      sessionCompleted: session.isCompleted || false,
      questionType: session.questionType
    });
    
  } catch (error: any) {
    console.error("Check submission error:", error);
    return NextResponse.json({ 
      success: false,
      error: "Server error checking submission status", 
      details: error.message 
    }, { status: 500 });
  }
}
