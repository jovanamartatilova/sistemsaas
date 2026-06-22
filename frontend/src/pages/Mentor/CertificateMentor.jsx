import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarMentor } from "../../components/SidebarMentor";
import { HRToastStack, useHRToast } from "../../components/HRToast";
import { mentorApi } from "../../api/mentorApi";
import { useAuthStore } from "../../stores/authStore";
import { broadcastDataRefresh, onDataRefresh } from "../../utils/dataRefresh";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Eye, RefreshCw, Check, Upload, Trash2, X, Sliders, Settings, Award, Sparkles, Image, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import SignatureSelector from "../../components/SignatureSelector";
import StampSelector from "../../components/StampSelector";

// ── Icons ──────────────────────────────────────────────────────────────────────
const IC = {
  FileCheck: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <polyline points="9 15 11 17 15 13" />
    </svg>
  ),
  FilePlus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  Search: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Refresh: (props) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ── Action Button ──────────────────────────────────────────────────────────────
const VARIANT = {
  green: { bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  red: { bg: "#fff1f2", color: "#be123c", border: "#fecdd3" },
  blue: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  amber: { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  ghost: { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
};

const FONT_OPTIONS = [
  { value: "", label: "Default Style Font" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Courier New", label: "Courier New" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Outfit", label: "Outfit" },
  { value: "Roboto", label: "Roboto" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Cinzel", label: "Cinzel" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Great Vibes", label: "Great Vibes" },
  { value: "Alex Brush", label: "Alex Brush" },
  { value: "Rochester", label: "Rochester" },
  { value: "Sacramento", label: "Sacramento" },
  { value: "Parisienne", label: "Parisienne" },
  { value: "Pinyon Script", label: "Pinyon Script" }
];


function ActionBtn({ label, icon, variant = "blue", onClick, disabled, title }) {
  const v = VARIANT[variant];
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "4px 10px", borderRadius: "7px", fontSize: "11.5px", fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        border: `1px solid ${v.border}`,
        background: disabled ? "#f1f5f9" : hov ? v.border : v.bg,
        color: disabled ? "#94a3b8" : v.color,
        whiteSpace: "nowrap",
        fontFamily: "'Poppins','Segoe UI',sans-serif",
        transition: "background 0.15s",
        display: "flex", alignItems: "center", gap: "4px",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon && icon}
      {label}
    </button>
  );
}

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
  th: { padding: "10px 16px", textAlign: "center", fontSize: "10px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" },
  td: { padding: "13px 16px", fontSize: "13px", color: "#334155", borderBottom: "1px solid #f8fafc", verticalAlign: "middle", textAlign: "center" },
  cname: { fontWeight: 600, color: "#0f172a", fontSize: "13px", display: "block" },
  badge: (bg, color) => ({ display: "inline-flex", padding: "3px 9px", borderRadius: "6px", fontSize: "12px", fontWeight: 500, background: bg, color }),
  acts: { display: "flex", gap: "6px", alignItems: "center" },
  btnSend: { height: "28px", padding: "0 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", border: "1px solid #93c5fd", background: "#eff6ff", color: "#2563eb", fontFamily: "inherit" },
  btnGenerate: { height: "28px", padding: "0 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, cursor: "pointer", border: "1px solid #86efac", background: "#f0fdf4", color: "#16a34a", fontFamily: "inherit" },
  btnIconBox: { width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
};

export default function CertificateMentor() {
  const navigate = useNavigate();
  const { toasts, pushToast, removeToast } = useHRToast();
  const [mentor, setMentor] = useState(null);
  const [certList, setCertList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState({});
  const [previewing, setPreviewing] = useState({});
  const [sending, setSending] = useState({});
  const [regenerateSuccess, setRegenerateSuccess] = useState({});
  const [logoutModal, setLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Individual");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkSending, setBulkSending] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [hasStamp, setHasStamp] = useState(false);

  // ─── Builder and Layout States ──────────────────────────────────────────────
  const [activeBuilderId, setActiveBuilderId] = useState(null); // null, 'new', or template ID
  const [templateStyle, setTemplateStyle] = useState("classic");
  const [logoPosition, setLogoPosition] = useState("center");
  const [signatureLayout, setSignatureLayout] = useState("single");
  const [signatory1Name, setSignatory1Name] = useState("");
  const [signatory1Title, setSignatory1Title] = useState("");
  const [signatory2Name, setSignatory2Name] = useState("");
  const [signatory2Title, setSignatory2Title] = useState("");
  const [signatory2Signature, setSignatory2Signature] = useState(null); // base64 or path
  const [showQr, setShowQr] = useState(true);
  const [qrPosition, setQrPosition] = useState("bottom-left");
  const [layoutSettings, setLayoutSettings] = useState({
    logo_y: 0, logo_x: 0, show_logo: true,
    title_y: 0, title_x: 0, show_title: true,
    recipient_y: 0, recipient_x: 0, show_recipient: true,
    body_y: 0, body_x: 0, show_body: true,
    signature_y: 0, signature_x: 0, show_signatures: true,
    qr_y: 0, qr_x: 0, show_qr: true,
    font_size_title: 30, font_size_name: 34, font_size_body: 11,
    font_family_title: '',
    font_family_name: '',
    font_family_body: '',
    font_family_table: '',
    font_color_title: '',        // SERTIFIKAT heading
    font_color_cert_id: '',      // certificate number under title
    font_color_name: '',         // candidate name
    font_color_labels: '',       // 'diberikan kepada:' / 'Sebagai:' labels
    font_color_role: '',         // role/position badge text
    badge_bg_color: '',          // position badge background color
    font_color_body: '',         // body paragraph
    font_color_signatures: '',   // signature block text
    sig_invert_1: false,         // invert signature 1 image colors
    sig_invert_2: false,         // invert signature 2 image colors
    logo_remove_bg: false,       // remove white background from logo
    custom_images: [],
  });
  const [customBgFile, setCustomBgFile] = useState(null);
  const [customBgUrl, setCustomBgUrl] = useState(null);
  const [sig2Mode, setSig2Mode] = useState("draw"); // 'draw' or 'upload'
  const [customizerModal, setCustomizerModal] = useState(false); // candidate specific tweaker

  // ─── Certificate Templates State ──────────────────────────────────────────
  const [templates, setTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [generateModal, setGenerateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("tpl_classic");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkModalType, setBulkModalType] = useState("generate");
  const [selectedBulkTemplateId, setSelectedBulkTemplateId] = useState("tpl_classic");

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // ─── Drawing Canvas Event Handlers ──────────────────────────────────────────
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Auto save signature as base64 to state
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignatory2Signature(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setSignatory2Signature(null);
  };

  // Configure canvas context when drawing mode opens
  useEffect(() => {
    if (canvasRef.current && sig2Mode === 'draw') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [activeBuilderId, sig2Mode, customizerModal]);



  // Image compression base64 helper
  const compressImageBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
        callback(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ─── Unified Canva visual mockup preview ─────────────────────────
  const renderVisualMockup = () => {
    const internName = selectedSubmissionId ? (selectedIntern?.name || "Candidate Name") : "[Nama Intern]";
    const internPosition = selectedSubmissionId ? (selectedIntern?.position || "Software Engineer") : "[Nama Posisi]";
    const internProgram = selectedSubmissionId ? (selectedIntern?.program || "Digital Marketing and Customer Engagement Internship Program") : "[Program Magang]";
    const companyName = mentor?.company?.name || "Telkomsel";
    const logoSrc = mentor?.company?.logo_path
      ? `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${mentor.company.logo_path}`
      : null;
    const qrSrc = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://earlypath.id/verify-certificate/PREVIEW_ONLY";
    const mentorSigUrl = sessionStorage.getItem('mentor_signature') || null;

    return (
      <div style={{
        width: "100%", aspectRatio: "1.414", border: "1px solid #cbd5e1", borderRadius: "10px",
        background: "#fff", backgroundImage: customBgUrl ? `url(${customBgUrl})` : "none",
        backgroundSize: "cover", backgroundPosition: "center",
        position: "relative", overflow: "hidden", boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
        userSelect: "none"
      }}>
        {/* Borders */}
        {!customBgUrl && templateStyle === "classic" && (
          <div style={{ position: "absolute", inset: "8px", border: "3px double #1e3a8a", pointerEvents: "none" }} />
        )}
        {!customBgUrl && templateStyle === "modern" && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: "linear-gradient(90deg, #8b5cf6, #3b82f6)", pointerEvents: "none" }} />
        )}
        {!customBgUrl && templateStyle === "elegant" && (
          <div style={{ position: "absolute", inset: "6px", border: "1px solid #b45309", padding: "2px", pointerEvents: "none" }}>
            <div style={{ width: "100%", height: "100%", border: "1px solid #b45309", opacity: 0.5 }} />
          </div>
        )}

        {/* Logo Element */}
        {layoutSettings.show_logo !== false && (
          <div
            style={{
              position: "absolute",
              padding: "4px 8px",
              zIndex: 10,
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              left: logoPosition === "left" ? "24px" : logoPosition === "right" ? "calc(100% - 150px)" : "calc(50% - 60px)",
              top: customBgUrl ? "13%" : "10%"
            }}
          >
            {logoSrc ? (
              <img src={logoSrc} alt="logo" style={{ maxHeight: "30px", maxWidth: "110px", pointerEvents: "none", mixBlendMode: "multiply" }} />
            ) : (
              <div style={{ fontWeight: 800, fontSize: "11px", color: "#2563eb", pointerEvents: "none", textTransform: "uppercase" }}>{companyName}</div>
            )}
          </div>
        )}

        {/* Title Element */}
        {layoutSettings.show_title !== false && (
          <div
            style={{
              position: "absolute",
              width: "70%",
              left: "15%",
              top: customBgUrl ? "18%" : "22%",
              zIndex: 10,
              borderRadius: "4px",
              padding: "4px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <span style={{
              fontSize: `${(layoutSettings.font_size_title || 30) * 0.3}px`,
              fontWeight: "900",
              color: layoutSettings.font_color_title || (templateStyle === "elegant" ? "#854d0e" : "#0f172a"),
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              lineHeight: "1.1",
              fontFamily: layoutSettings.font_family_title || (templateStyle === "elegant" ? "Georgia, serif" : "inherit")
            }}>
              SERTIFIKAT
            </span>
            <span style={{ fontSize: "5.5px", color: layoutSettings.font_color_cert_id || "#64748b", marginTop: "2px" }}>No: CERT/2026/001</span>
          </div>
        )}

        {/* Recipient Block */}
        {layoutSettings.show_recipient !== false && (
          <div
            style={{
              position: "absolute",
              width: "80%",
              left: "10%",
              top: customBgUrl ? "34%" : "38%",
              zIndex: 10,
              borderRadius: "4px",
              padding: "4px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <span style={{ fontSize: "6.5px", color: layoutSettings.font_color_labels || "#475569" }}>diberikan kepada:</span>
            <span style={{
              fontSize: `${(layoutSettings.font_size_name || 34) * 0.3}px`,
              fontWeight: "800",
              color: layoutSettings.font_color_name || (templateStyle === "elegant" ? "#854d0e" : templateStyle === "modern" ? "#1e3a8a" : "#0f172a"),
              borderBottom: "1px solid #cbd5e1",
              paddingBottom: "1px",
              display: "inline-block",
              minWidth: "140px",
              lineHeight: "1.1",
              fontFamily: layoutSettings.font_family_name || (templateStyle === "elegant" ? "Georgia, serif" : templateStyle === "classic" ? "Times New Roman, serif" : "inherit"),
              fontStyle: templateStyle === "modern" ? "normal" : "italic"
            }}>
              {internName}
            </span>

            {layoutSettings.show_body !== false && (
              <p style={{
                fontSize: `${(layoutSettings.font_size_body || (customBgUrl ? 5 : 11)) * 0.35}px`,
                color: layoutSettings.font_color_body || "#475569",
                lineHeight: customBgUrl ? "1.7" : "1.3",
                margin: customBgUrl ? "5px 0" : "3px 0",
                textAlign: "center",
                padding: customBgUrl ? "0 55px" : "0 20px",
                whiteSpace: "normal",
                wordWrap: "break-word",
                width: "100%",
                boxSizing: "border-box",
                fontFamily: layoutSettings.font_family_body || "inherit"
              }}>
                Telah menyelesaikan program magang di <strong>{companyName}</strong> pada program <strong>{internProgram}</strong> bertipe <strong>magang</strong> yang dilaksanakan pada tanggal 12 May 2026 - 12 Nov 2026.
              </p>
            )}
            <span style={{ fontSize: "6.5px", color: layoutSettings.font_color_labels || "#475569", marginTop: "2px" }}>Sebagai:</span>
            <span style={{
              backgroundColor: layoutSettings.badge_bg_color || (templateStyle === "classic" ? "#2563eb" : templateStyle === "modern" ? "#6366f1" : "#854d0e"),
              color: layoutSettings.font_color_role || "#fff",
              padding: "2px 8px",
              borderRadius: templateStyle === "elegant" ? "30px" : "4px",
              fontSize: "6px",
              fontWeight: "bold",
              marginTop: "2px",
              textTransform: "uppercase"
            }}>
              {internPosition}
            </span>
          </div>
        )}

        {/* Signatures Area */}
        {layoutSettings.show_signatures !== false && (() => {
          const sigTextColor = layoutSettings.font_color_signatures || '#64748b';
          const sigNameColor = layoutSettings.font_color_signatures || '#334155';
          const sigLeft = signatureLayout === 'double'
            ? "5%"
            : "57%";
          return (
            <div
              style={{
                position: 'absolute',
                left: sigLeft,
                width: signatureLayout === 'double' ? '90%' : 'auto',
                minWidth: signatureLayout === 'single' ? '90px' : undefined,
                display: 'flex',
                flexDirection: 'row',
                gap: signatureLayout === 'double' ? '8px' : '0',
                justifyContent: signatureLayout === 'double' ? 'space-between' : 'flex-end',
                top: "73%",
                zIndex: 10,
                borderRadius: '4px',
                padding: '2px 4px',
              }}
            >
              {signatureLayout === 'double' && (
                <div style={{ textAlign: 'center', width: '85px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '4.5px', color: sigTextColor }}>Jakarta, 06 June 2026</span>
                  <span style={{ fontSize: '4.5px', fontWeight: '700', color: sigTextColor }}>{signatory2Title || 'Supervisor'}</span>
                  <div style={{ height: '18px', borderBottom: '1px solid #cbd5e1', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '4px 0 1px 0' }}>
                    {signatory2Signature ? (
                      <img src={signatory2Signature} alt="sig2" style={{ maxHeight: '16px', maxWidth: '100%', objectFit: 'contain', pointerEvents: 'none', filter: layoutSettings.sig_invert_2 ? 'invert(1)' : 'none' }} />
                    ) : (
                      <span style={{ fontSize: '3.5px', color: '#cbd5e1' }}>[Signature 2]</span>
                    )}
                  </div>
                  <span style={{ fontSize: '5px', fontWeight: '700', color: sigNameColor, display: 'block' }}>{signatory2Name || 'Supervisor Name'}</span>
                </div>
              )}

              <div style={{ textAlign: 'center', width: '85px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: signatureLayout === 'double' ? '0' : '24px' }}>
                <span style={{ fontSize: '4.5px', color: sigTextColor }}>Jakarta, 06 June 2026</span>
                <span style={{ fontSize: '4.5px', fontWeight: '700', color: sigTextColor }}>{signatory1Title || 'Internship Mentor'}</span>
                <div style={{ height: '18px', borderBottom: '1px solid #cbd5e1', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '4px 0 1px 0' }}>
                  {mentorSigUrl ? (
                    <img src={mentorSigUrl} alt="sig1" style={{ maxHeight: '16px', maxWidth: '100%', objectFit: 'contain', pointerEvents: 'none', filter: layoutSettings.sig_invert_1 ? 'invert(1)' : 'none' }} />
                  ) : (
                    <span style={{ fontSize: '3.5px', color: '#cbd5e1' }}>[Signature 1]</span>
                  )}
                </div>
                <span style={{ fontSize: '5px', fontWeight: '700', color: sigNameColor, display: 'block' }}>{signatory1Name || 'Mentor Name'}</span>
              </div>
            </div>
          );
        })()}

        {/* QR Code Element */}
        {showQr && layoutSettings.show_qr !== false && (
          <div
            style={{
              position: "absolute",
              width: "24px",
              height: "24px",
              zIndex: 10,
              borderRadius: "4px",
              padding: "1px",
              top: customBgUrl ? "73%" : "73%",
              left: qrPosition === "bottom-left"
                ? (customBgUrl ? "11%" : "6%")
                : (customBgUrl ? "calc(89% - 24px)" : "calc(94% - 24px)"),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff"
            }}
          >
            <img src={qrSrc} alt="verification qr" style={{ width: "100%", height: "100%", pointerEvents: "none" }} />
          </div>
        )}
      </div>
    );
  };

  // ─── FETCH ───────────────────────────────────────────────────────────────
  const applyCerts = (data) => {
    const transformed = (data.certificates || []).map(cert => {
      if (cert.status === "Generated" || cert.status === "Sent") {
        return cert;
      }

      return {
        ...cert,
        status: cert.score === null
          ? "In Progress"
          : cert.status === "Passed"
            ? "Done"
            : cert.status,
      };
    });
    setCertList(transformed);
  };

  const fetchProfile = async () => {
    try {
      const profileRes = await mentorApi.getProfile();
      setMentor(profileRes.data);
      loadTemplates(profileRes.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchCerts = async (searchVal = '') => {
    try {
      const certRes = await mentorApi.getCertificates(searchVal);
      applyCerts(certRes.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const fetchAll = async (searchVal = '') => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProfile(),
        fetchCerts(searchVal),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ─── EFFECTS ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Dynamically insert Google Fonts stylesheet link to head
    const linkId = "google-fonts-certificate";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Great+Vibes&family=Alex+Brush&family=Rochester&family=Sacramento&family=Parisienne&family=Pinyon+Script&family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;700&family=Poppins:ital,wght@0,300;0,400;0,700;1,400&family=Roboto:ital,wght@0,300;0,400;0,700;1,400&family=Outfit:wght@300;400;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap";
      document.head.appendChild(link);
    }

    fetchAll('');

    const cacheRef = { lastFetchTime: null };
    const cacheDuration = 5 * 60 * 1000;

    const handleFocus = async () => {
      if (!cacheRef.lastFetchTime) return;
      const elapsed = Date.now() - cacheRef.lastFetchTime;
      if (elapsed < cacheDuration) {
        return;
      }
      try {
        setLoading(true);
        await fetchCerts(search);
        cacheRef.lastFetchTime = Date.now();
      } catch (error) {
        console.error('[CertificateMentor] Background sync error:', error);
      } finally {
        setLoading(false);
      }
    };

    const cleanup = onDataRefresh((eventName) => {
      if (eventName === 'certificate') {
        setLoading(true);
        fetchCerts(search).then(() => {
          cacheRef.lastFetchTime = Date.now();
        }).finally(() => setLoading(false));
      }
    });

    window.addEventListener('focus', handleFocus);
    cacheRef.lastFetchTime = Date.now();

    return () => {
      window.removeEventListener('focus', handleFocus);
      cleanup();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== '') {
        setLoading(true);
        fetchCerts(search).finally(() => setLoading(false));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── ACTIONS ─────────────────────────────────────────────────────────────
  const handleBulkGenerate = () => {
    if (!hasSignature) {
      pushToast("Please set up your signature first", "error");
      return;
    }
    const eligibleIds = filteredCerts
      .filter(cert => cert.status === "Done")
      .map(cert => cert.id_submission);

    if (eligibleIds.length === 0) {
      pushToast("No eligible interns to generate certificates for.", "info");
      return;
    }

    setBulkModalType("generate");
    setSelectedBulkTemplateId("tpl_classic");
    setShowBulkModal(true);
  };

  const handleBulkRegenerate = () => {
    if (!hasSignature) {
      pushToast("Please set up your signature first", "error");
      return;
    }
    const eligibleIds = filteredCerts
      .filter(cert => cert.status === "Generated")
      .map(cert => cert.id_submission);

    if (eligibleIds.length === 0) {
      pushToast("No eligible interns to regenerate certificates for.", "info");
      return;
    }

    setBulkModalType("regenerate");
    setSelectedBulkTemplateId("tpl_classic");
    setShowBulkModal(true);
  };

  const executeBulkAction = async () => {
    const tpl = templates.find(t => t.id === selectedBulkTemplateId);
    if (!tpl) {
      pushToast("Selected template not found", "error");
      return;
    }

    if (!hasSignature) {
      pushToast("Please set up your signature first", "error");
      return;
    }

    const eligibleIds = filteredCerts
      .filter(cert => bulkModalType === "generate" ? cert.status === "Done" : cert.status === "Generated")
      .map(cert => cert.id_submission);

    if (eligibleIds.length === 0) {
      pushToast(`No eligible interns to ${bulkModalType} certificates for.`, "info");
      return;
    }

    let parsedSettings = {};
    if (tpl.layout_settings) {
      if (typeof tpl.layout_settings === 'string') {
        try {
          parsedSettings = JSON.parse(tpl.layout_settings);
        } catch {
          parsedSettings = {};
        }
      } else {
        parsedSettings = tpl.layout_settings;
      }
    }

    const payload = {
      template_style: tpl.template_style,
      logo_position: tpl.logo_position || 'center',
      signature_layout: tpl.signature_layout,
      signatory1_name: tpl.signatory1_name || '',
      signatory1_title: tpl.signatory1_title || '',
      signatory2_name: tpl.signatory2_name || '',
      signatory2_title: tpl.signatory2_title || '',
      show_qr: tpl.show_qr ? "true" : "false",
      qr_position: tpl.qr_position || 'bottom-left',
      layout_settings: parsedSettings,
    };

    if (tpl.background_url) {
      if (tpl.background_url.startsWith('data:image')) {
        payload.background_path = tpl.background_url;
      } else {
        payload.background_path = tpl.background_url.replace(/.*\/storage\//, '');
      }
    }
    if (tpl.signatory2_signature) {
      if (tpl.signatory2_signature.startsWith('data:image')) {
        payload.signatory2_signature = tpl.signatory2_signature;
      } else {
        payload.signatory2_signature = tpl.signatory2_signature.replace(/.*\/storage\//, '');
      }
    }

    try {
      setShowBulkModal(false);
      setBulkGenerating(true);
      await mentorApi.bulkGenerateCertificates(eligibleIds, payload);
      broadcastDataRefresh('certificate');
      await fetchCerts(search);
      pushToast(`Bulk ${bulkModalType} successful for ${eligibleIds.length} interns.`, 'success');
    } catch (error) {
      console.error(`Bulk ${bulkModalType} error:`, error);
      pushToast(`Failed to process bulk ${bulkModalType}`, 'error');
    } finally {
      setBulkGenerating(false);
    }
  };

  const handleBulkSend = async () => {
    const sendableIds = filteredCerts
      .filter(cert => cert.status === "Generated")
      .map(cert => cert.id_submission);

    if (sendableIds.length === 0) {
      pushToast("No certificates ready to be sent. Generate them first.", "info");
      return;
    }

    if (!window.confirm(`Are you sure you want to send certificates to ${sendableIds.length} interns?`)) {
      return;
    }

    try {
      setBulkSending(true);
      await mentorApi.bulkSendCertificates(sendableIds);
      broadcastDataRefresh('certificate');
      await fetchCerts(search);
      pushToast(`Bulk send successful for ${sendableIds.length} interns.`, 'success');
    } catch (error) {
      console.error('Bulk send error:', error);
      pushToast('Failed to process bulk send', 'error');
    } finally {
      setBulkSending(false);
    }
  };

  const base64ToFile = (base64String, filename) => {
    if (!base64String || !base64String.startsWith('data:image')) return null;
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // ─── Templates Customizer Loaders & Actions ──────────────────────────────────
  // ─── Templates Customizer Loaders & Actions ──────────────────────────────────
  const loadTemplates = async (mentorProfile) => {
    let parsed = [];
    try {
      const response = await mentorApi.getTemplates();
      parsed = response.data || [];
    } catch (error) {
      console.error('Failed to load templates from server:', error);
      parsed = [];
    }

    const defaults = [
      {
        id: "tpl_classic",
        name: "Default Classic Style",
        template_style: "classic",
        logo_position: "center",
        signature_layout: "single",
        signatory1_name: mentorProfile?.name || "",
        signatory1_title: "Internship Mentor",
        signatory2_name: "",
        signatory2_title: "",
        signatory2_signature: null,
        show_qr: true,
        qr_position: "bottom-left",
        layout_settings: {
          logo_y: 0, logo_x: 0, show_logo: true,
          title_y: 0, title_x: 0, show_title: true,
          recipient_y: 0, recipient_x: 0, show_recipient: true,
          body_y: 0, body_x: 0, show_body: true,
          signature_y: 0, signature_x: 0, show_signatures: true,
          qr_y: 0, qr_x: 0, show_qr: true,
          font_size_title: 30, font_size_name: 34, font_size_body: 11
        },
        background_url: null,
        is_default: true
      },
      {
        id: "tpl_modern",
        name: "Default Modern Style",
        template_style: "modern",
        logo_position: "center",
        signature_layout: "single",
        signatory1_name: mentorProfile?.name || "",
        signatory1_title: "Internship Mentor",
        signatory2_name: "",
        signatory2_title: "",
        signatory2_signature: null,
        show_qr: true,
        qr_position: "bottom-left",
        layout_settings: {
          logo_y: 0, logo_x: 0, show_logo: true,
          title_y: 0, title_x: 0, show_title: true,
          recipient_y: 0, recipient_x: 0, show_recipient: true,
          body_y: 0, body_x: 0, show_body: true,
          signature_y: 0, signature_x: 0, show_signatures: true,
          qr_y: 0, qr_x: 0, show_qr: true,
          font_size_title: 28, font_size_name: 32, font_size_body: 11
        },
        background_url: null,
        is_default: true
      },
      {
        id: "tpl_elegant",
        name: "Default Elegant Style",
        template_style: "elegant",
        logo_position: "center",
        signature_layout: "single",
        signatory1_name: mentorProfile?.name || "",
        signatory1_title: "Internship Mentor",
        signatory2_name: "",
        signatory2_title: "",
        signatory2_signature: null,
        show_qr: true,
        qr_position: "bottom-left",
        layout_settings: {
          logo_y: 0, logo_x: 0, show_logo: true,
          title_y: 0, title_x: 0, show_title: true,
          recipient_y: 0, recipient_x: 0, show_recipient: true,
          body_y: 0, body_x: 0, show_body: true,
          signature_y: 0, signature_x: 0, show_signatures: true,
          qr_y: 0, qr_x: 0, show_qr: true,
          font_size_title: 26, font_size_name: 34, font_size_body: 11
        },
        background_url: null,
        is_default: true
      }
    ];

    setTemplates([...defaults, ...parsed]);
  };

  const handleCreateTemplate = () => {
    setSelectedSubmissionId(null);
    setActiveBuilderId("new");
    setTemplateName(`Template ${templates.filter(t => !t.is_default).length + 1}`);
    setTemplateStyle("classic");
    setLogoPosition("center");
    setSignatureLayout("single");
    setSignatory1Name(mentor?.name || "");
    setSignatory1Title("Internship Mentor");
    setSignatory2Name("");
    setSignatory2Title("");
    setSignatory2Signature(null);
    setShowQr(true);
    setQrPosition("bottom-left");
    setLayoutSettings({
      logo_y: 0, logo_x: 0, show_logo: true,
      title_y: 0, title_x: 0, show_title: true,
      recipient_y: 0, recipient_x: 0, show_recipient: true,
      body_y: 0, body_x: 0, show_body: true,
      signature_y: 0, signature_x: 0, show_signatures: true,
      qr_y: 0, qr_x: 0, show_qr: true,
      font_size_title: 30, font_size_name: 34, font_size_body: 11,
      font_family_title: '', font_family_name: '', font_family_body: '', font_family_table: '',
      font_color_title: '', font_color_cert_id: '', font_color_name: '',
      font_color_labels: '', font_color_role: '',
      badge_bg_color: '',
      font_color_body: '', font_color_signatures: '',
      sig_invert_1: false, sig_invert_2: false,
      logo_remove_bg: false,
      custom_images: []
    });
    setCustomBgUrl(null);
    setCustomBgFile(null);
  };

  const handleEditTemplate = (tpl) => {
    const isDefault = tpl.is_default;
    setSelectedSubmissionId(null);
    setActiveBuilderId(isDefault ? "new" : tpl.id);
    setTemplateName(isDefault ? `${tpl.name} - Custom` : tpl.name);
    setTemplateStyle(tpl.template_style);
    setLogoPosition(tpl.logo_position || "center");
    setSignatureLayout(tpl.signature_layout);
    setSignatory1Name(tpl.signatory1_name || mentor?.name || "");
    setSignatory1Title(tpl.signatory1_title || "Internship Mentor");
    setSignatory2Name(tpl.signatory2_name || "");
    setSignatory2Title(tpl.signatory2_title || "");
    setSignatory2Signature(tpl.signatory2_signature || null);
    setShowQr(tpl.show_qr !== undefined ? Boolean(tpl.show_qr) : true);
    setQrPosition(tpl.qr_position || "bottom-left");

    let parsedSettings = {};
    try {
      parsedSettings = typeof tpl.layout_settings === 'string'
        ? JSON.parse(tpl.layout_settings)
        : tpl.layout_settings;
    } catch {
      parsedSettings = tpl.layout_settings || {};
    }

    setLayoutSettings({
      logo_y: parsedSettings.logo_y || 0,
      logo_x: parsedSettings.logo_x || 0,
      show_logo: parsedSettings.show_logo !== undefined ? parsedSettings.show_logo : true,
      title_y: parsedSettings.title_y || 0,
      title_x: parsedSettings.title_x || 0,
      show_title: parsedSettings.show_title !== undefined ? parsedSettings.show_title : true,
      recipient_y: parsedSettings.recipient_y || 0,
      recipient_x: parsedSettings.recipient_x || 0,
      show_recipient: parsedSettings.show_recipient !== undefined ? parsedSettings.show_recipient : true,
      body_y: parsedSettings.body_y || 0,
      body_x: parsedSettings.body_x || 0,
      show_body: parsedSettings.show_body !== undefined ? parsedSettings.show_body : true,
      signature_y: parsedSettings.signature_y || 0,
      signature_x: parsedSettings.signature_x || 0,
      show_signatures: parsedSettings.show_signatures !== undefined ? parsedSettings.show_signatures : true,
      qr_y: parsedSettings.qr_y || 0,
      qr_x: parsedSettings.qr_x || 0,
      show_qr: parsedSettings.show_qr !== undefined ? parsedSettings.show_qr : true,
      font_size_title: parsedSettings.font_size_title || (tpl.template_style === 'classic' ? 30 : tpl.template_style === 'modern' ? 28 : 26),
      font_size_name: parsedSettings.font_size_name || (tpl.template_style === 'modern' ? 32 : 34),
      font_size_body: parsedSettings.font_size_body || 11,
      font_family_title: parsedSettings.font_family_title || '',
      font_family_name: parsedSettings.font_family_name || '',
      font_family_body: parsedSettings.font_family_body || '',
      font_family_table: parsedSettings.font_family_table || '',
      font_color_title: parsedSettings.font_color_title || '',
      font_color_cert_id: parsedSettings.font_color_cert_id || '',
      font_color_name: parsedSettings.font_color_name || '',
      font_color_labels: parsedSettings.font_color_labels || '',
      font_color_role: parsedSettings.font_color_role || '',
      badge_bg_color: parsedSettings.badge_bg_color || '',
      font_color_body: parsedSettings.font_color_body || '',
      font_color_signatures: parsedSettings.font_color_signatures || '',
      sig_invert_1: parsedSettings.sig_invert_1 || false,
      sig_invert_2: parsedSettings.sig_invert_2 || false,
      logo_remove_bg: parsedSettings.logo_remove_bg !== undefined ? parsedSettings.logo_remove_bg : (tpl.background_url ? true : false),
      custom_images: parsedSettings.custom_images || [],
    });

    setCustomBgUrl(tpl.background_url || null);
    setCustomBgFile(null);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      pushToast("Please enter a template name", "error");
      return;
    }

    const isNew = activeBuilderId === "new";
    try {
      const formData = new FormData();
      formData.append('name', templateName);
      formData.append('template_style', templateStyle);
      formData.append('logo_position', logoPosition);
      formData.append('signature_layout', signatureLayout);
      formData.append('signatory1_name', signatory1Name || "");
      formData.append('signatory1_title', signatory1Title || "");
      formData.append('signatory2_name', signatory2Name || "");
      formData.append('signatory2_title', signatory2Title || "");
      formData.append('show_qr', showQr ? "true" : "false");
      formData.append('qr_position', qrPosition);
      formData.append('layout_settings', JSON.stringify(layoutSettings));

      if (customBgFile) {
        formData.append('background_file', customBgFile);
      } else if (customBgUrl) {
        if (customBgUrl.startsWith('data:image')) {
          const bgFile = base64ToFile(customBgUrl, 'background.jpg');
          if (bgFile) formData.append('background_file', bgFile);
        } else {
          formData.append('background_path', customBgUrl.replace(/.*\/storage\//, ''));
        }
      }

      if (signatory2Signature) {
        if (signatory2Signature.startsWith('data:image')) {
          formData.append('signatory2_signature', signatory2Signature);
        } else {
          formData.append('signatory2_signature', signatory2Signature.replace(/.*\/storage\//, ''));
        }
      }

      if (isNew) {
        await mentorApi.createTemplate(formData);
        pushToast("Template created successfully", "success");
      } else {
        await mentorApi.updateTemplate(activeBuilderId, formData);
        pushToast("Template updated successfully", "success");
      }

      await loadTemplates(mentor);
      setActiveBuilderId(null);
    } catch (error) {
      console.error("Failed to save template:", error);
      pushToast("Failed to save template", "error");
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this custom template?")) return;
    try {
      await mentorApi.deleteTemplate(id);
      pushToast("Template deleted successfully", "success");
      await loadTemplates(mentor);
    } catch (error) {
      console.error("Failed to delete template:", error);
      pushToast("Failed to delete template", "error");
    }
  };

  const handlePreviewTemplate = async () => {
    const dummySubId = certList[0]?.id_submission;
    if (!dummySubId) {
      pushToast("Please ensure you have at least one intern to generate previews", "info");
      return;
    }

    const formData = new FormData();
    formData.append('is_dummy', 'true');
    formData.append('template_style', templateStyle);
    formData.append('logo_position', logoPosition);
    formData.append('signature_layout', signatureLayout);
    formData.append('signatory1_name', signatory1Name);
    formData.append('signatory1_title', signatory1Title);
    formData.append('signatory2_name', signatory2Name);
    formData.append('signatory2_title', signatory2Title);
    formData.append('show_qr', showQr ? "true" : "false");
    formData.append('qr_position', qrPosition);
    formData.append('layout_settings', JSON.stringify(layoutSettings));

    if (customBgFile) {
      formData.append('background_file', customBgFile);
    } else if (customBgUrl) {
      if (customBgUrl.startsWith('data:image')) {
        const bgFile = base64ToFile(customBgUrl, 'background.jpg');
        if (bgFile) formData.append('background_file', bgFile);
      } else {
        formData.append('background_path', customBgUrl.replace(/.*\/storage\//, ''));
      }
    }

    if (signatory2Signature) {
      formData.append('signatory2_signature', signatory2Signature);
    }

    try {
      setPreviewing(prev => ({ ...prev, template: true }));
      const url = await mentorApi.previewCertificate(dummySubId, formData);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error previewing template:', error);
      pushToast('Failed to preview template PDF', 'error');
    } finally {
      setPreviewing(prev => ({ ...prev, template: false }));
    }
  };

  // ─── Individual Candidate Customizer Actions ────────────────────────────────
  const handleOpenCustomizer = (cert) => {
    setSelectedSubmissionId(cert.id_submission);
    setGenerateModal(true);
  };

  const handlePreviewCustomizer = async () => {
    if (!hasSignature) {
      pushToast("Please set up your signature first", "error");
      return;
    }

    const formData = new FormData();
    formData.append('template_style', templateStyle);
    formData.append('logo_position', logoPosition);
    formData.append('signature_layout', signatureLayout);
    formData.append('signatory1_name', signatory1Name);
    formData.append('signatory1_title', signatory1Title);
    formData.append('signatory2_name', signatory2Name);
    formData.append('signatory2_title', signatory2Title);
    formData.append('show_qr', showQr ? "true" : "false");
    formData.append('qr_position', qrPosition);
    formData.append('layout_settings', JSON.stringify(layoutSettings));

    if (customBgFile) {
      formData.append('background_file', customBgFile);
    } else if (customBgUrl) {
      if (customBgUrl.startsWith('data:image')) {
        const bgFile = base64ToFile(customBgUrl, 'background.jpg');
        if (bgFile) formData.append('background_file', bgFile);
      } else {
        formData.append('background_path', customBgUrl.replace(/.*\/storage\//, ''));
      }
    }

    if (signatory2Signature) {
      formData.append('signatory2_signature', signatory2Signature);
    }

    try {
      setPreviewing(prev => ({ ...prev, [selectedSubmissionId]: true }));
      const url = await mentorApi.previewCertificate(selectedSubmissionId, formData);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error previewing certificate:', error);
      pushToast('Failed to preview certificate PDF', 'error');
    } finally {
      setPreviewing(prev => ({ ...prev, [selectedSubmissionId]: false }));
    }
  };

  const handleGenerateCustomizer = async () => {
    if (!hasSignature) {
      pushToast("Please set up your signature first", "error");
      return;
    }

    const formData = new FormData();
    formData.append('template_style', templateStyle);
    formData.append('logo_position', logoPosition);
    formData.append('signature_layout', signatureLayout);
    formData.append('signatory1_name', signatory1Name);
    formData.append('signatory1_title', signatory1Title);
    formData.append('signatory2_name', signatory2Name);
    formData.append('signatory2_title', signatory2Title);
    formData.append('show_qr', showQr ? "true" : "false");
    formData.append('qr_position', qrPosition);
    formData.append('layout_settings', JSON.stringify(layoutSettings));

    if (customBgFile) {
      formData.append('background_file', customBgFile);
    } else if (customBgUrl) {
      if (customBgUrl.startsWith('data:image')) {
        const bgFile = base64ToFile(customBgUrl, 'background.jpg');
        if (bgFile) formData.append('background_file', bgFile);
      } else {
        formData.append('background_path', customBgUrl.replace(/.*\/storage\//, ''));
      }
    }

    if (signatory2Signature) {
      formData.append('signatory2_signature', signatory2Signature);
    }

    try {
      setGenerating(prev => ({ ...prev, [selectedSubmissionId]: true }));
      await mentorApi.generateCertificate(selectedSubmissionId, formData);
      broadcastDataRefresh('certificate');
      setRegenerateSuccess(prev => ({ ...prev, [selectedSubmissionId]: true }));
      setTimeout(() => setRegenerateSuccess(prev => ({ ...prev, [selectedSubmissionId]: false })), 3000);
      pushToast('Certificate generated successfully', 'success');
      setCustomizerModal(false);
      await fetchCerts(search);
    } catch (error) {
      console.error('Error generating certificate:', error);
      pushToast('Failed to generate certificate', 'error');
    } finally {
      setGenerating(prev => ({ ...prev, [selectedSubmissionId]: false }));
    }
  };

  const handleGenerateFromTemplate = async () => {
    const tpl = templates.find(t => t.id === selectedTemplateId);
    if (!tpl) {
      pushToast("Selected template not found", "error");
      return;
    }

    if (!hasSignature) {
      pushToast("Please set up your signature first", "error");
      return;
    }

    let parsedSettings = {};
    if (tpl.layout_settings) {
      if (typeof tpl.layout_settings === 'string') {
        try {
          parsedSettings = JSON.parse(tpl.layout_settings);
        } catch {
          parsedSettings = {};
        }
      } else {
        parsedSettings = tpl.layout_settings;
      }
    }

    const formData = new FormData();
    formData.append('template_style', tpl.template_style);
    formData.append('logo_position', tpl.logo_position || 'center');
    formData.append('signature_layout', tpl.signature_layout);
    formData.append('signatory1_name', tpl.signatory1_name || '');
    formData.append('signatory1_title', tpl.signatory1_title || '');
    formData.append('signatory2_name', tpl.signatory2_name || '');
    formData.append('signatory2_title', tpl.signatory2_title || '');
    formData.append('show_qr', tpl.show_qr ? "true" : "false");
    formData.append('qr_position', tpl.qr_position || 'bottom-left');
    formData.append('layout_settings', JSON.stringify(parsedSettings));

    if (tpl.background_url) {
      if (tpl.background_url.startsWith('data:image')) {
        const bgFile = base64ToFile(tpl.background_url, 'background.jpg');
        if (bgFile) formData.append('background_file', bgFile);
      } else {
        formData.append('background_path', tpl.background_url.replace(/.*\/storage\//, ''));
      }
    }

    if (tpl.signatory2_signature) {
      formData.append('signatory2_signature', tpl.signatory2_signature);
    }

    try {
      setGenerating(prev => ({ ...prev, [selectedSubmissionId]: true }));
      await mentorApi.generateCertificate(selectedSubmissionId, formData);
      broadcastDataRefresh('certificate');
      setRegenerateSuccess(prev => ({ ...prev, [selectedSubmissionId]: true }));
      setTimeout(() => setRegenerateSuccess(prev => ({ ...prev, [selectedSubmissionId]: false })), 3000);
      pushToast('Certificate generated successfully', 'success');
      setGenerateModal(false);
      await fetchCerts(search);
    } catch (error) {
      console.error('Error generating certificate:', error);
      pushToast('Failed to generate certificate', 'error');
    } finally {
      setGenerating(prev => ({ ...prev, [selectedSubmissionId]: false }));
    }
  };

  const handleDirectPreview = async (cert) => {
    if (cert.file_url) {
      const cacheBuster = cert.file_url + (cert.file_url.includes('?') ? '&' : '?') + 't=' + Date.now();
      window.open(cacheBuster, '_blank');
      return;
    }
    try {
      setPreviewing(prev => ({ ...prev, [cert.id_submission]: true }));
      const url = await mentorApi.previewCertificate(cert.id_submission);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error previewing certificate:', error);
      pushToast('Failed to preview certificate', 'error');
    } finally {
      setPreviewing(prev => ({ ...prev, [cert.id_submission]: false }));
    }
  };

  const handleSendCertificate = async (idSubmission) => {
    try {
      setSending(prev => ({ ...prev, [idSubmission]: true }));
      await mentorApi.sendCertificate(idSubmission);
      broadcastDataRefresh('certificate');
      pushToast('Certificate sent successfully', 'success');
      await fetchCerts(search);
    } catch (error) {
      console.error('Error sending certificate:', error);
      pushToast('Failed to send certificate', 'error');
    } finally {
      setSending(prev => ({ ...prev, [idSubmission]: false }));
    }
  };

  const handleLogoutClick = () => setLogoutModal(true);

  const confirmLogout = async () => {
    try {
      await useAuthStore.getState().logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLogoutModal(false);
      navigate("/", { replace: true });
    }
  };

  const filteredCerts = certList.filter(cert =>
    activeTab === "Individual" ? cert.type !== "Team" : cert.type === "Team"
  );

  const selectedIntern = certList.find(c => c.id_submission === selectedSubmissionId);

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
          <div style={s.content}><LoadingSpinner message="Loading certificates..." /></div>
        </main>
      </div>
    );
  }

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Great+Vibes&family=Alex+Brush&family=Rochester&family=Sacramento&family=Parisienne&family=Pinyon+Script&family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;700&family=Poppins:ital,wght@0,300;0,400;0,700;1,400&family=Roboto:ital,wght@0,300;0,400;0,700;1,400&family=Outfit:wght@300;400;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }
        tr:last-child td { border-bottom: none; }
        .mockup-el {
          border: 1.5px dashed transparent !important;
          transition: border 0.15s, background-color 0.15s;
        }
        .mockup-el:hover {
          border: 1.5px dashed #8b5cf6 !important;
          background-color: rgba(139, 92, 246, 0.04);
        }
        .mockup-el-selected {
          border: 1.5px solid #8b5cf6 !important;
          background-color: rgba(139, 92, 246, 0.08);
        }
        @media (max-width: 768px) {
          .cert-main { overflow: auto !important; padding-top: 56px !important; }
          .cert-topbar { padding: 10px 14px !important; }
          .cert-topbar-date { display: none !important; }
          .cert-content { padding: 14px 10px !important; }
          .cert-card-header { padding: 12px 10px !important; }
          .cert-filter-row { flex-wrap: wrap !important; gap: 12px !important; }
          .cert-card-actions { flex-grow: 1 !important; width: 100% !important; justify-content: flex-start !important; }
          .cert-bulk-btns { flex-grow: 1 !important; width: 100% !important; justify-content: flex-start !important; }
        }
      `}</style>
      <SidebarMentor mentor={mentor} onLogout={handleLogoutClick} />
      <main className="cert-main" style={s.main}>
        <div className="cert-topbar" style={s.topbar}>
          <div style={s.bc}>
            <span>Dashboard</span><span style={s.bcSep}>/</span>
            <span>Others</span><span style={s.bcSep}>/</span>
            <span style={s.bcActive}>Certificate</span>
          </div>
          <div className="cert-topbar-date" style={s.topbarDate}>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>

        <div className="cert-content" style={s.content}>
          <h1 style={s.h1}>Certificate</h1>
          <p style={s.subtitle}>Generate and manage certificates for interns who have passed all competency assessments.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <SignatureSelector onSignatureChange={(url) => setHasSignature(!!url)} />
            <StampSelector onStampChange={(url) => setHasStamp(!!url)} />
          </div>

          {/* Inline Template Builder OR Saved Templates List */}
          {activeBuilderId !== null ? (
            /* --- INLINE TEMPLATE BUILDER CARD --- */
            <div style={{ ...s.card, marginBottom: "24px", border: "2px solid #8b5cf6" }}>
              <div style={{ ...s.ch, background: "linear-gradient(135deg, #f5f3ff, #fff)", borderBottom: "1px solid #ddd" }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ ...s.ct, color: "#7c3aed" }}>
                    {activeBuilderId === "new" ? "Create Certificate Template" : `Edit Template: ${templateName}`}
                  </div>
                  <div style={s.cs}>Configure visual layout offsets, themes, backgrounds, and signatory details.</div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setActiveBuilderId(null)}
                    style={{
                      padding: "6px 14px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px",
                      fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTemplate}
                    style={{
                      padding: "6px 14px", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", border: "none", borderRadius: "6px",
                      fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 10px rgba(124,58,237,0.15)"
                    }}
                  >
                    Save Template
                  </button>
                </div>
              </div>

              {/* Builder Body (Two Column Grid) */}
              <div style={{ display: "flex", flexWrap: "wrap", borderTop: "none" }}>

                {/* Left controls column */}
                <div style={{ flex: "1 1 550px", padding: "20px 24px", borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "20px" }}>

                  {/* Name field */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>Template Name</label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g. Template 1"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", fontWeight: "600", color: "#0f172a", background: "#ffffff" }}
                    />
                  </div>

                  {/* Theme Style & Background */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>Theme Style & Background Design</label>

                    {/* Style Grid cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                      {[
                        { id: "classic", label: "Classic", desc: "Serif, borders" },
                        { id: "modern", label: "Modern", desc: "Clean purple" },
                        { id: "elegant", label: "Elegant", desc: "Slim gold border" }
                      ].map(styleOpt => (
                        <div
                          key={styleOpt.id}
                          onClick={() => setTemplateStyle(styleOpt.id)}
                          style={{
                            padding: "10px", borderRadius: "10px", border: templateStyle === styleOpt.id ? "2px solid #8b5cf6" : "1px solid #e2e8f0",
                            background: templateStyle === styleOpt.id ? "#f5f3ff" : "#fff", cursor: "pointer", textAlign: "center", transition: "all 0.15s"
                          }}
                        >
                          <div style={{ fontSize: "12px", fontWeight: "700", color: templateStyle === styleOpt.id ? "#7c3aed" : "#334155" }}>{styleOpt.label}</div>
                          <div style={{ fontSize: "10px", color: templateStyle === styleOpt.id ? "#8b5cf6" : "#64748b", marginTop: "2px" }}>{styleOpt.desc}</div>
                        </div>
                      ))}
                    </div>

                    {/* Upload PPT Background design */}
                    <div style={{ marginTop: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" }}>Upload Design Background (PPT Export / PNG / JPG)</span>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <label style={{
                          padding: "6px 12px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px",
                          fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "#64748b"
                        }}>
                          <Upload size={14} />
                          Browse File
                          <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setCustomBgFile(file);
                              compressImageBase64(file, (compressedBase64) => {
                                setCustomBgUrl(compressedBase64);
                                setLayoutSettings(prev => ({ ...prev, logo_remove_bg: true }));
                              });
                            }
                          }} style={{ display: "none" }} />
                        </label>
                        {customBgUrl && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", padding: "5px 10px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                            <Image size={14} style={{ color: "#166534" }} />
                            <span style={{ fontSize: "11px", color: "#166534", fontWeight: "500", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {customBgFile ? customBgFile.name : "Custom Background"}
                            </span>
                            <button onClick={() => { setCustomBgFile(null); setCustomBgUrl(null); }} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: 0 }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: "10.5px", color: "#64748b", display: "block", marginTop: "6px", fontStyle: "italic", lineHeight: "1.4" }}>
                        Rekomendasi ukuran: <strong>3508 x 2480 px</strong> (300 DPI) atau <strong>29.7 x 21.0 cm</strong> (A4 Landscape dengan rasio 1.414:1) agar gambar tidak pecah atau terpotong.
                      </span>
                    </div>
                  </div>

                  {/* Set Signatures section */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
                      <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Award size={14} style={{ color: "#10b981" }} />
                        Set Signatures & Signatories
                      </label>
                      {signatureLayout === "single" && (
                        <button
                          onClick={() => setSignatureLayout("double")}
                          style={{ background: "#eff6ff", border: "none", color: "#2563eb", fontSize: "10.5px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px", cursor: "pointer" }}
                        >
                          + Add Second Signature
                        </button>
                      )}
                    </div>

                    {/* Signatory 1 Card */}
                    <div style={{ padding: "12px", border: "1px solid #cbd5e1", borderRadius: "10px", background: "#f8fafc" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>Signatory 1 (Primary Mentor)</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
                        <div>
                          <label style={{ fontSize: "10px", color: "#64748b", display: "block", marginBottom: "2px" }}>Name</label>
                          <input value={signatory1Name} onChange={e => setSignatory1Name(e.target.value)} placeholder="Mentor Name" style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", outline: "none", background: "#ffffff", color: "#0f172a" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "10px", color: "#64748b", display: "block", marginBottom: "2px" }}>Title</label>
                          <input value={signatory1Title} onChange={e => setSignatory1Title(e.target.value)} placeholder="e.g. Backend Mentor" style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", outline: "none", background: "#ffffff", color: "#0f172a" }} />
                        </div>
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#64748b", background: "#eff6ff", padding: "5px 10px", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                        💡 Uses the primary mentor signature set in the "Document Signature" box above.
                      </div>
                    </div>

                    {/* Signatory 2 Card */}
                    {signatureLayout === "double" && (
                      <div style={{ padding: "12px", border: "1px solid #8b5cf6", borderRadius: "10px", background: "#fcfcff", position: "relative" }}>
                        <button
                          onClick={() => setSignatureLayout("single")}
                          style={{ position: "absolute", top: "10px", right: "10px", background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}
                        >
                          Remove
                        </button>
                        <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#7c3aed", marginBottom: "8px" }}>Signatory 2 (Secondary Mentor / Supervisor)</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
                          <div>
                            <label style={{ fontSize: "10px", color: "#64748b", display: "block", marginBottom: "2px" }}>Name</label>
                            <input value={signatory2Name} onChange={e => setSignatory2Name(e.target.value)} placeholder="Second Signer Name" style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", outline: "none", background: "#ffffff", color: "#0f172a" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: "10px", color: "#64748b", display: "block", marginBottom: "2px" }}>Title</label>
                            <input value={signatory2Title} onChange={e => setSignatory2Title(e.target.value)} placeholder="e.g. Supervisor / HRD" style={{ width: "100%", padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", outline: "none", background: "#ffffff", color: "#0f172a" }} />
                          </div>
                        </div>

                        {/* Signatory 2 pad */}
                        <div style={{ marginTop: "8px" }}>
                          <div style={{ display: "flex", gap: "12px", marginBottom: "6px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10.5px", cursor: "pointer", color: "#475569" }}>
                              <input type="radio" checked={sig2Mode === "draw"} onChange={() => setSig2Mode("draw")} style={{ accentColor: "#8b5cf6" }} />
                              Draw Signature
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10.5px", cursor: "pointer", color: "#475569" }}>
                              <input type="radio" checked={sig2Mode === "upload"} onChange={() => setSig2Mode("upload")} style={{ accentColor: "#8b5cf6" }} />
                              Upload PNG Image
                            </label>
                          </div>

                          {sig2Mode === "draw" ? (
                            <div>
                              <canvas
                                ref={canvasRef}
                                width={400}
                                height={110}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                style={{
                                  width: "100%", height: "110px", border: "1px solid #cbd5e1", borderRadius: "6px",
                                  background: "#fff", cursor: "crosshair", touchAction: "none"
                                }}
                              />
                              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                                <span style={{ fontSize: "9px", color: "#94a3b8" }}>Draw within the box</span>
                                <button onClick={clearCanvas} style={{ background: "#fee2e2", border: "none", color: "#ef4444", fontSize: "9.5px", padding: "1px 6px", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>Clear Canvas</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <label style={{
                                padding: "5px 10px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "6px",
                                fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600", color: "#64748b"
                              }}>
                                <Upload size={12} />
                                Upload PNG Signature
                                <input type="file" accept="image/*" onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => setSignatory2Signature(event.target.result);
                                    reader.readAsDataURL(file);
                                  }
                                }} style={{ display: "none" }} />
                              </label>
                              {signatory2Signature && (
                                <button onClick={() => setSignatory2Signature(null)} style={{ background: "#fee2e2", border: "none", color: "#ef4444", fontSize: "10px", padding: "3px 8px", borderRadius: "5px", cursor: "pointer", fontWeight: "600" }}>Delete</button>
                              )}
                            </div>
                          )}

                          {signatory2Signature && (
                            <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "9.5px", color: "#94a3b8" }}>Drawn/Uploaded Preview:</span>
                              <div style={{ width: "60px", height: "30px", border: "1px solid #cbd5e1", borderRadius: "4px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                <img src={signatory2Signature} alt="sig2_preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Element Visibility & Text Colors Panel */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "16px", background: "#f8fafc" }}>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Sliders size={14} style={{ color: "#8b5cf6" }} />
                      Element Visibility & Colors
                    </label>

                    {/* Logo Visibility */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                          <input
                            type="checkbox"
                            checked={layoutSettings.show_logo !== false}
                            onChange={(e) => setLayoutSettings(prev => ({ ...prev, show_logo: e.target.checked }))}
                            style={{ accentColor: "#8b5cf6", width: "15px", height: "15px" }}
                          />
                          Show Logo
                        </label>
                      </div>
                      {layoutSettings.show_logo !== false && (
                        <div style={{ paddingLeft: "23px" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "11px", color: "#64748b" }}>
                            <input
                              type="checkbox"
                              checked={!!layoutSettings.logo_remove_bg}
                              onChange={(e) => setLayoutSettings(prev => ({ ...prev, logo_remove_bg: e.target.checked }))}
                              style={{ accentColor: "#8b5cf6" }}
                            />
                            Remove Logo Background (Transparency)
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Title Elements & Colors */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                          <input
                            type="checkbox"
                            checked={layoutSettings.show_title !== false}
                            onChange={(e) => setLayoutSettings(prev => ({ ...prev, show_title: e.target.checked }))}
                            style={{ accentColor: "#8b5cf6", width: "15px", height: "15px" }}
                          />
                          Show Title ("SERTIFIKAT")
                        </label>
                      </div>
                      {layoutSettings.show_title !== false && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", paddingLeft: "23px" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                            🎨 Title Color:
                            <input
                              type="color"
                              value={layoutSettings.font_color_title || "#000000"}
                              onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_title: e.target.value }))}
                              style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                            />
                            {layoutSettings.font_color_title && (
                              <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_title: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                            )}
                          </label>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                            🎨 Cert No Color:
                            <input
                              type="color"
                              value={layoutSettings.font_color_cert_id || "#64748b"}
                              onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_cert_id: e.target.value }))}
                              style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                            />
                            {layoutSettings.font_color_cert_id && (
                              <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_cert_id: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                            )}
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Recipient Details & Colors */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                          <input
                            type="checkbox"
                            checked={layoutSettings.show_recipient !== false}
                            onChange={(e) => setLayoutSettings(prev => ({ ...prev, show_recipient: e.target.checked }))}
                            style={{ accentColor: "#8b5cf6", width: "15px", height: "15px" }}
                          />
                          Show Recipient Block
                        </label>
                      </div>
                      {layoutSettings.show_recipient !== false && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "23px" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                              🎨 Name Color:
                              <input
                                type="color"
                                value={layoutSettings.font_color_name || "#000000"}
                                onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_name: e.target.value }))}
                                style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                              />
                              {layoutSettings.font_color_name && (
                                <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_name: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                              )}
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                              🎨 Labels Color:
                              <input
                                type="color"
                                value={layoutSettings.font_color_labels || "#475569"}
                                onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_labels: e.target.value }))}
                                style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                              />
                              {layoutSettings.font_color_labels && (
                                <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_labels: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                              )}
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                              🎨 Badge Text Color:
                              <input
                                type="color"
                                value={layoutSettings.font_color_role || "#ffffff"}
                                onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_role: e.target.value }))}
                                style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                              />
                              {layoutSettings.font_color_role && (
                                <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_role: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                              )}
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                              🎨 Badge Background Color:
                              <input
                                type="color"
                                value={layoutSettings.badge_bg_color || "#2563eb"}
                                onChange={(e) => setLayoutSettings(prev => ({ ...prev, badge_bg_color: e.target.value }))}
                                style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                              />
                              {layoutSettings.badge_bg_color && (
                                <button onClick={() => setLayoutSettings(prev => ({ ...prev, badge_bg_color: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                              )}
                            </label>
                          </div>

                          {/* Body / Description Text */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "11.5px", fontWeight: "600", color: "#475569" }}>
                              <input
                                type="checkbox"
                                checked={layoutSettings.show_body !== false}
                                onChange={(e) => setLayoutSettings(prev => ({ ...prev, show_body: e.target.checked }))}
                                style={{ accentColor: "#8b5cf6", width: "13px", height: "13px" }}
                              />
                              Show Description / Body Text
                            </label>
                            {layoutSettings.show_body !== false && (
                              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b", paddingLeft: "21px" }}>
                                🎨 Body Color:
                                <input
                                  type="color"
                                  value={layoutSettings.font_color_body || "#475569"}
                                  onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_body: e.target.value }))}
                                  style={{ width: "22px", height: "18px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                                />
                                {layoutSettings.font_color_body && (
                                  <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_body: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                                )}
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Signatures Visibility & Colors */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                          <input
                            type="checkbox"
                            checked={layoutSettings.show_signatures !== false}
                            onChange={(e) => setLayoutSettings(prev => ({ ...prev, show_signatures: e.target.checked }))}
                            style={{ accentColor: "#8b5cf6", width: "15px", height: "15px" }}
                          />
                          Show Signatures Block
                        </label>
                      </div>
                      {layoutSettings.show_signatures !== false && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", paddingLeft: "23px" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                            🎨 Signatures Text Color:
                            <input
                              type="color"
                              value={layoutSettings.font_color_signatures || "#64748b"}
                              onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_signatures: e.target.value }))}
                              style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                            />
                            {layoutSettings.font_color_signatures && (
                              <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_signatures: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                            )}
                          </label>

                          <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "2px" }}>
                            <label style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={!!layoutSettings.sig_invert_1} onChange={(e) => setLayoutSettings(prev => ({ ...prev, sig_invert_1: e.target.checked }))} />
                              <span>Invert TTD 1 (Dark Mode)</span>
                            </label>
                            {signatureLayout === 'double' && (
                              <label style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={!!layoutSettings.sig_invert_2} onChange={(e) => setLayoutSettings(prev => ({ ...prev, sig_invert_2: e.target.checked }))} />
                                <span>Invert TTD 2</span>
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* QR Code Visibility */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                          <input
                            type="checkbox"
                            checked={layoutSettings.show_qr !== false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setShowQr(checked);
                              setLayoutSettings(prev => ({ ...prev, show_qr: checked }));
                            }}
                            style={{ accentColor: "#8b5cf6", width: "15px", height: "15px" }}
                          />
                          Show QR Validator
                        </label>
                      </div>
                      {layoutSettings.show_qr !== false && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "23px" }}>
                          <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>QR Position:</label>
                          <select value={qrPosition} onChange={e => setQrPosition(e.target.value)} style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", background: "#fff", outline: "none", color: "#0f172a" }}>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right">Bottom Right</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Typography & Fonts Selection */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #cbd5e1", paddingTop: "12px", marginTop: "8px" }}>
                      <span style={{ fontSize: "11.5px", fontWeight: "750", color: "#475569", textTransform: "uppercase" }}>Typography & Fonts</span>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <label style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Title Font ("SERTIFIKAT")</label>
                          <select
                            value={layoutSettings.font_family_title || ""}
                            onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_family_title: e.target.value }))}
                            style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", background: "#fff", outline: "none", color: "#0f172a" }}
                          >
                            {FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value ? `"${opt.value}"` : 'inherit', fontSize: '13px' }}>{opt.label}</option>)}
                          </select>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <label style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Recipient Name Font</label>
                          <select
                            value={layoutSettings.font_family_name || ""}
                            onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_family_name: e.target.value }))}
                            style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", background: "#fff", outline: "none", color: "#0f172a" }}
                          >
                            {FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value ? `"${opt.value}"` : 'inherit', fontSize: '13px' }}>{opt.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <label style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Body / Description Font</label>
                          <select
                            value={layoutSettings.font_family_body || ""}
                            onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_family_body: e.target.value }))}
                            style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", background: "#fff", outline: "none", color: "#0f172a" }}
                          >
                            {FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value ? `"${opt.value}"` : 'inherit', fontSize: '13px' }}>{opt.label}</option>)}
                          </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <label style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Table / Page 2 Font</label>
                          <select
                            value={layoutSettings.font_family_table || ""}
                            onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_family_table: e.target.value }))}
                            style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", background: "#fff", outline: "none", color: "#0f172a" }}
                          >
                            {FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value ? `"${opt.value}"` : 'inherit', fontSize: '13px' }}>{opt.label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Visual mockup preview column */}
                <div style={{ flex: "1 1 450px", padding: "20px 24px", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Eye size={15} style={{ color: "#8b5cf6" }} />
                    <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155" }}>Visual Mockup Preview (A4 landscape)</span>
                  </div>

                  {/* Mockup landscape container */}
                  {renderVisualMockup()}

                  <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", justifyContent: "center", marginTop: "-6px", marginBottom: "-2px" }}>
                    <span>📐 Dimensi Output Sertifikat: <strong>3508 x 2480 px</strong> (A4 Landscape, Rasio 1.414:1)</span>
                  </div>

                  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "10px", borderRadius: "8px", fontSize: "11px", color: "#1e40af", display: "flex", gap: "6px" }}>
                    <span style={{ fontWeight: "700" }}>Tip:</span>
                    <span>Toggles show/hide boxes and coordinate sliders will instantly render on this preview and apply to PDF output.</span>
                  </div>

                  {/* Preview PDF */}
                  <button
                    onClick={handlePreviewTemplate}
                    disabled={previewing.template}
                    style={{
                      width: "100%", padding: "8px 14px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px",
                      fontSize: "12px", fontWeight: "600", color: "#475569", cursor: previewing.template ? "not-allowed" : "pointer",
                      fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                    }}
                  >
                    {previewing.template ? (
                      <>
                        <div className="spin" style={{ width: "12px", height: "12px", border: "2px solid #64748b", borderTopColor: "transparent", borderRadius: "50%" }} />
                        Opening Preview PDF...
                      </>
                    ) : (
                      <>
                        <Eye size={14} />
                        Preview PDF output
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* --- STANDALONE TEMPLATES GRID VIEW --- */
            <div style={{ ...s.card, marginBottom: "24px" }}>
              <div style={s.ch}>
                <div style={{ textAlign: "left" }}>
                  <div style={s.ct}>Certificate Templates & Layouts</div>
                  <div style={s.cs}>Configure reusable templates for candidate certificates. Set style, design background, and signature coordinates.</div>
                </div>
                <button
                  onClick={handleCreateTemplate}
                  style={{
                    ...s.btnPrimary,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                  }}
                >
                  <Plus size={15} />
                  Add New Template
                </button>
              </div>

              {/* Templates Grid List */}
              <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {templates.map(tpl => (
                  <div
                    key={tpl.id}
                    style={{
                      border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px",
                      background: "#fff", display: "flex", gap: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                      position: "relative", overflow: "hidden", transition: "all 0.2s"
                    }}
                  >
                    {/* Left Mini Preview Graphic (aspect-ratio A4 landscape) */}
                    <div style={{
                      width: "90px", height: "64px", border: "1px solid #cbd5e1", borderRadius: "6px",
                      background: "#f8fafc", flexShrink: 0, position: "relative", overflow: "hidden",
                      backgroundImage: tpl.background_url ? `url(${tpl.background_url})` : "none",
                      backgroundSize: "cover", backgroundPosition: "center"
                    }}>
                      {!tpl.background_url && tpl.template_style === 'classic' && (
                        <div style={{ position: "absolute", inset: "2px", border: "1px double #1e3a8a", opacity: 0.5 }} />
                      )}
                      {!tpl.background_url && tpl.template_style === 'modern' && (
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "#8b5cf6" }} />
                      )}
                      {!tpl.background_url && tpl.template_style === 'elegant' && (
                        <div style={{ position: "absolute", inset: "2px", border: "1px solid #b45309", opacity: 0.3 }} />
                      )}
                      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: "16px", height: "4px", background: "#cbd5e1", borderRadius: "1px" }} />
                      <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translateX(-50%)", width: "24px", height: "2px", background: "#cbd5e1" }} />
                      <div style={{ position: "absolute", bottom: "15%", left: "20%", width: "12px", height: "4px", background: "#cbd5e1" }} />
                      {tpl.signature_layout === 'double' && (
                        <div style={{ position: "absolute", bottom: "15%", right: "20%", width: "12px", height: "4px", background: "#cbd5e1" }} />
                      )}
                    </div>

                    {/* Template details */}
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, textAlign: "left" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {tpl.name}
                      </span>
                      <span style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                        Theme: <span style={{ textTransform: "capitalize", fontWeight: "600" }}>{tpl.template_style}</span>
                        {tpl.signature_layout === 'double' ? " • Double Signers" : " • Single Signer"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        Signer: {tpl.signatory1_name || "Mentor"}
                      </span>

                      {/* Actions buttons */}
                      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                        <button
                          onClick={() => handleEditTemplate(tpl)}
                          style={{
                            background: "#f1f5f9", border: "none", borderRadius: "6px",
                            padding: "3px 8px", fontSize: "10.5px", fontWeight: "600",
                            color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                          }}
                        >
                          <Sliders size={11} />
                          {tpl.is_default ? "Customize Preset" : "Edit Details"}
                        </button>
                        {!tpl.is_default && (
                          <button
                            onClick={() => handleDeleteTemplate(tpl.id)}
                            style={{
                              background: "#fff1f2", border: "none", borderRadius: "6px",
                              padding: "3px 8px", fontSize: "10.5px", fontWeight: "600",
                              color: "#e11d48", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                            }}
                          >
                            <Trash2 size={11} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standalone Candidate List Table Card */}
          <div style={{ ...s.card, marginTop: "24px" }}>
            {/* Card Header */}
            <div className="cert-card-header" style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Title */}
              <div style={{ textAlign: "left" }}>
                <div style={s.ct}>Certificate List</div>
                <div style={s.cs}>Interns who have completed all competency assessments</div>
              </div>

              {/* Filter row: left = tabs + search, right = bulk buttons */}
              <div className="cert-filter-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "nowrap", minWidth: 0 }}>
                {/* Left: tab toggle + search */}
                <div className="cert-card-actions" style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 1, minWidth: 0, flexWrap: "nowrap" }}>
                  {/* Tab toggle */}
                  <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "8px", padding: "2px", gap: "2px", flexShrink: 0 }}>
                    {["Individual", "Team"].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          padding: "4px 10px", borderRadius: "6px", border: "none",
                          fontSize: "clamp(10px, 0.95vw, 12px)", fontWeight: activeTab === tab ? 700 : 500,
                          color: activeTab === tab ? "#0f172a" : "#94a3b8",
                          background: activeTab === tab ? "#fff" : "transparent",
                          cursor: "pointer", fontFamily: "inherit",
                          boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                          transition: "all 0.15s", whiteSpace: "nowrap",
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px",
                    padding: "4px 8px", width: "clamp(100px, 14vw, 180px)", flexShrink: 1,
                  }}>
                    <IC.Search />
                    <input
                      placeholder="Search by name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ border: "none", background: "transparent", outline: "none", fontSize: "clamp(10px,0.95vw,12px)", color: "#64748b", width: "100%", fontFamily: "inherit" }}
                    />
                    {search && (
                      <span onClick={() => setSearch("")} style={{ cursor: "pointer", color: "#94a3b8", fontSize: "14px", lineHeight: 1, flexShrink: 0 }}>×</span>
                    )}
                  </div>
                </div>

                {/* Right: bulk buttons */}
                <div className="cert-bulk-btns" style={{ display: "flex", gap: "6px", flexShrink: 0, flexWrap: "nowrap" }}>
                  <button
                    style={{
                      padding: "clamp(4px,0.4vw,6px) clamp(7px,0.8vw,12px)",
                      background: "#f0fdf4", color: "#15803d", border: "1px solid #86efac",
                      borderRadius: "7px", fontSize: "clamp(10px,0.95vw,12px)", fontWeight: 600,
                      cursor: bulkGenerating ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: "4px",
                      fontFamily: "inherit", opacity: bulkGenerating ? 0.7 : 1, whiteSpace: "nowrap"
                    }}
                    onClick={handleBulkGenerate} disabled={bulkGenerating}
                  >
                    <IC.FilePlus />
                    Bulk Generate
                  </button>

                  <button
                    style={{
                      padding: "clamp(4px,0.4vw,6px) clamp(7px,0.8vw,12px)",
                      background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a",
                      borderRadius: "7px", fontSize: "clamp(10px,0.95vw,12px)", fontWeight: 600,
                      cursor: bulkGenerating ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: "4px",
                      fontFamily: "inherit", opacity: bulkGenerating ? 0.7 : 1, whiteSpace: "nowrap"
                    }}
                    onClick={handleBulkRegenerate} disabled={bulkGenerating}
                  >
                    <IC.Refresh />
                    Bulk Regenerate
                  </button>

                  <button
                    style={{
                      padding: "clamp(4px,0.4vw,6px) clamp(7px,0.8vw,12px)",
                      background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
                      borderRadius: "7px", fontSize: "clamp(10px,0.95vw,12px)", fontWeight: 600,
                      cursor: bulkSending ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: "4px",
                      fontFamily: "inherit", opacity: bulkSending ? 0.7 : 1, whiteSpace: "nowrap"
                    }}
                    onClick={handleBulkSend} disabled={bulkSending}
                  >
                    <IC.Check />
                    Bulk Send
                  </button>
                </div>
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
                    {activeTab === "Team" && <th style={s.th}>TEAM</th>}
                    <th style={s.th}>INTERN</th>
                    <th style={s.th}>POSITION</th>
                    <th style={s.th}>PROGRAM</th>
                    <th style={s.th}>FINAL SCORE</th>
                    <th style={s.th}>STATUS</th>
                    <th style={{ ...s.th, textAlign: 'center' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCerts.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === "Team" ? 7 : 6} style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                        {search ? `No results for "${search}"` : "No certificates yet."}
                      </td>
                    </tr>
                  ) : activeTab === "Team" ? (
                    // ─── TEAM ROWS ───────────────────────────────────────────────
                    (() => {
                      const teamMap = {};
                      filteredCerts.forEach(cert => {
                        const key = cert.id_team || "unknown";
                        if (!teamMap[key]) teamMap[key] = [];
                        teamMap[key].push(cert);
                      });
                      return Object.entries(teamMap).map(([teamId, members]) =>
                        members.map((cert, j) => (
                          <tr key={`${teamId}-${j}`}>
                            {j === 0 && (
                              <td
                                rowSpan={members.length}
                                style={{
                                  ...s.td, verticalAlign: "middle",
                                  fontWeight: 700, color: "#1e40af", background: "#eff6ff",
                                  borderRight: "1px solid #e2e8f0",
                                }}
                              >
                                <span style={{ fontSize: "12px", color: "#1e40af", background: "#dbeafe", padding: "3px 8px", borderRadius: "5px" }}>
                                  {cert.team_name ?? `Team ${teamId.slice(-4)}`}
                                </span>
                              </td>
                            )}
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
                              <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
                                {cert.status === "Generated" && (
                                  <>
                                    <ActionBtn icon={<IC.Eye />} variant="ghost" title="Preview" onClick={() => handleDirectPreview(cert)} />
                                    <ActionBtn
                                      label={sending[cert.id_submission] ? "Sending" : "Send"}
                                      variant={cert.is_sent ? "ghost" : "blue"} title={cert.is_sent ? "Sent" : "Send"}
                                      disabled={cert.is_sent || sending[cert.id_submission]}
                                      onClick={() => handleSendCertificate(cert.id_submission)}
                                    />
                                    <ActionBtn
                                      icon={<IC.Refresh className={generating[cert.id_submission] ? "spin" : ""} />}
                                      variant={regenerateSuccess[cert.id_submission] ? "green" : "amber"} title="Regenerate"
                                      disabled={generating[cert.id_submission]}
                                      onClick={() => handleOpenCustomizer(cert)}
                                    />
                                  </>
                                )}
                                {cert.status === "Done" && (
                                  <ActionBtn
                                    label="Generate" variant="green" title="Generate Certificate"
                                    disabled={generating[cert.id_submission]}
                                    onClick={() => handleOpenCustomizer(cert)}
                                    icon={generating[cert.id_submission] ? <IC.Refresh className="spin" /> : null}
                                  />
                                )}
                                {(cert.status === "Not Passed" || cert.status === "In Progress" || cert.status === "Failed") && (
                                  <span style={{ color: "#cbd5e1", fontSize: "12px", fontWeight: "600" }}>Not Eligible</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      );
                    })()
                  ) : (
                    // ─── INDIVIDUAL ROWS ─────────────────────────────────────────
                    filteredCerts.map((cert, i) => (
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
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
                            {cert.status === "Generated" && (
                              <>
                                <ActionBtn icon={<IC.Eye />} variant="ghost" title="Preview" onClick={() => handleDirectPreview(cert)} />
                                <ActionBtn
                                  label={sending[cert.id_submission] ? "Sending" : "Send"}
                                  variant={cert.is_sent ? "ghost" : "blue"} title={cert.is_sent ? "Sent" : "Send"}
                                  disabled={cert.is_sent || sending[cert.id_submission]}
                                  onClick={() => handleSendCertificate(cert.id_submission)}
                                />
                                <ActionBtn
                                  icon={<IC.Refresh className={generating[cert.id_submission] ? "spin" : ""} />}
                                  variant={regenerateSuccess[cert.id_submission] ? "green" : "amber"} title="Regenerate"
                                  disabled={generating[cert.id_submission]}
                                  onClick={() => handleOpenCustomizer(cert)}
                                />
                              </>
                            )}
                            {cert.status === "Done" && (
                              <ActionBtn
                                label="Generate" variant="green" title="Generate Certificate"
                                disabled={generating[cert.id_submission]}
                                onClick={() => handleOpenCustomizer(cert)}
                                icon={generating[cert.id_submission] ? <IC.Refresh className="spin" /> : null}
                              />
                            )}
                            {(cert.status === "Not Passed" || cert.status === "In Progress" || cert.status === "Failed") && (
                              <span style={{ color: "#cbd5e1", fontSize: "12px", fontWeight: "600" }}>Not Eligible</span>
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

        {/* Generate Selection Preset Modal */}
        {generateModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(6px)" }}>
            <div style={{ background: "#fff", borderRadius: "16px", width: "90vw", maxWidth: "480px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden", animation: "modalFadeIn 0.2s ease-out", textAlign: "left" }}>

              <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "15px", fontWeight: "750", color: "#0f172a" }}>Generate Certificate</span>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>For Candidate: <b>{selectedIntern?.name}</b></div>
                </div>
                <button
                  onClick={() => setGenerateModal(false)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
                >
                  <X size={13} />
                </button>
              </div>

              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>Select Certificate Template Preset</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", background: "#fff", cursor: "pointer", color: "#0f172a" }}
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.template_style})</option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const tpl = templates.find(t => t.id === selectedTemplateId);
                  if (!tpl) return null;
                  return (
                    <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ fontWeight: "700", color: "#475569" }}>Template Summary:</div>
                      <div>• Theme Style: <span style={{ textTransform: "capitalize", fontWeight: "600" }}>{tpl.template_style}</span></div>
                      <div>• Layout Mode: <span style={{ fontWeight: "600" }}>{tpl.signature_layout === 'double' ? "Double Signatures" : "Single Signature"}</span></div>
                      <div>• Primary Signatory: <span style={{ fontWeight: "600" }}>{tpl.signatory1_name || "-"} ({tpl.signatory1_title || "-"})</span></div>
                      {tpl.signature_layout === 'double' && (
                        <div>• Secondary Signatory: <span style={{ fontWeight: "600" }}>{tpl.signatory2_name || "-"} ({tpl.signatory2_title || "-"})</span></div>
                      )}
                      <div>• Background Design: <span style={{ fontWeight: "600" }}>{tpl.background_url ? "Custom Background Image" : "Default Border Template"}</span></div>
                    </div>
                  );
                })()}
              </div>

              <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", gap: "10px", background: "#f8fafc" }}>
                <button
                  onClick={() => {
                    const tpl = templates.find(t => t.id === selectedTemplateId);
                    if (tpl) {
                      setGenerateModal(false);
                      setTemplateStyle(tpl.template_style);
                      setLogoPosition(tpl.logo_position || "center");
                      setSignatureLayout(tpl.signature_layout);
                      setSignatory1Name(tpl.signatory1_name || mentor?.name || "");
                      setSignatory1Title(tpl.signatory1_title || "");
                      setSignatory2Name(tpl.signatory2_name || "");
                      setSignatory2Title(tpl.signatory2_title || "");
                      setSignatory2Signature(tpl.signatory2_signature || null);
                      setShowQr(tpl.show_qr !== undefined ? Boolean(tpl.show_qr) : true);
                      setQrPosition(tpl.qr_position || "bottom-left");

                      let parsedSettings = {};
                      try {
                        parsedSettings = typeof tpl.layout_settings === 'string'
                          ? JSON.parse(tpl.layout_settings)
                          : tpl.layout_settings;
                      } catch {
                        parsedSettings = tpl.layout_settings || {};
                      }

                      setLayoutSettings({
                        logo_y: parsedSettings.logo_y || 0,
                        logo_x: parsedSettings.logo_x || 0,
                        show_logo: parsedSettings.show_logo !== undefined ? parsedSettings.show_logo : true,
                        title_y: parsedSettings.title_y || 0,
                        title_x: parsedSettings.title_x || 0,
                        show_title: parsedSettings.show_title !== undefined ? parsedSettings.show_title : true,
                        recipient_y: parsedSettings.recipient_y || 0,
                        recipient_x: parsedSettings.recipient_x || 0,
                        show_recipient: parsedSettings.show_recipient !== undefined ? parsedSettings.show_recipient : true,
                        body_y: parsedSettings.body_y || 0,
                        body_x: parsedSettings.body_x || 0,
                        show_body: parsedSettings.show_body !== undefined ? parsedSettings.show_body : true,
                        signature_y: parsedSettings.signature_y || 0,
                        signature_x: parsedSettings.signature_x || 0,
                        show_signatures: parsedSettings.show_signatures !== undefined ? parsedSettings.show_signatures : true,
                        qr_y: parsedSettings.qr_y || 0,
                        qr_x: parsedSettings.qr_x || 0,
                        show_qr: parsedSettings.show_qr !== undefined ? parsedSettings.show_qr : true,
                        font_size_title: parsedSettings.font_size_title || (tpl.template_style === 'classic' ? 30 : tpl.template_style === 'modern' ? 28 : 26),
                        font_size_name: parsedSettings.font_size_name || (tpl.template_style === 'modern' ? 32 : 34),
                        font_size_body: parsedSettings.font_size_body || 11,
                        font_family_title: parsedSettings.font_family_title || '',
                        font_family_name: parsedSettings.font_family_name || '',
                        font_family_body: parsedSettings.font_family_body || '',
                        font_family_table: parsedSettings.font_family_table || '',
                        font_color_title: parsedSettings.font_color_title || '',
                        font_color_cert_id: parsedSettings.font_color_cert_id || '',
                        font_color_name: parsedSettings.font_color_name || '',
                        font_color_labels: parsedSettings.font_color_labels || '',
                        font_color_role: parsedSettings.font_color_role || '',
                        badge_bg_color: parsedSettings.badge_bg_color || '',
                        font_color_body: parsedSettings.font_color_body || '',
                        font_color_signatures: parsedSettings.font_color_signatures || '',
                        sig_invert_1: parsedSettings.sig_invert_1 || false,
                        sig_invert_2: parsedSettings.sig_invert_2 || false,
                        logo_remove_bg: parsedSettings.logo_remove_bg !== undefined ? parsedSettings.logo_remove_bg : (tpl.background_url ? true : false),
                        custom_images: parsedSettings.custom_images || [],
                      });
                      setCustomBgUrl(tpl.background_url || null);
                      setCustomBgFile(null);
                      setCustomizerModal(true);
                    }
                  }}
                  style={{
                    padding: "7px 12px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px",
                    fontSize: "12px", fontWeight: "600", color: "#475569", cursor: "pointer", fontFamily: "inherit"
                  }}
                >
                  Tweak Design & Colors
                </button>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setGenerateModal(false)}
                    style={{
                      padding: "7px 12px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px",
                      fontSize: "12px", fontWeight: "600", color: "#475569", cursor: "pointer", fontFamily: "inherit"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateFromTemplate}
                    disabled={generating[selectedSubmissionId]}
                    style={{
                      padding: "7px 14px", background: "linear-gradient(135deg, #10b981, #059669)", border: "none", borderRadius: "8px",
                      fontSize: "12px", fontWeight: "600", color: "#fff", cursor: generating[selectedSubmissionId] ? "not-allowed" : "pointer",
                      fontFamily: "inherit"
                    }}
                  >
                    {generating[selectedSubmissionId] ? "Generating..." : "Generate PDF"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Bulk Generate/Regenerate Certificates Modal */}
        {showBulkModal && (() => {
          const eligibleIds = filteredCerts
            .filter(cert => bulkModalType === "generate" ? cert.status === "Done" : cert.status === "Generated")
            .map(cert => cert.id_submission);

          return (
            <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(6px)" }}>
              <div style={{ background: "#fff", borderRadius: "14px", width: "90vw", maxWidth: "480px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                
                <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "14.5px", fontWeight: "750", color: "#0f172a" }}>
                      {bulkModalType === "generate" ? "Bulk Generate Certificates" : "Bulk Regenerate Certificates"}
                    </span>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                      Target: <b>{eligibleIds.length} eligible interns</b>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBulkModal(false)}
                    style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
                  >
                    <X size={13} />
                  </button>
                </div>

                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>Select Certificate Template Preset</label>
                    <select
                      value={selectedBulkTemplateId}
                      onChange={(e) => setSelectedBulkTemplateId(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", outline: "none", background: "#fff", cursor: "pointer", color: "#0f172a", fontWeight: "600" }}
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.template_style})</option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const tpl = templates.find(t => t.id === selectedBulkTemplateId);
                    if (!tpl) return null;
                    return (
                      <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "11.5px", display: "flex", flexDirection: "column", gap: "5px", color: "#475569" }}>
                        <div style={{ fontWeight: "750", color: "#334155", marginBottom: "2px" }}>Template Summary:</div>
                        <div>• Theme Style: <span style={{ textTransform: "capitalize", fontWeight: "600", color: "#0f172a" }}>{tpl.template_style}</span></div>
                        <div>• Layout Mode: <span style={{ fontWeight: "600", color: "#0f172a" }}>{tpl.signature_layout === 'double' ? "Double Signatures" : "Single Signature"}</span></div>
                        <div>• Primary Signatory: <span style={{ fontWeight: "600", color: "#0f172a" }}>{tpl.signatory1_name || "-"} ({tpl.signatory1_title || "-"})</span></div>
                        {tpl.signature_layout === 'double' && (
                          <div>• Secondary Signatory: <span style={{ fontWeight: "600", color: "#0f172a" }}>{tpl.signatory2_name || "-"} ({tpl.signatory2_title || "-"})</span></div>
                        )}
                        <div>• Background Design: <span style={{ fontWeight: "600", color: "#0f172a" }}>{tpl.background_url ? "Custom Background Image" : "Default Border Template"}</span></div>
                      </div>
                    );
                  })()}
                </div>

                <div style={{ padding: "12px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "8px", background: "#f8fafc" }}>
                  <button
                    onClick={() => setShowBulkModal(false)}
                    style={{
                      padding: "6px 12px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px",
                      fontSize: "11.5px", fontWeight: "600", color: "#475569", cursor: "pointer", fontFamily: "inherit"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeBulkAction}
                    disabled={bulkGenerating}
                    style={{
                      padding: "6px 14px", background: "linear-gradient(135deg, #10b981, #059669)", border: "none", borderRadius: "8px",
                      fontSize: "11.5px", fontWeight: "600", color: "#fff", cursor: bulkGenerating ? "not-allowed" : "pointer",
                      fontFamily: "inherit"
                    }}
                  >
                    {bulkGenerating ? "Processing..." : bulkModalType === "generate" ? "Generate All" : "Regenerate All"}
                  </button>
                </div>

              </div>
            </div>
          );
        })()}

        {/* Candidate Specific Customizer Offsets Tweaker Modal */}
        {customizerModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(6px)" }}>
            <div style={{ background: "#fff", borderRadius: "18px", width: "95vw", maxWidth: "1150px", height: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden", animation: "modalFadeIn 0.2s ease-out" }}>

              {/* Modal Header */}
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Settings size={20} style={{ color: "#8b5cf6" }} />
                    <span style={{ fontSize: "16px", fontWeight: "750", color: "#0f172a" }}>
                      {selectedSubmissionId ? `Candidate Layout Tweaker: ${selectedIntern?.name}` : "Certificate Layout Template Manager"}
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    {selectedSubmissionId
                      ? `Customize candidate-specific certificate styling for ${selectedIntern?.name}`
                      : `Set template parameters, offsets, and reusable signatures`}
                  </span>
                </div>
                <button
                  onClick={() => setCustomizerModal(false)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b", transition: "all 0.2s" }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

                {/* Left Pane - Customizer Inputs (52% Width, Scrollable) */}
                <div style={{ width: "52%", padding: "20px 24px", overflowY: "auto", borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "22px" }}>

                  {/* Preset Name (Template Edit Mode only) */}
                  {!selectedSubmissionId && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569" }}>Template Preset Name</label>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="e.g. Batch 3 Certificate Template"
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", outline: "none", fontWeight: "600", color: "#0f172a", background: "#fff" }}
                      />
                    </div>
                  )}

                  {/* Step 1: Template Style & Custom Background */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Award size={16} style={{ color: "#3b82f6" }} />
                      1. Style & Background Template
                    </div>

                    {/* Style Grid cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                      {[
                        { id: "classic", label: "Classic", desc: "Serif, borders" },
                        { id: "modern", label: "Modern", desc: "Clean purple" },
                        { id: "elegant", label: "Elegant", desc: "Slim gold border" }
                      ].map(styleOpt => (
                        <div
                          key={styleOpt.id}
                          onClick={() => setTemplateStyle(styleOpt.id)}
                          style={{
                            padding: "10px", borderRadius: "10px", border: templateStyle === styleOpt.id ? "2px solid #8b5cf6" : "1px solid #e2e8f0",
                            background: templateStyle === styleOpt.id ? "#f5f3ff" : "#fff", cursor: "pointer", textAlign: "center", transition: "all 0.15s"
                          }}
                        >
                          <div style={{ fontSize: "12px", fontWeight: "700", color: templateStyle === styleOpt.id ? "#7c3aed" : "#334155" }}>{styleOpt.label}</div>
                          <div style={{ fontSize: "10px", color: templateStyle === styleOpt.id ? "#8b5cf6" : "#64748b", marginTop: "2px" }}>{styleOpt.desc}</div>
                        </div>
                      ))}
                    </div>

                    {/* Background PPT / Image upload */}
                    <div style={{ marginTop: "4px" }}>
                      <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" }}>Upload Design Background (PPT Export / Image)</label>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <label style={{
                          padding: "6px 12px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px",
                          fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "#64748b"
                        }}>
                          <Upload size={14} />
                          Browse File
                          <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setCustomBgFile(file);
                              compressImageBase64(file, (compressedBase64) => {
                                setCustomBgUrl(compressedBase64);
                                setLayoutSettings(prev => ({ ...prev, logo_remove_bg: true }));
                              });
                            }
                          }} style={{ display: "none" }} />
                        </label>
                        {customBgUrl && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", padding: "5px 10px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                            <Image size={14} style={{ color: "#166534" }} />
                            <span style={{ fontSize: "11px", color: "#166534", fontWeight: "500", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {customBgFile ? customBgFile.name : "Custom Background"}
                            </span>
                            <button onClick={() => { setCustomBgFile(null); setCustomBgUrl(null); }} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px", padding: 0 }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: "10.5px", color: "#64748b", display: "block", marginTop: "6px", fontStyle: "italic", lineHeight: "1.4" }}>
                        Rekomendasi ukuran: <strong>3508 x 2480 px</strong> (300 DPI) atau <strong>29.7 x 21.0 cm</strong> (A4 Landscape dengan rasio 1.414:1) agar gambar tidak pecah atau terpotong.
                      </span>
                      <span style={{ fontSize: "10px", color: "#94a3b8", display: "block", marginTop: "4px" }}>
                        * Uploading background disables default border templates. Use XY offsets below to align texts.
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Signatory Details & Handlers */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Award size={16} style={{ color: "#10b981" }} />
                      2. Signatory & Signature Settings
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" }}>Signatory 1 Name (Primary)</label>
                        <input value={signatory1Name} onChange={e => setSignatory1Name(e.target.value)} placeholder="Mentor Name" style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none", background: "#ffffff", color: "#0f172a" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" }}>Signatory 1 Title</label>
                        <input value={signatory1Title} onChange={e => setSignatory1Title(e.target.value)} placeholder="e.g. Mentor Backend" style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none", background: "#ffffff", color: "#0f172a" }} />
                      </div>
                    </div>

                    {/* Double Signature Switch */}
                    <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input type="checkbox" checked={signatureLayout === "double"} onChange={(e) => setSignatureLayout(e.target.checked ? "double" : "single")} style={{ width: "16px", height: "16px", accentColor: "#8b5cf6" }} />
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Enable Second Signatory (e.g. HR Manager / Supervisor)</span>
                      </label>
                    </div>

                    {/* Signatory 2 input blocks */}
                    {signatureLayout === "double" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fcfcff" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div>
                            <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" }}>Signatory 2 Name</label>
                            <input value={signatory2Name} onChange={e => setSignatory2Name(e.target.value)} placeholder="Second Signer Name" style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none", background: "#ffffff", color: "#0f172a" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" }}>Signatory 2 Title</label>
                            <input value={signatory2Title} onChange={e => setSignatory2Title(e.target.value)} placeholder="e.g. Supervisor / HRD" style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none", background: "#ffffff", color: "#0f172a" }} />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: "11.5px", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" }}>Signatory 2 Signature Pad</label>
                          {/* Selector draw vs upload */}
                          <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11.5px", cursor: "pointer", color: "#475569" }}>
                              <input type="radio" checked={sig2Mode === "draw"} onChange={() => setSig2Mode("draw")} style={{ accentColor: "#8b5cf6" }} />
                              Draw on Screen
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11.5px", cursor: "pointer", color: "#475569" }}>
                              <input type="radio" checked={sig2Mode === "upload"} onChange={() => setSig2Mode("upload")} style={{ accentColor: "#8b5cf6" }} />
                              Upload Image File
                            </label>
                          </div>

                          {sig2Mode === "draw" ? (
                            <div>
                              <canvas
                                ref={canvasRef}
                                width={400}
                                height={130}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                style={{
                                  width: "100%", height: "130px", border: "1px solid #cbd5e1", borderRadius: "8px",
                                  background: "#fff", cursor: "crosshair", touchAction: "none"
                                }}
                              />
                              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                                <span style={{ fontSize: "10px", color: "#94a3b8" }}>Coret/gambar ttd di dalam kotak putih</span>
                                <button onClick={clearCanvas} style={{ background: "#fee2e2", border: "none", color: "#ef4444", fontSize: "10.5px", padding: "2px 8px", borderRadius: "5px", cursor: "pointer", fontWeight: "600" }}>Clear Pad</button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <label style={{
                                  padding: "6px 12px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "8px",
                                  fontSize: "11.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", color: "#64748b"
                                }}>
                                  <Upload size={13} />
                                  Upload PNG Signature
                                  <input type="file" accept="image/*" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => setSignatory2Signature(event.target.result);
                                      reader.readAsDataURL(file);
                                    }
                                  }} style={{ display: "none" }} />
                                </label>
                                {signatory2Signature && (
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", padding: "5px 10px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                                    <Image size={14} style={{ color: "#166534" }} />
                                    <span style={{ fontSize: "11px", color: "#166534", fontWeight: "500", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      Uploaded
                                    </span>
                                    <button onClick={() => setSignatory2Signature(null)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px", padding: 0 }}>
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Sliders size={16} style={{ color: "#f59e0b" }} />
                      3. Elements & Colors Settings
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "16px", background: "#f8fafc" }}>

                      {/* Logo Visibility */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                            <input
                              type="checkbox"
                              checked={layoutSettings.show_logo !== false}
                              onChange={(e) => setLayoutSettings(prev => ({ ...prev, show_logo: e.target.checked }))}
                              style={{ accentColor: "#8b5cf6", width: "15px", height: "15px" }}
                            />
                            Show Logo
                          </label>
                        </div>
                        {layoutSettings.show_logo !== false && (
                          <div style={{ paddingLeft: "23px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "11px", color: "#64748b" }}>
                              <input
                                type="checkbox"
                                checked={!!layoutSettings.logo_remove_bg}
                                onChange={(e) => setLayoutSettings(prev => ({ ...prev, logo_remove_bg: e.target.checked }))}
                                style={{ accentColor: "#8b5cf6" }}
                              />
                              Remove Logo Background (Transparency)
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Title Elements & Colors */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                            <input
                              type="checkbox"
                              checked={layoutSettings.show_title !== false}
                              onChange={(e) => setLayoutSettings(prev => ({ ...prev, show_title: e.target.checked }))}
                              style={{ accentColor: "#8b5cf6", width: "15px", height: "15px" }}
                            />
                            Show Title ("SERTIFIKAT")
                          </label>
                        </div>
                        {layoutSettings.show_title !== false && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", paddingLeft: "23px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                              🎨 Title Color:
                              <input
                                type="color"
                                value={layoutSettings.font_color_title || "#000000"}
                                onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_title: e.target.value }))}
                                style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                              />
                              {layoutSettings.font_color_title && (
                                <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_title: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                              )}
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                              🎨 Cert No Color:
                              <input
                                type="color"
                                value={layoutSettings.font_color_cert_id || "#64748b"}
                                onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_cert_id: e.target.value }))}
                                style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                              />
                              {layoutSettings.font_color_cert_id && (
                                <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_cert_id: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                              )}
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Recipient Details & Colors */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                            <input
                              type="checkbox"
                              checked={layoutSettings.show_recipient !== false}
                              onChange={(e) => setLayoutSettings(prev => ({ ...prev, show_recipient: e.target.checked }))}
                              style={{ accentColor: "#8b5cf6", width: "15px", height: "15px" }}
                            />
                            Show Recipient Block
                          </label>
                        </div>
                        {layoutSettings.show_recipient !== false && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "23px" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                                🎨 Name Color:
                                <input
                                  type="color"
                                  value={layoutSettings.font_color_name || "#000000"}
                                  onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_name: e.target.value }))}
                                  style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                                />
                                {layoutSettings.font_color_name && (
                                  <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_name: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                                )}
                              </label>
                              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                                🎨 Labels Color:
                                <input
                                  type="color"
                                  value={layoutSettings.font_color_labels || "#475569"}
                                  onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_labels: e.target.value }))}
                                  style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                                />
                                {layoutSettings.font_color_labels && (
                                  <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_labels: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                                )}
                              </label>
                              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                                🎨 Badge Text Color:
                                <input
                                  type="color"
                                  value={layoutSettings.font_color_role || "#ffffff"}
                                  onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_role: e.target.value }))}
                                  style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                                />
                                {layoutSettings.font_color_role && (
                                  <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_role: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                                )}
                              </label>
                              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                                🎨 Badge Background Color:
                                <input
                                  type="color"
                                  value={layoutSettings.badge_bg_color || "#2563eb"}
                                  onChange={(e) => setLayoutSettings(prev => ({ ...prev, badge_bg_color: e.target.value }))}
                                  style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                                />
                                {layoutSettings.badge_bg_color && (
                                  <button onClick={() => setLayoutSettings(prev => ({ ...prev, badge_bg_color: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                                )}
                              </label>
                            </div>

                            {/* Body / Description Text */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "11.5px", fontWeight: "600", color: "#475569" }}>
                                <input
                                  type="checkbox"
                                  checked={layoutSettings.show_body !== false}
                                  onChange={(e) => setLayoutSettings(prev => ({ ...prev, show_body: e.target.checked }))}
                                  style={{ accentColor: "#8b5cf6", width: "13px", height: "13px" }}
                                />
                                Show Description / Body Text
                              </label>
                              {layoutSettings.show_body !== false && (
                                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b", paddingLeft: "21px" }}>
                                  🎨 Body Color:
                                  <input
                                    type="color"
                                    value={layoutSettings.font_color_body || "#475569"}
                                    onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_body: e.target.value }))}
                                    style={{ width: "22px", height: "18px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                                  />
                                  {layoutSettings.font_color_body && (
                                    <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_body: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                                  )}
                                </label>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Signatures Visibility & Colors */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                            <input
                              type="checkbox"
                              checked={layoutSettings.show_signatures !== false}
                              onChange={(e) => setLayoutSettings(prev => ({ ...prev, show_signatures: e.target.checked }))}
                              style={{ accentColor: "#8b5cf6", width: "15px", height: "15px" }}
                            />
                            Show Signatures Block
                          </label>
                        </div>
                        {layoutSettings.show_signatures !== false && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", paddingLeft: "23px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#475569" }}>
                              🎨 Signatures Text Color:
                              <input
                                type="color"
                                value={layoutSettings.font_color_signatures || "#64748b"}
                                onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_color_signatures: e.target.value }))}
                                style={{ width: "24px", height: "20px", padding: 0, border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer" }}
                              />
                              {layoutSettings.font_color_signatures && (
                                <button onClick={() => setLayoutSettings(prev => ({ ...prev, font_color_signatures: "" }))} style={{ border: "none", background: "transparent", color: "#ef4444", fontSize: "11px", cursor: "pointer", marginLeft: "2px" }}>✕ Reset</button>
                              )}
                            </label>

                            <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "2px" }}>
                              <label style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={!!layoutSettings.sig_invert_1} onChange={(e) => setLayoutSettings(prev => ({ ...prev, sig_invert_1: e.target.checked }))} />
                                <span>Invert TTD 1 (Dark Mode)</span>
                              </label>
                              {signatureLayout === 'double' && (
                                <label style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                  <input type="checkbox" checked={!!layoutSettings.sig_invert_2} onChange={(e) => setLayoutSettings(prev => ({ ...prev, sig_invert_2: e.target.checked }))} />
                                  <span>Invert TTD 2</span>
                                </label>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* QR Code Visibility */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                            <input
                              type="checkbox"
                              checked={layoutSettings.show_qr !== false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setShowQr(checked);
                                setLayoutSettings(prev => ({ ...prev, show_qr: checked }));
                              }}
                              style={{ accentColor: "#8b5cf6", width: "15px", height: "15px" }}
                            />
                            Show QR Validator
                          </label>
                        </div>
                        {layoutSettings.show_qr !== false && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "23px" }}>
                            <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>QR Position:</label>
                            <select value={qrPosition} onChange={e => setQrPosition(e.target.value)} style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", background: "#fff", outline: "none", color: "#0f172a" }}>
                              <option value="bottom-left">Bottom Left</option>
                              <option value="bottom-right">Bottom Right</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Typography & Fonts Selection */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #cbd5e1", paddingTop: "12px", marginTop: "8px" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: "750", color: "#475569", textTransform: "uppercase" }}>Typography & Fonts</span>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <label style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Title Font ("SERTIFIKAT")</label>
                            <select
                              value={layoutSettings.font_family_title || ""}
                              onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_family_title: e.target.value }))}
                              style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", background: "#fff", outline: "none", color: "#0f172a" }}
                            >
                              {FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value ? `"${opt.value}"` : 'inherit', fontSize: '13px' }}>{opt.label}</option>)}
                            </select>
                          </div>
                          
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <label style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Recipient Name Font</label>
                            <select
                              value={layoutSettings.font_family_name || ""}
                              onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_family_name: e.target.value }))}
                              style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", background: "#fff", outline: "none", color: "#0f172a" }}
                            >
                              {FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value ? `"${opt.value}"` : 'inherit', fontSize: '13px' }}>{opt.label}</option>)}
                            </select>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <label style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Body / Description Font</label>
                            <select
                              value={layoutSettings.font_family_body || ""}
                              onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_family_body: e.target.value }))}
                              style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", background: "#fff", outline: "none", color: "#0f172a" }}
                            >
                              {FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value ? `"${opt.value}"` : 'inherit', fontSize: '13px' }}>{opt.label}</option>)}
                            </select>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                            <label style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Table / Page 2 Font</label>
                            <select
                              value={layoutSettings.font_family_table || ""}
                              onChange={(e) => setLayoutSettings(prev => ({ ...prev, font_family_table: e.target.value }))}
                              style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11.5px", background: "#fff", outline: "none", color: "#0f172a" }}
                            >
                              {FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value} style={{ fontFamily: opt.value ? `"${opt.value}"` : 'inherit', fontSize: '13px' }}>{opt.label}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Right Pane - Live Interactive Layout Map (48% Width) */}
                <div style={{ width: "48%", padding: "20px 24px", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: "6px" }}>
                    <Sliders size={16} style={{ color: "#8b5cf6" }} />
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Live Layout Wireframe (Visual Map)</span>
                  </div>

                  {/* Landscape A4 Mockup Box */}
                  {renderVisualMockup()}

                  <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", justifyContent: "center", marginTop: "-6px", marginBottom: "-2px" }}>
                    <span>📐 Dimensi Output Sertifikat: <strong>3508 x 2480 px</strong> (A4 Landscape, Rasio 1.414:1)</span>
                  </div>

                  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "10px 12px", borderRadius: "8px", fontSize: "11px", color: "#1e40af", display: "flex", gap: "8px" }}>
                    <span style={{ fontWeight: "700" }}>Tip:</span>
                    <span>Use coordinates sliders and font sizes to adjust text blocks and prevent overlaps with your design.</span>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "10px", background: "#fff" }}>
                <button
                  onClick={() => setCustomizerModal(false)}
                  style={{
                    padding: "7px 16px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "8px",
                    fontSize: "12px", fontWeight: "600", color: "#475569", cursor: "pointer", fontFamily: "inherit"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={selectedSubmissionId ? handlePreviewCustomizer : handlePreviewTemplate}
                  disabled={selectedSubmissionId ? previewing[selectedSubmissionId] : previewing.template}
                  style={{
                    padding: "7px 16px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px",
                    fontSize: "12px", fontWeight: "600", color: "#1d4ed8", cursor: (selectedSubmissionId ? previewing[selectedSubmissionId] : previewing.template) ? "not-allowed" : "pointer",
                    fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px"
                  }}
                >
                  {(selectedSubmissionId ? previewing[selectedSubmissionId] : previewing.template) ? (
                    <>
                      <div className="spin" style={{ width: "12px", height: "12px", border: "2px solid #1d4ed8", borderTopColor: "transparent", borderRadius: "50%" }} />
                      Opening Preview...
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      Preview PDF
                    </>
                  )}
                </button>
                <button
                  onClick={selectedSubmissionId ? handleGenerateCustomizer : handleSaveTemplate}
                  disabled={selectedSubmissionId ? generating[selectedSubmissionId] : false}
                  style={{
                    padding: "7px 16px", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", border: "none", borderRadius: "8px",
                    fontSize: "12px", fontWeight: "600", color: "#fff", cursor: (selectedSubmissionId ? generating[selectedSubmissionId] : false) ? "not-allowed" : "pointer",
                    fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px", boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)"
                  }}
                >
                  {selectedSubmissionId && generating[selectedSubmissionId] ? (
                    <>
                      <div className="spin" style={{ width: "12px", height: "12px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%" }} />
                      Generating...
                    </>
                  ) : (
                    <>
                      {selectedSubmissionId ? <Sparkles size={14} /> : <Check size={14} />}
                      {selectedSubmissionId ? "Save & Generate" : "Save Template"}
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

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

        {/* Toast Stack */}
        <HRToastStack toasts={toasts} onDismiss={removeToast} />
      </main>
    </div>
  );
}
