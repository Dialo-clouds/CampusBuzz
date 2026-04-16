import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany();
    console.log("Courses found:", courses.length);
    return NextResponse.json(courses);
  } catch (error: any) {
    console.error("Courses API error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}