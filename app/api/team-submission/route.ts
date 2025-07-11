import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Check if the request is multipart/form-data or JSON
    const contentType = req.headers.get('content-type');
    
    let teamCode, questionType, explanation, files, submittedAt;
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle multipart/form-data submission
      const formData = await req.formData();
      teamCode = formData.get('teamCode') as string;
      questionType = parseInt(formData.get('questionType') as string);
      explanation = formData.get('explanation') as string;
      
      // Get files from form data
      const uploadedFiles = formData.getAll('files');
      files = await Promise.all(
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
      
      submittedAt = new Date();
    } else {
      // Handle JSON submission
      const body = await req.json();
      teamCode = body.teamCode;
      questionType = body.questionType;
      explanation = body.explanation;
      files = body.files || [];
      submittedAt = body.submittedAt ? new Date(body.submittedAt) : new Date();
    }

    if (!teamCode || questionType === undefined || questionType === null) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

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
            ...existingSubmission,
            _id: undefined
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
      files: files || [], // Store the entire file objects including content
      fileNames: files ? files.map((file: any) => file.name) : [], // Keep fileNames for backward compatibility
      submittedAt: submittedAt,
    };

    await submissionsCollection.insertOne(submissionData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating team submission:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create team submission" },
      { status: 500 }
    );
  }
}

// Get submissions for a team
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const teamCode = url.searchParams.get("teamCode");
    const includeFileContent = url.searchParams.get("includeFileContent") === "true";

    if (!teamCode) {
      return NextResponse.json(
        { success: false, error: "Team code is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("duothan");
    const submissionsCollection = db.collection("team_submissions");

    // Find submissions for this team
    const submissions = await submissionsCollection
      .find({ teamCode: teamCode.toLowerCase() })
      .toArray();

    if (submissions.length === 0) {
      return NextResponse.json({ success: true, submissions: [] });
    }

    return NextResponse.json({ 
      success: true, 
      submissions: submissions.map(doc => {
        // Create result with the basic fields
        const result: Record<string, any> = {
          id: doc._id.toString(),
          teamCode: doc.teamCode,
          questionType: doc.questionType,
          explanation: doc.explanation,
          fileNames: doc.fileNames || [],
          submittedAt: doc.submittedAt
        };

        // Only include file content when explicitly requested
        if (includeFileContent && doc.files) {
          result.files = doc.files;
        }

        return result;
      })
    });
  } catch (error) {
    console.error("Error fetching team submissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team submissions" },
      { status: 500 }
    );
  }
}
