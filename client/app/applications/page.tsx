"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getApplications, createApplication, updateApplication, deleteApplication } from "@/lib/supabase";
import type { Application, ApplicationStatus } from "@/lib/types";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Building2,
  X,
  Loader2,
} from "lucide-react";

const statusOptions: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  { value: "screening", label: "Screening", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  { value: "interview", label: "Interview", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
  { value: "technical", label: "Technical", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" },
  { value: "offer", label: "Offer", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  { value: "withdrawn", label: "Withdrawn", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  { value: "accepted", label: "Accepted", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
];

const currencyOptions = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
  { value: "INR", label: "INR (₹)", symbol: "₹" },
  { value: "CAD", label: "CAD (C$)", symbol: "C$" },
  { value: "AUD", label: "AUD (A$)", symbol: "A$" },
  { value: "JPY", label: "JPY (¥)", symbol: "¥" },
  { value: "SGD", label: "SGD (S$)", symbol: "S$" },
];

const reminderOptions = [
  { value: "0", label: "Don't remind" },
  { value: "3", label: "3 days" },
  { value: "7", label: "1 week" },
  { value: "14", label: "2 weeks" },
  { value: "21", label: "3 weeks" },
  { value: "30", label: "1 month" },
  { value: "custom", label: "Custom date" },
];

function getCurrencySymbol(code: string): string {
  return currencyOptions.find(c => c.value === code)?.symbol || "$";
}

function formatSalaryDisplay(salary: string): { amount: string; currency: string; symbol: string } {
  if (!salary) return { amount: "", currency: "", symbol: "$" };
  const currencyCode = salary.match(/[A-Z]{3}/)?.[0] || "USD";
  const amount = salary.replace(/[^0-9,]/g, '').trim();
  return {
    amount,
    currency: currencyCode,
    symbol: getCurrencySymbol(currencyCode),
  };
}

function parseSalaryForEdit(salary: string): { amount: string; currency: string } {
  if (!salary) return { amount: "", currency: "USD" };
  const currencyCode = salary.match(/[A-Z]{3}/)?.[0] || "USD";
  const amount = salary.replace(/[^0-9]/g, '').trim();
  return { amount, currency: currencyCode };
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    company: "",
    role: "",
    platform: "",
    status: "applied" as ApplicationStatus,
    applied_date: new Date().toISOString().split("T")[0],
    salary: "",
    currency: "USD",
    location: "",
    notes: "",
    reminder_days: "7",
    custom_reminder_date: "",
  });

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    fetchApplications(userId);
  }, [user]);

  async function fetchApplications(userId: string) {
    try {
      setLoading(true);
      const data = await getApplications(userId);
      setApplications(data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.role.toLowerCase().includes(search.toLowerCase()) ||
      app.platform.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openModal(app?: Application) {
    if (app) {
      setEditingApp(app);
      const parsed = parseSalaryForEdit(app.salary);
      setForm({
        company: app.company,
        role: app.role,
        platform: app.platform,
        status: app.status,
        applied_date: app.applied_date.split("T")[0],
        salary: parsed.amount,
        currency: parsed.currency,
        location: app.location || "",
        notes: app.notes || "",
        reminder_days: "7",
        custom_reminder_date: "",
      });
    } else {
      setEditingApp(null);
      setForm({
        company: "",
        role: "",
        platform: "",
        status: "applied",
        applied_date: new Date().toISOString().split("T")[0],
        salary: "",
        currency: "USD",
        location: "",
        notes: "",
        reminder_days: "7",
        custom_reminder_date: "",
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingApp(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const userId = user.id;

    const salaryWithCurrency = form.salary 
      ? `${form.salary} ${form.currency}`
      : "";

    const applicationData = {
      company: form.company,
      role: form.role,
      platform: form.platform,
      status: form.status,
      applied_date: form.applied_date,
      salary: salaryWithCurrency,
      location: form.location,
      notes: form.notes,
    };

    const reminderDays = form.reminder_days === "custom" 
      ? null 
      : parseInt(form.reminder_days);
    
    let customReminderDate = null;
    if (form.reminder_days === "custom" && form.custom_reminder_date) {
      customReminderDate = form.custom_reminder_date;
    }

    setSubmitting(true);
    try {
      if (editingApp) {
        await updateApplication(editingApp.id, applicationData);
      } else {
        await createApplication({ 
          ...applicationData, 
          user_id: userId,
          reminder_days: reminderDays,
          custom_reminder_date: customReminderDate,
        });
      }
      await fetchApplications(userId);
      closeModal();
    } catch (err) {
      console.error("Error saving application:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this application?")) return;
    const userId = user.id;
    try {
      await deleteApplication(id);
      await fetchApplications(userId);
    } catch (err) {
      console.error("Error deleting application:", err);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Applications</h1>
          <p className="text-muted-foreground mt-1">
            {applications.length} application{applications.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by company, role, or platform..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "")}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
          >
            <option value="">All Status</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {search || statusFilter ? "No matching applications" : "No applications yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {search || statusFilter
              ? "Try adjusting your filters"
              : "Start tracking your job search by adding your first application"}
          </p>
          {!search && !statusFilter && (
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add your first application
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApps.map((app) => {
            const status = statusOptions.find((s) => s.value === app.status);
            return (
              <div
                key={app.id}
                className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-lg font-semibold text-primary">
                        {app.company.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{app.company}</h3>
                      <p className="text-muted-foreground">{app.role}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {app.platform}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(app.applied_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {app.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {app.location}
                          </span>
                        )}
                        {app.salary && (() => {
                          const { symbol, amount } = formatSalaryDisplay(app.salary);
                          return (
                            <span className="flex items-center gap-1">
                              <span className="text-xs">{symbol}</span>
                              {amount}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${status?.color}`}>
                      {status?.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal(app)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {app.notes && (
                  <p className="mt-3 text-sm text-muted-foreground pl-16">{app.notes}</p>
                )}
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
          <div className="relative bg-card rounded-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">
                {editingApp ? "Edit Application" : "Add Application"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company *</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Acme Corp"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role *</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Software Engineer"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform *</label>
                  <input
                    type="text"
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    placeholder="LinkedIn, Indeed, Company Website"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationStatus })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Applied Date *</label>
                  <input
                    type="date"
                    value={form.applied_date}
                    onChange={(e) => setForm({ ...form, applied_date: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Remote, NYC, San Francisco"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Salary Range</label>
                <div className="flex gap-2">
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    {currencyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    placeholder="100,000 - 120,000"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {!editingApp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Follow-up Reminder</label>
                  <div className="flex gap-2">
                    <select
                      value={form.reminder_days}
                      onChange={(e) => setForm({ ...form, reminder_days: e.target.value })}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {reminderOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {form.reminder_days === "custom" && (
                      <input
                        type="date"
                        value={form.custom_reminder_date}
                        onChange={(e) => setForm({ ...form, custom_reminder_date: e.target.value })}
                        min={form.applied_date}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {form.reminder_days === "0" 
                      ? "No reminder will be created"
                      : form.reminder_days === "custom" && form.custom_reminder_date
                      ? `Reminder will be on ${new Date(form.custom_reminder_date).toLocaleDateString()}`
                      : `You'll be reminded in ${reminderOptions.find(o => o.value === form.reminder_days)?.label.toLowerCase() || "1 week"}`
                    }
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes about this application..."
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
                  {editingApp ? "Save Changes" : "Add Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
