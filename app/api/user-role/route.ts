import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Get the auth token from the request headers
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ role: "STUDENT" });
    }
    
    // Get user from Supabase using the token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ role: "STUDENT" });
    }
    
    // Get user role from Prisma database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });
    
    return NextResponse.json({ role: dbUser?.role || "STUDENT" });
  } catch (error) {
    console.error("User role error:", error);
    return NextResponse.json({ role: "STUDENT" });
  }
}