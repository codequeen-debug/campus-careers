import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function JobDetail() {
  const { id } = useParams();
  const { currentUser, userRole, userData } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJob() {
      try {
        const snap = await getDoc(doc(db, "jobs", id));
        if (snap.exists()) {
          setJob({ id: snap.id, ...snap.data() });
        } else {
          setJob(null);
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        setJob(null);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  async function handleApply(e) {
    e.preventDefault();
    if (!currentUser) { navigate("/login"); return; }
    setSubmitting(true);
    setError("");
    try {
      await addDoc(collection(db, "applications"), {
        jobId: id,
        jobTitle: job.title,
        institution: job.institution,
        applicantId: currentUser.uid,
        applicantName: userData?.name || "",
        applicantEmail: currentUser.email,
        resumeUrl,
        coverLetter,
        dateApplied: new Date().toISOString(),
        status: "pending"
      });
      setApplied(true);
      setShowModal(false);
    } catch (err) {
      setError("Failed to submit application. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    background: "#fff", border: "1px solid #ffebf1",
    color: "#1e293b", fontSize: 14, outline: "none", boxSizing: "border-box"
  };

  // Loading state
  if (loading) return (
    <div style={{ background: "#fff5f8", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #ffb6c1", borderTopColor: "#98fb98", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#64748b" }}>Loading position...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  // Job not found
  if (!job) return (
    <div style={{ background: "#fff5f8", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e293b" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ marginBottom: 12 }}>Job not found</h2>
        <p style={{ color: "#64748b", marginBottom: 20 }}>This position may have been removed or the link is invalid.</p>
        <Link to="/jobs" style={{ color: "#fff", background: "#98fb98", padding: "10px 20px", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>← Back to listings</Link>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#fff5f8", minHeight: "calc(100vh - 64px)", color: "#1e293b" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 2rem" }}>

        <Link to="/jobs" style={{ color: "#d4818d", textDecoration: "none", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
          ← Back to listings
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "flex-start" }}>

          {/* Main content */}
          <div>
            <div style={{ background: "#ffffff", borderRadius: 14, padding: 32, border: "1px solid #ffebf1", marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 12, flexShrink: 0,
                  background: "linear-gradient(135deg, #ffb6c1, #98fb98)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, fontWeight: 700, color: "#fff"
                }}>{job.institution?.charAt(0) || "?"}</div>
                <div>
                  <h1 style={{ color: "#1e293b", fontSize: 22, fontWeight: 700, margin: "0 0 4px", fontFamily: "Georgia, serif" }}>
                    {job.title}
                  </h1>
                  <p style={{ color: "#64748b", margin: 0, fontSize: 15 }}>{job.institution} · {job.location}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
                {[
                  { label: job.department, color: "rgba(255,182,193,0.2)", text: "#d4818d" },
                  { label: job.type, color: "rgba(152,251,152,0.2)", text: "#057a55" },
                  { label: job.location, color: "rgba(255,182,193,0.1)", text: "#64748b" }
                ].map(({ label, color, text }) => label && (
                  <span key={label} style={{ background: color, color: text, padding: "5px 12px", borderRadius: 20, fontSize: 13 }}>{label}</span>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #ffebf1", paddingTop: 24 }}>
                <h3 style={{ color: "#64748b", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>Position Description</h3>
                <p style={{ color: "#475569", lineHeight: 1.8, fontSize: 15, margin: 0 }}>{job.description}</p>
              </div>
            </div>

            <div style={{ background: "#ffffff", borderRadius: 14, padding: 32, border: "1px solid #ffebf1" }}>
              <h3 style={{ color: "#64748b", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>Required Qualifications</h3>
              <p style={{ color: "#475569", lineHeight: 1.8, fontSize: 15, margin: 0 }}>{job.qualifications}</p>
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div style={{ background: "#ffffff", borderRadius: 14, padding: 24, border: "1px solid #ffebf1" }}>
              <h3 style={{ color: "#1e293b", fontSize: 16, fontWeight: 600, margin: "0 0 20px" }}>Position Details</h3>
              {[
                { label: "Salary Range", value: `$${Number(job.salaryMin).toLocaleString()} – $${Number(job.salaryMax).toLocaleString()}`, color: "#057a55" },
                { label: "Application Deadline", value: job.deadline ? new Date(job.deadline).toLocaleDateString() : "—" },
                { label: "Expected Start", value: job.startDate ? new Date(job.startDate).toLocaleDateString() : "—" },
                { label: "Job Type", value: job.type },
                { label: "Department", value: job.department },
                { label: "Location", value: job.location }
              ].map(({ label, value, color }) => (
                <div key={label} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #fff5f8" }}>
                  <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 3 }}>{label}</div>
                  <div style={{ color: color || "#475569", fontSize: 14, fontWeight: 500 }}>{value}</div>
                </div>
              ))}

              {applied ? (
                <div style={{ textAlign: "center", padding: 14, background: "rgba(152,251,152,0.2)", border: "1px solid #98fb98", borderRadius: 8, color: "#057a55", fontWeight: 600, fontSize: 14 }}>
                  ✓ Application Submitted!
                </div>
              ) : userRole === "seeker" ? (
                <button onClick={() => setShowModal(true)} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: "#98fb98", color: "#166534", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Apply Now
                </button>
              ) : !currentUser ? (
                <Link to="/login" style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 8, background: "#98fb98", color: "#166534", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                  Sign in to Apply
                </Link>
              ) : (
                <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "8px 0" }}>
                  Only job seekers can apply
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(30,41,59,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: 16, padding: 36, maxWidth: 520, width: "100%", border: "1px solid #ffebf1", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)" }}>
            <h2 style={{ color: "#1e293b", fontSize: 20, fontWeight: 700, margin: "0 0 6px", fontFamily: "Georgia, serif" }}>Apply for Position</h2>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>{job.title} at {job.institution}</p>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleApply}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 6 }}>Resume/CV URL *</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/your-resume"
                  value={resumeUrl}
                  onChange={e => setResumeUrl(e.target.value)}
                  style={inputStyle}
                  required
                />
                <p style={{ color: "#94a3b8", fontSize: 11, margin: "4px 0 0" }}>Upload to Google Drive or Dropbox and paste the link</p>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 6 }}>Cover Letter (optional)</label>
                <textarea
                  placeholder="Tell them why you're a great fit..."
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", borderRadius: 8, background: "transparent", border: "1px solid #ffebf1", color: "#64748b", cursor: "pointer", fontSize: 14 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ flex: 2, padding: "11px", borderRadius: 8, border: "none", background: submitting ? "#b8f0b8" : "#98fb98", color: "#166534", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}