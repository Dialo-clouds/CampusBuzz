import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const assignmentId = formData.get("assignmentId") as string;
    const content = formData.get("content") as string;
    const file = formData.get("file") as File | null;

    let fileUrl = null;

    // Handle file upload
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const timestamp = Date.now();
      const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      await mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, safeFileName);
      await writeFile(filePath, buffer);
      
      fileUrl = `/uploads/${safeFileName}`;
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId: assignmentId,
        userId: user.id,
      },
    });

    if (existingSubmission) {
      return NextResponse.json({ error: "Already submitted" }, { status: 400 });
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId: assignmentId,
        userId: user.id,
        content: content || null,
        fileUrl: fileUrl,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit" }, { status: 500 });
  }
}