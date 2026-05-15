import { useState } from 'react';
import { validatePassword, getPasswordStrength } from '../utils/passwordValidator';

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export default function PasswordInput({
  value,
  onChange,
  placeholder = 'Minimal 8 karakter',
  label = 'Password',
  showStrength = true,
  showRules = true,
  isDark = false,
  required = true,
  name = 'password',
}) {
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);

  const strength = getPasswordStrength(value);
  const { errors } = validatePassword(value);

  const rules = [
    { label: 'At Least 8 characters', pass: value.length >= 8 },
    { label: 'Uppercase Letters (A-Z)', pass: /[A-Z]/.test(value) },
    { label: 'Lowercase Letters (a-z)', pass: /[a-z]/.test(value) },
    { label: 'Numbers (0-9)', pass: /[0-9]/.test(value) },
    { label: 'No Spaces', pass: value.length > 0 && !/\s/.test(value) },
  ];

  const inputStyle = {
    width: '100%',
    padding: '12px 44px 12px 16px',
    fontSize: '14px',
    border: `1.5px solid ${touched && errors.length > 0 ? '#fca5a5' : '#e2e8f0'}`,
    borderRadius: '12px',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#1e293b',
    fontFamily: 'inherit',
  };

  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: isDark ? 'rgba(255,255,255,0.8)' : '#1e293b',
        marginBottom: '6px'
      }}>
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          required={required}
          style={inputStyle}
          onFocus={e => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlurCapture={e => {
            e.target.style.borderColor = touched && errors.length > 0 ? '#fca5a5' : '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: 'absolute', right: '12px', top: '50%',
            transform: 'translateY(-50%)', background: 'none',
            border: 'none', cursor: 'pointer',
            color: '#94a3b8', padding: '2px',
          }}
        >
          <EyeIcon open={show} />
        </button>
      </div>

      {/* Strength bar */}
      {showStrength && value.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                flex: 1, height: '3px', borderRadius: '99px',
                background: i <= strength.level ? strength.color : '#e2e8f0',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
          <span style={{ fontSize: '11px', color: strength.color, fontWeight: '600' }}>
            {strength.label}
          </span>
        </div>
      )}

      {/* Rules checklist — tampil saat touched atau ada isian */}
      {showRules && (touched || value.length > 0) && (
        <div style={{
          marginTop: '10px', padding: '12px 14px',
          background: '#f8fafc', borderRadius: '10px',
          border: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          {rules.map((rule, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '12px',
              color: rule.pass ? '#16a34a' : '#94a3b8',
            }}>
              <span style={{ fontSize: '14px' }}>{rule.pass ? '✓' : '○'}</span>
              {rule.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}