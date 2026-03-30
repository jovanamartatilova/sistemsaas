import { useState } from "react";
import { LayoutDashboard, BookOpen, User, Award, LogOut, MapPin } from "lucide-react";

// --- Radar Chart (SVG) ---
function RadarChart() {
  const labels = ["HTML/CSS", "JavaScript", "React.js", "TypeScript", "Redux", "UI/UX"];
  const values = [0.85, 0.78, 0.72, 0.60, 0.55, 0.65];
  const cx = 120, cy = 120, r = 90;
  const n = labels.length;

  const toXY = (i, val) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * val * Math.cos(angle), y: cy + r * val * Math.sin(angle) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const dataPoints = values.map((v, i) => toXY(i, v));
  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-[200px] mx-auto">
      {gridLevels.map((level, li) => {
        const pts = Array.from({ length: n }, (_, i) => toXY(i, level));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
        return <path key={li} d={d} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
      })}
      {Array.from({ length: n }, (_, i) => {
        const outer = toXY(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <polygon points={polygon} fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="2" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#6366f1" />
      ))}
      {labels.map((label, i) => {
        const pos = toXY(i, 1.25);
        return (
          <text key={i} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="8.5">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// --- Progress Bar ---
function ProgressBar({ value, max, color = "bg-indigo-500", height = "h-1.5" }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className={`w-full bg-slate-100 rounded-full ${height}`}>
      <div className={`${color} rounded-full ${height} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// --- Skill Tag ---
function SkillTag({ label, color = "bg-slate-100 text-slate-600" }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>
  );
}

// --- Competency Card ---
function CompetencyCard({ title, hours, projects, score, maxScore, status, progress }) {
  const statusColor = status === "Done" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-indigo-50 text-indigo-600 border border-indigo-200";
  const dotColor = status === "Done" ? "bg-emerald-500" : "bg-indigo-500";
  const barColor = status === "Done" ? "bg-emerald-500" : "bg-indigo-500";

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${dotColor}`} />
          <div>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <p className="text-xs text-slate-500">{hours} · {projects}</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor}`}>{status}</span>
      </div>
      <div className="space-y-1">
        {score !== undefined ? (
          <>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Score Evaluation</span>
              <span className="text-emerald-600 font-semibold">{score} / {maxScore}</span>
            </div>
            <ProgressBar value={score} max={maxScore} color="bg-emerald-500" />
          </>
        ) : (
          <>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Progress</span>
              <span className="text-indigo-600 font-semibold">{progress}%</span>
            </div>
            <ProgressBar value={progress} max={100} color={barColor} />
          </>
        )}
      </div>
    </div>
  );
}

// --- Activity Item ---
function ActivityItem({ color, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${color}`} />
      <div className="min-w-0 w-full">
        <p className="text-sm text-slate-700 font-medium">{title}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

// --- Certificate Card ---
function CertificateCard({ subject, date }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Competency Certificate</p>
          <p className="text-sm font-bold text-slate-800 mt-1">{subject}</p>
          <p className="text-xs text-slate-400 mt-0.5">Issued: {date}</p>
        </div>
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
          Download PDF
        </button>
      </div>
    </div>
  );
}

// --- Sidebar ---
function Sidebar() {
  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={16} />, active: true },
    { label: "Programs", icon: <BookOpen size={16} /> },
    { label: "My Profile", icon: <User size={16} /> },
    { label: "Certificates", icon: <Award size={16} /> },
  ];

  return (
    <aside className="w-56 min-h-screen bg-[#0f1e3a] text-white flex flex-col px-4 py-6 fixed top-0 left-0 z-10">
      <div className="flex items-center gap-2 mb-8">
  <img src="/assets/images/logo.png" alt="EarlyPath" className="h-16 w-auto" />
  <span className="font-bold text-lg tracking-tight">EarlyPath</span>
  </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <a key={item.label} href="#"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${item.active ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-[#1a2f54] hover:text-white"}`}>
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">R</div>
        <span className="text-sm text-slate-300 flex-1">Riku</span>
        <LogOut size={14} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
      </div>
    </aside>
  );
}

// --- Main Dashboard ---
export default function EarlyPathDashboard() {
  const [skillFilter, setSkillFilter] = useState("Active");

  const competencies = [
    { title: "HTML5 & CSS3 Fundamentals", hours: "40 jam pembelajaran", projects: "2 proyek", score: 92, maxScore: 100, status: "Done" },
    { title: "JavaScript ES6+", hours: "48 jam pembelajaran", projects: "3 proyek", score: 88, maxScore: 100, status: "Done" },
    { title: "React.js & Component Design", hours: "32 / 52 jam pembelajaran", projects: "1/3 proyek", progress: 61, status: "Active" },
    { title: "TypeScript Basics", hours: "18 / 36 jam pembelajaran", projects: "0/2 proyek", progress: 50, status: "Active" },
  ];

  const filtered = skillFilter === "All" ? competencies : competencies.filter((c) => c.status === skillFilter);

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <Sidebar />

      <main className="ml-56 flex-1 px-6 py-6 space-y-5 min-w-0">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');`}</style>

        {/* Profile Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-5 shadow-sm">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600">
              R
            </div>
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-800 text-left">Riku</h1>
            <p className="text-slate-500 text-sm mt-0.5 text-left">Frontend Developer Intern | Batch 5 – PT. Teknologi Maju</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin size={11} /> Surabaya, Jawa Timur · 01 Apr 2025 – 30 Jun 2025
              </span>
              <span className="bg-emerald-50 text-emerald-600 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">● Active</span>
            </div>
          </div>
          <div className="flex gap-6 flex-shrink-0 divide-x divide-slate-100">
            {[
              { value: "78%", label: "Progress", bar: true },
              { value: "12", label: "Competencies", sub: "8 Done", subColor: "text-slate-400" },
              { value: "240", label: "Learning Hours", sub: "+12 This Week", subColor: "text-emerald-500" },
            ].map((stat, i) => (
              <div key={i} className="text-center px-6 first:pl-0 last:pr-0">
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                {stat.bar && (
                  <div className="mt-1.5 w-full h-1.5 bg-slate-100 rounded-full">
                    <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: "78%" }} />
                  </div>
                )}
                {stat.sub && <p className={`text-xs mt-0.5 ${stat.subColor}`}>{stat.sub}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-[1fr_1.6fr] gap-5 items-stretch">

          {/* Left Column */}
          <div className="flex flex-col gap-5">
            {/* Apprentice Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Apprentice Info</h2>
              <div className="space-y-3">
                {[
                  { label: "ID Apprentice", value: "APR-2025-00042" },
                  { label: "Program", value: "Frontend Developer Intern" },
                  { label: "Batch", value: "Batch 5 – 2025" },
                  { label: "Periode", value: "01 Apr – 30 Jun 2025" },
                  { label: "Status", value: "Active", badge: true },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">{row.label}</span>
                    {row.badge ? (
                      <span className="bg-emerald-50 text-emerald-600 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">● {row.value}</span>
                    ) : (
                      <span className="text-slate-700 font-medium text-right max-w-[55%]">{row.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Progress */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Learning Progress</h2>
              <div className="space-y-4">
                {[
                  { label: "Total Learning Hours", value: "240 / 320 hours", pct: 75, color: "bg-indigo-500" },
                  { label: "Completed Module", value: "18 / 24 module", pct: 75, color: "bg-emerald-500" },
                  { label: "Attendance", value: "92%", pct: 92, color: "bg-yellow-400" },
                  { label: "Assignment Submitted", value: "34 / 40 assignment", pct: 85, color: "bg-slate-400" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-slate-700 font-medium">{item.value}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities — grows to fill remaining height */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex-1 text-left">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Recent Activities</h2>
              <div className="space-y-4">
                <ActivityItem color="bg-indigo-400" title="Completing Competencies: React Hooks" subtitle="24 Apr 2025 · 10 hours" />
                <ActivityItem color="bg-emerald-400" title="Upload Assignment: Project Portfolio" subtitle="20 Apr 2025 · Score: 87/100" />
                <ActivityItem color="bg-yellow-400" title="Mentoring Session: UI/UX Principles" subtitle="18 Apr 2025 · 2 hours" />
                <ActivityItem color="bg-purple-400" title="Joined Batch 5 Program" subtitle="01 Apr 2025 · Kick-off day" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-5">
            {/* Competencies & Skills */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Competencies & Skills</h2>
                <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                  {["All", "Active", "Done"].map((f) => (
                    <button key={f} onClick={() => setSkillFilter(f)}
                      className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${skillFilter === f ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-700 hover:bg-white"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {filtered.map((c, i) => <CompetencyCard key={i} {...c} />)}
              </div>
            </div>

            {/* Skill Tags + Radar */}
            <div className="grid grid-cols-2 gap-5 flex-1">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Skill Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "HTML5", color: "bg-orange-50 text-orange-600" },
                    { label: "CSS3", color: "bg-blue-50 text-blue-600" },
                    { label: "JavaScript", color: "bg-yellow-50 text-yellow-600" },
                    { label: "React.js", color: "bg-cyan-50 text-cyan-600" },
                    { label: "TypeScript", color: "bg-blue-50 text-blue-500" },
                    { label: "Redux", color: "bg-purple-50 text-purple-600" },
                    { label: "Figma", color: "bg-pink-50 text-pink-600" },
                    { label: "Git", color: "bg-red-50 text-red-600" },
                    { label: "Tailwind", color: "bg-teal-50 text-teal-600" },
                    { label: "REST API", color: "bg-slate-100 text-slate-600" },
                    { label: "Next.js", color: "bg-slate-100 text-slate-700" },
                  ].map((tag, i) => <SkillTag key={i} {...tag} />)}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Competency Radar</h2>
                <div className="relative">
                  <RadarChart />
                  <div className="absolute top-1/2 right-2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-500 flex items-center justify-center bg-white shadow-sm">
                      <span className="text-sm font-bold text-slate-800">67%</span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-slate-500">Done (8)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span className="text-slate-500">Active (2)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Certificates & Documents</h2>
            <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">See More →</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <CertificateCard subject="HTML5 & CSS3 Fundamentals" date="18 Apr 2025" />
            <CertificateCard subject="JavaScript ES6+" date="22 Apr 2025" />
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 py-2">
          © 2025 EarlyPath · Platform Magang Modern · All rights reserved
        </p>
      </main>
    </div>
  );
}