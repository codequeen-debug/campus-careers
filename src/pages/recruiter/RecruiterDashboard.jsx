import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
  return [state, setState];
}

const EMPTY_FORM = { title: "", department: "", location: "", type: "Full-time", description: "", institution: "", salaryMin: "", salaryMax: "" };
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3005";

export default function RecruiterDashboard() {
  const { currentUser, userData } = useAuth();
  const userId = currentUser?.uid || userData?.id;

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [waitlistCandidates, setWaitlistCandidates] = useLocalStorage("recruiter_waitlist", []);

  // Create/Edit posting form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Waitlist add
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: "", role: "" });

  // Fetch jobs and applications from backend on mount
  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [userId]);

  async function fetchJobs() {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/jobs`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Fetch jobs error:", err);
      setError(err.message);
      setJobs([]);
    }
  }

  async function fetchApplications() {
    try {
      const res = await fetch(`${API_BASE}/api/applications`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Fetch applications error:", err);
    }
  }

  async function updateApplicationStatus(appId, status, recruiterId) {
    try {
      const res = await fetch(`${API_BASE}/api/applications/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, approvedBy: recruiterId, approvedDate: new Date().toISOString() })
      });
      if (!res.ok) throw new Error("Failed to update application");
      await fetchApplications();
    } catch (err) {
      console.error("Update application error:", err);
      setError(err.message);
    }
  }

  const myJobs = jobs.filter(job => job.recruiterId === userId);
  const myJobIds = myJobs.map(j => j._id);
  const myApplications = applications.filter(app => myJobIds.includes(app.jobId));
  const pendingApps = myApplications.filter(app => app.status === "pending");
  const approvedApps = myApplications.filter(app => app.status === "approved");
  
  const stats = [
    { label: "Active Jobs", value: myJobs.length },
    { label: "Total Applicants", value: myApplications.length },
    { label: "Pending Review", value: pendingApps.length }
  ];

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(job) {
    setEditingId(job._id);
    setForm({
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      type: job.type || "Full-time",
      description: job.description || "",
      institution: job.institution || "",
      salaryMin: job.salaryMin || "",
      salaryMax: job.salaryMax || ""
    });
    setShowForm(true);
  }

  async function savePosting() {
    if (!form.title.trim()) {
      setError("Job title is required");
      return;
    }
    setLoading(true);
    try {
      setError(null);
      const url = editingId
        ? `${API_BASE}/api/jobs/${editingId}`
        : `${API_BASE}/api/jobs`;
      
      const method = editingId ? "PUT" : "POST";
      const payload = {
        ...form,
        recruiterId: userId || "unknown",
        postedDate: form.postedDate || new Date().toISOString()
      };
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to ${editingId ? "update" : "create"} job`);
      }

      // Refresh jobs list from backend
      await fetchJobs();
      
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      console.error("Save posting error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteJob(id) {
    if (!window.confirm("Delete this posting?")) return;
    setLoading(true);
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete job");
      }

      // Refresh jobs list from backend
      await fetchJobs();
    } catch (err) {
      console.error("Delete job error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function addCandidate() {
    if (!newCandidate.name.trim()) return;
    setWaitlistCandidates(prev => [...prev, { id: Date.now(), ...newCandidate }]);
    setNewCandidate({ name: "", role: "" });
    setShowAddCandidate(false);
  }

  function removeCandidate(id) {
    setWaitlistCandidates(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div style={{ background: "#fff5f8", minHeight: "calc(100vh - 64px)", padding: "40px 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontFamily: "Georgia, serif", color: "#1e293b" }}>Recruiter Command Center</h1>
            <p style={{ color: "#64748b" }}>Managing for {userData?.name || "Institution"}</p>
          </div>
          <button
            onClick={openCreate}
            style={{ background: "#98fb98", border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
          >
            + Create Posting
          </button>
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #ffebf1", padding: 24, marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{editingId ? "Edit Posting" : "New Job Posting"}</h3>
            {error && <div style={{ background: "#fecaca", color: "#991b1b", padding: "12px", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>{error}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {[
                { label: "Job Title *", key: "title", placeholder: "e.g. Lecturer in Biology" },
                { label: "Institution", key: "institution", placeholder: "e.g. State University" },
                { label: "Department", key: "department", placeholder: "e.g. Science" },
                { label: "Location", key: "location", placeholder: "e.g. Tampa, FL" },
                { label: "Salary Min", key: "salaryMin", placeholder: "e.g. 60000", type: "number" },
                { label: "Salary Max", key: "salaryMax", placeholder: "e.g. 80000", type: "number" }
              ].map(({ label, key, placeholder, type = "text" }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: type === "number" ? (e.target.value ? parseInt(e.target.value) : "") : e.target.value }))}
                    placeholder={placeholder}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #ffebf1", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #ffebf1", borderRadius: 8, fontSize: 13 }}
                >
                  {["Full-time", "Part-time", "Contract", "Internship"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe the role, requirements, etc."
                rows={4}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #ffebf1", borderRadius: 8, fontSize: 13, boxSizing: "border-box", resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={savePosting}
                disabled={loading}
                style={{ padding: "10px 24px", background: loading ? "#ccc" : "#98fb98", border: "none", borderRadius: 8, fontWeight: 700, cursor: loading ? "default" : "pointer" }}
              >
                {loading ? "Saving..." : (editingId ? "Save Changes" : "Publish Posting")}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); setError(null); }}
                disabled={loading}
                style={{ padding: "10px 16px", background: "none", border: "1px solid #ffebf1", borderRadius: 8, cursor: loading ? "default" : "pointer", fontSize: 13 }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #ffebf1", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pending Applications Section */}
        {pendingApps.length > 0 && (
          <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 12, padding: 24, marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#92400e" }}>Pending Applications Review</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {pendingApps.map(app => {
                const job = jobs.find(j => j._id === app.jobId);
                return (
                  <div key={app._id} style={{ background: "#fff", borderRadius: 8, padding: 16, border: "1px solid #fed7aa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", color: "#1e293b" }}>{app.applicantName}</p>
                      <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 2px" }}>{app.jobTitle} at {job?.institution || "Unknown"}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Applied: {new Date(app.dateApplied).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => updateApplicationStatus(app._id, "approved", userId)}
                        style={{ background: "#98fb98", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 12, color: "#166534" }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(app._id, "rejected", userId)}
                        style={{ background: "#ffcccb", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 12, color: "#7c2d12" }}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          {/* Job Management */}
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Your Active Postings</h2>
            {error && <div style={{ background: "#fecaca", color: "#991b1b", padding: "12px", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>{error}</div>}
            {approvedApps.length > 0 && (
              <div style={{ background: "#d1fae5", border: "1px solid #86efac", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: "#047857" }}>
                <strong>{approvedApps.length}</strong> candidates approved and ready for next steps
              </div>
            )}
            {myJobs.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 14 }}>No postings yet. Click "+ Create Posting" to add one.</p>
            ) : (
              myJobs.map(job => (
                <div key={job._id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #ffebf1", padding: 20, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{job.title}</h3>
                      <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
                        {[job.institution, job.department, job.location, job.type].filter(Boolean).join(" • ")}
                      </p>
                      {(job.salaryMin || job.salaryMax) && (
                        <p style={{ fontSize: 12, color: "#65a30d", margin: "4px 0 0", fontWeight: 500 }}>
                          ${job.salaryMin?.toLocaleString() || "0"} - ${job.salaryMax?.toLocaleString() || "0"}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openEdit(job)}
                        disabled={loading}
                        style={{ background: "#fff", border: "1px solid #ffebf1", padding: "6px 12px", borderRadius: 6, cursor: loading ? "default" : "pointer", fontSize: 13 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteJob(job._id)}
                        disabled={loading}
                        style={{ background: "#fff5f8", border: "1px solid #ffb6c1", color: "#d4818d", padding: "6px 12px", borderRadius: 6, cursor: loading ? "default" : "pointer", fontSize: 13 }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Candidate Waitlist */}
          <section>
            <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #ffebf1" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Candidate Waitlist</h3>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Strong profiles for future openings.</p>

              {waitlistCandidates.length === 0 ? (
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>No candidates saved yet.</p>
              ) : (
                waitlistCandidates.map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #fff5f8" }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                      {c.role && <span style={{ fontSize: 11, background: "#fbe7c6", padding: "2px 8px", borderRadius: 4, marginLeft: 8 }}>{c.role}</span>}
                    </div>
                    <button onClick={() => removeCandidate(c.id)} style={{ border: "none", background: "none", color: "#ffb6c1", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>×</button>
                  </div>
                ))
              )}

              {showAddCandidate ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  <input
                    value={newCandidate.name}
                    onChange={e => setNewCandidate(p => ({ ...p, name: e.target.value }))}
                    placeholder="Candidate name"
                    style={{ padding: "7px 10px", border: "1px solid #ffebf1", borderRadius: 8, fontSize: 12 }}
                  />
                  <input
                    value={newCandidate.role}
                    onChange={e => setNewCandidate(p => ({ ...p, role: e.target.value }))}
                    placeholder="Role / field (optional)"
                    style={{ padding: "7px 10px", border: "1px solid #ffebf1", borderRadius: 8, fontSize: 12 }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={addCandidate} style={{ flex: 1, padding: "7px", background: "#ffb6c1", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Add</button>
                    <button onClick={() => setShowAddCandidate(false)} style={{ flex: 1, padding: "7px", background: "none", border: "1px solid #ffebf1", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddCandidate(true)}
                  style={{ width: "100%", marginTop: 12, padding: "8px", border: "1px dashed #ffb6c1", background: "none", borderRadius: 8, color: "#ffb6c1", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  + Add Candidate
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}