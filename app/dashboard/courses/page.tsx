"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  instructor: string;
  credits: number;
  capacity: number;
  enrolled: number;
}

export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        fetchData();
      }
    };
    checkUser();
  }, [router]);

  async function fetchData() {
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/enrolled")
      ]);

      const coursesData = await coursesRes.json();
      const enrollmentsData = await enrollmentsRes.json();

      setCourses(Array.isArray(coursesData) ? coursesData : []);
      
      const enrolledIds = new Set(
        (Array.isArray(enrollmentsData) ? enrollmentsData : []).map(
          (enrollment: any) => enrollment.courseId
        )
      );
      setEnrolledCourseIds(enrolledIds);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function enrollInCourse(courseId: string, courseTitle: string) {
    setEnrolling(courseId);
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        alert("You must be logged in to enroll");
        setEnrolling(null);
        return;
      }
      
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ courseId }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(`✅ Successfully enrolled in ${courseTitle}!`);
        fetchData();
      } else {
        alert(`❌ ${data.error || "Failed to enroll"}`);
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("❌ Error enrolling. Please try again.");
    } finally {
      setEnrolling(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <div className="w-16 h-16 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const availableCourses = courses.filter(course => !enrolledCourseIds.has(course.id));
  const myCourses = courses.filter(course => enrolledCourseIds.has(course.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">My Learning</h1>

        {/* My Courses Section */}
        {myCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📚</span> My Courses ({myCourses.length})
            </h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {myCourses.map((course) => (
                <div key={course.id} className="bg-emerald-600/10 rounded-2xl p-6 border border-emerald-500/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{course.title}</h3>
                      <p className="text-purple-400 text-sm">{course.code}</p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
                      Enrolled ✓
                    </span>
                  </div>
                  <p className="text-white/60 text-sm my-2">{course.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-white/60">👨‍🏫 {course.instructor}</span>
                    <span className="text-white/60">📚 {course.credits} credits</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Courses Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📖</span> Available Courses ({availableCourses.length})
          </h2>
          
          {availableCourses.length === 0 ? (
            <div className="bg-white/10 rounded-2xl p-12 text-center">
              <p className="text-white/60">You're enrolled in all available courses!</p>
              <p className="text-white/40 text-sm mt-2">Check back later for new courses.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {availableCourses.map((course) => (
                <div key={course.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                  <h3 className="text-xl font-semibold text-white">{course.title}</h3>
                  <p className="text-purple-400 text-sm">{course.code}</p>
                  <p className="text-white/60 text-sm my-2">{course.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-white/60">👨‍🏫 {course.instructor}</span>
                    <span className="text-white/60">📚 {course.credits} credits</span>
                  </div>
                  <button
                    onClick={() => enrollInCourse(course.id, course.title)}
                    disabled={enrolling === course.id}
                    className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-2 rounded-xl font-semibold disabled:opacity-50 transition-all"
                  >
                    {enrolling === course.id ? "Enrolling..." : "Enroll Now"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}