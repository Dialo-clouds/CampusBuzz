"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, ClipboardList, MessageSquare, Settings, BarChart3, LayoutDashboard, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Fetch user role from database
        try {
          const res = await fetch("/api/user-role", {
            headers: { "Authorization": `Bearer ${session.access_token}` }
          });
          const data = await res.json();
          console.log("User role:", data.role);
          setIsAdmin(data.role === "ADMIN");
        } catch (err) {
          console.error("Failed to get role:", err);
        }
      }
      setLoading(false);
    };
    getUser();
  }, []);

  // Don't show navbar on login/register pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Courses", href: "/dashboard/courses" },
    { icon: ClipboardList, label: "Assignments", href: "/dashboard/assignments" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  console.log("Is Admin:", isAdmin); // Debug log

  return (
    <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-white font-semibold hidden sm:inline">CampusConnect</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isActive ? "bg-purple-600/20 text-purple-400" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
          {/* Admin Link - Only visible when isAdmin is true */}
          {isAdmin && (
            <Link href="/admin">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${pathname === "/admin" ? "bg-purple-600/20 text-purple-400" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm">Admin</span>
              </div>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">{user.user_metadata?.name?.split(" ")[0] || user.email?.split("@")[0] || "User"}</p>
              <p className="text-white/40 text-xs">{isAdmin ? "ADMIN" : "STUDENT"}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <button onClick={handleLogout} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}