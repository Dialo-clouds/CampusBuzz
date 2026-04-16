import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Get all users from Supabase Auth
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let synced = 0;
    let failed = 0;

    // Sync each user to Prisma
    for (const supabaseUser of users) {
      try {
        await prisma.user.upsert({
          where: { id: supabaseUser.id },
          update: {
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
          },
          create: {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
            password: "supabase-managed",
            role: "STUDENT",
          },
        });
        synced++;
      } catch (err) {
        console.error("Failed to sync user:", supabaseUser.email, err);
        failed++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      synced, 
      failed,
      message: `Synced ${synced} users, ${failed} failed` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}