import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarMentor } from "../../components/SidebarMentor";
import { mentorApi } from "../../api/mentorApi";
import { useAuthStore } from "../../stores/authStore";
import { broadcastDataRefresh, onDataRefresh } from "../../utils/dataRefresh";
import { Eye, RefreshCw, Check } from 'lucide-react';

const s = {
  app: { display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Poppins', 'Segoe UI', sans-serif", fontSize: "14px", color: "#1e293b", gap: 0 },
  main: { flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", gap: 0, overflow: "hidden" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50, flexShrink: 0 },
  bc: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" },
  bcSep: { color: "#cbd5e1" },
  bcActive: { color: "#1e293b", fontWeight: 600 },
  topbarDate: { fontSize: "12px", color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 10px" },
  content: { padding: "28px", flex: 1, overflowY: "auto" },
  h1: { fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 },
  subtitle: { fontSize: "13px", color: "#64748b", marginTop: "4px", marginBottom: "20px" },
  card: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" },
  ch: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" },
  ct: { fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  cs: { fontSize: "12px", color: "#94a3b8", marginTop: "1px" },
  btnPrimary: { padding: "7px 16px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "900px" },
  thead: { background: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" },
  td: { padding: "13px 16px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", textAlign: "left" },
  cname: { fontWeight: 600, color: "#0f172a", fontSize: "13px", display: "block" },
  badge: (bg, color) => ({ display: "inline-flex", padding: "3px 9px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, background: bg, color }),
  acts: { display: "flex", gap: "6px", alignItems: "center" },
  btnSend: { height: "28px", padding: "0 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", border: "1px solid #93c5fd", background: "#eff6ff", color: "#2563eb", fontFamily: "inherit" },
  btnGenerate: { height: "28px", padding: "0 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #86efac", background: "#f0fdf4", color: "#16a34a", fontFamily: "inherit" },
  btnIconBox: { width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
};

export default function CertificateMentor() {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [statCards, setStatCards] = useState([]);
  const [certList, setCertList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState({});
  const [previewing, setPreviewing] = useState({});
  const [sending, setSending] = useState({});
  const [regenerateSuccess, setRegenerateSuccess] = useState({});
  const [logoutModal, setLogoutModal] = useState(false);

  // ─── EFFECTS ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();

    const handleFocus = () => fetchAll();
    window.addEventListener('focus', handleFocus);

    const cleanup = onDataRefresh(() => fetchAll());

    return () => {
      window.removeEventListener('focus', handleFocus);
      cleanup();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) fetchCerts(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── FETCH ───────────────────────────────────────────────────────────────
  const applyCerts = (data) => {
    setStatCards(data.stats || []);
    const transformed = (data.certificates || []).map(cert => ({
      ...cert,
      status: (cert.score === null || cert.score === 0) ? "In Progress" : cert.status,
    }));
    setCertList(transformed);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [profileRes, certRes] = await Promise.all([
        mentorApi.getProfile(),
        mentorApi.getCertificates(''),
      ]);
      setMentor(profileRes.data);
      applyCerts(certRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCerts = async (searchVal) => {
    setTableLoading(true);
    try {
      const res = await mentorApi.getCertificates(searchVal);
      applyCerts(res.data);
    } catch (err) {
      console.error('Error fetching certs:', err);
    } finally {
      setTableLoading(false);
    }
  };

  // ─── ACTIONS ─────────────────────────────────────────────────────────────
  const handleGenerateCertificate = async (idSubmission) => {
    try {
      setGenerating(prev => ({ ...prev, [idSubmission]: true }));
      await mentorApi.generateCertificate(idSubmission);
      broadcastDataRefresh('certificate');
      setRegenerateSuccess(prev => ({ ...prev, [idSubmission]: true }));
      setTimeout(() => setRegenerateSuccess(prev => ({ ...prev, [idSubmission]: false })), 3000);
      fetchAll();
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate');
    } finally {
      setGenerating(prev => ({ ...prev, [idSubmission]: false }));
    }
  };

  const handleSendCertificate = async (idSubmission) => {
    try {
      setSending(prev => ({ ...prev, [idSubmission]: true }));
      await mentorApi.sendCertificate(idSubmission);
      broadcastDataRefresh('certificate');
      fetchAll();
    } catch (error) {
      console.error('Error sending certificate:', error);
      alert('Failed to send certificate');
    } finally {
      setSending(prev => ({ ...prev, [idSubmission]: false }));
    }
  };

  const handlePreview = async (idSubmission) => {
    try {
      setPreviewing(prev => ({ ...prev, [idSubmission]: true }));
      const url = await mentorApi.previewCertificate(idSubmission);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error previewing certificate:', error);
      alert('Failed to preview certificate');
    } finally {
      setPreviewing(prev => ({ ...prev, [idSubmission]: false }));
    }
  };

  const handleLogoutClick = () => setLogoutModal(true);

  const confirmLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:8000/api/auth/logout", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      useAuthStore.setState({ isAuthenticated: false, token: null, user: null, company: null });
      setLogoutModal(false);
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div style={s.app}>
        <SidebarMentor mentor={mentor} onLogout={handleLogoutClick} />
        <main style={s.main}>
          <div style={s.topbar}>
            <div style={s.bc}>
              <span>Dashboard</span><span style={s.bcSep}>/</span>
              <span>Others</span><span style={s.bcSep}>/</span>
              <span style={s.bcActive}>Certificate</span>
            </div>
          </div>
          <div style={s.content}><p>Loading...</p></div>
        </main>
      </div>
    );
  }

  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 5px; } @keyframes spin { to { transform: rotate(360deg); } } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; } tr:last-child td { border-bottom: none; }`}</style>
      <SidebarMentor mentor={mentor} onLogout={handleLogoutClick} />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.bc}>
            <span>Dashboard</span><span style={s.bcSep}>/</span>
            <span>Others</span><span style={s.bcSep}>/</span>
            <span style={s.bcActive}>Certificate</span>
          </div>
          <div style={s.topbarDate}>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
        <div style={s.content}>
          <h1 style={s.h1}>Certificate</h1>
          <p style={s.subtitle}>Generate and manage certificates for interns who have passed all competency assessments.</p>

          <div style={s.card}>
            {/* Card Header */}
            <div style={{ ...s.ch, flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <div><div style={s.ct}>Certificate List</div><div style={s.cs}>Interns who have completed all competency assessments</div></div>
                <button style={s.btnPrimary}>Bulk Generate</button>
              </div>
              {/* Search Bar */}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
                padding: "7px 14px", width: "260px", alignSelf: "flex-start", marginTop: "4px",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: "#64748b", width: "100%", fontFamily: "inherit" }}
                />
                {search && (
                  <span onClick={() => setSearch("")} style={{ cursor: "pointer", color: "#94a3b8", fontSize: "16px", lineHeight: 1 }}>×</span>
                )}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto", width: "100%" }}>
              <table style={s.table}>
                <colgroup>
                  <col style={{ width: "22%" }} /><col style={{ width: "18%" }} /><col style={{ width: "20%" }} />
                  <col style={{ width: "12%" }} /><col style={{ width: "14%" }} /><col style={{ width: "14%" }} />
                </colgroup>
                <thead style={s.thead}>
                  <tr>
                    <th style={s.th}>INTERN</th><th style={s.th}>POSITION</th><th style={s.th}>PROGRAM</th>
                    <th style={s.th}>FINAL SCORE</th><th style={s.th}>STATUS</th><th style={{ ...s.th, textAlign: 'center' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                        <div style={{ display: "inline-block", width: "20px", height: "20px", border: "2px solid #e2e8f0", borderTopColor: "#8b5cf6", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                        <div style={{ marginTop: "10px" }}>Searching...</div>
                      </td>
                    </tr>
                  ) : certList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                        {search ? `No results for "${search}"` : "No certificates yet."}
                      </td>
                    </tr>
                  ) : (
                    certList.map((cert, i) => (
                      <tr key={i}>
                        <td style={s.td}><span style={s.cname}>{cert.name}</span></td>
                        <td style={s.td}>{cert.position}</td>
                        <td style={s.td}>{cert.program}</td>
                        <td style={s.td}>
                          {cert.score != null
                            ? <span style={{ fontWeight: 700, color: "#8b5cf6" }}>{cert.score.toFixed(1)}</span>
                            : <span style={{ color: "#94a3b8" }}>—</span>}
                        </td>
                        <td style={s.td}><span style={s.badge(cert.statusBg, cert.statusColor)}>{cert.status}</span></td>
                        <td style={{ ...s.td, textAlign: 'center' }}>
                          <div style={{ ...s.acts, justifyContent: 'center' }}>
                            {(cert.status === "Passed" || cert.status === "Generated") && (
                              <>
                                <button style={s.btnIconBox} onClick={() => handlePreview(cert.id_submission)} disabled={previewing[cert.id_submission]} title="Preview">
                                  <Eye size={15} />
                                </button>
                                <button style={s.btnIconBox} onClick={() => handleGenerateCertificate(cert.id_submission)} disabled={generating[cert.id_submission]} title="Regenerate">
                                  <RefreshCw size={15} />
                                </button>
                              </>
                            )}
                            {cert.status === "Generated" && (
                              <>
                                <button style={{ ...s.btnIconBox, opacity: 0.5, pointerEvents: 'none' }} title="Already sent">
                                  <Check size={15} />
                                </button>
                                <button style={s.btnSend} onClick={() => handleSendCertificate(cert.id_submission)} disabled={sending[cert.id_submission]}>
                                  {sending[cert.id_submission] ? 'Sending...' : 'Send'}
                                </button>
                              </>
                            )}
                            {cert.status === "Passed" && (
                              <button style={s.btnGenerate} onClick={() => handleGenerateCertificate(cert.id_submission)} disabled={generating[cert.id_submission]}>
                                {regenerateSuccess[cert.id_submission] ? '✓ Generated' : generating[cert.id_submission] ? 'Generating...' : 'Generate'}
                              </button>
                            )}
                            {(cert.status === "Not Passed" || cert.status === "In Progress") && (
                              <span style={{ color: "#cbd5e1", fontSize: "12px" }}>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Logout Modal */}
        {logoutModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "340px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", textAlign: "left" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", marginBottom: "14px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 3 16 13 2 13"></polyline>
                </svg>
              </div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Sign Out?</div>
              <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginBottom: "20px" }}>Are you sure you want to sign out of your account?</div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button onClick={() => setLogoutModal(false)} style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "700", color: "#64748b", cursor: "pointer" }}>Cancel</button>
                <button onClick={confirmLogout} style={{ padding: "9px 18px", borderRadius: "9px", border: "none", background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer" }}>Yes, Sign Out</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}