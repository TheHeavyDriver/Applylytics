"use client";

import { useEffect, useState } from "react";

type Application = {
  id: number;
  company: string;
  role: string;
  platform: string;
  status: string;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    company: "",
    role: "",
    platform: "",
    status: "",
  });

  // ✅ Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/applications");
      const data = await res.json();

      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // ✅ Add application
  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5000/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          appliedDate: new Date(),
        }),
      });

      if (!res.ok) throw new Error("Failed to add application");

      await fetchApplications();

      // reset form
      setForm({
        company: "",
        role: "",
        platform: "",
        status: "",
      });
    } catch (err) {
      console.error("Error adding application:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Applications</h1>

      {/* FORM */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          value={form.company}
          placeholder="Company"
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />

        <input
          value={form.role}
          placeholder="Role"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />

        <input
          value={form.platform}
          placeholder="Platform"
          onChange={(e) => setForm({ ...form, platform: e.target.value })}
        />

        <input
          value={form.status}
          placeholder="Status"
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        />

        <button onClick={handleSubmit}>Add</button>
      </div>

      {/* 🔄 LOADING STATE */}
      {loading && <p>Loading...</p>}

      {/* 📭 EMPTY STATE */}
      {!loading && applications.length === 0 && <p>No applications yet</p>}

      {/* 📋 APPLICATION LIST */}
      {!loading &&
        applications.map((app) => (
          <div
            key={app.id}
            style={{
              border: "1px solid #ccc",
              margin: "10px 0",
              padding: "10px",
              borderRadius: "6px",
            }}
          >
            <p><strong>{app.company}</strong></p>
            <p>{app.role}</p>
            <p>{app.platform}</p>
            <p>{app.status}</p>
          </div>
        ))}
    </div>
  );
}