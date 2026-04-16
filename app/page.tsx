"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <div className="w-16 h-16 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-white/90">Next Generation Learning Platform</span>
        </div>
        <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
          CampusConnect
        </h1>
        <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
          Transform your educational experience with AI-powered learning, real-time collaboration, and personalized insights.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/login">
            <button className="border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}