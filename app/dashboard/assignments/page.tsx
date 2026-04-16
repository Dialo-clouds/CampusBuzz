"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  course: {
    title: string;
    code: string;
  };
}

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        fetchAssignments();
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  async function fetchAssignments() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const token = session.access_token;
      
      const res = await fetch("/api/assignments", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await res.json();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  }

  async function submitAssignmentWithFile(assignmentId: string, formData: FormData) {
    setSubmitting(assignmentId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/assignments/submit", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (res.ok) {
        alert("✅ Assignment submitted successfully!");
        setShowModal(false);
        fetchAssignments();
      } else {
        const data = await res.json();
        alert(`❌ ${data.error || "Failed to submit"}`);
      }
    } catch (error) {
      alert("❌ Error submitting assignment");
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <div className="w-16 h-16 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Assignments</h1>

        {assignments.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-12 text-center">
            <p className="text-white/60">No assignments yet.</p>
            <p className="text-white/40 text-sm mt-2">Enroll in courses to see assignments.</p>
            <Link href="/dashboard/courses" className="inline-block mt-4 text-purple-400 hover:text-purple-300">
              Browse Courses →
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                <h3 className="text-xl font-semibold text-white">{assignment.title}</h3>
                <p className="text-purple-400 text-sm">{assignment.course.title} ({assignment.course.code})</p>
                <p className="text-white/60 text-sm my-2">{assignment.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-white/60">📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  <span className="text-white/60">⭐ {assignment.totalPoints} pts</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowModal(true);
                  }}
                  className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-xl font-semibold transition-all"
                >
                  Submit Assignment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Modal with File Upload */}
      {showModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-2">Submit Assignment</h2>
            <p className="text-purple-400 mb-4">{selectedAssignment.title}</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              formData.append("assignmentId", selectedAssignment.id);
              await submitAssignmentWithFile(selectedAssignment.id, formData);
            }}>
              <div className="mb-4">
                <label className="block text-white mb-2">Text Submission (optional)</label>
                <textarea
                  name="content"
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500"
                  placeholder="Write your submission here..."
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-white mb-2">Or Upload File</label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png,.zip"
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
                <p className="text-white/40 text-xs mt-2">Accepted: PDF, DOC, DOCX, TXT, JPG, PNG, ZIP (Max 10MB)</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting === selectedAssignment.id}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl font-semibold disabled:opacity-50"
                >
                  {submitting === selectedAssignment.id ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}