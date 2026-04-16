"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Submission {
  id: string;
  content: string;
  fileUrl: string;
  grade: number | null;
  feedback: string | null;
  submittedAt: string;
  assignment: {
    title: string;
    totalPoints: number;
    course: { title: string };
  };
  user: { name: string; email: string };
}

export default function AdminGradesPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        fetchSubmissions();
      }
    };
    checkAdmin();
  }, [router]);

  async function fetchSubmissions() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/admin/submissions", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateGrade(submissionId: string, grade: number, feedback: string) {
    setSaving(submissionId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ submissionId, grade, feedback }),
      });
      
      if (res.ok) {
        alert("Grade saved successfully!");
        fetchSubmissions();
      } else {
        alert("Failed to save grade");
      }
    } catch (error) {
      alert("Error saving grade");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <div className="w-16 h-16 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.grade === null);
  const gradedSubmissions = submissions.filter(s => s.grade !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Grade Submissions</h1>

        {pendingSubmissions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Pending ({pendingSubmissions.length})</h2>
            <div className="space-y-6">
              {pendingSubmissions.map((sub) => (
                <div key={sub.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{sub.assignment.title}</h3>
                      <p className="text-purple-400">{sub.assignment.course.title}</p>
                      <p className="text-white/60 text-sm mt-1">
                        Student: {sub.user.name || sub.user.email}
                      </p>
                      <p className="text-white/60 text-sm">
                        Submitted: {new Date(sub.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <p className="text-white/80">{sub.content || "No text submission"}</p>
                    {sub.fileUrl && (
                      <a 
                        href={sub.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 text-sm hover:underline inline-block mt-2"
                      >
                        View Attached File
                      </a>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-1">
                        Grade (out of {sub.assignment.totalPoints})
                      </label>
                      <input
                        type="number"
                        id={`grade-${sub.id}`}
                        defaultValue={sub.grade || ""}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-sm mb-1">Feedback</label>
                      <input
                        type="text"
                        id={`feedback-${sub.id}`}
                        defaultValue={sub.feedback || ""}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      const gradeInput = document.getElementById(`grade-${sub.id}`) as HTMLInputElement;
                      const feedbackInput = document.getElementById(`feedback-${sub.id}`) as HTMLInputElement;
                      const grade = parseInt(gradeInput.value);
                      const feedback = feedbackInput.value;
                      if (!isNaN(grade)) {
                        updateGrade(sub.id, grade, feedback);
                      } else {
                        alert("Please enter a valid grade");
                      }
                    }}
                    disabled={saving === sub.id}
                    className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {saving === sub.id ? "Saving..." : "Save Grade"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {gradedSubmissions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Graded ({gradedSubmissions.length})</h2>
            <div className="space-y-4">
              {gradedSubmissions.map((sub) => {
                const percentage = Math.round((sub.grade! / sub.assignment.totalPoints) * 100);
                return (
                  <div key={sub.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{sub.assignment.title}</h3>
                        <p className="text-purple-400">{sub.assignment.course.title}</p>
                        <p className="text-white/60 text-sm mt-1">
                          Student: {sub.user.name || sub.user.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-semibold">
                          {sub.grade}/{sub.assignment.totalPoints}
                        </span>
                        <p className="text-2xl font-bold text-emerald-400">{percentage}%</p>
                      </div>
                    </div>
                    {sub.feedback && (
                      <div className="mt-3 p-3 bg-white/5 rounded-lg">
                        <p className="text-white/40 text-xs">Feedback:</p>
                        <p className="text-white/80 text-sm">&quot;{sub.feedback}&quot;</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {submissions.length === 0 && (
          <div className="bg-white/10 rounded-2xl p-12 text-center">
            <p className="text-white/60">No submissions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}