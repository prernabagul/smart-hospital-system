import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name || user?.name || 'Prerna';

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const cards = [
    {
      id: 'medical-records',
      title: 'Medical Records',
      subtitle: 'History, prescriptions & lab results',
      desc: 'Access your complete timeline of doctor notes, lab reports, and past prescriptions in one place.',
      icon: '📁',
      accentColor: '#10b981',
      badge: 'Updated Today',
      path: '/medical-records',
    },
    {
      id: 'doctor-search',
      title: 'Doctor Search',
      subtitle: 'Find specialists & book appointments',
      desc: 'Describe symptoms or search by specialty to match with trusted healthcare providers.',
      icon: '👨‍⚕️',
      accentColor: '#0284c7',
      badge: 'AI Powered',
      path: '/doctor-search',
    },
    {
      id: 'chatbot',
      title: 'AI Health Assistant',
      subtitle: '24/7 Virtual Health Guidance',
      desc: 'Ask health questions, interpret terminology, or get instant triage advice anytime.',
      icon: '🤖',
      accentColor: '#8b5cf6',
      badge: 'Online 24/7',
      path: '/chatbot',
    },
    {
      id: 'report-analysis',
      title: 'Analyze Lab Report',
      subtitle: 'Automated test insights',
      desc: 'Upload PDFs or photos of lab results to automatically extract metrics and plain-English summaries.',
      icon: '📄',
      accentColor: '#f59e0b',
      badge: 'Instant AI',
      path: '/report-analysis',
    },
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '32px 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>

        {/* Navigation Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            padding: '14px 24px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            marginBottom: '28px',
          }}
        >
          {/* Clickable User Avatar Area for Profile */}
          <div
            onClick={() => navigate('/patient-profile')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '4px 8px',
              borderRadius: '10px',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '15px',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{displayName}</div>
              <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600' }}>View Profile →</div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            style={{
              padding: '8px 18px',
              backgroundColor: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              color: '#475569',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
          >
            Sign Out
          </button>
        </div>

        {/* Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '36px',
            borderRadius: '20px',
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.05em', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '6px' }}>
              Patient Portal
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: '800', margin: '0 0 14px 0', letterSpacing: '-0.02em' }}>
              Welcome back, {displayName} 👋
            </h1>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                🆔 ID: {user?.patientId || 'PAT-2026-0001'}
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  color: '#fca5a5',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/emergency')}
            style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              padding: '14px 24px',
              borderRadius: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
              transition: 'transform 0.15s, background-color 0.15s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>🚨</span>
            <span>EMERGENCY SOS</span>
          </button>
        </div>

        {/* Section Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0' }}>
            Quick Actions & Services
          </h2>
        </div>

        {/* Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => navigate(card.path)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = card.accentColor;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div
                    style={{
                      fontSize: '24px',
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: `${card.accentColor}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {card.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: card.accentColor,
                      backgroundColor: `${card.accentColor}15`,
                      padding: '4px 10px',
                      borderRadius: '12px',
                    }}
                  >
                    {card.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
                  {card.title}
                </h3>
                <div style={{ fontSize: '12px', fontWeight: '600', color: card.accentColor, marginBottom: '10px' }}>
                  {card.subtitle}
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: '0 0 20px 0' }}>
                  {card.desc}
                </p>
              </div>

              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: card.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Access Feature</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;