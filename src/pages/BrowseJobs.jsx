import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { categories, locations } from "../data/mockJobs";

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

const EMPTY_FORM = { title: "", department: "", location: "", type: "Full-time", description: "", qualifications: "", salaryMin: "", salaryMax: "", deadline: "" };
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3005";

export default function BrowseJobs() {
  const { currentUser, userData, userRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isPrivileged = userRole === "admin" || userRole === "recruiter";
  const userId = currentUser?.uid || userData?.id;

  if (!currentUser) {
    return <div style={{ background: "#fff5f8", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e293b" }}>
      <div style={{ textAlign: "center", maxWidth: 420, padding: "2rem" }}>
        <h2 style={{ marginBottom: 16 }}>Please sign in to view jobs</h2>
        <p style={{ color: "#64748b", marginBottom: 24 }}>Browse jobs and apply only after signing in.</p>
        <button onClick={() => navigate("/login")}
          style={{ background: "#98fb98", border: "none", color: "#166534", padding: "12px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
          Go to Login
        </button>
      </div>
    </div>;
  }

  const [savedJobs, setSavedJobs] = useLocalStorage("seeker_savedJobs", []);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [typeFilter, setTypeFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);

  // Fetch jobs from backend on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!userId) return;
    async function fetchApplications() {
      try {
        const res = await fetch(`${API_BASE}/api/applications/by-applicant/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        setAppliedJobs(data.map(app => app.jobId));
      } catch (err) {
        console.error("Fetch applications error:", err);
      }
    }
    fetchApplications();
  }, [userId]);

  async function fetchJobs() {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  const filtered = jobs.filter(job => {
    const matchSearch = !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.institution?.toLowerCase().includes(search.toLowerCase()) ||
      job.department?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All Categories" || job.department === categoryFilter;
    const matchLocation = locationFilter === "All Locations" || job.location === locationFilter;
    const matchType = typeFilter === "All" || job.type === typeFilter;
    return matchSearch && matchCategory && matchLocation && matchType;
  });

  function toggleSave(id) {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setSavedJobs(prev => prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]);
  }

  async function applyToJob(jobId) {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    // Navigate to job detail page where they can use the proper application form
    navigate(`/jobs/${jobId}`);
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setSelectedJob(null);
  }

  function openEdit(job) {
    setEditingId(job._id);
    setForm({
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      type: job.type || "Full-time",
      description: job.description || "",
      qualifications: job.qualifications || "",
      salaryMin: job.salaryMin || "",
      salaryMax: job.salaryMax || "",
      deadline: job.deadline || "",
    });
    setShowForm(true);
    setSelectedJob(null);
  }

  async function savePosting() {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const url = editingId
        ? `${API_BASE}/api/jobs/${editingId}`
        : `${API_BASE}/api/jobs`;
      
      const method = editingId ? "PUT" : "POST";
      const payload = {
        ...form,
        institution: userData?.name || "My Institution",
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

      // Refresh jobs from API
      await fetchJobs();
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error("Save posting error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteJob(id) {
    if (!window.confirm("Delete this job posting permanently?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete job");
      }

      // Refresh jobs from API
      await fetchJobs();
      if (selectedJob?._id === id) setSelectedJob(null);
    } catch (err) {
      console.error("Delete job error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "8px 12px", border: "1px solid #ffebf1",
    borderRadius: 8, fontSize: 13, boxSizing: "border-box", outline: "none",
    background: "#fff"
  };

  return (
    <div style={{ background: "#fff5f8", minHeight: "calc(100vh - 64px)", color: "#1e293b" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 2rem" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontFamily: "Georgia, serif", margin: "0 0 4px" }}>Browse Jobs</h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
              {filtered.length} position{filtered.length !== 1 ? "s" : ""} available
            </p>
          </div>
          {userRole === "recruiter" && (
            <button
              onClick={openCreate}
              style={{ background: "#98fb98", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}
            >
              + New Posting
            </button>
          )}
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #ffebf1", padding: 24, marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, marginTop: 0 }}>
              {editingId ? "Edit Job Posting" : "New Job Posting"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {[
                { label: "Job Title *", key: "title", placeholder: "e.g. Lecturer in Biology" },
                { label: "Department", key: "department", placeholder: "e.g. Life Sciences" },
                { label: "Location", key: "location", placeholder: "e.g. Tampa, FL" },
                { label: "Application Deadline", key: "deadline", placeholder: "YYYY-MM-DD", type: "date" },
                { label: "Min Salary ($)", key: "salaryMin", placeholder: "e.g. 60000", type: "number" },
                { label: "Max Salary ($)", key: "salaryMax", placeholder: "e.g. 80000", type: "number" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>{label}</label>
                  <input
                    type={type || "text"}
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  style={inputStyle}
                >
                  {["Full-time", "Part-time", "Contract", "Internship"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            {[
              { label: "Description", key: "description", placeholder: "Describe the role and responsibilities..." },
              { label: "Qualifications", key: "qualifications", placeholder: "Required qualifications and experience..." },
            ].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>{label}</label>
                <textarea
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={savePosting} style={{ padding: "10px 24px", background: "#98fb98", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                {editingId ? "Save Changes" : "Publish"}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ padding: "10px 16px", background: "none", border: "1px solid #ffebf1", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #ffebf1", padding: 16, marginBottom: 24, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, institution, department..."
            style={{ ...inputStyle, flex: 2, minWidth: 200 }}
          />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 140 }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 130 }}>
            {locations.map(l => <option key={l}>{l}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 110 }}>
            {["All", "Full-time", "Part-time", "Contract", "Internship"].map(t => <option key={t}>{t}</option>)}
          </select>
          {(search || categoryFilter !== "All Categories" || locationFilter !== "All Locations" || typeFilter !== "All") && (
            <button
              onClick={() => { setSearch(""); setCategoryFilter("All Categories"); setLocationFilter("All Locations"); setTypeFilter("All"); }}
              style={{ padding: "8px 14px", background: "none", border: "1px solid #ffebf1", borderRadius: 8, cursor: "pointer", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Main Layout */}
        <div style={{ display: "grid", gridTemplateColumns: selectedJob ? "1fr 1.2fr" : "1fr", gap: 20 }}>

          {/* Job Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #ffebf1", padding: 40, textAlign: "center", color: "#94a3b8" }}>
                No jobs match your filters.
              </div>
            ) : (
              filtered.map(job => {
                const isSaved = savedJobs.includes(job._id);
                const isApplied = appliedJobs.includes(job._id);
                const isSelected = selectedJob?._id === job._id;

                return (
                  <div
                    key={job._id}
                    onClick={() => setSelectedJob(isSelected ? null : job)}
                    style={{
                      background: "#fff", borderRadius: 12,
                      border: isSelected ? "2px solid #98fb98" : "1px solid #ffebf1",
                      padding: 20, cursor: "pointer", transition: "border-color 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>{job.title}</h3>
                        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 8px" }}>
                          {job.institution} · {job.location}
                        </p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, background: "#fff5f8", border: "1px solid #ffebf1", padding: "2px 8px", borderRadius: 20 }}>{job.type}</span>
                          {job.salaryMin && job.salaryMax && (
                            <span style={{ fontSize: 11, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 20, color: "#166534" }}>
                              ${Number(job.salaryMin).toLocaleString()} – ${Number(job.salaryMax).toLocaleString()}
                            </span>
                          )}
                          {job.deadline && (
                            <span style={{ fontSize: 11, background: "#fefce8", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: 20, color: "#854d0e" }}>
                              Due {job.deadline}
                            </span>
                          )}
                          {isApplied && (
                            <span style={{ fontSize: 11, background: "#eff6ff", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: 20, color: "#1d4ed8" }}>Applied</span>
                          )}
                        </div>
                      </div>

                      {userRole === "recruiter" && job.recruiterId === userId ? (
                        <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                          <button onClick={() => openEdit(job)} style={{ padding: "5px 14px", background: "#fff", border: "1px solid #ffebf1", borderRadius: 6, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                            Edit
                          </button>
                          <button onClick={() => deleteJob(job._id)} style={{ padding: "5px 14px", background: "#fff5f8", border: "1px solid #ffb6c1", color: "#d4818d", borderRadius: 6, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                            Delete
                          </button>
                        </div>
                      ) : userRole === "admin" ? (
                        <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                          <button onClick={() => deleteJob(job._id)} style={{ padding: "5px 14px", background: "#fff5f8", border: "1px solid #ffb6c1", color: "#d4818d", borderRadius: 6, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                            Delete
                          </button>
                        </div>
                      ) : (
                        <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                          <button
                            onClick={() => toggleSave(job._id)}
                            style={{ padding: "5px 14px", background: isSaved ? "#fff5f8" : "#fff", border: `1px solid ${isSaved ? "#ffb6c1" : "#ffebf1"}`, color: isSaved ? "#d4818d" : "#64748b", borderRadius: 6, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            {isSaved ? "Saved ♥" : "Save"}
                          </button>
                          <button
                            onClick={() => applyToJob(job._id)}
                            disabled={isApplied || applying}
                            style={{ padding: "5px 14px", background: isApplied ? "#f0fdf4" : "#98fb98", border: "none", color: isApplied ? "#166534" : "#000", borderRadius: 6, fontSize: 12, cursor: isApplied || applying ? "default" : "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                          >
                            {applying ? "Applying..." : (isApplied ? "Applied" : "Apply")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Detail Panel */}
          {selectedJob && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #ffebf1", padding: 28, alignSelf: "flex-start", position: "sticky", top: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>{selectedJob.title}</h2>
                  <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{selectedJob.institution} · {selectedJob.department}</p>
                </div>
                <button onClick={() => setSelectedJob(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>×</button>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                <span style={{ fontSize: 11, background: "#fff5f8", border: "1px solid #ffebf1", padding: "3px 10px", borderRadius: 20 }}>{selectedJob.type}</span>
                {selectedJob.salaryMin && selectedJob.salaryMax && (
                  <span style={{ fontSize: 11, background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "3px 10px", borderRadius: 20, color: "#166534" }}>
                    ${Number(selectedJob.salaryMin).toLocaleString()} – ${Number(selectedJob.salaryMax).toLocaleString()}
                  </span>
                )}
                <span style={{ fontSize: 11, background: "#fff5f8", border: "1px solid #ffebf1", padding: "3px 10px", borderRadius: 20 }}>{selectedJob.location}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, padding: 14, background: "#fff5f8", borderRadius: 8 }}>
                {[
                  { label: "Deadline", value: selectedJob.deadline || "Open" },
                  { label: "Start Date", value: selectedJob.startDate || "TBD" },
                  { label: "Posted", value: selectedJob.postedDate || "Recently" },
                  { label: "Department", value: selectedJob.department || "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>

              {selectedJob.description && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", margin: "0 0 8px" }}>About the Role</h4>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "#334155", margin: 0 }}>{selectedJob.description}</p>
                </div>
              )}

              {selectedJob.qualifications && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", margin: "0 0 8px" }}>Qualifications</h4>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "#334155", margin: 0 }}>{selectedJob.qualifications}</p>
                </div>
              )}

              {userRole === "recruiter" && selectedJob.recruiterId === userId ? (
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => openEdit(selectedJob)} style={{ flex: 1, padding: "10px", background: "#fff", border: "1px solid #ffebf1", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                    Edit Posting
                  </button>
                  <button onClick={() => deleteJob(selectedJob._id)} style={{ flex: 1, padding: "10px", background: "#fff5f8", border: "1px solid #ffb6c1", color: "#d4818d", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                    Delete
                  </button>
                </div>
              ) : userRole === "admin" ? (
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => deleteJob(selectedJob._id)} style={{ flex: 1, padding: "10px", background: "#fff5f8", border: "1px solid #ffb6c1", color: "#d4818d", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                    Delete
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => toggleSave(selectedJob._id)}
                    style={{
                      flex: 1, padding: "10px",
                      background: savedJobs.includes(selectedJob._id) ? "#fff5f8" : "#fff",
                      border: `1px solid ${savedJobs.includes(selectedJob._id) ? "#ffb6c1" : "#ffebf1"}`,
                      color: savedJobs.includes(selectedJob._id) ? "#d4818d" : "#64748b",
                      borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600
                    }}
                  >
                    {savedJobs.includes(selectedJob._id) ? "Saved ♥" : "Save Job"}
                  </button>
                  <button
                    onClick={() => applyToJob(selectedJob._id)}
                    disabled={appliedJobs.includes(selectedJob._id)}
                    style={{
                      flex: 1, padding: "10px",
                      background: appliedJobs.includes(selectedJob._id) ? "#f0fdf4" : "#98fb98",
                      border: "none",
                      color: appliedJobs.includes(selectedJob._id) ? "#166534" : "#000",
                      borderRadius: 8, fontSize: 13,
                      cursor: appliedJobs.includes(selectedJob._id) ? "default" : "pointer",
                      fontWeight: 700
                    }}
                  >
                    {appliedJobs.includes(selectedJob._id) ? "Already Applied" : "Apply Now"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}