import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../api';

const IC = {
  Briefcase: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  GraduationCap: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3L1 9l11 6 11-6-11-6z"/>
      <path d="M5 12v6a7 7 0 0 0 14 0v-6"/>
    </svg>
  ),
  Building: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="8" y1="6" x2="16" y2="6"/>
      <line x1="8" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="12" y2="14"/>
    </svg>
  ),
  Mail: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M22 7l-10 7L2 7"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Copy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Key: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="16" r="3"/>
      <path d="M16 10l3-3m0 0l-3-3m3 3h-6"/>
    </svg>
  ),
  UserPlus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/>
      <line x1="17" y1="11" x2="23" y2="11"/>
    </svg>
  ),
};

export default function PreviewOnboarding() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [mode, setMode] = useState('select'); // select, company-setup, invite-verify
  const [companyName, setCompanyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if user already has role
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const res = await api('/auth/me');
        if (res.user) {
          if (res.user.role === 'candidate') {
            navigate('/candidate/dashboard');
          } else if (res.user.role === 'company_admin' || res.user.role === 'company_staff') {
            navigate('/dashboard');
          } else if (res.user.role === 'hr') {
            navigate('/hr/dashboard');
          }
        }
      } catch (err) {
        // User belum punya role, lanjutkan
        console.log('User needs role selection');
      }
    };
    if (token) checkUserStatus();
  }, [token, navigate]);

  // Check URL params for invite code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteParam = urlParams.get('invite');
    const codeParam = urlParams.get('code');
    
    if (inviteParam) {
      setInviteCode(inviteParam);
      handleVerifyInvite(inviteParam);
    } else if (codeParam) {
      setActivationCode(codeParam);
      setMode('invite-verify');
    }
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'candidate') {
      completeSetup('candidate');
    } else {
      setMode('company-setup');
    }
  };

  const completeSetup = async (role, additionalData = {}) => {
    setLoading(true);
    setError('');
    try {
      const payload = { role, ...additionalData };
      const res = await api('/auth/complete-setup', {
        method: 'POST',
        data: payload
      });
      
      if (res.success) {
        setShowSuccess(true);
        // Update auth store
        useAuthStore.setState({ 
          user: { ...user, role: role, company_id: res.company_id || null }
        });
        
        setTimeout(() => {
          if (role === 'candidate') {
            navigate('/candidate/dashboard');
          } else if (role === 'company_admin') {
            navigate('/dashboard');
          } else if (role === 'company_staff') {
            navigate('/dashboard');
          }
        }, 2000);
      } else {
        setError(res.message || 'Setup failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }
    await completeSetup('company_admin', { company_name: companyName });
  };

  const handleVerifyInvite = async (code = inviteCode) => {
    if (!code.trim()) {
      setError('Invite code is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api('/auth/verify-invite', {
        method: 'POST',
        data: { invite_code: code }
      });
      if (res.success) {
        setCompanyName(res.company_name);
        setCompanyCode(res.company_code);
        setActivationCode(res.activation_code);
        setMode('invite-verify');
      } else {
        setError(res.message || 'Invalid invite code');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify invite code');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateStaff = async () => {
    if (!activationCode.trim()) {
      setError('Activation code is required');
      return;
    }
    await completeSetup('company_staff', {
      company_code: companyCode,
      activation_code: activationCode
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: "'Inter', system-ui, sans-serif"
      }}>
        <div style={{ textAlign: 'center', padding: '48px', maxWidth: '400px' }}>
          <div style={{ color: '#10b981', marginBottom: '24px' }}>
            <IC.CheckCircle />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
            Setup Complete!
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            Redirecting you to your dashboard...
          </p>
          <div style={{
            width: '40px',
            height: '40px',
            margin: '0 auto',
            border: '3px solid #e2e8f0',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 20px 35px -12px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '28px 32px 20px',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#0f172a',
            margin: '0 0 6px 0'
          }}>
            {mode === 'select' && 'Complete Your Account'}
            {mode === 'company-setup' && 'Start Your Company'}
            {mode === 'invite-verify' && 'Join as Team Member'}
          </h1>
          <p style={{
            fontSize: '13.5px',
            color: '#64748b',
            margin: 0
          }}>
            {mode === 'select' && 'Please select how you want to use the platform'}
            {mode === 'company-setup' && 'Create your company profile to start hiring'}
            {mode === 'invite-verify' && 'Verify your invitation to join the team'}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 32px 32px' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <IC.AlertCircle />
              <span style={{ fontSize: '13px', color: '#dc2626', flex: 1 }}>{error}</span>
              <button onClick={() => setError('')} style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}>
                <IC.X />
              </button>
            </div>
          )}

          {mode === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={() => handleRoleSelect('candidate')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  padding: '20px 24px',
                  background: '#fff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#eff6ff',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3b82f6'
                }}>
                  <IC.GraduationCap />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>I'm a Candidate</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>Find internships and job opportunities</div>
                </div>
                <IC.ArrowRight />
              </button>

              <button
                onClick={() => handleRoleSelect('company')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  padding: '20px 24px',
                  background: '#fff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#f0fdf4',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}>
                  <IC.Briefcase />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>I'm a Recruiter</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>Hire talent for my company</div>
                </div>
                <IC.ArrowRight />
              </button>

              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginBottom: '12px' }}>
                  Already have an invite code?
                </p>
                <button
                  onClick={() => setMode('invite-verify')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
                >
                  Enter Invite Code →
                </button>
              </div>
            </div>
          )}

          {mode === 'company-setup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. TechCorp Indonesia"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setMode('select')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#fff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleCreateCompany}
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: '#3b82f6',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fff',
                    cursor: 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Creating...' : 'Create Company & Continue'}
                </button>
              </div>
            </div>
          )}

          {mode === 'invite-verify' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. INV-ABC123"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                />
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IC.Mail /> Received an invite from your company admin
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setMode('select')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#fff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => handleVerifyInvite()}
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: '#3b82f6',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fff',
                    cursor: 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </div>

              {companyName && activationCode && (
                <div style={{
                  marginTop: '8px',
                  padding: '16px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px'
                }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
                    Join: {companyName}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <code style={{
                      flex: 1,
                      padding: '6px 10px',
                      background: '#fff',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#065f46'
                    }}>
                      {activationCode}
                    </code>
                    <button
                      onClick={() => copyToClipboard(activationCode)}
                      style={{
                        padding: '6px 12px',
                        background: '#fff',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#166534',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <IC.Copy />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <button
                    onClick={handleActivateStaff}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#166534',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    Activate My Account
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 32px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9'
        }}>
          <p style={{ fontSize: '11.5px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
            Need help?{' '}
            <a href="/support" style={{ color: '#3b82f6', textDecoration: 'none' }}>Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}