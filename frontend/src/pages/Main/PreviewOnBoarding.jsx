import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../api';
import PasswordInput from '../../components/PasswordInput';
import { validatePassword } from '../../utils/passwordValidator';

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
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Key: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="16" r="3"/>
      <path d="M16 10l3-3m0 0l-3-3m3 3h-6"/>
    </svg>
  ),
};

export default function PreviewOnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, getRoleForRouting, loading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('entry'); // entry, form, invite_form, success
  const [path, setPath] = useState(null); // 'candidate', 'admin', or 'invitation'
  const [inviteCode, setInviteCode] = useState(searchParams.get('invite') || '');
  const [inviteData, setInviteData] = useState(null);
  const [activationForm, setActivationForm] = useState({
    first_name: '', last_name: '', email: '', password: '', password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Form fields - Registration
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Form fields - Candidate Profile
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [major, setMajor] = useState('');

  // Form fields - Company Profile
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPassword, setCompanyPassword] = useState('');
  const [companyPasswordConfirm, setCompanyPasswordConfirm] = useState('');

const handleActivationEmailChange = async (emailValue) => {
  setActivationForm(f => ({ ...f, email: emailValue }));
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailValue || !emailRegex.test(emailValue)) return;
  try {
    const res = await api(`/auth/check-email/${encodeURIComponent(emailValue)}`);
    if (res.exists && res.user) {
      setInviteData(prev => ({ ...prev, existingUser: res.user }));
      setActivationForm(f => ({
        ...f,
        email: res.user.email,
      }));
    } else {
      setInviteData(prev => ({ ...prev, existingUser: null }));
    }
  } catch (_) {
    setInviteData(prev => ({ ...prev, existingUser: null }));
  }
};

  // Check if already logged in with a role - only then redirect
  useEffect(() => {
    if (authLoading) return;
    if (token) {
      const role = getRoleForRouting();
      if (role && role !== 'null' && role !== '' && role !== 'new') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [token, authLoading, navigate, getRoleForRouting]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate password
    const { valid: isPasswordValid, errors: passwordErrors } = validatePassword(password);
    if (!isPasswordValid) {
      setError(passwordErrors[0] || 'Invalid password');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // 1. Register user
      const registerRes = await api('/register', {
        method: 'POST',
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password,
          password_confirmation: passwordConfirm
        }
      });

      if (!registerRes.token) {
        throw new Error('Registration failed');
      }

      // Store token temporarily for profile creation
      const tempToken = registerRes.token;

      // 2. Create profile based on path
      let profileRes;
      let resolvedRole = null;
      
      if (path === 'candidate') {
        profileRes = await api('/create-candidate-profile', {
          method: 'POST',
          data: {
            phone: phone || null,
            institution: institution || null,
            education_level: educationLevel || null,
            major: major || null
          },
          headers: { 'Authorization': `Bearer ${tempToken}` }
        });
        resolvedRole = 'candidate';
      } else if (path === 'admin') {
        profileRes = await api('/create-company', {
          method: 'POST',
          data: {
            name: companyName,
            phone: companyPhone,
            address: companyAddress,
            password: companyPassword
          },
          headers: { 'Authorization': `Bearer ${tempToken}` }
        });
        resolvedRole = 'admin';
      }

      if (!profileRes || !profileRes.message) {
        throw new Error('Profile creation failed');
      }

      // 3. Use store's setAuthData to commit all state properly
      useAuthStore.setState(state => ({
        ...state,
        token: tempToken,
        user: profileRes.user || null,
        company: profileRes.company || null,
        candidate_profile: profileRes.candidate_profile || null,
        isAuthenticated: true,
      }));

      // Also update localStorage
      localStorage.setItem('auth_token', tempToken);
      localStorage.setItem('user_type', resolvedRole);
      if (profileRes.user) {
        localStorage.setItem('user', JSON.stringify(profileRes.user));
      }
      if (profileRes.company) {
        localStorage.setItem('company', JSON.stringify(profileRes.company));
      }
      if (profileRes.candidate_profile) {
        localStorage.setItem('candidate_profile', JSON.stringify(profileRes.candidate_profile));
      }

      // Show success screen briefly, then navigate
      setShowSuccess(true);

      // Use a short timeout to allow success screen to render
      setTimeout(() => {
        const targetPath = path === 'candidate' ? '/candidate/dashboard' : '/dashboard';
        navigate(targetPath, { replace: true });
      }, 1200);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!inviteCode.trim()) { setError('Please enter an invitation code'); return; }
    setLoading(true);
    try {
      const validationRes = await api(`/invitation-codes/validate/${inviteCode.trim()}`);
      if (!validationRes.valid) throw new Error('Invalid invitation code');

      // Cek apakah user sudah punya akun
      let existingUser = null;
      try {
        const checkRes = await api(`/auth/check-email/${encodeURIComponent('')}`);
        // Tidak bisa cek tanpa email dulu — set null, nanti cek di form
      } catch (_) {}

      setInviteData({
        code: inviteCode.trim(),
        redirect_role: validationRes.redirect_role,
        invitation: validationRes.invitation,
        existingUser: null, // akan diupdate saat user isi email
      });
      setActivationForm(f => ({ ...f, email: '' }));
      setStep('activation_form');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid invitation code');
    } finally {
      setLoading(false);
    }
  };

  const handleActivationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!activationForm.email) { setError('Please enter your email'); return; }
    if (!activationForm.password) { setError('Please enter your password'); return; }
    if (!inviteData?.existingUser && activationForm.password !== activationForm.password_confirmation) {
      setError('Passwords do not match'); return;
    }
    if (!inviteData?.existingUser && activationForm.password.length < 8) {
      setError('Password must be at least 8 characters'); return;
    }
    setLoading(true);
    try {
      let res;

      if (inviteData?.existingUser) {
        // Sudah punya akun → login biasa dulu, lalu activate untuk assign role
        const loginRes = await api('/login', {
          method: 'POST',
          data: { email: activationForm.email, password: activationForm.password }
        });
        if (!loginRes.token) throw new Error('Login failed');

        // Activate untuk assign role & company
        res = await api('/auth/activate', {
          method: 'POST',
          data: {
            invitation_code: inviteData.code,
            first_name: inviteData.existingUser.first_name,
            last_name: inviteData.existingUser.last_name,
            email: activationForm.email,
            password: activationForm.password,
            password_confirmation: activationForm.password,
          },
          headers: { 'Authorization': `Bearer ${loginRes.token}` }
        });
      } else {
        // Belum punya akun → activate langsung
        res = await api('/auth/activate', {
          method: 'POST',
          data: {
            invitation_code: inviteData.code,
            first_name: activationForm.first_name,
            last_name: activationForm.last_name,
            email: activationForm.email,
            password: activationForm.password,
            password_confirmation: activationForm.password_confirmation,
          }
        });
      }

      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      localStorage.setItem('user_type', res.redirect_role);
      if (res.company) localStorage.setItem('company', JSON.stringify(res.company));

      useAuthStore.setState(state => ({
        ...state,
        token: res.token,
        user: res.user,
        company: res.company || state.company,
        isAuthenticated: true,
      }));

      const roleRoutes = {
        mentor: '/mentor/dashboard',
        hr: '/hr/dashboard',
        admin: '/dashboard',
        candidate: '/candidate/dashboard',
        super_admin: '/superadmin/dashboard',
      };
      navigate(roleRoutes[res.redirect_role] || res.redirect_path || '/dashboard', { replace: true });

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
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

  // STEP 1: ENTRY PATH SELECTION
  if (step === 'entry') {
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
              Get Started
            </h1>
            <p style={{
              fontSize: '13.5px',
              color: '#64748b',
              margin: 0
            }}>
              Choose how you want to use the platform
            </p>
          </div>

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
                  cursor: 'pointer',
                  color: '#dc2626'
                }}>
                  <IC.X />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* CANDIDATE OPTION */}
              <button
                onClick={() => { setPath('candidate'); setStep('form'); }}
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
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.borderColor = '#3b82f6'; 
                  e.currentTarget.style.background = '#f8fafc'; 
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = '#e2e8f0'; 
                  e.currentTarget.style.background = '#fff'; 
                }}
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
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>Find internships and opportunities</div>
                </div>
                <IC.ArrowRight />
              </button>

              {/* ADMIN OPTION */}
              <button
                onClick={() => { setPath('admin'); setStep('form'); }}
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
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.borderColor = '#10b981'; 
                  e.currentTarget.style.background = '#f8fafc'; 
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = '#e2e8f0'; 
                  e.currentTarget.style.background = '#fff'; 
                }}
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
                  <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>I'm an Admin</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>Set up my company to hire</div>
                </div>
                <IC.ArrowRight />
              </button>

              {/* INVITATION CODE OPTION */}
              <button
                onClick={() => { setPath('invitation'); setStep('invite_form'); }}
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
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.borderColor = '#f59e0b'; 
                  e.currentTarget.style.background = '#f8fafc'; 
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = '#e2e8f0'; 
                  e.currentTarget.style.background = '#fff'; 
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#fef3c7',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b'
                }}>
                  <IC.Key />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>I Have an Invitation Code</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>Join using your invitation code</div>
                </div>
                <IC.ArrowRight />
              </button>
            </div>
          </div>

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

  // STEP 2B: INVITATION CODE FORM
  if (step === 'invite_form') {
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
              Enter Your Invitation Code
            </h1>
            <p style={{
              fontSize: '13.5px',
              color: '#64748b',
              margin: 0
            }}>
              Provide the code you received to join
            </p>
          </div>

          <form onSubmit={handleInvitationCodeSubmit} style={{ padding: '28px 32px 32px' }}>
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
                <button 
                  type="button"
                  onClick={() => setError('')} 
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#dc2626'
                  }}>
                  <IC.X />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Invitation Code Input */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '8px'
                }}>
                  Invitation Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. INV-ABC123XYZ"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '16px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    color: '#1e293b',
                    fontFamily: 'monospace',
                    letterSpacing: '0.75px',
                    textTransform: 'uppercase'
                  }}
                  onFocus={(e) => { 
                    e.currentTarget.style.borderColor = '#3b82f6'; 
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; 
                  }}
                  onBlur={(e) => { 
                    e.currentTarget.style.borderColor = '#e2e8f0'; 
                    e.currentTarget.style.boxShadow = 'none'; 
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginTop: '8px',
                  margin: '8px 0 0 0'
                }}>
                  You should have received this code from your company or team administrator
                </p>
              </div>

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => { setStep('entry'); setPath(null); setError(''); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#fff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = '#fff';
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !inviteCode.trim()}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: loading || !inviteCode.trim() ? '#cbd5e1' : '#3b82f6',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fff',
                    cursor: loading || !inviteCode.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && inviteCode.trim()) {
                      e.currentTarget.style.background = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && inviteCode.trim()) {
                      e.currentTarget.style.background = '#3b82f6';
                    }
                  }}
                >
                  {loading ? 'Validating...' : 'Validate & Continue'}
                </button>
              </div>
            </div>
          </form>

          <div style={{
            padding: '16px 32px',
            background: '#f8fafc',
            borderTop: '1px solid #f1f5f9'
          }}>
            <p style={{ fontSize: '11.5px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
              Don't have a code?{' '}
              <a href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Sign up normally</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'activation_form') {
  const isExisting = !!inviteData?.existingUser;

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter', system-ui, sans-serif", padding:'20px' }}>
      <div style={{ maxWidth:'520px', width:'100%', background:'#ffffff', borderRadius:'20px', boxShadow:'0 20px 35px -12px rgba(0,0,0,0.08)', overflow:'hidden' }}>
        
        {/* Header */}
        <div style={{ padding:'28px 32px 20px', borderBottom:'1px solid #f1f5f9' }}>
          <p style={{ fontSize:'12px', fontWeight:'600', color:'#f59e0b', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px' }}>
            {inviteData?.invitation?.label || inviteData?.redirect_role}
          </p>
          <h1 style={{ fontSize:'22px', fontWeight:'700', color:'#0f172a', margin:'0 0 4px' }}>
            {isExisting ? 'Welcome Back!' : 'Activate Your Account'}
          </h1>
          <p style={{ fontSize:'13px', color:'#64748b', margin:0 }}>
            {inviteData?.invitation?.company?.name} · {inviteData?.invitation?.position || inviteData?.redirect_role}
          </p>
        </div>

        <form onSubmit={handleActivationSubmit} style={{ padding:'28px 32px 32px' }}>
          {error && (
            <div style={{ padding:'12px 16px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'12px', marginBottom:'20px', fontSize:'13px', color:'#dc2626' }}>
              {error}
            </div>
          )}

          {/* Notice existing account */}
          {isExisting && (
            <div style={{ padding:'12px 16px', background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)', borderRadius:'12px', marginBottom:'20px', fontSize:'13px', color:'#3b82f6', lineHeight:'1.6' }}>
              Akun kamu sudah terdaftar. Masukkan password untuk login dan bergabung ke <strong>{inviteData?.invitation?.company?.name}</strong>.
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

            {/* Nama - hanya tampil kalau belum punya akun */}
            {!isExisting && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                {[['first_name','First Name','John'],['last_name','Last Name','Doe']].map(([field, label, ph]) => (
                  <div key={field}>
                    <label style={{ display:'block', fontSize:'13px', fontWeight:'600', color:'#1e293b', marginBottom:'6px' }}>{label}</label>
                    <input
                      type="text"
                      placeholder={ph}
                      value={activationForm[field]}
                      onChange={e => setActivationForm(f => ({ ...f, [field]: e.target.value }))}
                      required={field === 'first_name'}
                      style={{ width:'100%', padding:'11px 14px', fontSize:'14px', border:'1.5px solid #e2e8f0', borderRadius:'10px', outline:'none', boxSizing:'border-box', color:'#1e293b', background:'#fff' }}
                      onFocus={e => e.target.style.borderColor='#3b82f6'}
                      onBlur={e => e.target.style.borderColor='#e2e8f0'}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:'600', color:'#1e293b', marginBottom:'6px' }}>
                Email {isExisting && <span style={{ fontSize:'11px', color:'#94a3b8', fontWeight:'400' }}></span>}
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={activationForm.email}
                onChange={e => !isExisting && handleActivationEmailChange(e.target.value)}
                readOnly={isExisting}
                required
                style={{
                  width:'100%', padding:'11px 14px', fontSize:'14px',
                  border: isExisting ? '1.5px solid #e2e8f0' : '1.5px solid #e2e8f0',
                  borderRadius:'10px', outline:'none', boxSizing:'border-box',
                  color: isExisting ? '#94a3b8' : '#1e293b',
                  background: isExisting ? '#f8fafc' : '#fff',
                  cursor: isExisting ? 'not-allowed' : 'text',
                }}
                onFocus={e => { if (!isExisting) e.target.style.borderColor='#3b82f6'; }}
                onBlur={e => { if (!isExisting) e.target.style.borderColor='#e2e8f0'; }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:'600', color:'#1e293b', marginBottom:'6px' }}>Password</label>
              <input
                type="password"
                placeholder="Masukkan password kamu"
                value={activationForm.password}
                onChange={e => setActivationForm(f => ({ ...f, password: e.target.value }))}
                required
                style={{ width:'100%', padding:'11px 14px', fontSize:'14px', border:'1.5px solid #e2e8f0', borderRadius:'10px', outline:'none', boxSizing:'border-box', color:'#1e293b', background:'#fff' }}
                onFocus={e => e.target.style.borderColor='#3b82f6'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'}
              />
            </div>

            {/* Confirm password - hanya kalau belum punya akun */}
            {!isExisting && (
              <div>
                <label style={{ display:'block', fontSize:'13px', fontWeight:'600', color:'#1e293b', marginBottom:'6px' }}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={activationForm.password_confirmation}
                  onChange={e => setActivationForm(f => ({ ...f, password_confirmation: e.target.value }))}
                  required
                  style={{ width:'100%', padding:'11px 14px', fontSize:'14px', border:'1.5px solid #e2e8f0', borderRadius:'10px', outline:'none', boxSizing:'border-box', color:'#1e293b', background:'#fff' }}
                  onFocus={e => e.target.style.borderColor='#3b82f6'}
                  onBlur={e => e.target.style.borderColor='#e2e8f0'}
                />
              </div>
            )}

            <div style={{ display:'flex', gap:'12px', marginTop:'4px' }}>
              <button type="button" onClick={() => { setStep('invite_form'); setError(''); }}
                style={{ flex:1, padding:'12px', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:'12px', fontSize:'14px', fontWeight:'600', color:'#64748b', cursor:'pointer' }}>
                Back
              </button>
              <button type="submit" disabled={loading}
                style={{ flex:2, padding:'12px', background: loading ? '#cbd5e1' : '#3b82f6', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:'600', color:'#fff', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Processing...' : isExisting ? 'Login & Join' : 'Activate & Continue'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

  // STEP 2A: REGISTRATION FORM
  if (step === 'form') {
    const isCandidateForm = path === 'candidate';
    const isAdminForm = path === 'admin';

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
              {isCandidateForm && 'Create Your Account'}
              {isAdminForm && 'Set Up Your Company'}
            </h1>
            <p style={{
              fontSize: '13.5px',
              color: '#64748b',
              margin: 0
            }}>
              {isCandidateForm && 'Sign up to start applying'}
              {isAdminForm && 'Set up your company to start hiring'}
            </p>
          </div>

          <form onSubmit={isCandidateForm || inviteData ? handleRegister : handleRegister} style={{ padding: '28px 32px 32px' }}>
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
                <button 
                  type="button"
                  onClick={() => setError('')} 
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#dc2626'
                  }}>
                  <IC.X />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Name Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '8px'
                  }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                      color: '#1e293b'
                    }}
                    onFocus={(e) => { 
                      e.currentTarget.style.borderColor = '#3b82f6'; 
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; 
                    }}
                    onBlur={(e) => { 
                      e.currentTarget.style.borderColor = '#e2e8f0'; 
                      e.currentTarget.style.boxShadow = 'none'; 
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '8px'
                  }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: '#ffffff',
                      color: '#1e293b'
                    }}
                    onFocus={(e) => { 
                      e.currentTarget.style.borderColor = '#3b82f6'; 
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; 
                    }}
                    onBlur={(e) => { 
                      e.currentTarget.style.borderColor = '#e2e8f0'; 
                      e.currentTarget.style.boxShadow = 'none'; 
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '8px'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    color: '#1e293b'
                  }}
                  onFocus={(e) => { 
                    e.currentTarget.style.borderColor = '#3b82f6'; 
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; 
                  }}
                  onBlur={(e) => { 
                    e.currentTarget.style.borderColor = '#e2e8f0'; 
                    e.currentTarget.style.boxShadow = 'none'; 
                  }}
                />
              </div>

              {/* Candidate-specific fields */}
              {isCandidateForm && (
                <>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 812 3456 7890"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14px',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: '#ffffff',
                        color: '#1e293b'
                      }}
                      onFocus={(e) => { 
                        e.currentTarget.style.borderColor = '#3b82f6'; 
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; 
                      }}
                      onBlur={(e) => { 
                        e.currentTarget.style.borderColor = '#e2e8f0'; 
                        e.currentTarget.style.boxShadow = 'none'; 
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      Institution / University
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. University of Indonesia"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14px',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: '#ffffff',
                        color: '#1e293b'
                      }}
                      onFocus={(e) => { 
                        e.currentTarget.style.borderColor = '#3b82f6'; 
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; 
                      }}
                      onBlur={(e) => { 
                        e.currentTarget.style.borderColor = '#e2e8f0'; 
                        e.currentTarget.style.boxShadow = 'none'; 
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '8px'
                      }}>
                        Education Level
                      </label>
                      <select
                        value={educationLevel}
                        onChange={(e) => setEducationLevel(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          fontSize: '14px',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '12px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          background: '#ffffff',
                          color: '#1e293b'
                        }}
                        onFocus={(e) => { 
                          e.currentTarget.style.borderColor = '#3b82f6'; 
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; 
                        }}
                        onBlur={(e) => { 
                          e.currentTarget.style.borderColor = '#e2e8f0'; 
                          e.currentTarget.style.boxShadow = 'none'; 
                        }}
                      >
                        <option value="">Select Level</option>
                        <option value="SMA">High School</option>
                        <option value="D3">Diploma</option>
                        <option value="S1">Bachelor</option>
                        <option value="S2">Master</option>
                      </select>
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '8px'
                      }}>
                        Major / Field
                      </label>
                      <input
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="e.g. Computer Science"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          fontSize: '14px',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '12px',
                          outline: 'none',
                          boxSizing: 'border-box',
                          background: '#ffffff',
                          color: '#1e293b'
                        }}
                        onFocus={(e) => { 
                          e.currentTarget.style.borderColor = '#3b82f6'; 
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; 
                        }}
                        onBlur={(e) => { 
                          e.currentTarget.style.borderColor = '#e2e8f0'; 
                          e.currentTarget.style.boxShadow = 'none'; 
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Admin-specific fields */}
              {isAdminForm && (
                <>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
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
                        boxSizing: 'border-box',
                        background: '#ffffff',
                        color: '#1e293b'
                      }}
                      onFocus={(e) => { 
                        e.currentTarget.style.borderColor = '#3b82f6'; 
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; 
                      }}
                      onBlur={(e) => { 
                        e.currentTarget.style.borderColor = '#e2e8f0'; 
                        e.currentTarget.style.boxShadow = 'none'; 
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="+62 812 3456 7890"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14px',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: '#ffffff',
                        color: '#1e293b'
                      }}
                      onFocus={(e) => { 
                        e.currentTarget.style.borderColor = '#3b82f6'; 
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; 
                      }}
                      onBlur={(e) => { 
                        e.currentTarget.style.borderColor = '#e2e8f0'; 
                        e.currentTarget.style.boxShadow = 'none'; 
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      Office Address
                    </label>
                    <textarea
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Street address, city, province"
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '14px',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: '#ffffff',
                        color: '#1e293b',
                        fontFamily: 'inherit',
                        resize: 'none'
                      }}
                      onFocus={(e) => { 
                        e.currentTarget.style.borderColor = '#3b82f6'; 
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; 
                      }}
                      onBlur={(e) => { 
                        e.currentTarget.style.borderColor = '#e2e8f0'; 
                        e.currentTarget.style.boxShadow = 'none'; 
                      }}
                    />
                  </div>
                </>
              )}

              {/* Password Fields */}
              {isCandidateForm && (
                <>
                  <PasswordInput
                    value={password}
                    onChange={(val) => setPassword(val)}
                    label="Password"
                    isDark={false}
                    showStrength={true}
                    showRules={true}
                  />

                  <PasswordInput
                    value={passwordConfirm}
                    onChange={(val) => setPasswordConfirm(val)}
                    label="Confirm Password"
                    isDark={false}
                    showStrength={false}
                    showRules={false}
                  />
                </>
              )}

              {isAdminForm && (
                <>
                  <PasswordInput
                    value={companyPassword}
                    onChange={(val) => setCompanyPassword(val)}
                    label="Company Password"
                    isDark={false}
                    showStrength={true}
                    showRules={true}
                  />

                  <PasswordInput
                    value={companyPasswordConfirm}
                    onChange={(val) => setCompanyPasswordConfirm(val)}
                    label="Confirm Company Password"
                    isDark={false}
                    showStrength={false}
                    showRules={false}
                  />
                </>
              )}

              {/* Form Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setStep('entry'); setPath(null); }}
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
                  type="submit"
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
                  {loading ? 'Creating Account...' : 'Create Account & Continue'}
                </button>
              </div>
            </div>
          </form>

          <div style={{
            padding: '16px 32px',
            background: '#f8fafc',
            borderTop: '1px solid #f1f5f9'
          }}>
            <p style={{ fontSize: '11.5px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Sign in here</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}