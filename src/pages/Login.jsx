import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      setTimeout(() => navigate("/"), 200);
    } catch (err) {
      // Show specific Firebase error messages
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setError("No account found with this email. Please register first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please wait a moment and try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Sign in failed: " + (err.message || "Please try again."));
      }
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

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)", background: "#fff5f8",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem"
    }}>
      <div style={{
        width: "100%", maxWidth: 420, background: "#ffffff",
        borderRadius: 16, padding: "40px 36px",
        border: "1px solid #ffebf1", boxShadow: "0 10px 25px rgba(0,0,0,0.04)"
      }}>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, margin: "0 auto 16px",
            background: "linear-gradient(135deg, #ffb6c1, #98fb98)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "Georgia, serif"
          }}>C</div>
          <h1 style={{ color: "#1e293b", fontSize: 22, fontWeight: 700, fontFamily: "Georgia, serif", margin: "0 0 6px" }}>
            Welcome back
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Sign in to your Campus Careers account</p>
        </div>

        {/* Error box */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            color: "#dc2626", padding: "12px 14px", borderRadius: 8,
            fontSize: 13, marginBottom: 20, lineHeight: 1.5
          }}>
            {error}
            {error.includes("register") && (
              <div style={{ marginTop: 6 }}>
                <Link to="/register" style={{ color: "#dc2626", fontWeight: 600 }}>
                  Create an account →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
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
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 6 }}>Password</label>
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Register link */}
        <p style={{ textAlign: "center", color: "#64748b", fontSize: 13, marginTop: 24, marginBottom: 0 }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#d4818d", textDecoration: "none", fontWeight: 600 }}>
            Create one →
          </Link>
        </p>

        {/* Info box — explains demo accounts need to be registered first */}
        <div style={{
          marginTop: 20, padding: 14, background: "#fff5f8",
          borderRadius: 8, border: "1px solid #ffebf1"
        }}>
          <p style={{ color: "#d4818d", fontSize: 11, fontWeight: 700, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            First time here?
          </p>
          <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 4px", lineHeight: 1.5 }}>
            You must <Link to="/register" style={{ color: "#d4818d", fontWeight: 600 }}>register an account</Link> before you can log in — Firebase doesn't have any users until you create them.
          </p>
          <p style={{ color: "#94a3b8", fontSize: 11, margin: 0 }}>
            Pick a role (Seeker, Recruiter, or Admin) on the register page.
          </p>
        </div>

      </div>
    </div>
  );
}