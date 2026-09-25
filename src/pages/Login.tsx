import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, login, register, logout } = useAuth();

  // Tab State: false = Already a User (Sign In), true = New User (Register)
  const [isRegister, setIsRegister] = useState(false);

  // Common Form Fields
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');

  // New User Registration Fields
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form Utility States
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegister) {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      // Handle New User Registration using AuthContext
      const result = register({
        id: 'PAT-' + Math.floor(100000 + Math.random() * 900000),
        name: fullName || 'New Patient',
        email,
        phone: mobileNumber,
        password,
        role: 'patient',
      });

      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }
    } else {
      // Handle Existing User Login using AuthContext
      const result = login(email, password);

      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }
    }

    // Redirect to Patient Dashboard after successful action
    navigate('/dashboard');
  };

  const handleForgotPassword = () => {
    alert('Password reset instructions have been sent to your registered Email/Mobile Number.');
  };

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        
        {/* COMPACT DARK HEADER SECTION */}
        <div style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '20px 24px 16px 24px', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
              Your complete health care journey in one place.
            </h1>
            {user && (
              <button
                onClick={logout}
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginLeft: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                Logout
              </button>
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px 0', lineHeight: '1.4' }}>
            Access medical records, consult with AI specialists, and manage prescriptions securely.
          </p>

          <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid #334155', paddingTop: '10px' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#38bdf8' }}>24/7 </span>
              <span style={{ fontSize: '11px', color: '#cbd5e1' }}>AI Triage</span>
            </div>
            <div>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#34d399' }}>100% </span>
              <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Secure Data</span>
            </div>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: !isRegister ? '#ffffff' : 'transparent',
              color: !isRegister ? '#0284c7' : '#64748b',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              borderBottom: !isRegister ? '2px solid #0284c7' : 'none',
            }}
          >
            Already a User (Sign In)
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: isRegister ? '#ffffff' : 'transparent',
              color: isRegister ? '#0284c7' : '#64748b',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              borderBottom: isRegister ? '2px solid #0284c7' : 'none',
            }}
          >
            New User (Register)
          </button>
        </div>

        {/* FORM SECTION */}
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              {isRegister ? 'Create Patient Account' : 'Welcome Back'}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              {isRegister ? 'Please enter your details to register as a new patient.' : 'Please enter your credentials to sign in.'}
            </p>
          </div>

          {errorMsg && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px', fontWeight: '600' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* NEW USER SPECIFIC FIELD */}
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {/* EMAIL ADDRESS */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Email ID *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. patient@example.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {/* MOBILE NUMBER */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Mobile Number *</label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter mobile number"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                {isRegister ? 'Create Password *' : 'Password *'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            {/* CONFIRM PASSWORD (NEW USER ONLY) */}
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {/* REMEMBER ME & FORGOT PASSWORD */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#0284c7' }}
                />
                Remember Me
              </label>
              
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: '600', cursor: 'pointer', padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                marginTop: '8px',
                boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.3)',
              }}
            >
              {isRegister ? 'Register & Go to Dashboard' : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;