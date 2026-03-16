import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function CompanyPublicPage() {
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/c/${slug}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error("Perusahaan tidak ditemukan");
          throw new Error("Gagal memuat data perusahaan");
        }
        const data = await response.json();
        setCompany(data.company);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [slug]);

  // ── Loading State ──
  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin" width="36" height="36" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(74,158,255,0.2)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0110 10" stroke="#4a9eff" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Memuat profil perusahaan...</p>
        </div>
      </div>
    );
  }

  // ── Error / Not Found State ──
  if (error) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-6"
        style={{ background: "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)" }}
      >
        <div className="text-center max-w-sm">
          {/* 404 icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.2)" }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#ff6b6b" strokeWidth="1.5" opacity="0.5" />
                <path d="M12 8v4M12 16h.01" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h1>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #2d7dd2 0%, #4a9eff 100%)", boxShadow: "0 4px 20px rgba(74,158,255,0.3)" }}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // ── Main Page ──
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "linear-gradient(160deg, #0d1f3c 0%, #0a1628 40%, #071220 100%)" }}
    >
      {/* Background glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ background: "#4a9eff" }}
      />

      {/* ── Header / Navbar ── */}
      <header
        className="sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(10,22,40,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/assets/images/logo.png" alt="EarlyPath" className="h-8 object-contain" />
          <span className="text-white font-semibold text-sm">EarlyPath</span>
        </div>
        <Link
          to="/register"
          className="text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200"
          style={{ color: "#4a9eff", border: "1px solid rgba(74,158,255,0.3)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(74,158,255,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Daftar Perusahaan
        </Link>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* ── Company Hero Card ── */}
        <div
          className="rounded-2xl p-8 mb-8 relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Decorative glow inside card */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-5 pointer-events-none"
            style={{ background: "#4a9eff" }}
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            {/* Logo */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{
                background: company.logo_path ? "transparent" : "rgba(74,158,255,0.12)",
                border: "1px solid rgba(74,158,255,0.2)",
              }}
            >
              {company.logo_path ? (
                <img
                  src={`http://localhost:8000/storage/${company.logo_path}`}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold" style={{ color: "#4a9eff" }}>
                  {company.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1" style={{ letterSpacing: "-0.5px" }}>
                {company.name}
              </h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {company.address && (
                  <span
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(74,158,255,0.1)", color: "rgba(74,158,255,0.9)", border: "1px solid rgba(74,158,255,0.15)" }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    {company.address}
                  </span>
                )}
                {company.email && (
                  <span
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {company.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {company.description && (
            <div
              className="mt-6 pt-6 text-sm leading-relaxed"
              style={{
                color: "rgba(255,255,255,0.6)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {company.description}
            </div>
          )}
        </div>

        {/* ── Open Positions placeholder ── */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Lowongan Tersedia</h2>
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ background: "rgba(74,158,255,0.1)", color: "#4a9eff", border: "1px solid rgba(74,158,255,0.2)" }}
          >
            Coming soon
          </span>
        </div>

        <div
          className="rounded-2xl p-10 flex flex-col items-center justify-center text-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px dashed rgba(255,255,255,0.1)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(74,158,255,0.08)", border: "1px solid rgba(74,158,255,0.15)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="14" rx="2" stroke="#4a9eff" strokeWidth="1.5" opacity="0.6" />
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="#4a9eff" strokeWidth="1.5" />
              <line x1="12" y1="12" x2="12" y2="16" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="14" x2="14" y2="14" stroke="#4a9eff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white mb-1">Belum ada lowongan</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Lowongan dari {company.name} akan muncul di sini
          </p>
        </div>

        {/* ── Footer ── */}
        <div className="mt-12 text-center">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            Halaman ini dikelola oleh{" "}
            <span style={{ color: "rgba(74,158,255,0.6)" }}>{company.name}</span>
            {" "}melalui platform{" "}
            <Link to="/" style={{ color: "rgba(74,158,255,0.6)" }}>EarlyPath</Link>
          </p>
        </div>
      </main>
    </div>
  );
}