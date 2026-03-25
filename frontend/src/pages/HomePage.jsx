import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const JOBS = [
  {
    id: 1,
    initials: 'TN',
    company: 'PT Teknologi Nusantara',
    title: 'Software Engineering Intern',
    batch: 'Batch 7 · Individual',
    type: 'paid',
    mode: 'individual',
    tags: ['Frontend Dev', 'Backend Dev', 'UI/UX'],
    period: '16 Apr – 30 Jun 2026',
    location: 'Surabaya',
    deadline: '10 Apr 2026',
    quota: '42/500',
    bg: 'from-blue-100 to-blue-200',
    textColor: 'text-blue-800',
    slug: 'teknologi-nusantara',
  },
  {
    id: 2,
    initials: 'DA',
    company: 'PT Digital Aksara',
    title: 'Data Science Flagship',
    batch: 'Batch 3 · Tim (2–4 orang)',
    type: 'paid',
    mode: 'team',
    tags: ['Data Analyst', 'ML Engineer'],
    period: '1 Mei – 31 Jul 2026',
    location: 'Jakarta (Remote)',
    deadline: '25 Apr 2026',
    quota: '117/300',
    bg: 'from-emerald-100 to-emerald-200',
    textColor: 'text-emerald-800',
    slug: 'digital-aksara',
  },
  {
    id: 3,
    initials: 'SK',
    company: 'Studio Kreatif ID',
    title: 'Product Design Internship',
    batch: 'Batch 2 · Individual',
    type: 'unpaid',
    mode: 'individual',
    tags: ['UI/UX Design', 'Figma', 'Research'],
    period: '10 Apr – 10 Jul 2026',
    location: 'Bandung',
    deadline: '1 Apr 2026',
    quota: '110/200',
    bg: 'from-yellow-100 to-yellow-200',
    textColor: 'text-yellow-800',
    slug: 'studio-kreatif',
  },
  {
    id: 4,
    initials: 'IK',
    company: 'PT Inovasi Kreatif',
    title: 'Business & Marketing Intern',
    batch: 'Batch 1 · Tim (3–5 orang)',
    type: 'paid',
    mode: 'team',
    tags: ['Digital Marketing', 'Finance'],
    period: '1 Mei – 31 Jul 2026',
    location: 'Yogyakarta',
    deadline: '20 Apr 2026',
    quota: '68/150',
    bg: 'from-violet-100 to-violet-200',
    textColor: 'text-violet-800',
    slug: 'inovasi-kreatif',
  },
  {
    id: 5,
    initials: 'GO',
    company: 'PT Global Optima',
    title: 'Operations & HR Intern',
    batch: 'Batch 4 · Individual',
    type: 'unpaid',
    mode: 'individual',
    tags: ['HR Management', 'Operations'],
    period: '15 Apr – 15 Jul 2026',
    location: 'Jakarta',
    deadline: '5 Apr 2026',
    quota: '85/200',
    bg: 'from-red-100 to-red-200',
    textColor: 'text-red-800',
    slug: 'global-optima',
  },
  {
    id: 6,
    initials: 'PA',
    company: 'PT Analitika',
    title: 'Backend Engineer Intern',
    batch: 'Batch 2 · Individual',
    type: 'paid',
    mode: 'individual',
    tags: ['Laravel', 'Node.js', 'PostgreSQL'],
    period: '1 Mei – 30 Jul 2026',
    location: 'Surabaya (Hybrid)',
    deadline: '28 Apr 2026',
    quota: '22/100',
    bg: 'from-cyan-100 to-cyan-200',
    textColor: 'text-cyan-800',
    slug: 'pt-analitika',
  },
];

const FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'paid', label: 'Berbayar' },
  { key: 'unpaid', label: 'Tidak Berbayar' },
  { key: 'individual', label: 'Individual' },
  { key: 'team', label: 'Tim' },
];

// ── ICONS ──────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);
const IconArrow = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconCalendar = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconPin = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconClock = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconPlay = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);
const IconChevronDown = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ── NAVBAR ──────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-[5%] gap-8 bg-white/95 backdrop-blur-md border-b border-black/[0.07] transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
      <a href="#" className="flex items-center mr-auto no-underline">
        <img src="/assets/images/logo.png" alt="EarlyPath" className="h-9 w-auto" />
      </a>

      <div className="hidden md:flex items-center gap-1">
        {['Home', 'Positions', 'Cara Daftar', 'Tentang'].map((item, i) => (
          <a
            key={item}
            href={i === 1 ? '#positions' : i === 2 ? '#how' : '#'}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium no-underline transition-all ${
              i === 0 ? 'text-[#0d1b3e] font-semibold' : 'text-slate-500 hover:text-[#0d1b3e] hover:bg-slate-100'
            }`}
          >
            {item}
          </a>
        ))}
      </div>

    </nav>
  );
}

// ── HERO ────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="min-h-screen relative overflow-hidden flex items-center justify-center pt-16 px-[5%]"
      style={{
        backgroundImage: "url('/assets/images/Hero Section.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#0d1b3e]/70 pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center py-24">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-semibold text-blue-300 tracking-wide">Platform Magang #1 di Indonesia</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
          Mulai Karir <span className="text-blue-400">Impianmu</span><br />
          dari <span className="text-teal-300">Sini</span>
        </h1>

        {/* Desc */}
        <p className="text-base text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">
          Temukan program magang dari ratusan perusahaan terkemuka. Daftar, seleksi, dan mulai perjalananmu — semua dalam satu platform.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href="#positions"
            className="inline-flex items-center gap-2 bg-white text-[#0d1b3e] px-6 py-3 rounded-xl font-bold text-sm no-underline transition-all hover:-translate-y-0.5 hover:shadow-xl group"
          >
            Lihat Lowongan
            <IconArrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a href="#how" className="inline-flex items-center gap-2 text-white/60 text-sm font-medium no-underline hover:text-white transition-colors">
            <IconPlay />
            Pelajari lebih lanjut
          </a>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-10 mt-12 pt-10 border-t border-white/10">
          {[['47+', 'Perusahaan aktif'], ['1.4K+', 'Program tersedia'], ['18K+', 'Alumni magang']].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <div className="text-2xl font-extrabold text-white leading-none">{val}</div>
              <div className="text-xs text-white/40 mt-1.5">{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── JOB CARD ────────────────────────────────────────────────────────
function JobCard({ job }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-200 cursor-pointer">
      {/* Header image */}
      <div className={`w-full h-36 bg-gradient-to-br ${job.bg} flex items-center justify-center relative`}>
        <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md font-bold text-lg ${job.textColor}`}>
          {job.initials}
        </div>
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
          job.type === 'paid'
            ? 'bg-green-500/15 text-green-700 border border-green-500/25'
            : 'bg-slate-500/10 text-slate-600 border border-slate-400/20'
        }`}>
          {job.type === 'paid' ? 'Berbayar' : 'Tidak Berbayar'}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-1">{job.company}</div>
        <div className="text-base font-bold text-[#0d1b3e] leading-snug mb-1">{job.title}</div>
        <div className="text-xs text-slate-400 mb-3">{job.batch}</div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.tags.map(tag => (
            <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">{tag}</span>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <IconCalendar />{job.period}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <IconPin />{job.location}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 bg-rose-50 rounded-lg px-2.5 py-2 mt-auto">
          <IconClock />Deadline: {job.deadline}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Sisa <span className="font-semibold text-slate-600">{job.quota}</span> kuota
        </div>
        <Link
          to={`/c/${job.slug}`}
          className="flex items-center gap-1.5 bg-[#0d1b3e] text-white text-xs font-semibold px-3.5 py-2 rounded-lg no-underline hover:bg-[#162d5a] transition-colors"
        >
          Daftar <IconArrow className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ── POSITIONS SECTION ────────────────────────────────────────────────
function PositionsSection() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = JOBS.filter(job => {
    const matchFilter =
      activeFilter === 'all' ||
      (activeFilter === 'paid' && job.type === 'paid') ||
      (activeFilter === 'unpaid' && job.type === 'unpaid') ||
      (activeFilter === 'individual' && job.mode === 'individual') ||
      (activeFilter === 'team' && job.mode === 'team');
    const q = search.toLowerCase();
    const matchSearch = !q || job.company.toLowerCase().includes(q) || job.title.toLowerCase().includes(q) || job.location.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <>
      {/* Search + filter bar */}
      <div className="bg-slate-50 border-y border-slate-200 py-4 px-[5%]" id="positions">
        <div className="max-w-[1200px] mx-auto flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[240px] flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <IconSearch />
            <input
              type="text"
              placeholder="Cari posisi, perusahaan, atau kota..."
              className="border-none outline-none text-sm text-slate-700 w-full bg-transparent placeholder-slate-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium border whitespace-nowrap transition-all ${
                activeFilter === f.key
                  ? 'border-blue-400 text-blue-600 bg-blue-50'
                  : 'border-slate-200 text-slate-500 bg-white hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}

          <div className="ml-auto text-sm text-slate-400 whitespace-nowrap">
            <span className="font-semibold text-slate-600">{filtered.length}</span> lowongan ditemukan
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="py-12 px-[5%]">
        <div className="max-w-[1200px] mx-auto">
          {/* Section header — center */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#0d1b3e]">Lowongan Terbuka</h2>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-sm">
              Tidak ada lowongan yang cocok dengan pencarian kamu.
            </div>
          )}

          <div className="flex justify-center mt-10">
            <button className="flex items-center gap-2 border border-slate-200 rounded-xl px-6 py-2.5 text-sm font-medium text-slate-400 bg-white hover:border-slate-300 hover:text-slate-600 transition-all">
              <IconChevronDown />
              Muat lebih banyak
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── HOW IT WORKS ────────────────────────────────────────────────────
function HowSection() {
  const steps = [
    { n: '1', title: 'Buat akun', desc: 'Daftar dengan email universitas atau email pribadi kamu' },
    { n: '2', title: 'Pilih lowongan', desc: 'Jelajahi program dari berbagai perusahaan, filter sesuai minat' },
    { n: '3', title: 'Upload dokumen', desc: 'Kirim CV dan portofolio, lalu tunggu proses seleksi' },
    { n: '4', title: 'Mulai magang', desc: 'Terima LoA, jalankan program, dan dapatkan sertifikat' },
  ];

  return (
    <section className="bg-[#0d1b3e] py-20 px-[5%]" id="how">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Cara Daftar</div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Mudah, cepat, dan transparan
          </h2>
          <p className="text-sm text-white/50 max-w-md leading-relaxed mb-12 mx-auto">
            Proses pendaftaran magang yang simpel — dari pilih lowongan sampai dapat sertifikat.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="absolute hidden lg:block top-7 left-[12%] right-[12%] h-px bg-gradient-to-r from-blue-500/30 to-teal-500/30" />
          {steps.map(s => (
            <div key={s.n} className="text-center relative">
              <div className="w-14 h-14 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 relative z-10">
                <span className="text-lg font-bold text-blue-400">{s.n}</span>
              </div>
              <div className="text-sm font-semibold text-white mb-2">{s.title}</div>
              <div className="text-xs text-white/45 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ──────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#08112a] py-10 px-[5%] text-center border-t border-white/[0.06]">
      <div className="inline-flex items-center justify-center mb-4">
        <img src="/assets/images/logo.png" alt="EarlyPath" className="h-7 w-auto opacity-50" />
      </div>
      <div className="text-xs text-white/30">© 2026 EarlyPath. All rights reserved.</div>
    </footer>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
      `}</style>
      <Navbar />
      <Hero />
      <PositionsSection />
      <HowSection />
      <Footer />
    </div>
  );
}