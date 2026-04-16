import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // For now, return empty array - we'll fix auth later
    const enrollments = await prisma.enrollment.findMany({
      take: 100,
      include: { course: true }
    });
    
    return NextResponse.json(enrollments);
  } catch (error: any) {
    console.error("Enrolled API error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}