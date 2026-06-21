import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ShieldCheck, Calendar, Award, Building, User, FileText, ArrowLeft } from 'lucide-react';

export default function CertificateVerification() {
  const { id_certificate } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cert, setCert] = useState(null);

  useEffect(() => {
    const verifyCert = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/certificates/${id_certificate}/verify`);
        const data = await res.json();
        
        if (res.ok && data.success) {
          setCert(data.certificate);
        } else {
          setError(data.message || 'Sertifikat tidak ditemukan atau tidak valid.');
        }
      } catch (err) {
        console.error('Error verifying certificate:', err);
        setError('Gagal menghubungkan ke server untuk verifikasi.');
      } finally {
        setLoading(false);
      }
    };

    if (id_certificate) {
      verifyCert();
    }
  }, [id_certificate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          width: 100%;
          max-width: 600px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .pulse-logo {
          animation: pulse 2s infinite ease-in-out;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.9; }
        }
      `}</style>

      <div className="glass-card">
        {loading ? (
          /* LOADING STATE */
          <div style={{ padding: '60px 40px', textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #e2e8f0',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', margin: 0 }}>Memverifikasi Keaslian Sertifikat...</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Menghubungkan ke sistem SaaS database keamanan...</p>
          </div>
        ) : error ? (
          /* ERROR / INVALID STATE */
          <div style={{ padding: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#fef2f2',
                color: '#ef4444',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <AlertTriangle style={{ width: '32px', height: '32px' }} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#991b1b', margin: 0 }}>Sertifikat Tidak Valid</h2>
              <p style={{ fontSize: '14px', color: '#7f1d1d', background: '#fee2e2', borderRadius: '10px', padding: '10px 16px', marginTop: '16px', display: 'inline-block' }}>
                {error}
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              fontSize: '13.5px',
              color: '#475569',
              lineHeight: '1.6'
            }}>
              <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>Mengapa hal ini terjadi?</p>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li>ID sertifikat tidak cocok dengan data di sistem kami.</li>
                <li>Sertifikat mungkin telah ditarik kembali atau dibatalkan oleh mentor.</li>
                <li>QR Code palsu atau dibuat di luar sistem resmi kami.</li>
              </ul>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <Link to="/" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#0f172a',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background 0.2s'
              }}>
                <ArrowLeft style={{ width: '16px', height: '16px' }} /> Kembali ke Beranda
              </Link>
            </div>
          </div>
        ) : (
          /* SUCCESS / VERIFIED STATE */
          <div>
            {/* Header Badge */}
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              padding: '30px 24px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '99px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}>
                ID: {cert.id_certificate}
              </div>

              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }} className="pulse-logo">
                <ShieldCheck style={{ width: '32px', height: '32px' }} />
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '0.5px' }}>SERTIFIKAT TERVERIFIKASI</h2>
              <p style={{ fontSize: '13px', opacity: 0.9, marginTop: '6px', margin: 0 }}>Sertifikat ini sah dan terdaftar secara resmi di sistem kami</p>
            </div>

            {/* Details Panel */}
            <div style={{ padding: '30px 40px' }}>
              
              {/* Company Logo Header */}
              {cert.company_name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                  {cert.company_logo ? (
                    <img src={cert.company_logo} alt={cert.company_name} style={{ maxHeight: '45px', maxWidth: '140px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                      <span style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>{cert.company_name}</span>
                    </div>
                  )}
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Penerbit</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>{cert.company_name}</div>
                  </div>
                </div>
              )}

              {/* Grid Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Penerima */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <User style={{ width: '18px', height: '18px', color: '#64748b', marginTop: '3px' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Nama Penerima</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{cert.candidate_name}</div>
                  </div>
                </div>

                {/* Posisi & Program */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Award style={{ width: '18px', height: '18px', color: '#64748b', marginTop: '3px' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Posisi Magang</div>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#334155', marginTop: '2px' }}>
                      {cert.position_name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '1px' }}>
                      Program: {cert.program_title}
                    </div>
                  </div>
                </div>

                {/* Nilai Akhir */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <FileText style={{ width: '18px', height: '18px', color: '#64748b', marginTop: '3px' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Nilai Kelulusan</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>{cert.final_score}</span>
                      <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>/ 100</span>
                      <span style={{ 
                        fontSize: '11px', 
                        background: '#d1fae5', 
                        color: '#065f46', 
                        padding: '2px 8px', 
                        borderRadius: '6px', 
                        fontWeight: 600,
                        marginLeft: '8px' 
                      }}>LULUS</span>
                    </div>
                  </div>
                </div>

                {/* Tanggal Terbit & Nomor Sertifikat */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <Calendar style={{ width: '18px', height: '18px', color: '#64748b', marginTop: '3px' }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Nomor & Tanggal Terbit</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginTop: '2px' }}>
                      {cert.certificate_number}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '1px' }}>
                      Diterbitkan pada {cert.issued_date}
                    </div>
                  </div>
                </div>

              </div>

              {/* Stamp Footer */}
              <div style={{
                marginTop: '35px',
                paddingTop: '20px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#64748b',
                fontSize: '12px'
              }}>
                <ShieldCheck style={{ width: '16px', height: '16px', color: '#10b981' }} />
                <span>Dokumen ini ditandatangani secara elektronik dan sah hukum.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
