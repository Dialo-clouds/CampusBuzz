"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { TrendingUp, BookOpen, Award, Clock, CheckCircle } from "lucide-react";

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedAssignments: 0,
    averageGrade: 0,
    studyHours: 0,
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        fetchStats();
      }
    };
    checkUser();
  }, [router]);

  async function fetchStats() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/analytics", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <div className="w-16 h-16 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { icon: BookOpen, label: "Enrolled Courses", value: stats.enrolledCourses, color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: CheckCircle, label: "Completed Assignments", value: stats.completedAssignments, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: TrendingUp, label: "Average Grade", value: `${stats.averageGrade}%`, color: "text-purple-400", bg: "bg-purple-500/10" },
    { icon: Clock, label: "Study Hours", value: stats.studyHours, color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Learning Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className={`p-3 rounded-xl ${stat.bg} w-fit mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-white/60 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Learning Progress</h2>
          <p className="text-white/60">Complete more courses to see detailed analytics here.</p>
        </div>
      </div>
    </div>
  );
}