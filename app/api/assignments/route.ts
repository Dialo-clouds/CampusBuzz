import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    console.log("Auth header present:", !!authHeader);
    
    if (!token) {
      console.log("No token provided");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      console.log("User not found:", error?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log("User found:", user.id);

    // Get user's enrolled courses
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: { course: true }
    });

    const courseIds = enrollments.map(e => e.courseId);
    console.log("Enrolled course IDs:", courseIds);
    
    // If user is not enrolled in any courses, return empty array
    if (courseIds.length === 0) {
      console.log("No enrolled courses");
      return NextResponse.json([]);
    }
    
    // Get assignments for enrolled courses
    const assignments = await prisma.assignment.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: true },
      orderBy: { dueDate: 'asc' }
    });

    console.log("Assignments found:", assignments.length);

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Assignments error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}