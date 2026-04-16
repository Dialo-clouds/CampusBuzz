"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Bell, Moon, Globe, Shield, User, Save } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    name: "",
    email: "",
    notifications: true,
    darkMode: true,
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        setSettings({
          name: session.user.user_metadata?.name || "",
          email: session.user.email || "",
          notifications: true,
          darkMode: true,
        });
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  async function saveSettings() {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: settings.name,
          notifications: settings.notifications,
        }),
      });

      if (res.ok) {
        alert("✅ Settings saved successfully!");
      } else {
        alert("❌ Failed to save settings");
      }
    } catch (error) {
      alert("❌ Error saving settings");
    } finally {
      setSaving(false);
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
        <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

        <div className="max-w-2xl space-y-6">
          {/* Profile Settings */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white/50 cursor-not-allowed"
                />
                <p className="text-white/30 text-xs mt-1">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" /> Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white">Email Notifications</span>
                <button
                  onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                  className={`w-12 h-6 rounded-full transition-all ${settings.notifications ? "bg-purple-600" : "bg-white/20"}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${settings.notifications ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white">Dark Mode</span>
                <button
                  onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
                  className={`w-12 h-6 rounded-full transition-all ${settings.darkMode ? "bg-purple-600" : "bg-white/20"}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-all ${settings.darkMode ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}