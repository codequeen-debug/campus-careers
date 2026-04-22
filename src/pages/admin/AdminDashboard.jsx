import { useState } from "react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([
    { id: 1, name: "Admin User", role: "admin", status: "Active" },
    { id: 2, name: "John Seeker", role: "seeker", status: "Active" },
    { id: 3, name: "Jane Recruiter", role: "recruiter", status: "Suspended" }
  ]);

  const logs = [
    { action: "New Job Posted", user: "Jane R.", time: "2 mins ago" },
    { action: "User Deleted", user: "System", time: "1 hour ago" },
    { action: "Login Failed", user: "Unknown", time: "3 hours ago" }
  ];

  return (
    <div style={{ background: "#fff5f8", minHeight: "calc(100vh - 64px)", padding: "40px 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontFamily: "Georgia, serif" }}>Platform Oversight</h1>
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <span style={{ color: "#22c55e", fontSize: 12, fontWeight: 700 }}>● SYSTEM ONLINE</span>
            <span style={{ color: "#64748b", fontSize: 12 }}>v2.0.4-Pastel</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
          {/* User Management Table */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #ffebf1", overflow: "hidden" }}>
            <div style={{ padding: 20, borderBottom: "1px solid #fff5f8", fontWeight: 700 }}>User Directory</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", background: "#fff5f8", color: "#64748b" }}>
                  <th style={{ padding: 12 }}>Name</th>
                  <th style={{ padding: 12 }}>Role</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #fff5f8" }}>
                    <td style={{ padding: 12 }}>{u.name}</td>
                    <td style={{ padding: 12, textTransform: "capitalize" }}>{u.role}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ color: u.status === "Active" ? "#057a55" : "#d4818d" }}>{u.status}</span>
                    </td>
                    <td style={{ padding: 12 }}>
                      <button style={{ background: "none", border: "none", color: "#ffb6c1", cursor: "pointer", fontWeight: 600 }}>Modify</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Audit Logs */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #ffebf1", padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Audit Trail</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {logs.map((log, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", borderLeft: "3px solid #98fb98", paddingLeft: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{log.action}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>By {log.user}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{log.time}</div>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", marginTop: 24, padding: 10, borderRadius: 8, border: "1px solid #ffebf1", background: "none", color: "#64748b", fontSize: 12, cursor: "pointer" }}>Export System Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}