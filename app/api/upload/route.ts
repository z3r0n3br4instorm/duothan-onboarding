import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const teamCode = formData.get('teamCode') as string;
    const questionType = parseInt(formData.get('questionType') as string);
    const explanation = formData.get('explanation') as string;
    
    // Validate required fields
    if (!teamCode || isNaN(questionType)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Get files from form data
    const uploadedFiles = formData.getAll('files');
    const files = await Promise.all(
      uploadedFiles.map(async (file) => {
        const f = file as File;
        const buffer = await f.arrayBuffer();
        
        return {
          name: f.name,
          type: f.type,
          size: f.size,
          content: Buffer.from(buffer).toString('base64'),
          lastModified: f.lastModified
        };
      })
    );
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("duothan");
    const submissionsCollection = db.collection("team_submissions");

    // Check if a submission already exists for this team
    const existingSubmission = await submissionsCollection.findOne({ 
      teamCode: teamCode.toLowerCase() 
    });
    
    if (existingSubmission) {
      // A submission already exists - return the existing submission along with error
      return NextResponse.json(
        { 
          success: false, 
          error: "A submission already exists for this team",
          existingSubmission: {
            id: existingSubmission._id.toString(),
            teamCode: existingSubmission.teamCode,
            questionType: existingSubmission.questionType,
            explanation: existingSubmission.explanation,
            fileNames: existingSubmission.fileNames || [],
            submittedAt: existingSubmission.submittedAt
          }
        },
        { status: 409 }
      );
    }

    // Create a new submission with file content
    const submissionData = {
      teamCode: teamCode.toLowerCase(),
      questionType,
      explanation: explanation || "",
      files, // Store the entire file objects including content
      fileNames: files.map(file => file.name), // Keep fileNames for backward compatibility
      submittedAt: new Date(),
    };

    await submissionsCollection.insertOne(submissionData);

    return NextResponse.json({ 
      success: true,
      message: "Submission with files saved successfully" 
    });
  } catch (error: any) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to upload files",
        details: error.message || "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// Increase the maximum request body size for this route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
