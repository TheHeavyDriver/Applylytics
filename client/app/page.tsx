"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getApplications, getFollowUps, generateFollowUpSuggestions } from "@/lib/supabase";
import type { Application, FollowUp, DashboardStats } from "@/lib/types";
import { 
  Briefcase, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  CalendarClock,
  ArrowRight,
  Plus,
  Sparkles,
  Loader2
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  applied: { label: "Applied", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  screening: { label: "Screening", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
  interview: { label: "Interview", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
  technical: { label: "Technical", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950" },
  offer: { label: "Offer", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950" },
  withdrawn: { label: "Withdrawn", color: "text-gray-600", bg: "bg-gray-50 dark:bg-gray-950" },
  accepted: { label: "Accepted", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950" },
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [followUps, setFollowUps] = useState<(FollowUp & { applications?: Application })[]>([]);
  const [suggestions, setSuggestions] = useState<{ application: Application; daysSinceApplied: number; suggestion: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (!user) return;

    const userId = user.id;

    async function fetchData() {
      try {
        const [apps, fUs, sugg] = await Promise.all([
          getApplications(userId),
          getFollowUps(userId),
          generateFollowUpSuggestions(userId),
        ]);
        setApplications(apps || []);
        setFollowUps(fUs || []);
        setSuggestions(sugg || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, authLoading]);

  const stats: DashboardStats = {
    total: applications.length,
    applied: applications.filter(a => a.status === "applied").length,
    screening: applications.filter(a => a.status === "screening").length,
    interview: applications.filter(a => ["interview", "technical"].includes(a.status)).length,
    offer: applications.filter(a => ["offer", "accepted"].includes(a.status)).length,
    rejected: applications.filter(a => a.status === "rejected").length,
    pendingFollowUps: followUps.filter(f => !f.completed).length,
  };

  const successRate = stats.total > 0 
    ? Math.round(((stats.offer + stats.rejected) / stats.total) * 100)
    : 0;

  const upcomingFollowUps = followUps
    .filter(f => !f.completed && new Date(f.scheduled_date) >= new Date())
    .slice(0, 3);

  if (loading || authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your job search.
          </p>
        </div>
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Briefcase}
          label="Total Applications"
          value={stats.total}
          color="text-primary"
        />
        <StatCard
          icon={TrendingUp}
          label="In Progress"
          value={stats.applied + stats.screening}
          color="text-blue-600"
        />
        <StatCard
          icon={Clock}
          label="Interviews"
          value={stats.interview}
          color="text-amber-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Offers"
          value={stats.offer}
          color="text-emerald-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {suggestions.length > 0 && (
            <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Smart Insights</h2>
              </div>
              <div className="space-y-3">
                {suggestions.slice(0, 3).map((s, i) => (
                  <div key={i} className="bg-card/80 rounded-xl p-4 border border-border/50">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{s.application.company}</p>
                        <p className="text-sm text-muted-foreground">{s.application.role}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {s.daysSinceApplied} days ago
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/80">{s.suggestion}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Recent Applications</h2>
              <Link 
                href="/applications" 
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No applications yet</p>
                <Link
                  href="/applications"
                  className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
                >
                  Add your first application <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app) => {
                  const status = statusConfig[app.status] || statusConfig.applied;
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {app.company.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{app.company}</p>
                          <p className="text-sm text-muted-foreground">{app.role}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Success Rate</h2>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  className="text-muted stroke-[8]"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  className="text-primary stroke-[8] transition-all"
                  strokeDasharray={`${successRate * 2.64} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{successRate}%</span>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Based on {stats.total} applications
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upcoming Follow-ups</h2>
              <Link 
                href="/follow-ups" 
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            {upcomingFollowUps.length === 0 ? (
              <div className="text-center py-8">
                <CalendarClock className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No pending follow-ups</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingFollowUps.map((followUp) => (
                  <div
                    key={followUp.id}
                    className="p-3 rounded-xl bg-muted/50"
                  >
                    <p className="font-medium text-sm">
                      {followUp.applications?.company || "Unknown Company"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(followUp.scheduled_date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Application Status</h2>
            <div className="space-y-3">
              {Object.entries(statusConfig).slice(0, 5).map(([key, config]) => {
                const count = applications.filter(a => a.status === key).length;
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={config.color}>{config.label}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${config.color.replace("text-", "bg-")}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
