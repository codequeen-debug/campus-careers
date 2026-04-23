import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { mockJobs } from "../../data/mockJobs";

// Custom hook: syncs state to localStorage
function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

export default function SeekerDashboard() {
  const { userData } = useAuth();

  // All state now persisted to localStorage, starts empty
  const [savedJobs, setSavedJobs] = useLocalStorage("seeker_savedJobs", []);
  const [appliedJobs, setAppliedJobs] = useLocalStorage("seeker_appliedJobs", []);
  const [waitlist, setWaitlist] = useLocalStorage("seeker_waitlist", []);

  // Local UI state (not persisted)
  const [newAlert, setNewAlert] = useState("");
  const [showAlertInput, setShowAlertInput] = useState(false);
  const [cvFileName, setCvFileName] = useState(null);

  // --- Handlers ---
  function removeSaved(id) {
    setSavedJobs(prev => prev.filter(j => j !== id));
  }

  function withdrawApplication(id) {
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      setAppliedJobs(prev => prev.filter(j => j !== id));
    }
  }

  function removeWaitlist(term) {
    setWaitlist(prev => prev.filter(t => t !== term));
  }

  function addAlert() {
    const trimmed = newAlert.trim();
    if (trimmed && !waitlist.includes(trimmed)) {
      setWaitlist(prev => [...prev, trimmed]);
    }
    setNewAlert("");
    setShowAlertInput(false);
  }

  function handleCvUpload(e) {
    const file = e.target.files[0];
    if (file) setCvFileName(file.name);
  }

  // Filtered Data
  const saved = mockJobs.filter(j => savedJobs.includes(j.id));
  const applied = mockJobs.filter(j => appliedJobs.includes(j.id));

  return (
    <div style={{ background: "#fff5f8", minHeight: "calc(100vh - 64px)", color: "#1e293b" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 2rem" }}>

        { /* Header */ }
        <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", margin: "0 0 6px", color: "#1e293b" }}>
              Welcome, {userData?.name?.split(" ")[0] || "Scholar"}
            </h1>
            <p style={{ color: "#64748b", margin: 0 }}>
              {applied.length > 0
                ? `You have ${applied.length} active application${applied.length !== 1 ? "s" : ""}.`
                : "No active applications yet. Browse jobs to get started."}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 12, color: "#d4818d", fontWeight: 700, textTransform: "uppercase" }}>Profile Strength</span>
            <div style={{ width: 150, height: 8, background: "#ffebf1", borderRadius: 4, marginTop: 4 }}>
              <div style={{ width: "85%", height: "100%", background: "#98fb98", borderRadius: 4 }}></div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 36 }}>
          {[
            { label: "Applied", value: applied.length, color: "#ffb6c1" },
            { label: "Saved", value: saved.length, color: "#98fb98" },
            { label: "Alerts", value: waitlist.length, color: "#a0e7e5" },
            { label: "Views", value: 24, color: "#fbe7c6" }
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#ffffff", borderRadius: 12, padding: "20px", border: "1px solid #ffebf1", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#1e293b" }}>{value}</div>
              <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>

          {/* Main Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Active Applications */}
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Active Applications</h2>
              {applied.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 14 }}>No applications yet. Apply to a job to see it here.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {applied.map(job => (
                    <div key={job.id} style={{ background: "#ffffff", borderRadius: 12, padding: 20, border: "1px solid #ffebf1", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>{job.title}</h3>
                        <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{job.institution} • Applied recently</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ background: "#fff9db", color: "#f59e0b", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Under Review</div>
                        <button onClick={() => withdrawApplication(job.id)} style={{ background: "none", border: "none", color: "#ffb6c1", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Withdraw</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Saved Jobs */}
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Saved for Later</h2>
              {saved.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 14 }}>No saved jobs yet. Browse and save jobs to see them here.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {saved.map(job => (
                    <div key={job.id} style={{ background: "#ffffff", borderRadius: 12, padding: 16, border: "1px solid #ffebf1" }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>{job.title}</h3>
                      <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 12px" }}>{job.institution}</p>
                      <div style={{ display: "flex", gap: 10 }}>
                        <Link to={`/jobs/${job.id}`} style={{ flex: 1, textAlign: "center", padding: "6px", background: "#98fb98", color: "#000", borderRadius: 6, fontSize: 12, textDecoration: "none", fontWeight: 600 }}>Apply</Link>
                        <button onClick={() => removeSaved(job.id)} style={{ flex: 1, padding: "6px", background: "none", border: "1px solid #ffebf1", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Job Alerts / Waitlist */}
            <div style={{ background: "#ffffff", borderRadius: 12, padding: 20, border: "1px solid #ffebf1" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Job Waitlist</h3>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Get notified when these roles open:</p>

              {waitlist.length === 0 ? (
                <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>No alerts set. Add one below.</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {waitlist.map(term => (
                    <span key={term} style={{ background: "#fff5f8", border: "1px solid #ffebf1", padding: "4px 10px", borderRadius: 20, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
                      {term}
                      <button onClick={() => removeWaitlist(term)} style={{ border: "none", background: "none", cursor: "pointer", color: "#ffb6c1", fontWeight: 800 }}>×</button>
                    </span>
                  ))}
                </div>
              )}

              {showAlertInput ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={newAlert}
                    onChange={e => setNewAlert(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addAlert()}
                    placeholder="e.g. Data Science"
                    autoFocus
                    style={{ flex: 1, padding: "6px 10px", border: "1px solid #ffb6c1", borderRadius: 8, fontSize: 12, outline: "none" }}
                  />
                  <button onClick={addAlert} style={{ padding: "6px 12px", background: "#ffb6c1", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Add</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAlertInput(true)}
                  style={{ width: "100%", padding: "8px", border: "1px dashed #ffb6c1", background: "none", borderRadius: 8, color: "#ffb6c1", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  + Add Alert
                </button>
              )}
            </div>

            {/* CV Upload */}
            <div style={{ background: "linear-gradient(135deg, #ffb6c1, #98fb98)", borderRadius: 12, padding: 20, color: "#fff" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>Resume Update</h3>
              <p style={{ fontSize: 12, margin: "0 0 16px", opacity: 0.9 }}>
                {cvFileName
                  ? `Uploaded: ${cvFileName}`
                  : "Your resume was last updated 4 months ago. Keeping it fresh increases visibility!"}
              </p>
              <label style={{ display: "block", width: "100%", boxSizing: "border-box" }}>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} style={{ display: "none" }} />
                <span style={{ display: "block", width: "100%", padding: "10px", background: "#fff", border: "none", borderRadius: 8, color: "#1e293b", fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "center", boxSizing: "border-box" }}>
                  {cvFileName ? "Replace CV" : "Upload New CV"}
                </span>
              </label>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}