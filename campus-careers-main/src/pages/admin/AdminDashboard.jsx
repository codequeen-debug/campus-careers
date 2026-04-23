import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("admin_logs")) || []; }
    catch { return []; }
  });
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch all users from Firestore on mount
  useEffect(() => {
    async function fetchUsers() {
      try {
        const snap = await getDocs(collection(db, "users"));
        const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(fetched);
      } catch (e) {
        console.error("Failed to fetch users:", e);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  // Persist logs to localStorage
  useEffect(() => {
    localStorage.setItem("admin_logs", JSON.stringify(logs));
  }, [logs]);

  function addLog(action, user) {
    const entry = { action, user, time: new Date().toLocaleTimeString() };
    setLogs(prev => [entry, ...prev].slice(0, 20));
  }

  async function toggleStatus(userId) {
    const user = users.find(u => u.id === userId);
    const nextStatus = user.status === "Suspended" ? "Active" : "Suspended";
    try {
      await updateDoc(doc(db, "users", userId), { status: nextStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
      addLog(`User ${nextStatus}`, user.name);
    } catch (e) {
      console.error("Failed to update user:", e);
    }
  }

  async function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
      addLog("User Deleted", user.name);
    } catch (e) {
      console.error("Failed to delete user:", e);
    }
  }

  function exportCSV() {
    const rows = [["Name", "Email", "Role", "Status"],
      ...users.map(u => [u.name, u.email, u.role, u.status || "Active"])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "users_report.csv";
    a.click();
    addLog("Report Exported", "Admin");
  }

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

          {/* User Directory */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #ffebf1", overflow: "hidden" }}>
            <div style={{ padding: 20, borderBottom: "1px solid #fff5f8", fontWeight: 700 }}>
              User Directory{" "}
              <span style={{ fontWeight: 400, fontSize: 12, color: "#94a3b8" }}>
                ({loadingUsers ? "..." : users.length} users)
              </span>
            </div>

            {loadingUsers ? (
              <p style={{ padding: 20, color: "#94a3b8", fontSize: 13 }}>Loading users...</p>
            ) : users.length === 0 ? (
              <p style={{ padding: 20, color: "#94a3b8", fontSize: 13 }}>No registered users yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", background: "#fff5f8", color: "#64748b" }}>
                    <th style={{ padding: 12 }}>Name</th>
                    <th style={{ padding: 12 }}>Email</th>
                    <th style={{ padding: 12 }}>Role</th>
                    <th style={{ padding: 12 }}>Status</th>
                    <th style={{ padding: 12 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #fff5f8" }}>
                      <td style={{ padding: 12 }}>{u.name}</td>
                      <td style={{ padding: 12, color: "#64748b" }}>{u.email}</td>
                      <td style={{ padding: 12, textTransform: "capitalize" }}>{u.role}</td>
                      <td style={{ padding: 12 }}>
                        <span style={{ color: (u.status === "Suspended") ? "#d4818d" : "#057a55" }}>
                          {u.status || "Active"}
                        </span>
                      </td>
                      <td style={{ padding: 12, display: "flex", gap: 8 }}>
                        <button
                          onClick={() => toggleStatus(u.id)}
                          style={{ background: "none", border: "none", color: "#ffb6c1", cursor: "pointer", fontWeight: 600, fontSize: 12 }}
                        >
                          {u.status === "Suspended" ? "Reinstate" : "Suspend"}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id)}
                          style={{ background: "none", border: "none", color: "#d4818d", cursor: "pointer", fontWeight: 600, fontSize: 12 }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Audit Logs */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #ffebf1", padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Audit Trail</h3>
            {logs.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94a3b8" }}>No activity yet.</p>
            ) : (
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
            )}
            <button
              onClick={exportCSV}
              style={{ width: "100%", marginTop: 24, padding: 10, borderRadius: 8, border: "1px solid #ffebf1", background: "none", color: "#64748b", fontSize: 12, cursor: "pointer" }}
            >
              Export System Report (.csv)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}