import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3005";

export default function Home() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs from backend on mount
  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch(`${API_BASE}/api/jobs`);
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Fetch jobs error:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const featuredJobs = jobs.slice(0, 3);

  function getDashboardLink() {
    if (userData?.role === "admin") return "/admin";
    if (userData?.role === "recruiter") return "/recruiter";
    return "/seeker";
  }

  // When a featured job card is clicked, go to /jobs and open that job's detail panel
  function goToJob(jobId) {
    navigate("/jobs", { state: { openJobId: jobId } });
  }

  return (
    <div style={{ background: "#fff5f8", minHeight: "100vh", color: "#1e293b" }}>

      {/* Hero */}
      <section style={{
        padding: "80px 2rem 60px", textAlign: "center",
        background: "linear-gradient(180deg, #fff5f8 0%, #fff 60%, #fff 100%)",
        position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,182,193,0.3) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-block", padding: "4px 14px", borderRadius: 20,
            background: "rgba(152,251,152,0.1)", border: "1px solid rgba(152,251,152,0.4)",
            color: "#057a55", fontSize: 13, fontWeight: 500, marginBottom: 24
          }}>
            Higher Education's #1 Job Platform
          </div>
          <h1 style={{
            fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800,
            fontFamily: "'Georgia', serif", lineHeight: 1.1,
            margin: "0 auto 20px", maxWidth: 700,
            background: "linear-gradient(135deg, #1e293b 0%, #ffb6c1 50%, #98fb98 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Find Your Next Academic Position
          </h1>
          <p style={{ color: "#64748b", fontSize: 18, maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Connect with universities and colleges across the country. Browse faculty, administrative, and staff openings.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/jobs" style={{
              background: "#98fb98", color: "#000", textDecoration: "none",
              padding: "13px 28px", borderRadius: 8, fontSize: 15, fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 8
            }}>Browse All Jobs →</Link>
            {currentUser ? (
              <Link to={getDashboardLink()} style={{
                background: "transparent", color: "#475569", textDecoration: "none",
                padding: "13px 28px", borderRadius: 8, fontSize: 15, fontWeight: 500,
                border: "1px solid #ffb6c1"
              }}>Go to Dashboard</Link>
            ) : (
              <Link to="/register" style={{
                background: "transparent", color: "#475569", textDecoration: "none",
                padding: "13px 28px", borderRadius: 8, fontSize: 15, fontWeight: 500,
                border: "1px solid #ffb6c1"
              }}>Create Account</Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar — live from localStorage */}
      <div style={{
        display: "flex", justifyContent: "center", gap: "60px",
        padding: "32px 2rem", borderTop: "1px solid #ffebf1", borderBottom: "1px solid #ffebf1",
        flexWrap: "wrap"
      }}>
        {[
          [jobs.length || "0", "Open Positions"],
          [new Set(jobs.map(j => j.institution)).size || "0", "Institutions"],
          ["3", "User Roles"],
          ["100%", "Free to Apply"]
        ].map(([num, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#98fb98", fontFamily: "Georgia, serif" }}>{num}</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Featured Jobs */}
      <section style={{ padding: "64px 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, fontFamily: "Georgia, serif", margin: 0, color: "#1e293b" }}>Featured Positions</h2>
          <Link to="/jobs" style={{ color: "#ffb6c1", textDecoration: "none", fontSize: 14 }}>View all →</Link>
        </div>

        {featuredJobs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", background: "#fff", borderRadius: 12, border: "1px solid #ffebf1" }}>
            No positions posted yet.{" "}
            {currentUser && userData?.role === "recruiter" && (
              <Link to="/recruiter" style={{ color: "#d4818d" }}>Post one from your dashboard →</Link>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {featuredJobs.map(job => (
              <div
                key={job.id}
                onClick={() => goToJob(job.id)}
                style={{
                  background: "#ffffff", borderRadius: 12, padding: 24,
                  border: "1px solid #ffebf1", cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#98fb98"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#ffebf1"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: "linear-gradient(135deg, #ffb6c1, #98fb98)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, color: "#000"
                  }}>
                    {job.institution?.charAt(0) || "?"}
                  </div>
                  <span style={{
                    background: "rgba(152,251,152,0.15)", color: "#057a55",
                    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500
                  }}>{job.type}</span>
                </div>
                <h3 style={{ color: "#1e293b", fontSize: 16, fontWeight: 600, margin: "0 0 4px" }}>{job.title}</h3>
                <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 16px" }}>{job.institution} · {job.location}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#057a55", fontSize: 13, fontWeight: 500 }}>
                    ${Number(job.salaryMin).toLocaleString()} – ${Number(job.salaryMax).toLocaleString()}
                  </span>
                  <span style={{ color: "#64748b", fontSize: 12 }}>
                    {job.deadline ? `Deadline: ${new Date(job.deadline).toLocaleDateString()}` : "Open deadline"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      {!currentUser && (
        <section style={{
          margin: "0 auto 64px", maxWidth: 1060, padding: "0 2rem"
        }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(255,182,193,0.15), rgba(152,251,152,0.15))",
            border: "1px solid rgba(255,182,193,0.3)", borderRadius: 16, padding: "48px",
            textAlign: "center"
          }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", margin: "0 0 12px", color: "#1e293b" }}>Ready to find your position?</h2>
            <p style={{ color: "#64748b", margin: "0 0 28px" }}>Join as a job seeker or post openings as a recruiter.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link to="/register" style={{
                background: "#98fb98", color: "#000", textDecoration: "none",
                padding: "11px 24px", borderRadius: 8, fontSize: 14, fontWeight: 600
              }}>Create Account</Link>
              <Link to="/login" style={{
                background: "transparent", color: "#475569", textDecoration: "none",
                padding: "11px 24px", borderRadius: 8, fontSize: 14,
                border: "1px solid #ffb6c1"
              }}>Sign In</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}