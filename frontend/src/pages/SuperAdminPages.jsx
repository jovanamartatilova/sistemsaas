import { useState } from "react";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IC = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Tenant: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Logout: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  TrendUp: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  ChevDown: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

function today() {
  return new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

// ── Sidebar Item ──────────────────────────────────────────────────────────────
function SideItem({ icon, label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        width: "100%", padding: "9px 12px", borderRadius: "9px",
        background: active ? "rgba(74,158,255,0.13)" : hov ? "rgba(255,255,255,0.05)" : "transparent",
        border: active ? "1px solid rgba(74,158,255,0.25)" : "1px solid transparent",
        color: active ? "#4a9eff" : "rgba(255,255,255,0.58)",
        fontSize: "13px", fontWeight: active ? "600" : "500",
        cursor: "pointer", transition: "all 0.18s", textAlign: "left",
      }}
    >
      <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ activePage, setActivePage, onLogout }) {
  const nav = [
    { label: "Dashboard", icon: <IC.Dashboard />, key: "dashboard" },
    { label: "Manajemen Tenant", icon: <IC.Tenant />, key: "tenant" },
    { label: "Manajemen User", icon: <IC.Users />, key: "users" },
  ];
  return (
    <aside style={{
      width: "220px", flexShrink: 0,
      background: "linear-gradient(180deg, #0f1c2e 0%, #0d1a28 100%)",
      display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
      padding: "18px 10px", gap: "3px", overflowY: "auto",
    }}>
      {/* Logo */}
<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  <img
    src="/assets/images/logo.png"
    alt="Logo"
    style={{
      width: "60px",
      height: "60px",
      objectFit: "contain",
      borderRadius: "8px"
    }}
  />
  <span style={{
    fontSize: "16px",
    fontWeight: "700",
    color: "#fff",
    letterSpacing: "-0.3px"
  }}>
    EarlyPath
  </span>
</div>

      <p style={{ fontSize: "9.5px", fontWeight: "700", color: "rgba(255,255,255,0.22)", letterSpacing: "1.2px", padding: "0 12px 4px", textTransform: "uppercase" }}>Menu</p>
      {nav.map(n => (
        <SideItem key={n.key} icon={n.icon} label={n.label} active={activePage === n.key} onClick={() => setActivePage(n.key)} />
      ))}

      <div style={{ flex: 1 }} />
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "12px", display: "flex", alignItems: "center", gap: "9px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg,#2d7dd2,#4a9eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: "#fff", flexShrink: 0 }}>SA</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#fff" }}>Super Admin</div>
          <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.38)" }}>earlypath.id</div>
        </div>
        <button onClick={onLogout} title="Logout" style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex", transition: "all 0.18s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}>
          <IC.Logout />
        </button>
      </div>
    </aside>
  );
}
function Topbar({ title, sub, searchPlaceholder }) {
  return (
    <header
      style={{
        height: "54px",
        background: "#fff",
        borderBottom: "1px solid #e8edf2",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", // 🔥 kunci utama
        padding: "0 26px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* LEFT: Title */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>
          {title}
        </span>

        {sub && (
          <>
            <span style={{ fontSize: "12px", color: "#94a3b8", margin: "0 6px" }}>
              /
            </span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              {sub}
            </span>
          </>
        )}
      </div>

      {/* RIGHT: Search + Date */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "9px",
            padding: "6px 12px",
            width: "200px",
          }}
        >
          <IC.Search />
          <input
            placeholder={searchPlaceholder || "Cari..."}
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "12.5px",
              color: "#64748b",
              width: "100%",
            }}
          />
        </div>

        <span style={{ fontSize: "11.5px", color: "#94a3b8", whiteSpace: "nowrap" }}>
          {today()}
        </span>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 1 — DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardPage() {
  const barHeights = [28, 42, 34, 55, 40, 60, 50, 72, 58, 82, 65, 88];
const stats = [
  { icon: <IC.Tenant />, accent: "#3b82f6", title: "Total Tenant", value: "47", trend: "+3", sub: "44 aktif · 2 suspended · 1 lainnya" },
  { icon: <IC.Users />, accent: "#10b981", title: "Total User", value: "18.294", trend: "+847", sub: "847 user baru 7 hari terakhir" },
  {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>,
    accent: "#f59e0b", title: "Program Aktif", value: "1.482", trend: "+9%", sub: "67 program berakhir bulan ini",
  }
];

  // Growth chart data
  const months = ["Okt", "Nov", "Des", "Jan", "Feb", "Mar"];
const chartData = [
  { tenant: 14, user: 55 },
  { tenant: 18, user: 62 },
  { tenant: 16, user: 78 },
  { tenant: 22, user: 85 },
  { tenant: 26, user: 92 },
  { tenant: 30, user: 100 },
];
  const chartH = 140;
  const maxV = 108;
  const bw = 16;
  const gap = 3;
  const gw = bw * 3 + gap * 2;
  const colW = gw + 24;

  // Donut
  const total = 47; const aktif = 44; const susp = 2; const nonaktif = 1;
  const C = 2 * Math.PI * 34;
  const aD = (aktif / total) * C; const sD = (susp / total) * C; const nD = (nonaktif / total) * C;

  return (
    <main style={{ flex: 1, padding: "26px 26px 40px", overflowY: "auto", background: "#f1f5f9" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a" }}>Selamat pagi, Super Admin 👋</div>
        <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>Ringkasan aktivitas seluruh platform hari ini.</div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
        {stats.map((s, i) => (
          <div key={i} style={{ flex: "1 1 180px", minWidth: 0, background: "#fff", borderRadius: "13px", padding: "18px 20px", borderTop: `3px solid ${s.accent}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: `${s.accent}14`, display: "flex", alignItems: "center", justifyContent: "center", color: s.accent }}>{s.icon}</div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "100px", padding: "2px 7px", display: "flex", alignItems: "center", gap: "2px" }}>
                <IC.TrendUp /> {s.trend}
              </span>
            </div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", letterSpacing: "-1px", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500", marginTop: "3px" }}>{s.title}</div>
            <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "28px", marginTop: "12px" }}>
              {barHeights.map((h, bi) => (
                <div key={bi} style={{ flex: 1, borderRadius: "2px 2px 0 0", background: bi >= 9 ? s.accent : `${s.accent}35`, height: `${h}%`, minHeight: "3px" }} />
              ))}
            </div>
            <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "5px" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "18px" }}>
        {/* Bar Chart */}
        <div style={{ background: "#fff", borderRadius: "13px", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>Pertumbuhan Tenant & User</div>
            <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>6 bulan terakhir</div>
          </div>
          <div style={{ display: "flex", gap: "14px", marginBottom: "14px" }}>
            {[{ c: "#3b82f6", l: "Tenant baru" }, { c: "#10b981", l: "User baru" }].map(x => (
              <div key={x.l} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: x.c }} />
                <span style={{ fontSize: "11.5px", color: "#64748b" }}>{x.l}</span>
              </div>
            ))}
          </div>
          <svg width="100%" viewBox={`0 0 ${months.length * colW + 10} ${chartH + 28}`} style={{ overflow: "visible" }}>
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
              <line key={i} x1="0" y1={chartH - p * chartH} x2={months.length * colW + 10} y2={chartH - p * chartH} stroke="#f1f5f9" strokeWidth="1" />
            ))}
            {months.map((m, mi) => {
              const x = mi * colW + 8;
              const d = chartData[mi];
              const vals = [(d.tenant / 30) * maxV, d.user, d.sertif];
              return (
                <g key={mi}>
                  {["#3b82f6", "#10b981", "#f59e0b"].map((c, ci) => {
                    const h = Math.max((vals[ci] / maxV) * chartH, 4);
                    return <rect key={ci} x={x + ci * (bw + gap)} y={chartH - h} width={bw} height={h} rx="3" fill={c} opacity="0.85" />;
                  })}
                  <text x={x + gw / 2} y={chartH + 18} textAnchor="middle" fill="#94a3b8" fontSize="11">{m}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Status Tenant Donut */}
        <div style={{ background: "#fff", borderRadius: "13px", padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>Status Tenant</div>
            <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>Dari {total} tenant terdaftar</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
            <div style={{ position: "relative", width: "120px", height: "120px" }}>
              <svg width="120" height="120" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#3b82f6" strokeWidth="12"
                  strokeDasharray={`${aD} ${C - aD}`} strokeDashoffset="0"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#ef4444" strokeWidth="12"
                  strokeDasharray={`${sD} ${C - sD}`} strokeDashoffset={-aD}
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#94a3b8" strokeWidth="12"
                  strokeDasharray={`${nD} ${C - nD}`} strokeDashoffset={-(aD + sD)}
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>{total}</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>total</div>
              </div>
            </div>
          </div>
          {[{ l: "Aktif", v: aktif, c: "#3b82f6" }, { l: "Suspended", v: susp, c: "#ef4444" }, { l: "Tidak aktif", v: nonaktif, c: "#94a3b8" }].map(item => (
            <div key={item.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <div style={{ width: "9px", height: "9px", borderRadius: "3px", background: item.c }} />
                <span style={{ fontSize: "12.5px", color: "#64748b" }}>{item.l}</span>
              </div>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{item.v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
            {[{ l: "Uptime", v: "99.8%", c: "#16a34a" }, { l: "Avg latency", v: "142ms", c: "#3b82f6" }, { l: "AI calls/hari", v: "3.2K", c: "#f59e0b" }].map(m => (
              <div key={m.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "13px", fontWeight: "800", color: m.c }}>{m.v}</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 2 — MANAJEMEN TENANT
// ═══════════════════════════════════════════════════════════════════════════════
const TENANTS = [
  { id: 1, name: "PT Teknologi Nusantara", slug: "teknologi-nusantara", plan: "Enterprise", users: 421, programs: 18, peserta: 421, registered: "10 Jan 2026", status: "Aktif" },
  { id: 2, name: "PT Global Optima", slug: "global-optima", plan: "Enterprise", users: 380, programs: 15, peserta: 395, registered: "5 Jan 2026", status: "Aktif" },
  { id: 3, name: "PT Digital Aksara", slug: "digital-aksara", plan: "Pro", users: 220, programs: 12, peserta: 318, registered: "20 Jan 2026", status: "Aktif" },
  { id: 4, name: "Solusi Nusantara", slug: "solusi-nusantara", plan: "Pro", users: 180, programs: 9, peserta: 247, registered: "1 Feb 2026", status: "Aktif" },
  { id: 5, name: "PT Inovasi Kreatif", slug: "inovasi-kreatif", plan: "Starter", users: 120, programs: 7, peserta: 198, registered: "8 Feb 2026", status: "Aktif" },
  { id: 6, name: "Studio Kreatif ID", slug: "studio-kreatif", plan: "Starter", users: 65, programs: 4, peserta: 90, registered: "14 Feb 2026", status: "Aktif" },
  { id: 7, name: "TechCorp Indonesia", slug: "techcorp-id", plan: "Starter", users: 100, programs: 6, peserta: 165, registered: "20 Feb 2026", status: "Aktif" },
  { id: 8, name: "PT Maju Inovasi", slug: "maju-inovasi", plan: "Enterprise", users: 310, programs: 14, peserta: 380, registered: "1 Mar 2026", status: "Aktif" },
  { id: 9, name: "PT Analitika", slug: "pt-analitika", plan: "Enterprise", users: 290, programs: 11, peserta: 318, registered: "3 Mar 2026", status: "Aktif" },
  { id: 10, name: "Digilab Group", slug: "digilab", plan: "Starter", users: 43, programs: 2, peserta: 43, registered: "5 Mar 2026", status: "Suspended" },
  { id: 11, name: "Studio Solusi", slug: "studio-solusi", plan: "Starter", users: 28, programs: 1, peserta: 28, registered: "7 Mar 2026", status: "Aktif" },
  { id: 12, name: "CV Kreasi Digital", slug: "kreasi-digital", plan: "Starter", users: 5, programs: 0, peserta: 0, registered: "15 Mar 2026", status: "Aktif" },
];

const planColors = { Enterprise: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" }, Pro: { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" }, Starter: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" } };

function ManajemenTenantPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [planFilter, setPlanFilter] = useState("Semua Plan");
  const [tenants, setTenants] = useState(TENANTS);

  const filtered = tenants.filter(t => {
    const q = search.toLowerCase();
    const matchQ = t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
    const matchS = statusFilter === "Semua Status" || t.status === statusFilter;
    const matchP = planFilter === "Semua Plan" || t.plan === planFilter;
    return matchQ && matchS && matchP;
  });

  const toggleStatus = (id) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "Aktif" ? "Suspended" : "Aktif" } : t));
  };

  const initials = (name) => name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const avatarColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

  return (
    <main style={{ flex: 1, padding: "26px 26px 40px", overflowY: "auto", background: "#f1f5f9" }}>
      <div style={{ marginBottom: "22px" }}>
        <div style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a" }}>Manajemen Tenant</div>
        <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>Daftar semua perusahaan yang terdaftar di platform.</div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "7px 12px", flex: "1 1 220px" }}>
          <IC.Search />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama perusahaan atau slug..." style={{ border: "none", background: "transparent", outline: "none", fontSize: "12.5px", color: "#64748b", width: "100%" }} />
        </div>
        {[
          { val: statusFilter, set: setStatusFilter, opts: ["Semua Status", "Aktif", "Suspended"] },
          { val: planFilter, set: setPlanFilter, opts: ["Semua Plan", "Starter", "Pro", "Enterprise"] },
        ].map((f, i) => (
          <div key={i} style={{ position: "relative" }}>
            <select value={f.val} onChange={e => f.set(e.target.value)} style={{ appearance: "none", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "7px 32px 7px 12px", fontSize: "12.5px", color: "#475569", fontWeight: "500", cursor: "pointer", outline: "none" }}>
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
            <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}><IC.ChevDown /></span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Menampilkan <strong style={{ color: "#1e293b" }}>{filtered.length}</strong> dari <strong style={{ color: "#1e293b" }}>{tenants.length}</strong> tenant</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["PERUSAHAAN", "PLAN", "USER", "PROGRAM", "PESERTA", "TERDAFTAR", "STATUS", "AKSI"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10.5px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => {
              const pc = planColors[t.plan];
              const ac = avatarColors[i % avatarColors.length];
              return (
                <tr key={t.id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${ac}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: ac, flexShrink: 0 }}>{initials(t.name)}</div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{t.name}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{t.slug}.earlypath.id</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: pc.bg, color: pc.color, border: `1px solid ${pc.border}`, borderRadius: "6px", fontSize: "11.5px", fontWeight: "700", padding: "3px 9px" }}>{t.plan}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{t.users.toLocaleString()}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{t.programs}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{t.peserta.toLocaleString()}</td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#64748b" }}>{t.registered}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: t.status === "Aktif" ? "#f0fdf4" : "#fff1f2", color: t.status === "Aktif" ? "#15803d" : "#be123c", border: `1px solid ${t.status === "Aktif" ? "#bbf7d0" : "#fecdd3"}`, borderRadius: "6px", fontSize: "11.5px", fontWeight: "700", padding: "3px 9px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: t.status === "Aktif" ? "#16a34a" : "#e11d48", display: "inline-block" }} />
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button style={{ padding: "4px 12px", borderRadius: "7px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "11.5px", fontWeight: "600", color: "#475569", cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                        Detail
                      </button>
                      <button onClick={() => toggleStatus(t.id)} style={{ padding: "4px 12px", borderRadius: "7px", border: `1px solid ${t.status === "Aktif" ? "#fecdd3" : "#bbf7d0"}`, background: t.status === "Aktif" ? "#fff1f2" : "#f0fdf4", fontSize: "11.5px", fontWeight: "600", color: t.status === "Aktif" ? "#be123c" : "#15803d", cursor: "pointer", transition: "all 0.15s" }}>
                        {t.status === "Aktif" ? "Suspend" : "Aktifkan"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13.5px" }}>Tidak ada tenant yang cocok</div>
        )}
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 3 — MANAJEMEN USER
// ═══════════════════════════════════════════════════════════════════════════════
const USERS = [
  { id: 1, name: "Budi Santoso", email: "budi@teknologi-nusantara.com", role: "Admin", tenant: "PT Teknologi Nusantara", phone: "0812-3456-7890", university: "—", registered: "10 Jan 2026" },
  { id: 2, name: "Sari Dewi", email: "sari@global-optima.com", role: "HR", tenant: "PT Global Optima", phone: "0856-7890-1234", university: "—", registered: "12 Jan 2026" },
  { id: 3, name: "Wahyu Prasetyo", email: "wahyu@digital-aksara.com", role: "Mentor", tenant: "PT Digital Aksara", phone: "0878-2345-6789", university: "—", registered: "22 Jan 2026" },
  { id: 4, name: "Nadia Putri", email: "nadia@solusi-nusantara.com", role: "Admin", tenant: "Solusi Nusantara", phone: "0821-9876-5432", university: "—", registered: "3 Feb 2026" },
  { id: 5, name: "Kevin Rahmad", email: "kevin@inovasi-kreatif.com", role: "Peserta", tenant: "PT Inovasi Kreatif", phone: "0838-1122-3344", university: "Universitas Indonesia", registered: "10 Feb 2026" },
  { id: 6, name: "Rina Kusuma", email: "rina@studio-kreatif.com", role: "HR", tenant: "Studio Kreatif ID", phone: "0852-5566-7788", university: "—", registered: "15 Feb 2026" },
  { id: 7, name: "Dimas Arif", email: "dimas@techcorp-id.com", role: "Mentor", tenant: "TechCorp Indonesia", phone: "0813-4455-6677", university: "—", registered: "20 Feb 2026" },
  { id: 8, name: "Anisa Rahma", email: "anisa@maju-inovasi.com", role: "Peserta", tenant: "PT Maju Inovasi", phone: "0877-8899-0011", university: "ITB", registered: "2 Mar 2026" },
  { id: 9, name: "Rafi Ananda", email: "rafi@pt-analitika.com", role: "Peserta", tenant: "PT Analitika", phone: "0819-3344-5566", university: "UGM", registered: "4 Mar 2026" },
  { id: 10, name: "Bima Sakti", email: "bima@digilab.com", role: "Admin", tenant: "Digilab Group", phone: "0831-6677-8899", university: "—", registered: "5 Mar 2026" },
  { id: 11, name: "Layla Sari", email: "layla@studio-solusi.com", role: "Peserta", tenant: "Studio Solusi", phone: "0845-2233-4455", university: "UNPAD", registered: "8 Mar 2026" },
  { id: 12, name: "Hendra Wijaya", email: "hendra@kreasi-digital.com", role: "Admin", tenant: "CV Kreasi Digital", phone: "0867-1122-9900", university: "—", registered: "15 Mar 2026" },
  { id: 13, name: "Putri Ayu", email: "putri@teknologi-nusantara.com", role: "Peserta", tenant: "PT Teknologi Nusantara", phone: "0856-3344-1122", university: "BINUS", registered: "16 Mar 2026" },
  { id: 14, name: "Ahmad Fauzi", email: "ahmad@global-optima.com", role: "Mentor", tenant: "PT Global Optima", phone: "0812-9988-7766", university: "—", registered: "16 Mar 2026" },
];

const roleStyle = {
  Admin:   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  HR:      { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  Mentor:  { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  Peserta: { bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" },
};

function ManajemenUserPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua Role");
  const [tenantFilter, setTenantFilter] = useState("Semua Tenant");

  const tenantNames = ["Semua Tenant", ...Array.from(new Set(USERS.map(u => u.tenant)))];
  const filtered = USERS.filter(u => {
    const q = search.toLowerCase();
    const matchQ = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchR = roleFilter === "Semua Role" || u.role === roleFilter;
    const matchT = tenantFilter === "Semua Tenant" || u.tenant === tenantFilter;
    return matchQ && matchR && matchT;
  });

  const initials = (name) => name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const avatarColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#14b8a6"];

  return (
    <main style={{ flex: 1, padding: "26px 26px 40px", overflowY: "auto", background: "#f1f5f9" }}>
      <div style={{ marginBottom: "22px" }}>
        <div style={{ fontSize: "19px", fontWeight: "800", color: "#0f172a" }}>Manajemen User</div>
        <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>Semua user terdaftar lintas tenant.</div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "7px 12px", flex: "1 1 220px" }}>
          <IC.Search />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau email..." style={{ border: "none", background: "transparent", outline: "none", fontSize: "12.5px", color: "#64748b", width: "100%" }} />
        </div>
        {[
          { val: roleFilter, set: setRoleFilter, opts: ["Semua Role", "Admin", "HR", "Mentor", "Peserta"] },
          { val: tenantFilter, set: setTenantFilter, opts: tenantNames },
        ].map((f, i) => (
          <div key={i} style={{ position: "relative" }}>
            <select value={f.val} onChange={e => f.set(e.target.value)} style={{ appearance: "none", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "7px 32px 7px 12px", fontSize: "12.5px", color: "#475569", fontWeight: "500", cursor: "pointer", outline: "none", maxWidth: "180px" }}>
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
            <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}><IC.ChevDown /></span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: "12px", color: "#64748b" }}>Menampilkan <strong style={{ color: "#1e293b" }}>{filtered.length}</strong> dari <strong style={{ color: "#1e293b" }}>{USERS.length}</strong> user</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["USER", "ROLE", "TENANT", "NO. HP", "UNIVERSITAS", "TERDAFTAR"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10.5px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const rs = roleStyle[u.role] || { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
              const ac = avatarColors[i % avatarColors.length];
              return (
                <tr key={u.id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.15s", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${ac}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10.5px", fontWeight: "800", color: ac, flexShrink: 0 }}>{initials(u.name)}</div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{u.name}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`, borderRadius: "6px", fontSize: "11.5px", fontWeight: "700", padding: "3px 9px" }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: "12.5px", color: "#475569" }}>{u.tenant}</td>
                  <td style={{ padding: "11px 16px", fontSize: "12.5px", color: "#475569", fontFamily: "monospace" }}>{u.phone}</td>
                  <td style={{ padding: "11px 16px", fontSize: "12.5px", color: u.university === "—" ? "#cbd5e1" : "#475569" }}>{u.university}</td>
                  <td style={{ padding: "11px 16px", fontSize: "12px", color: "#64748b" }}>{u.registered}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13.5px" }}>Tidak ada user yang cocok</div>
        )}
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT — combines everything
// ═══════════════════════════════════════════════════════════════════════════════
export default function SuperAdminPages() {
  const [activePage, setActivePage] = useState("dashboard");
  const [logoutModal, setLogoutModal] = useState(false);

  const pageTitle = { dashboard: { title: "Dashboard", sub: "Overview" }, tenant: { title: "Manajemen Tenant", sub: "Daftar Tenant" }, users: { title: "Manajemen User", sub: "Daftar User" } };
  const pt = pageTitle[activePage];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Poppins', sans-serif;
}
      `}</style>

      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={() => setLogoutModal(true)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar title={pt.title} sub={pt.sub} searchPlaceholder={activePage === "tenant" ? "Cari nama perusahaan..." : activePage === "users" ? "Cari nama atau email..." : "Cari..."} />

        {activePage === "dashboard" && <DashboardPage />}
        {activePage === "tenant" && <ManajemenTenantPage />}
        {activePage === "users" && <ManajemenUserPage />}
      </div>

      {/* Logout Modal */}
      {logoutModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "340px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", marginBottom: "14px" }}>
              <IC.Logout />
            </div>
            <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>Keluar Sistem?</div>
            <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginBottom: "20px" }}>Apakah Anda yakin ingin keluar dari akun Super Admin?</div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setLogoutModal(false)} style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "#fff", fontSize: "13px", fontWeight: "700", color: "#64748b", cursor: "pointer" }}>Batal</button>
              <button onClick={() => setLogoutModal(false)} style={{ padding: "9px 18px", borderRadius: "9px", border: "none", background: "#ef4444", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer" }}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}