import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { id, email, name } = await request.json();

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        email,
        name: name || email?.split('@')[0],
      },
      create: {
        id,
        email,
        name: name || email?.split('@')[0],
        password: "supabase-managed",
        role: "STUDENT",
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Sync user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}