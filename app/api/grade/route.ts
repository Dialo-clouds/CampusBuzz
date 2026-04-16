import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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
    if (error || !user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId, grade, feedback } = await request.json();

    // Update the submission
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: { 
        grade: Number(grade),
        feedback: feedback || null
      },
      include: {
        assignment: true,
        user: true
      }
    });

    // Send email notification to student
    if (submission.user?.email) {
      const percentage = Math.round((grade / submission.assignment.totalPoints) * 100);
      const gradeColor = percentage >= 70 ? "#28a745" : "#dc3545";
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Assignment Graded! 🎓</h1>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <p>Hello ${submission.user.name || "Student"},</p>
            <p>Your assignment <strong>"${submission.assignment.title}"</strong> has been graded!</p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <p style="font-size: 24px;">Score: <strong>${grade}/${submission.assignment.totalPoints}</strong></p>
              <p style="font-size: 18px; color: ${gradeColor};">${percentage}%</p>
            </div>
            ${feedback ? `<p><strong>Feedback:</strong> "${feedback}"</p>` : ""}
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/assignments" 
               style="display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              View Assignment
            </a>
          </div>
          <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>&copy; 2024 CampusConnect. All rights reserved.</p>
          </div>
        </div>
      `;

      // Send email using Supabase Auth
      const { error: emailError } = await supabaseAdmin.auth.admin.sendRawEmail({
        email: submission.user.email,
        subject: `📝 Assignment Graded: ${submission.assignment.title}`,
        html: emailHtml,
      });

      if (emailError) {
        console.error("Failed to send email:", emailError);
      } else {
        console.log("Grade email sent to:", submission.user.email);
      }
    }

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    console.error("Grade API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}