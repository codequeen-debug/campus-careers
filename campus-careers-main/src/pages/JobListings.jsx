import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { mockJobs, categories, locations } from "../data/mockJobs";

export default function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [location, setLocation] = useState("All Locations");
  const [salaryMin, setSalaryMin] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 4;

  useEffect(() => {
    async function fetchJobs() {
      try {
        const { db } = await import("../firebase");
        const { collection, getDocs, addDoc } = await import("firebase/firestore");
        const snapshot = await getDocs(collection(db, "jobs"));

        if (snapshot.empty) {
          const seeded = [];
          for (const job of mockJobs) {
            const { id, ...jobData } = job;
            const ref = await addDoc(collection(db, "jobs"), jobData);
            seeded.push({ ...jobData, id: ref.id });
          }
          setJobs(seeded);
        } else {
          const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setJobs(fetched);
        }
      } catch (err) {
        console.warn("Firestore unavailable, using mock data:", err.message);
        setJobs(mockJobs);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filtered = useMemo(() => {
    return jobs.filter(job => {
      const matchSearch = !search ||
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.institution?.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All Categories" || job.department === category;
      const matchLoc = location === "All Locations" || job.location === location;
      return matchSearch && matchCat && matchLoc && (job.salaryMin || 0) >= salaryMin;
    });
  }, [jobs, search, category, location, salaryMin]);

  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const selectStyle = {
    padding: "9px 12px", borderRadius: 8, background: "#ffffff",
    border: "1px solid #ffebf1", color: "#1e293b", fontSize: 13, outline: "none", cursor: "pointer"
  };

  if (loading) return (
    <div style={{ background: "#fff5f8", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #ffb6c1", borderTopColor: "#98fb98", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#64748b" }}>Loading positions...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#fff5f8", minHeight: "calc(100vh - 64px)", color: "#1e293b" }}>
      <div style={{ borderBottom: "1px solid #ffebf1", padding: "32px 2rem", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia, serif", margin: "0 0 6px" }}>Browse Positions</h1>
          <p style={{ color: "#64748b", margin: "0 0 24px" }}>{filtered.length} position{filtered.length !== 1 ? "s" : ""} available</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              placeholder="Search by title or institution..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              style={{ flex: "1 1 280px", padding: "10px 14px", borderRadius: 8, background: "#ffffff", border: "1px solid #ffebf1", color: "#1e293b", fontSize: 14, outline: "none" }}
            />
            <select value={category} onChange={e => { setCategory(e.target.value); setCurrentPage(1); }} style={selectStyle}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={location} onChange={e => { setLocation(e.target.value); setCurrentPage(1); }} style={selectStyle}>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={salaryMin} onChange={e => { setSalaryMin(Number(e.target.value)); setCurrentPage(1); }} style={selectStyle}>
              <option value={0}>Any salary</option>
              <option value={60000}>$60k+</option>
              <option value={80000}>$80k+</option>
              <option value={100000}>$100k+</option>
              <option value={120000}>$120k+</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 2rem" }}>
        {paginated.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "#64748b", marginBottom: 16 }}>No positions match your search.</p>
            <button
              onClick={() => { setSearch(""); setCategory("All Categories"); setLocation("All Locations"); setSalaryMin(0); setCurrentPage(1); }}
              style={{ background: "#98fb98", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 600, color: "#166534" }}
            >Clear filters</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {paginated.map(job => (
              <Link key={job.id} to={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{ background: "#ffffff", borderRadius: 12, padding: "24px 28px", border: "1px solid #ffebf1", display: "flex", gap: 20, transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#98fb98"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#ffebf1"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg, #ffb6c1, #98fb98)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 20 }}>
                    {job.institution?.charAt(0) || "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ color: "#1e293b", margin: "0 0 4px", fontSize: 16, fontWeight: 600 }}>{job.title}</h3>
                    <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 10px" }}>{job.institution} · {job.location}</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ background: "rgba(152,251,152,0.2)", color: "#057a55", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{job.type}</span>
                      <span style={{ background: "rgba(255,182,193,0.2)", color: "#be185d", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>{job.department}</span>
                      <span style={{ color: "#057a55", fontSize: 14, fontWeight: 600 }}>${Number(job.salaryMin).toLocaleString()} – ${Number(job.salaryMax).toLocaleString()}</span>
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : "—"}</span>
                    </div>
                  </div>
                  <span style={{ alignSelf: "center", flexShrink: 0, background: "#98fb98", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#166534" }}>View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 36 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} style={{
                width: 36, height: 36, borderRadius: 8,
                border: currentPage === page ? "2px solid #98fb98" : "1px solid #ffebf1",
                background: currentPage === page ? "#98fb98" : "#fff",
                color: currentPage === page ? "#166534" : "#64748b",
                cursor: "pointer", fontSize: 14, fontWeight: currentPage === page ? 600 : 400
              }}>{page}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}