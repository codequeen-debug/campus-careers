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

const EMPTY_FORM = { title: "", department: "", location: "", type: "Full-time", description: "" };

export default function RecruiterDashboard() {
  const { userData } = useAuth();

  const [jobs, setJobs] = useLocalStorage("recruiter_jobs", []);
  const [waitlistCandidates, setWaitlistCandidates] = useLocalStorage("recruiter_waitlist", []);

  // Create/Edit posting form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Waitlist add
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: "", role: "" });

  const stats = [
    { label: "Active Jobs", value: jobs.length },
    { label: "Applicants", value: 0 },
    { label: "Interviews", value: 0 }
  ];

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(job) {
    setEditingId(job.id);
    setForm({ title: job.title, department: job.department || "", location: job.location || "", type: job.type || "Full-time", description: job.description || "" });
    setShowForm(true);
  }

  function savePosting() {
    if (!form.title.trim()) return;
    if (editingId) {
      setJobs(prev => prev.map(j => j.id === editingId ? { ...j, ...form } : j));
    } else {
      setJobs(prev => [...prev, { id: String(Date.now()), ...form }]);
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function deleteJob(id) {
    if (window.confirm("Delete this posting?")) {
      setJobs(prev => prev.filter(j => j.id !== id));
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {[
                { label: "Job Title *", key: "title", placeholder: "e.g. Lecturer in Biology" },
                { label: "Department", key: "department", placeholder: "e.g. Science" },
                { label: "Location", key: "location", placeholder: "e.g. Tampa, FL" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>{label}</label>
                  <input
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
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
              <button onClick={savePosting} style={{ padding: "10px 24px", background: "#98fb98", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                {editingId ? "Save Changes" : "Publish Posting"}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ padding: "10px 16px", background: "none", border: "1px solid #ffebf1", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          {/* Job Management */}
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Your Active Postings</h2>
            {jobs.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 14 }}>No postings yet. Click "+ Create Posting" to add one.</p>
            ) : (
              jobs.map(job => (
                <div key={job.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #ffebf1", padding: 20, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{job.title}</h3>
                      <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
                        {[job.department, job.location, job.type].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(job)} style={{ background: "#fff", border: "1px solid #ffebf1", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Edit</button>
                      <button onClick={() => deleteJob(job.id)} style={{ background: "#fff5f8", border: "1px solid #ffb6c1", color: "#d4818d", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Delete</button>
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