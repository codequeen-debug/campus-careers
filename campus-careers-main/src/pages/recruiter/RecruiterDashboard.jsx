import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { mockJobs } from "../../data/mockJobs";

export default function RecruiterDashboard() {
  const { userData } = useAuth();
  const [jobs, setJobs] = useState(mockJobs.slice(0, 2));
  const [waitlistCandidates, setWaitlistCandidates] = useState([
    { id: 1, name: "Dr. Sarah Jenkins", role: "Physics" },
    { id: 2, name: "Mark Peterson", role: "IT Admin" }
  ]);

  const stats = [
    { label: "Active Jobs", value: jobs.length, color: "#ffb6c1" },
    { label: "Applicants", value: 18, color: "#98fb98" },
    { label: "Interviews", value: 4, color: "#a0e7e5" }
  ];

  function deleteJob(id) {
    if(window.confirm("Delete this posting?")) {
      setJobs(jobs.filter(j => j.id !== id));
    }
  }

  return (
    <div style={{ background: "#fff5f8", minHeight: "calc(100vh - 64px)", padding: "40px 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontFamily: "Georgia, serif", color: "#1e293b" }}>Recruiter Command Center</h1>
            <p style={{ color: "#64748b" }}>Managing for {userData?.name || "Institution"}</p>
          </div>
          <button style={{ background: "#98fb98", border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>+ Create Posting</button>
        </div>

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
            {jobs.map(job => (
              <div key={job.id} style={{ background: "#fff", p: 20, borderRadius: 12, border: "1px solid #ffebf1", padding: 20, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16 }}>{job.title}</h3>
                    <p style={{ fontSize: 13, color: "#64748b" }}>{job.department} • {job.location}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ background: "#fff", border: "1px solid #ffebf1", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>Edit</button>
                    <button onClick={() => deleteJob(job.id)} style={{ background: "#fff5f8", border: "1px solid #ffb6c1", color: "#d4818d", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Candidate Waitlist */}
          <section>
            <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #ffebf1" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Candidate Waitlist</h3>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Strong profiles for future openings.</p>
              {waitlistCandidates.map(c => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #fff5f8" }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                  <span style={{ fontSize: 11, background: "#fbe7c6", padding: "2px 8px", borderRadius: 4 }}>{c.role}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}