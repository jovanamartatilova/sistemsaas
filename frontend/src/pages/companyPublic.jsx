import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// ── DUMMY DATA ── ganti ini nanti pakai fetch API beneran
const DUMMY_SUBMISSION = {
  id_submission: "SUB001TEST",
  status: "accepted",
  vacancy: {
    id_vacancy: "VAC001TEST",
    title: "Creative Technology Internship",
    batch: 2,
    positions: [
  { id_position: "POS001", name: "Frontend Developer" },
  { id_position: "POS002", name: "UI/UX Designer" },
  { id_position: "POS003", name: "Backend Developer" },
  { id_position: "POS004", name: "Project Manager" },
],
start_date: "10 April 2025",
end_date: "10 June 2025",
deadline: "10 March 2025",
location: "Surabaya",
photo: null,
  },
};

// ── helpers ──────────────────────────────────────────────────────
const blu = "linear-gradient(135deg,#1a5fc4 0%,#2d7ff3 100%)";

function Badge({ children, color = "#2d7ff3" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
      padding: "4px 10px", borderRadius: 99,
      background: `${color}18`, color, border: `1px solid ${color}30`,
    }}>
      {children}
    </span>
  );
}

function GlassCard({ children, style = {}, hover = false }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: hov ? "1px solid rgba(45,127,243,0.35)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        backdropFilter: "blur(10px)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov ? "0 0 0 1px rgba(45,127,243,0.2),0 12px 40px rgba(45,127,243,0.15)" : "none",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function NavBtn({ children, primary, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: "8px 18px", borderRadius: 9, cursor: "pointer",
        fontSize: 13, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 6,
        transition: "all 0.2s",
        ...(primary ? {
          background: blu, color: "#fff", border: "none",
          boxShadow: h ? "0 8px 28px rgba(45,127,243,0.5)" : "0 4px 16px rgba(45,127,243,0.28)",
          transform: h ? "translateY(-1px)" : "none",
        } : {
          background: h ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.75)",
          border: "1px solid rgba(255,255,255,0.1)",
        }),
      }}
    >
      {children}
    </button>
  );
}

// ── Locked overlay (belum login) ──────────────────────────────────
function LockedPositions({ onLogin, onRegister }) {
  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
      {/* blurred fake cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, padding: 24, filter: "blur(5px)", opacity: 0.3, pointerEvents: "none", userSelect: "none" }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ borderRadius: 14, padding: 22, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 14, background: "rgba(45,127,243,0.2)" }}/>
            <div style={{ height: 14, borderRadius: 4, marginBottom: 8, background: "rgba(255,255,255,0.18)", width: "65%" }}/>
            <div style={{ height: 11, borderRadius: 4, background: "rgba(255,255,255,0.08)", width: "45%" }}/>
          </div>
        ))}
      </div>
      {/* overlay CTA */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18,
        background: "rgba(6,13,26,0.75)", backdropFilter: "blur(3px)",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(45,127,243,0.1)", border: "1px solid rgba(45,127,243,0.22)",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d7ff3" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 5px" }}>Masuk untuk melihat posisi</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", margin: 0 }}>Kamu perlu akun untuk melihat posisi yang tersedia.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <NavBtn onClick={onLogin}>Masuk</NavBtn>
          <NavBtn primary onClick={onRegister}>Daftar Sekarang</NavBtn>
        </div>
      </div>
    </div>
  );
}

// ── Position card ─────────────────────────────────────────────────
function PositionCard({ pos, idx, submission }) {
  return (
    <GlassCard hover style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Thumbnail placeholder */}
      <div style={{
        width: "100%", aspectRatio: "16/9",
        background: "linear-gradient(135deg,rgba(45,127,243,0.08) 0%,rgba(45,127,243,0.03) 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(45,127,243,0.1)", border: "1px solid rgba(45,127,243,0.18)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d7ff3" strokeWidth="1.8" strokeLinecap="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
            <line x1="10" y1="14" x2="14" y2="14"/>
          </svg>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>{pos.name}</h3>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          {submission?.vacancy?.title} · Batch {submission?.vacancy?.batch}
        </p>
        <div style={{ flex: 1 }}/>
        <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Badge color="#38bdf8">Posisi {idx + 1}</Badge>
        </div>
      </div>
    </GlassCard>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────
function StatsBar({ submission }) {
  const items = [
    { label: "Program", value: submission.vacancy.title },
    { label: "Batch", value: `Batch ${submission.vacancy.batch}` },
    { label: "Posisi Tersedia", value: submission.vacancy.positions.length },
    { label: "Status", value: submission.status.charAt(0).toUpperCase() + submission.status.slice(1) },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
      {items.map(s => (
        <GlassCard key={s.label} style={{ padding: "16px 20px" }}>
          <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>{s.label}</p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.value}</p>
        </GlassCard>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function CompanyPublicPage() {
  // Toggle ini buat preview 3 state berbeda
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
const isLoggedIn = true;
const submission = DUMMY_SUBMISSION;
const positions  = submission?.vacancy?.positions ?? [];

useEffect(() => {
  fetch(`http://localhost:8000/api/c/${slug}`, {
    headers: { Accept: "application/json" }
  })
    .then(r => r.json())
    .then(data => setCompany(data.company))
    .catch(() => setCompany(null));
}, [slug]);

if (!company) return (
  <div style={{ minHeight: "100vh", background: "#060d1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Loading...</p>
  </div>
);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#060d1a 0%,#08101f 55%,#04080e 100%)", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>

      {/* ambient glow */}
      <div style={{ position: "fixed", top: "-8%", left: "50%", transform: "translateX(-50%)", width: 800, height: 600, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(45,127,243,0.07) 0%,transparent 70%)", pointerEvents: "none" }}/>

      {/* ── Navbar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        height: 60, padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(6,13,26,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(45,127,243,0.15)", border: "1px solid rgba(45,127,243,0.25)",
          }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#2d7ff3" }}>{company.name.charAt(0)}</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{company.name}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isLoggedIn
            ? <NavBtn primary>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                Dashboard
              </NavBtn>
            : <>
                <NavBtn>Masuk</NavBtn>
                <NavBtn primary>Daftar</NavBtn>
              </>
          }
        </div>
      </header>

      <main style={{ maxWidth: "100%", margin: "0 auto", padding: "44px 24px 100px" }}>

        {/* ── Company hero card ── */}
<div style={{
  position: "relative", borderRadius: 20, overflow: "hidden",
  marginBottom: 16, minHeight: 320,
  background: "linear-gradient(160deg,#0a1628 0%,#071020 100%)",
}}>
  {/* bg foto — ganti URL-nya kalau company punya cover photo */}
  <div style={{
    position: "absolute", inset: 0,
    backgroundImage: "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80')",
    backgroundSize: "cover", backgroundPosition: "center",
    opacity: 0.25,
  }}/>

  {/* gradient overlay bawah */}
  <div style={{
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(6,13,26,0.95) 0%, rgba(6,13,26,0.4) 50%, rgba(6,13,26,0.2) 100%)",
  }}/>

  {/* content */}
  <div style={{ position: "relative", zIndex: 2, padding: "56px 48px 48px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
    {/* Logo */}
    <div style={{
      width: 72, height: 72, borderRadius: 18, marginBottom: 20,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(45,127,243,0.15)", border: "1px solid rgba(45,127,243,0.3)",
      boxShadow: "0 8px 32px rgba(45,127,243,0.2)",
    }}>
      <span style={{ fontSize: 30, fontWeight: 900, color: "#2d7ff3" }}>{company.name.charAt(0)}</span>
    </div>

    {/* Nama company */}
    <h1 style={{ fontSize: 42, fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-1px", lineHeight: 1.1 }}>
      {company.name}
    </h1>

    {/* Badges */}
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 20 }}>
      {company.address && (
        <Badge color="#2d7ff3">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          {company.address}
        </Badge>
      )}
      {company.email && (
        <Badge color="#64748b">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          {company.email}
        </Badge>
      )}
    </div>

    {/* Deskripsi */}
    {company.description && (
      <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.55)", maxWidth: 580, margin: "0 0 28px" }}>
        {company.description}
      </p>
    )}

    {/* CTA kalau belum login */}
    {!isLoggedIn && (
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <NavBtn primary>Join Program</NavBtn>
        <NavBtn>Masuk</NavBtn>
      </div>
    )}
  </div>
</div>

        {/* ── Stats (logged in + ada submission) ── */}
        {isLoggedIn && submission && (
          <div style={{ marginBottom: 36 }}>
            <StatsBar submission={submission}/>
          </div>
        )}

        {/* ── Positions section ── */}
        <section style={{ marginTop: isLoggedIn && submission ? 0 : 36 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.3px" }}>Open Positions</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", margin: 0 }}>
                {!isLoggedIn && "Masuk untuk melihat posisi yang tersedia"}
                {isLoggedIn && !submission && "Kamu belum punya submission di perusahaan ini"}
                {isLoggedIn && submission && positions.length > 0 && `${positions.length} posisi tersedia di program kamu`}
                {isLoggedIn && submission && positions.length === 0 && "Belum ada posisi di submission kamu"}
              </p>
            </div>
            {isLoggedIn && submission && (
              <Badge color="#2d7ff3">
                {submission.vacancy.title} · Batch {submission.vacancy.batch}
              </Badge>
            )}
          </div>

          {/* Guest — locked */}
          {!isLoggedIn && <LockedPositions onLogin={() => {}} onRegister={() => {}}/>}

          {/* Logged in — no submission */}
          {isLoggedIn && !submission && (
            <GlassCard style={{ padding: "56px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(45,127,243,0.08)", border: "1px solid rgba(45,127,243,0.14)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d7ff3" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" opacity=".5"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>Tidak ada submission</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "0 0 24px" }}>Kamu belum punya submission yang terhubung ke perusahaan ini.</p>
              <NavBtn primary>Pergi ke Dashboard</NavBtn>
            </GlassCard>
          )}

          {/* Logged in — has positions */}
          {isLoggedIn && positions.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
              {positions.map((pos, idx) => (
  <PositionCard key={pos.id_position} pos={pos} idx={idx} submission={submission}/>
))}
            </div>
          )}

          {/* Logged in — submission ada tapi kosong */}
          {isLoggedIn && submission && positions.length === 0 && (
            <GlassCard style={{ padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>Belum ada posisi</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0 }}>Posisi untuk program kamu akan muncul di sini.</p>
            </GlassCard>
          )}
        </section>

        {/* ── CTA Banner ── */}
<div style={{
  marginTop: 64, borderRadius: 20, overflow: "hidden", position: "relative",
  background: "linear-gradient(160deg,#0a1628 0%,#071020 100%)",
  padding: "64px 24px", textAlign: "center",
  border: "1px solid rgba(255,255,255,0.07)",
}}>
  <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "#2d7ff3", textTransform: "uppercase", margin: "0 0 12px" }}>Program Magang</p>
<h2 style={{ fontSize: 36, fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.8px", lineHeight: 1.15 }}>
  Siap memulai perjalanan<br/>kariermu bersama kami?
</h2>
<p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 32px", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
  Daftarkan dirimu sekarang dan jadilah bagian dari generasi profesional berikutnya.
</p>
</div>

        {/* ── Footer ── */}
<footer style={{ marginTop: 72, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
  <div style={{ padding: "48px 0 32px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40 }}>
    {/* Brand */}
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(45,127,243,0.15)", border: "1px solid rgba(45,127,243,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#2d7ff3" }}>{company.name.charAt(0)}</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{company.name}</span>
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.35)", margin: 0, maxWidth: 220, textAlign: "left" }}>
        {company.description?.slice(0, 100)}...
      </p>
    </div>

    {/* Product links */}
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", margin: "0 0 16px" }}>Program</p>
      {["Tentang Program", "Open Positions", "Cara Daftar", "FAQ"].map(l => (
        <p key={l} style={{ margin: "0 0 10px" }}>
          <a href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color="#2d7ff3"}
            onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.45)"}>
            {l}
          </a>
        </p>
      ))}
    </div>

    {/* Legal links */}
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", margin: "0 0 16px" }}>Legal</p>
      {["Privacy Policy", "Terms of Service", "Security", "GDPR"].map(l => (
        <p key={l} style={{ margin: "0 0 10px" }}>
          <a href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color="#2d7ff3"}
            onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.45)"}>
            {l}
          </a>
        </p>
      ))}
    </div>
  </div>

  {/* Bottom bar */}
  <div style={{ paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", margin: 0 }}>
      © 2025 {company.name}. All rights reserved.
    </p>
    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", margin: 0 }}>
      Powered by <span style={{ color: "rgba(45,127,243,0.5)" }}>EarlyPath</span>
    </p>
  </div>
</footer>
      </main>
    </div>
  );
}