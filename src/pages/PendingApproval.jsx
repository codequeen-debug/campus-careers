import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PendingApproval() {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await logout();
    navigate("/");
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#fff5f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 540, background: "#ffffff", borderRadius: 16, padding: "40px 36px", border: "1px solid #ffebf1", boxShadow: "0 10px 25px rgba(0,0,0,0.04)" }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <h1 style={{ color: "#1e293b", fontSize: 24, fontWeight: 700, fontFamily: "Georgia, serif", margin: "0 0 10px" }}>Recruiter Account Pending Approval</h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Thanks for registering, {userData?.name || "Recruiter"}. Your account is awaiting administrative approval.</p>
        </div>

        <div style={{ background: "#f8fafc", border: "1px solid #dbeafe", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <p style={{ color: "#0f172a", fontSize: 15, fontWeight: 600, marginBottom: 12 }}>What happens next</p>
          <ul style={{ color: "#475569", fontSize: 13, lineHeight: 1.8, margin: 0, paddingLeft: 18 }}>
            <li>Your recruiter registration is under review by an administrator.</li>
            <li>Once approved, you will have access to job posting tools and the recruiter dashboard.</li>
            <li>If your request is declined, you can contact support or try again with an updated application.</li>
          </ul>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <button
            onClick={handleSignOut}
            style={{ flex: 1, padding: "12px 18px", borderRadius: 10, border: "1px solid #ffebf1", background: "#ffffff", color: "#475569", cursor: "pointer", fontWeight: 700 }}
          >
            Sign out
          </button>
          <button
            onClick={() => navigate("/")}
            style={{ flex: 1, padding: "12px 18px", borderRadius: 10, border: "none", background: "#98fb98", color: "#166534", cursor: "pointer", fontWeight: 700 }}
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
