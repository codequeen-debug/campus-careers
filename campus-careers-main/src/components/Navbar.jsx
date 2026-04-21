import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { currentUser, userRole, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  function getDashboardLink() {
    if (userRole === "admin") return "/admin";
    if (userRole === "recruiter") return "/recruiter";
    return "/seeker";
  }

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <nav style={{
      background: "#ffffff",
      borderBottom: "1px solid #e2e8f0",
      padding: "0 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "64px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
    }}>

      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 800, color: "#fff",
          fontFamily: "'Georgia', serif"
        }}>C</div>
        <span style={{ fontWeight: 700, fontSize: 18, fontFamily: "'Georgia', serif", letterSpacing: "-0.3px", color: "#0f172a" }}>
          Campus<span style={{ color: "#2563eb" }}>Careers</span>
        </span>
      </Link>

      {/* Center links */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {[{ to: "/", label: "Home" }, { to: "/jobs", label: "Browse Jobs" }].map(({ to, label }) => (
          <Link key={to} to={to} style={{
            color: isActive(to) ? "#2563eb" : "#475569",
            textDecoration: "none",
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: isActive(to) ? 600 : 400,
            background: isActive(to) ? "#eff6ff" : "transparent",
            transition: "all 0.15s"
          }}
            onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.background = "#f8fafc"; }}
            onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.background = "transparent"; }}
          >{label}</Link>
        ))}
        {currentUser && (
          <Link to={getDashboardLink()} style={{
            color: isActive(getDashboardLink()) ? "#2563eb" : "#475569",
            textDecoration: "none",
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: isActive(getDashboardLink()) ? 600 : 400,
            background: isActive(getDashboardLink()) ? "#eff6ff" : "transparent",
            transition: "all 0.15s"
          }}
            onMouseEnter={e => { if (!isActive(getDashboardLink())) e.currentTarget.style.background = "#f8fafc"; }}
            onMouseLeave={e => { if (!isActive(getDashboardLink())) e.currentTarget.style.background = "transparent"; }}
          >Dashboard</Link>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {currentUser ? (
          <>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "5px 10px 5px 5px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0
              }}>
                {userData?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <div style={{ color: "#0f172a", fontSize: 13, fontWeight: 500, lineHeight: 1 }}>
                  {userData?.name || "User"}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 11, textTransform: "capitalize", lineHeight: 1.5 }}>
                  {userRole}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "1px solid #e2e8f0",
                color: "#64748b",
                padding: "6px 14px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                transition: "all 0.15s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#ef4444";
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.background = "#fef2f2";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.background = "transparent";
              }}
            >Sign out</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              color: "#475569",
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 14,
              transition: "color 0.15s"
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#0f172a"}
              onMouseLeave={e => e.currentTarget.style.color = "#475569"}
            >Log in</Link>

            <Link to="/register" style={{
              background: "#2563eb",
              color: "#fff",
              textDecoration: "none",
              padding: "7px 16px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              transition: "background 0.15s"
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
              onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
            >Get started</Link>
          </>
        )}
      </div>
    </nav>
  );
}