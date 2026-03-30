"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  getFollowUps,
  getApplications,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
} from "@/lib/supabase";
import type { Application, FollowUp } from "@/lib/types";
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  X,
  Loader2,
  Mail,
  Phone,
  Linkedin,
  MoreHorizontal,
  Clock,
} from "lucide-react";

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  email: { icon: Mail, label: "Email", color: "text-blue-600" },
  call: { icon: Phone, label: "Call", color: "text-green-600" },
  linkedin: { icon: Linkedin, label: "LinkedIn", color: "text-sky-600" },
  other: { icon: MoreHorizontal, label: "Other", color: "text-purple-600" },
};

export default function FollowUpsPage() {
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState<(FollowUp & { applications?: Application })[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    application_id: "",
    type: "email" as "email" | "call" | "linkedin" | "other",
    scheduled_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    fetchData(userId);
  }, [user]);

  async function fetchData(userId: string) {
    try {
      setLoading(true);
      const [fUs, apps] = await Promise.all([
        getFollowUps(userId),
        getApplications(userId),
      ]);
      setFollowUps(fUs || []);
      setApplications(apps || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredFollowUps = followUps.filter((fu) => {
    if (filter === "pending") return !fu.completed;
    if (filter === "completed") return fu.completed;
    return true;
  });

  const now = new Date();
  const upcomingCount = followUps.filter(
    (fu) => !fu.completed && new Date(fu.scheduled_date) >= now
  ).length;
  const overdueCount = followUps.filter(
    (fu) => !fu.completed && new Date(fu.scheduled_date) < now
  ).length;

  function openModal() {
    setForm({
      application_id: "",
      type: "email",
      scheduled_date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const userId = user.id;

    setSubmitting(true);
    try {
      await createFollowUp({
        ...form,
        user_id: userId,
        completed: false,
      });
      await fetchData(userId);
      closeModal();
    } catch (err) {
      console.error("Error creating follow-up:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleComplete(fu: FollowUp) {
    if (!user) return;
    const userId = user.id;
    try {
      await updateFollowUp(fu.id, {
        completed: !fu.completed,
        completed_at: !fu.completed ? new Date().toISOString() : undefined,
      });
      await fetchData(userId);
    } catch (err) {
      console.error("Error updating follow-up:", err);
    }
  }

  async function handleDelete(id: string) {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this follow-up?")) return;
    const userId = user.id;
    try {
      await deleteFollowUp(id);
      await fetchData(userId);
    } catch (err) {
      console.error("Error deleting follow-up:", err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground mt-1">
            Follow-ups are automatically created when you add applications
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === "pending"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border hover:bg-muted"
          }`}
        >
          Pending ({upcomingCount + overdueCount})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === "completed"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border hover:bg-muted"
          }`}
        >
          Completed ({followUps.filter((f) => f.completed).length})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border hover:bg-muted"
          }`}
        >
          All ({followUps.length})
        </button>
      </div>

      {overdueCount > 0 && filter === "pending" && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 text-destructive">
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              {overdueCount} overdue follow-up{overdueCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {filteredFollowUps.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <CalendarClock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {filter === "pending"
              ? "No pending follow-ups"
              : filter === "completed"
              ? "No completed follow-ups"
              : "No follow-ups yet"}
          </h3>
          <p className="text-muted-foreground">
            {filter === "pending"
              ? "Follow-ups will be automatically created when you add applications."
              : "Follow-ups will appear here once you add job applications."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFollowUps.map((fu) => {
            const type = typeConfig[fu.type] || typeConfig.other;
            const TypeIcon = type.icon;
            const isOverdue =
              !fu.completed && new Date(fu.scheduled_date) < now;
            const isToday =
              !fu.completed &&
              new Date(fu.scheduled_date).toDateString() === now.toDateString();

            return (
              <div
                key={fu.id}
                className={`bg-card rounded-2xl border p-5 transition-all ${
                  fu.completed
                    ? "border-border opacity-60"
                    : isOverdue
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleComplete(fu)}
                    className={`mt-1 shrink-0 transition-all ${
                      fu.completed
                        ? "text-primary"
                        : isOverdue
                        ? "text-destructive"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {fu.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3
                          className={`font-semibold ${
                            fu.completed ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {fu.applications?.company || "Unknown Company"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {fu.applications?.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            type.color
                          } bg-muted`}
                        >
                          <TypeIcon className="w-3.5 h-3.5" />
                          {type.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                      <span
                        className={`flex items-center gap-1.5 ${
                          isOverdue
                            ? "text-destructive font-medium"
                            : isToday
                            ? "text-amber-600 font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        <CalendarClock className="w-4 h-4" />
                        {new Date(fu.scheduled_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {isToday && " (Today)"}
                        {isOverdue && " (Overdue)"}
                      </span>
                      {fu.completed && fu.completed_at && (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed{" "}
                          {new Date(fu.completed_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>

                    {fu.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">{fu.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(fu.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-card rounded-2xl border border-border w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Add Follow-up</h2>
              <button
                onClick={closeModal}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Application *</label>
                <select
                  value={form.application_id}
                  onChange={(e) =>
                    setForm({ ...form, application_id: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="">Select an application</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company} - {app.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as typeof form.type,
                      })
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="email">Email</option>
                    <option value="call">Call</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Scheduled Date *</label>
                  <input
                    type="date"
                    value={form.scheduled_date}
                    onChange={(e) =>
                      setForm({ ...form, scheduled_date: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Add any notes about this follow-up..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-border font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
