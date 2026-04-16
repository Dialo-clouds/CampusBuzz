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
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await prisma.submission.findMany({
      include: {
        assignment: {
          include: { course: true }
        },
        user: true
      },
      orderBy: { submittedAt: 'desc' }
    });

    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}