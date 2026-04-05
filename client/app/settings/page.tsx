"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase, getEmailPreferences, updateEmailPreferences } from "@/lib/supabase";
import type { EmailPreferences } from "@/lib/supabase";
import {
  User,
  Mail,
  Bell,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [emailPrefs, setEmailPrefs] = useState<EmailPreferences | null>(null);
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestTime, setDigestTime] = useState("09:00");
  const [prefsLoading, setPrefsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    async function loadPrefs() {
      try {
        if (!user) return;

        const prefs = await getEmailPreferences(user.id);
        if (prefs) {
          setEmailPrefs(prefs);
          setDigestEnabled(prefs.daily_digest_enabled);
          setDigestTime(prefs.digest_time?.substring(0, 5) || "09:00");
        }
      } catch (err) {
        console.error("Error loading email preferences:", err);
      } finally {
        setPrefsLoading(false);
      }
    }
    
    loadPrefs();
  }, [user]);

  async function handleSaveEmailPrefs() {
    if (!user) return;
    setLoading(true);
    setMessage(null);

    try {
      await updateEmailPreferences(user.id, {
        daily_digest_enabled: digestEnabled,
        digest_time: digestTime + ":00",
      });
      setMessage({ type: "success", text: "Email preferences saved!" });
    } catch (err) {
      console.error("Error saving email preferences:", err);
      setMessage({ type: "error", text: "Failed to save preferences" });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;

    try {
      if (email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
      }

      if (fullName !== user?.user_metadata?.full_name) {
        const { error: metaError } = await supabase.auth.updateUser({
          data: { full_name: fullName },
        });
        if (metaError) throw metaError;
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setMessage({ type: "error", text: error.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    await signOut();
  }

  const profile = user?.user_metadata;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">Settings</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <section className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary">
                {profile?.full_name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "?"}
              </span>
            </div>
            <div>
              <p className="font-medium">
                {profile?.full_name || "No name set"}
              </p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={profile?.full_name || ""}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email || ""}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <p className="text-xs text-muted-foreground">
                Changing your email will require verification
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </form>
        </section>

        <section className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Email Notifications</h2>
          </div>

          {prefsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading preferences...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Digest</p>
                  <p className="text-sm text-muted-foreground">
                    Get a daily email with your pending follow-ups
                  </p>
                </div>
                <button
                  onClick={() => setDigestEnabled(!digestEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    digestEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      digestEnabled ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {digestEnabled && (
                <div className="pt-4 border-t border-border">
                  <label className="text-sm font-medium block mb-2">
                    Digest Time
                  </label>
                  <input
                    type="time"
                    value={digestTime}
                    onChange={(e) => setDigestTime(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    When to receive your daily follow-up summary
                  </p>
                </div>
              )}

              <button
                onClick={handleSaveEmailPrefs}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Preferences
              </button>
            </div>
          )}
        </section>

        <section className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Account</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                Verified
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">User ID</p>
                <p className="text-sm text-muted-foreground font-mono text-xs">
                  {user?.id}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Sign out of your account on this device.
          </p>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-destructive text-destructive font-medium hover:bg-destructive/10 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {loading ? "Signing out..." : "Sign Out"}
          </button>
        </section>
      </div>
    </div>
  );
}
