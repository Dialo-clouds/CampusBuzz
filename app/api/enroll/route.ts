import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

// Initialize Supabase client with service role for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Get the session from the request headers
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }
    
    // Verify the token with Supabase
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { courseId } = await request.json();
    const userId = user.id;

    console.log("Enrolling user:", userId, "in course:", courseId);

    // Check if user exists in Prisma, if not create them
    let dbUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          email: user.email,
          name: user.user_metadata?.name || null,
          password: "supabase-managed",
          role: "STUDENT",
        }
      });
      console.log("Created user in Prisma:", dbUser.id);
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findFirst({
      where: { userId, courseId }
    });

    if (existing) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 400 });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: "ACTIVE",
        progress: 0,
      }
    });

    console.log("Enrollment created:", enrollment.id);
    return NextResponse.json({ success: true, enrollment });
  } catch (error: any) {
    console.error("Enrollment error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}