"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Users, BookOpen, GraduationCap, Activity, Trash2, Edit, UserCog } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  code: string;
  credits: number;
  enrolled: number;
  capacity: number;
}

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalSubmissions: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        fetchData();
      }
    };
    checkAdmin();
  }, [router]);

  async function fetchData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const [usersRes, coursesRes, statsRes] = await Promise.all([
        fetch("/api/admin/users", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/admin/courses", { headers: { "Authorization": `Bearer ${token}` } }),
        fetch("/api/admin/stats", { headers: { "Authorization": `Bearer ${token}` } }),
      ]);

      const usersData = await usersRes.json();
      const coursesData = await coursesRes.json();
      const statsData = await statsRes.json();

      setUsers(Array.isArray(usersData) ? usersData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert("Failed to delete user");
    }
  }

  async function changeUserRole(userId: string, newRole: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      await fetch(`/api/admin/users/role?id=${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole }),
      });
      fetchData();
    } catch (error) {
      alert("Failed to change role");
    }
  }

  async function deleteCourse(courseId: string) {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      await fetch(`/api/admin/courses?id=${courseId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert("Failed to delete course");
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
    { icon: Users, label: "Total Users", value: stats.totalUsers, color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: BookOpen, label: "Total Courses", value: stats.totalCourses, color: "text-purple-400", bg: "bg-purple-500/10" },
    { icon: GraduationCap, label: "Enrollments", value: stats.totalEnrollments, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: Activity, label: "Submissions", value: stats.totalSubmissions, color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-white/60 mb-8">Manage users, courses, and monitor activity</p>

        {/* Stats Cards */}
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

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === "overview" ? "bg-purple-600 text-white" : "text-white/60 hover:text-white"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === "users" ? "bg-purple-600 text-white" : "text-white/60 hover:text-white"}`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === "courses" ? "bg-purple-600 text-white" : "text-white/60 hover:text-white"}`}
          >
            Courses ({courses.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
              <div className="space-y-3">
                {users.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5">
                    <div>
                      <p className="text-white font-medium">{u.name || "No name"}</p>
                      <p className="text-white/40 text-sm">{u.email}</p>
                    </div>
                    <span className="text-xs text-white/40">{new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Popular Courses</h3>
              <div className="space-y-3">
                {courses.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5">
                    <div>
                      <p className="text-white font-medium">{c.title}</p>
                      <p className="text-white/40 text-sm">{c.code}</p>
                    </div>
                    <span className="text-xs text-emerald-400">{c.enrolled}/{c.capacity} enrolled</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10 border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-white/60">Name</th>
                    <th className="text-left p-4 text-white/60">Email</th>
                    <th className="text-left p-4 text-white/60">Role</th>
                    <th className="text-left p-4 text-white/60">Joined</th>
                    <th className="text-left p-4 text-white/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-white">{u.name || "-"}</td>
                      <td className="p-4 text-white/80">{u.email}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => changeUserRole(u.id, e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm"
                          disabled={u.id === user?.id}
                        >
                          <option value="STUDENT">Student</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="p-4 text-white/60 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <button
                          onClick={() => deleteUser(u.id)}
                          disabled={u.id === user?.id}
                          className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={u.id === user?.id ? "Cannot delete yourself" : "Delete user"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10 border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-white/60">Title</th>
                    <th className="text-left p-4 text-white/60">Code</th>
                    <th className="text-left p-4 text-white/60">Credits</th>
                    <th className="text-left p-4 text-white/60">Enrolled</th>
                    <th className="text-left p-4 text-white/60">Capacity</th>
                    <th className="text-left p-4 text-white/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-white">{c.title}</td>
                      <td className="p-4 text-white/80">{c.code}</td>
                      <td className="p-4 text-white/80">{c.credits}</td>
                      <td className="p-4 text-emerald-400">{c.enrolled}</td>
                      <td className="p-4 text-white/80">{c.capacity}</td>
                      <td className="p-4">
                        <button
                          onClick={() => deleteCourse(c.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}