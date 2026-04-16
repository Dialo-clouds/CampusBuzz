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
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users except current user
    const users = await prisma.user.findMany({
      where: {
        id: { not: user.id }
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Users error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}