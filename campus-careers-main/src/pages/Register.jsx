import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "seeker" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await register(form.email, form.password, form.role, form.name);
      const routes = { admin: "/admin", recruiter: "/recruiter", seeker: "/seeker" };
      navigate(routes[form.role] || "/seeker");
    } catch (err) {
      const errorMessages = {
        "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
        "auth/invalid-email": "That email address doesn't look right. Please check and try again.",
        "auth/weak-password": "Password is too weak. Use at least 6 characters.",
        "auth/network-request-failed": "Network error — check your internet connection and try again.",
        "auth/operation-not-allowed": "Email/Password sign-up is not enabled. Go to Firebase Console → Authentication → Sign-in method and enable Email/Password.",
        "auth/configuration-not-found": "Firebase is not configured correctly. Make sure your config keys in firebase/config.js are correct.",
        "auth/api-key-not-valid": "Your Firebase API key is invalid. Check src/firebase/config.js.",
        "auth/project-not-found": "Firebase project not found. Check your projectId in src/firebase/config.js.",
      };
      const msg = errorMessages[err.code] || `Registration failed (${err.code || "unknown"}): ${err.message}`;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 8,
    background: "#ffffff", border: "1px solid #ffebf1",
    color: "#1e293b", fontSize: 14, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s"
  };

  const roles = [
    { value: "seeker", label: "Job Seeker", desc: "Find positions" },
    { value: "recruiter", label: "Recruiter", desc: "Post openings" },
    { value: "admin", label: "Admin", desc: "Manage site" }
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#fff5f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#ffffff", borderRadius: 16, padding: "40px 36px", border: "1px solid #ffebf1", boxShadow: "0 10px 25px rgba(0,0,0,0.04)" }}>

        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, margin: "0 auto 16px", background: "linear-gradient(135deg, #ffb6c1, #98fb98)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "Georgia, serif" }}>C</div>
          <h1 style={{ color: "#1e293b", fontSize: 22, fontWeight: 700, fontFamily: "Georgia, serif", margin: "0 0 4px" }}>Create your account</h1>
          <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>Join Campus Careers today</p>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 14px", borderRadius: 8, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 6 }}>Full Name</label>
            <input
              placeholder="Dr. Jane Smith"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#ffb6c1"}
              onBlur={e => e.target.style.borderColor = "#ffebf1"}
              required
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#ffb6c1"}
              onBlur={e => e.target.style.borderColor = "#ffebf1"}
              required
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 6 }}>
              Password <span style={{ color: "#94a3b8", fontWeight: 400 }}>(min. 6 characters)</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#ffb6c1"}
              onBlur={e => e.target.style.borderColor = "#ffebf1"}
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 10 }}>I am a...</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {roles.map(({ value, label, desc }) => (
                <div
                  key={value}
                  onClick={() => setForm({ ...form, role: value })}
                  style={{
                    padding: "12px 10px", borderRadius: 8, cursor: "pointer", textAlign: "center",
                    border: form.role === value ? "2px solid #98fb98" : "2px solid #ffebf1",
                    background: form.role === value ? "rgba(152,251,152,0.1)" : "#ffffff",
                    transition: "all 0.15s"
                  }}
                >
                  <div style={{ color: form.role === value ? "#057a55" : "#64748b", fontSize: 13, fontWeight: 600 }}>{label}</div>
                  <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px", borderRadius: 8, border: "none",
              background: loading ? "#b8f0b8" : "#98fb98",
              color: "#166534", fontSize: 15, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s"
            }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#64748b", fontSize: 13, marginTop: 24, marginBottom: 0 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#d4818d", textDecoration: "none", fontWeight: 600 }}>Sign in →</Link>
        </p>

        {/* Firebase checklist */}
        <div style={{ marginTop: 20, padding: 14, background: "#fff5f8", borderRadius: 8, border: "1px solid #ffebf1" }}>
          <p style={{ color: "#d4818d", fontSize: 11, fontWeight: 700, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>If registration keeps failing, check:</p>
          {[
            "Firebase Console → Authentication → Sign-in method → Email/Password is enabled",
            "Firebase Console → Firestore Database is created (test mode is fine)",
            "src/firebase/config.js has your real API keys (not placeholder text)",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "flex-start" }}>
              <span style={{ color: "#98fb98", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>✓</span>
              <p style={{ color: "#64748b", fontSize: 11, margin: 0, lineHeight: 1.5 }}>{tip}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}