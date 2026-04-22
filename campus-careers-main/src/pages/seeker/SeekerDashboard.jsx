import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { mockJobs } from "../../data/mockJobs";

export default function SeekerDashboard() {
  const { userData } = useAuth();
  
  // State for CRUD operations
  const [savedJobs, setSavedJobs] = useState(["1", "3"]);
  const [appliedJobs, setAppliedJobs] = useState(["2"]);
  const [waitlist, setWaitlist] = useState(["Computer Science", "Research"]); // Job Alerts/Waitlist

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

  // Filtered Data
  const saved = mockJobs.filter(j => savedJobs.includes(j.id));
  const applied = mockJobs.filter(j => appliedJobs.includes(j.id));

  return (
    <div style={{ background: "#fff5f8", minHeight: "calc(100vh - 64px)", color: "#1e293b" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 2rem" }}>

        {/* Header */}
        <div style={{ marginBottom: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", margin: "0 0 6px", color: "#1e293b" }}>
              Welcome, {userData?.name?.split(" ")[0] || "Scholar"}
            </h1>
            <p style={{ color: "#64748b", margin: 0 }}>You have {applied.length} active applications.</p>
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
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#ffffff", borderRadius: 12, padding: "20px", border: "1px solid #ffebf1", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#1e293b" }}>{value}</div>
              <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          
          {/* Main Column: Applications & Saved */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            
            {/* Applications (CRUD: Withdraw) */}
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Active Applications</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {applied.map(job => (
                  <div key={job.id} style={{ background: "#ffffff", borderRadius: 12, padding: 20, border: "1px solid #ffebf1", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>{job.title}</h3>
                      <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{job.institution} • Applied 2 days ago</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ background: "#fff9db", color: "#f59e0b", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Under Review</div>
                      <button onClick={() => withdrawApplication(job.id)} style={{ background: "none", border: "none", color: "#ffb6c1", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Withdraw</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Saved Jobs (CRUD: Remove/Delete) */}
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Saved for Later</h2>
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
            </section>
          </div>

          {/* Sidebar: Waitlist & Profile */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Waitlist/Alerts (CRUD: Add/Delete) */}
            <div style={{ background: "#ffffff", borderRadius: 12, padding: 20, border: "1px solid #ffebf1" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Job Waitlist</h3>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Get notified when these roles open:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {waitlist.map(term => (
                  <span key={term} style={{ background: "#fff5f8", border: "1px solid #ffebf1", padding: "4px 10px", borderRadius: 20, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
                    {term}
                    <button onClick={() => removeWaitlist(term)} style={{ border: "none", background: "none", cursor: "pointer", color: "#ffb6c1", fontWeight: 800 }}>×</button>
                  </span>
                ))}
              </div>
              <button style={{ width: "100%", padding: "8px", border: "1px dashed #ffb6c1", background: "none", borderRadius: 8, color: "#ffb6c1", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add Alert</button>
            </div>

            {/* Profile Action */}
            <div style={{ background: "linear-gradient(135deg, #ffb6c1, #98fb98)", borderRadius: 12, padding: 20, color: "#fff" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>Resume Update</h3>
              <p style={{ fontSize: 12, margin: "0 0 16px", opacity: 0.9 }}>Your resume was last updated 4 months ago. Keeping it fresh increases visibility!</p>
              <button style={{ width: "100%", padding: "10px", background: "#fff", border: "none", borderRadius: 8, color: "#1e293b", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Upload New CV</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}