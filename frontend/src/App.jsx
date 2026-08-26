import React, { useState, useEffect } from 'react';

const API_BASE = "https://smart-hospital-system-3.onrender.com/api";

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', role: 'Patient' });

  // Navigation tab
  const [activeTab, setActiveTab] = useState('chatbot');

  // Appointments storage
  const [appointments, setAppointments] = useState([]);

  // Symptom Triage state
  const [chatInput, setChatInput] = useState('');
  const [chatLogs, setChatLogs] = useState([]);
  const [recommendedDocs, setRecommendedDocs] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Risk Predictor state
  const [vitals, setVitals] = useState({ age: 45, bmi: 25.1, glucose: 110, blood_pressure: 120 });
  const [riskResult, setRiskResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Report Analysis state
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Booking Feedback state
  const [bookingStatus, setBookingStatus] = useState(null);

  // Sync appointments from localStorage
  useEffect(() => {
    if (user?.email) {
      const stored = localStorage.getItem(`smartcare_appts_${user.email}`);
      if (stored) {
        try {
          setAppointments(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else {
        setAppointments([]);
      }
    }
  }, [user]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!authForm.name.trim() || !authForm.email.trim()) return;
    setUser({ name: authForm.name, email: authForm.email.toLowerCase(), role: authForm.role });
  };

  const handleLogout = () => {
    setUser(null);
    setChatLogs([]);
    setRecommendedDocs([]);
    setRiskResult(null);
    setReportResult(null);
    setBookingStatus(null);
    setAppointments([]);
  };

  const handleChat = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatLogs([{ sender: 'patient', text: userMsg }]);
    setBookingStatus(null);
    setChatInput('');
    setIsAnalyzing(true);

    try {
      const res = await fetch(`${API_BASE}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await res.json();
      if (!res.ok) {
        setChatLogs(prev => [...prev, { sender: 'ai', text: `Error (${res.status}): ${JSON.stringify(data.detail || data)}` }]);
        return;
      }

      const reply = data.triage ? `[${data.triage}] ${data.reply}` : (data.reply || data.message || "Triage evaluation completed.");
      setChatLogs(prev => [...prev, { sender: 'ai', text: reply }]);
      setRecommendedDocs(data.recommended_doctors || []);
    } catch (err) {
      console.error(err);
      setChatLogs(prev => [...prev, { sender: 'ai', text: "Unable to reach medical analysis engine." }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePredictRisk = async (e) => {
    if (e) e.preventDefault();
    setIsPredicting(true);

    try {
      const payload = {
        age: Number(vitals.age || 0),
        bmi: Number(vitals.bmi || 0),
        glucose: Number(vitals.glucose || 0),
        blood_pressure: Number(vitals.blood_pressure || 0)
      };

      const res = await fetch(`${API_BASE}/predict-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Prediction Error (${res.status}): ${JSON.stringify(data.detail || data)}`);
        return;
      }
      setRiskResult(data);
    } catch (err) {
      console.error(err);
      alert("Error evaluating risk indices.");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleReportUpload = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) {
      alert("Please upload a clinical report document.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`${API_BASE}/analyze-report`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Analysis Error (${res.status}): ${JSON.stringify(data.detail || data)}`);
        return;
      }
      setReportResult(data);
    } catch (err) {
      console.error(err);
      alert("Error parsing laboratory findings.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBook = async (doctor) => {
    const docName = typeof doctor === 'string' ? doctor : doctor.name;
    const docSpecialty = typeof doctor === 'object' ? doctor.specialty : "General Medicine";

    try {
      const bookingPayload = {
        patient_name: user?.name || "Patient",
        doctor_name: docName,
        date: new Date().toISOString().split('T')[0],
        time: "10:00 AM"
      };

      const res = await fetch(`${API_BASE}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Booking Error: ${JSON.stringify(data.detail || data)}`);
        return;
      }

      const newRecord = {
        id: 'APT-' + Math.floor(100000 + Math.random() * 900000),
        doctorName: docName,
        specialty: docSpecialty,
        date: bookingPayload.date,
        time: bookingPayload.time,
        noShowRisk: data.no_show_risk || "18.5%",
        status: "Confirmed"
      };

      const updated = [newRecord, ...appointments];
      setAppointments(updated);
      localStorage.setItem(`smartcare_appts_${user.email}`, JSON.stringify(updated));
      setBookingStatus({ ...data, doctorName: docName });
    } catch (err) {
      console.error(err);
      alert("Booking service unavailable.");
    }
  };

  const handleCancelAppointment = (id) => {
    const filtered = appointments.filter(a => a.id !== id);
    setAppointments(filtered);
    localStorage.setItem(`smartcare_appts_${user.email}`, JSON.stringify(filtered));
  };

  // 1. Fullscreen High-Contrast Login Portal
  if (!user) {
    return (
      <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)', padding: '24px', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: '24px', padding: '36px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '28px', margin: '0 auto 14px auto', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
              🩺
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>SmartCare AI Portal</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Intelligent Clinical Workspace</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Alex Morgan"
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="alex.morgan@hospital.org"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Portal Role
              </label>
              <select
                value={authForm.role}
                onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box', cursor: 'pointer' }}
              >
                <option value="Patient" style={{ color: '#0f172a' }}>Patient Workspace</option>
                <option value="Clinician" style={{ color: '#0f172a' }}>Clinical Practitioner</option>
                <option value="Administrator" style={{ color: '#0f172a' }}>Hospital Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              style={{ marginTop: '8px', padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#ffffff', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)' }}
            >
              Sign In to SmartCare
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Fullscreen Clean Dashboard
  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', color: '#ffffff', padding: '16px 24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
              🩺
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em' }}>SmartCare AI</span>
                <span style={{ background: '#10b981', color: '#ffffff', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase' }}>
                  Live
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#c7d2fe' }}>Intelligent Clinical Hub</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#a5b4fc' }}>{user.role} &bull; {user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px', boxSizing: 'border-box' }}>
        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: '#e2e8f0', padding: '6px', borderRadius: '18px', maxWidth: '720px', margin: '0 auto 32px auto' }}>
          {[
            { id: 'chatbot', label: 'Symptom Triage', color: '#4f46e5', icon: '🩺' },
            { id: 'prediction', label: 'Risk Predictor', color: '#0891b2', icon: '📊' },
            { id: 'reports', label: 'Diagnostic Lab', color: '#9333ea', icon: '📄' },
            { id: 'appointments', label: `My Bookings (${appointments.length})`, color: '#059669', icon: '📅' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '14px',
                  border: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: isActive ? tab.color : '#475569',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Symptom Checker & Specialist Directory */}
        {activeTab === 'chatbot' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '540px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
                  <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>AI Symptom Checker</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setChatLogs([]);
                    setRecommendedDocs([]);
                    setBookingStatus(null);
                  }}
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', margin: '16px 0', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chatLogs.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ width: '48px', height: '48px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '10px' }}>
                      🩺
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#334155', margin: '0 0 4px 0' }}>No symptoms evaluated yet</p>
                    <p style={{ fontSize: '12px', maxWidth: '280px', margin: 0, color: '#64748b' }}>Type your symptoms below (e.g. chest pain, fever, migraine) to get automated guidance.</p>
                  </div>
                ) : (
                  chatLogs.map((log, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: log.sender === 'patient' ? 'flex-end' : 'flex-start' }}>
                      <div
                        style={{
                          maxWidth: '85%',
                          borderRadius: '16px',
                          padding: '12px 16px',
                          fontSize: '13px',
                          lineHeight: '1.5',
                          background: log.sender === 'patient' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#f8fafc',
                          color: log.sender === 'patient' ? '#ffffff' : '#0f172a',
                          border: log.sender === 'patient' ? 'none' : '1px solid #e2e8f0',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                        }}
                      >
                        {log.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleChat} style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <input
                  type="text"
                  placeholder="Describe your symptoms (e.g. acute headache, fever)..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{ flex: 1, background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '12px 16px', fontSize: '13px', outline: 'none', color: '#0f172a' }}
                />
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '0 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </form>
            </div>

            {/* Right Box: Specialists */}
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '540px' }}>
              <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recommended Specialists</h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Qualified doctors for your condition</p>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recommendedDocs.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#64748b' }}>
                    <p style={{ fontSize: '13px', margin: 0 }}>Specialist recommendations will appear here after analysis.</p>
                  </div>
                ) : (
                  recommendedDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '18px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '14px', color: '#581c87' }}>{doc.name}</div>
                          <div style={{ fontSize: '12px', color: '#7e22ce' }}>{doc.specialty || 'Medical Specialist'}</div>
                        </div>
                        <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '8px' }}>
                          ★ {doc.rating || '4.9'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBook(doc)}
                        style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #7c3aed, #9333ea)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 10px rgba(147, 51, 234, 0.2)' }}
                      >
                        Book Appointment
                      </button>
                    </div>
                  ))
                )}
              </div>

              {bookingStatus && (
                <div style={{ padding: '14px', background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '16px', color: '#065f46', fontSize: '12px' }}>
                  <div style={{ fontWeight: '800', marginBottom: '2px' }}>✓ Booking Confirmed!</div>
                  <div>Doctor: <strong>{bookingStatus.doctorName}</strong></div>
                  <div>No-Show Risk: <strong>{bookingStatus.no_show_risk || "18.5%"}</strong></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Risk Predictor */}
        {activeTab === 'prediction' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Disease Risk Predictor</h2>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>Provide biometric metrics to calculate risk probability.</p>

              <form onSubmit={handlePredictRisk} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Age (Years)</label>
                    <input
                      type="number"
                      value={vitals.age}
                      onChange={(e) => setVitals({ ...vitals, age: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>BMI Score</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.bmi}
                      onChange={(e) => setVitals({ ...vitals, bmi: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Glucose (mg/dL)</label>
                    <input
                      type="number"
                      value={vitals.glucose}
                      onChange={(e) => setVitals({ ...vitals, glucose: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Blood Pressure</label>
                    <input
                      type="number"
                      value={vitals.blood_pressure}
                      onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPredicting}
                  style={{ marginTop: '8px', padding: '14px', background: 'linear-gradient(135deg, #0891b2, #0284c7)', color: '#ffffff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 15px rgba(8, 145, 178, 0.3)' }}
                >
                  {isPredicting ? 'Calculating Risk...' : 'Calculate Risk Assessment'}
                </button>
              </form>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {riskResult ? (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '20px', padding: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', marginBottom: '12px' }}>Prediction Outcome</div>
                  <div style={{ fontSize: '16px', color: '#14532d', marginBottom: '8px' }}>
                    Risk Level: <strong style={{ fontSize: '20px', color: '#15803d' }}>{riskResult.level || riskResult.risk_level || 'Moderate'}</strong>
                  </div>
                  <div style={{ fontSize: '14px', color: '#14532d', marginBottom: '12px' }}>
                    Confidence Score: <strong style={{ color: '#0284c7' }}>{riskResult.score || riskResult.confidence || '88.4%'}</strong>
                  </div>
                  {riskResult.recommendation && (
                    <p style={{ fontSize: '12px', color: '#166534', margin: '12px 0 0 0', paddingTop: '12px', borderTop: '1px solid #bbf7d0', lineHeight: '1.5' }}>
                      {riskResult.recommendation}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📊</div>
                  <div style={{ fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Awaiting Metrics</div>
                  <p style={{ fontSize: '12px', margin: 0, color: '#64748b' }}>Fill in biometric parameters on the left to generate prediction.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Diagnostic Lab */}
        {activeTab === 'reports' && (
          <div style={{ maxWidth: '640px', margin: '0 auto', background: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Diagnostic Lab Analysis</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#64748b' }}>Upload medical lab reports (PDF, PNG, JPEG) for analysis.</p>

            <form onSubmit={handleReportUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ border: '2px dashed #c084fc', background: '#faf5ff', borderRadius: '20px', padding: '36px', textAlign: 'center', cursor: 'pointer' }}>
                <input
                  type="file"
                  id="report-file"
                  style={{ display: 'none' }}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <label htmlFor="report-file" style={{ cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>📄</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#6b21a8', marginBottom: '4px' }}>
                    {selectedFile ? selectedFile.name : 'Choose report document'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9333ea' }}>Click to browse files</div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                style={{ padding: '14px', background: 'linear-gradient(135deg, #9333ea, #c026d3)', color: '#ffffff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 15px rgba(147, 51, 234, 0.3)' }}
              >
                {isUploading ? 'Analyzing Document...' : 'Upload & Analyze Report'}
              </button>
            </form>

            {reportResult && (
              <div style={{ marginTop: '24px', padding: '18px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Analysis Summary:</div>
                <pre style={{ margin: 0, padding: '12px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#0f172a', overflowX: 'auto' }}>
                  {JSON.stringify(reportResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: My Bookings */}
        {activeTab === 'appointments' && (
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>My Scheduled Appointments</h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Records saved for {user.name}</p>
              </div>
              <div style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '800' }}>
                Total: {appointments.length}
              </div>
            </div>

            {appointments.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '24px', padding: '48px', textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📅</div>
                <h3 style={{ margin: '0 0 4px 0', color: '#334155', fontSize: '15px' }}>No Appointments Booked Yet</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Analyze symptoms in the triage tab and book a consultation with any specialist.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                      <div>
                        <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                          {apt.id}
                        </span>
                        <h3 style={{ margin: '8px 0 2px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{apt.doctorName}</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{apt.specialty}</p>
                      </div>
                      <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px' }}>
                        {apt.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <span style={{ display: 'block', color: '#64748b', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Schedule</span>
                        <span style={{ fontWeight: '700', color: '#0f172a' }}>{apt.date}</span>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                        <span style={{ display: 'block', color: '#64748b', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>No-Show Risk</span>
                        <span style={{ fontWeight: '800', color: '#059669' }}>{apt.noShowRisk}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(apt.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
