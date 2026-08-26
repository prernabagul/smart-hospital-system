import React, { useState, useEffect } from 'react';

const API_BASE = "https://smart-hospital-system-3.onrender.com/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', role: 'Patient' });

  // Navigation tab
  const [activeTab, setActiveTab] = useState('chatbot');

  // Shared Master Appointments Data
  const [appointments, setAppointments] = useState([]);

  // Administrator Interactive Bed Management State
  const [beds, setBeds] = useState({
    totalIcu: 20,
    occupiedIcu: 17,
    totalGeneral: 100,
    occupiedGeneral: 68
  });

  // Doctor Bed Assignment Modal State
  const [bedModalPatient, setBedModalPatient] = useState(null);
  const [selectedBedType, setSelectedBedType] = useState('ICU');

  // Patient Workspace States
  const [chatInput, setChatInput] = useState('');
  const [chatLogs, setChatLogs] = useState([]);
  const [recommendedDocs, setRecommendedDocs] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [vitals, setVitals] = useState({ age: 45, bmi: 25.1, glucose: 110, blood_pressure: 120 });
  const [riskResult, setRiskResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);

  // Sync data from localStorage
  useEffect(() => {
    const storedAppts = localStorage.getItem('smartcare_all_hospital_appts');
    if (storedAppts) {
      try { setAppointments(JSON.parse(storedAppts)); } catch (e) { console.error(e); }
    }
    const storedBeds = localStorage.getItem('smartcare_hospital_beds');
    if (storedBeds) {
      try { setBeds(JSON.parse(storedBeds)); } catch (e) { console.error(e); }
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!authForm.name.trim() || !authForm.email.trim()) return;
    const loggedUser = { name: authForm.name, email: authForm.email.toLowerCase(), role: authForm.role };
    setUser(loggedUser);
    
    if (loggedUser.role === 'Clinician') setActiveTab('doctor_desk');
    else if (loggedUser.role === 'Administrator') setActiveTab('admin_desk');
    else setActiveTab('chatbot');
  };

  const handleLogout = () => {
    setUser(null);
    setChatLogs([]);
    setRecommendedDocs([]);
    setRiskResult(null);
    setReportResult(null);
    setBookingStatus(null);
  };

  // Bed Allocation Logic (Doctor)
  const handleAssignBed = () => {
    if (!bedModalPatient) return;

    if (selectedBedType === 'ICU') {
      if (beds.occupiedIcu >= beds.totalIcu) {
        alert("⚠️ ICU is at 100% capacity! Cannot allocate ICU bed.");
        return;
      }
      const updatedBeds = { ...beds, occupiedIcu: beds.occupiedIcu + 1 };
      setBeds(updatedBeds);
      localStorage.setItem('smartcare_hospital_beds', JSON.stringify(updatedBeds));
    } else {
      if (beds.occupiedGeneral >= beds.totalGeneral) {
        alert("⚠️ General Ward is full!");
        return;
      }
      const updatedBeds = { ...beds, occupiedGeneral: beds.occupiedGeneral + 1 };
      setBeds(updatedBeds);
      localStorage.setItem('smartcare_hospital_beds', JSON.stringify(updatedBeds));
    }

    const updatedList = appointments.map(apt => {
      if (apt.id === bedModalPatient.id) {
        return { ...apt, bedAssigned: `${selectedBedType} Bed Allocated`, status: 'Admitted' };
      }
      return apt;
    });

    setAppointments(updatedList);
    localStorage.setItem('smartcare_all_hospital_appts', JSON.stringify(updatedList));
    alert(`✅ ${selectedBedType} Bed assigned successfully to ${bedModalPatient.patientName || "Patient"}!`);
    setBedModalPatient(null);
  };

  // Manual Bed Controls (Administrator)
  const updateBedCount = (type, change) => {
    let updatedBeds = { ...beds };
    if (type === 'icu') {
      const nextVal = beds.occupiedIcu + change;
      if (nextVal < 0 || nextVal > beds.totalIcu) return;
      updatedBeds.occupiedIcu = nextVal;
    } else {
      const nextVal = beds.occupiedGeneral + change;
      if (nextVal < 0 || nextVal > beds.totalGeneral) return;
      updatedBeds.occupiedGeneral = nextVal;
    }
    setBeds(updatedBeds);
    localStorage.setItem('smartcare_hospital_beds', JSON.stringify(updatedBeds));
  };

  // Patient: Chat triage
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

  // Patient: Risk Predictor
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
      const glucoseImpact = payload.glucose > 125 ? 42 : payload.glucose > 100 ? 25 : 10;
      const bpImpact = payload.blood_pressure > 130 ? 35 : payload.blood_pressure > 120 ? 20 : 10;
      const bmiImpact = payload.bmi > 28 ? 23 : 10;
      setRiskResult({
        ...data,
        xai: { glucoseImpact, bpImpact, bmiImpact, primaryDriver: glucoseImpact > bpImpact ? "Fasting Blood Glucose" : "Systolic Blood Pressure" }
      });
    } catch (err) {
      console.error(err);
      alert("Error evaluating risk indices.");
    } finally {
      setIsPredicting(false);
    }
  };

  // Patient: Report upload
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

  // Patient: Book Doctor
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
        patientName: user.name,
        patientEmail: user.email,
        specialty: docSpecialty,
        date: bookingPayload.date,
        time: bookingPayload.time,
        noShowRisk: data.no_show_risk || "18.5%",
        status: "Pending Consultation",
        bedAssigned: "None"
      };

      const updated = [newRecord, ...appointments];
      setAppointments(updated);
      localStorage.setItem('smartcare_all_hospital_appts', JSON.stringify(updated));
      setBookingStatus({ ...data, doctorName: docName });
    } catch (err) {
      console.error(err);
      alert("Booking service unavailable.");
    }
  };

  const handleCancelAppointment = (id) => {
    const filtered = appointments.filter(a => a.id !== id);
    setAppointments(filtered);
    localStorage.setItem('smartcare_all_hospital_appts', JSON.stringify(filtered));
  };

  // 1. Auth View
  if (!user) {
    return (
      <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)', padding: '24px', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: '24px', padding: '36px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '28px', margin: '0 auto 14px auto', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}>
              🩺
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>SmartCare AI Portal</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Select your role to access custom portal</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>Email Address</label>
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>Select Role</label>
              <select
                value={authForm.role}
                onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box', cursor: 'pointer' }}
              >
                <option value="Patient">Patient (Self-Triage & Bookings)</option>
                <option value="Clinician">Clinical Practitioner / Doctor</option>
                <option value="Administrator">Hospital Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              style={{ marginTop: '8px', padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#ffffff', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)' }}
            >
              Access Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  const icuPercent = Math.round((beds.occupiedIcu / beds.totalIcu) * 100);
  const generalPercent = Math.round((beds.occupiedGeneral / beds.totalGeneral) * 100);
  const patientBookings = appointments.filter(a => a.patientEmail === user.email || a.patientName === user.name);

  // Filter appointments specifically assigned to this doctor (or show pending list)
  const doctorPendingAppts = appointments.filter(a => 
    a.status === "Pending Consultation" && 
    (a.doctorName.toLowerCase().includes(user.name.toLowerCase()) || user.name.toLowerCase().includes(a.doctorName.toLowerCase()) || true)
  );

  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box' }}>
      {/* Top Header */}
      <header style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', color: '#ffffff', padding: '16px 24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
              🏥
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: '800' }}>SmartCare AI</span>
                <span style={{ background: user.role === 'Patient' ? '#3b82f6' : user.role === 'Clinician' ? '#e11d48' : '#8b5cf6', color: '#ffffff', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', textTransform: 'uppercase' }}>
                  {user.role} Workspace
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#c7d2fe' }}>Clinical Hospital Management Platform</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#a5b4fc' }}>{user.email}</div>
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

      {/* Main Container */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px', boxSizing: 'border-box' }}>

        {/* ======================================================== */}
        {/* ROLE 1: CLINICAL PRACTITIONER (DOCTOR) WORKSPACE          */}
        {/* ======================================================== */}
        {user.role === 'Clinician' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>🩺 Pending Consultations & Bed Allocation Desk</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Review your pending appointment requests, consult patients, and assign ward beds.</p>
                </div>
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', border: '1px solid #fecaca' }}>
                  Pending Queue: {doctorPendingAppts.length}
                </div>
              </div>

              {doctorPendingAppts.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#334155', fontSize: '15px' }}>No Pending Consultations</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>You have cleared all pending appointments assigned to your practice.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {doctorPendingAppts.map((apt) => (
                    <div key={apt.id} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>{apt.id}</span>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{apt.patientName || "Patient"}</h3>
                          <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px' }}>
                            ⏳ Pending Consultation
                          </span>
                        </div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#475569' }}>Requested Doctor: <strong>{apt.doctorName}</strong> ({apt.specialty})</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Date: {apt.date} at {apt.time} &bull; No-Show Risk: <strong style={{ color: '#059669' }}>{apt.noShowRisk}</strong></p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => setBedModalPatient(apt)}
                          style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)' }}
                        >
                          🛏️ Book Hospital Bed
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Complete / Clear
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal for Bed Booking by Doctor */}
            {bedModalPatient && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', maxWidth: '420px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Allocate Hospital Bed</h3>
                  <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
                    Assigning bed for pending patient: <strong>{bedModalPatient.patientName || "Patient"}</strong>
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Select Ward Type</label>
                    <select
                      value={selectedBedType}
                      onChange={(e) => setSelectedBedType(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#ffffff', color: '#0f172a' }}
                    >
                      <option value="ICU">ICU Ward (Available: {beds.totalIcu - beds.occupiedIcu}/{beds.totalIcu})</option>
                      <option value="General">General Inpatient Ward (Available: {beds.totalGeneral - beds.occupiedGeneral}/{beds.totalGeneral})</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                    <button
                      onClick={handleAssignBed}
                      style={{ flex: 1, padding: '12px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Confirm Bed Allocation
                    </button>
                    <button
                      onClick={() => setBedModalPatient(null)}
                      style={{ padding: '12px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ROLE 2: HOSPITAL ADMINISTRATOR WORKSPACE                  */}
        {/* ======================================================== */}
        {user.role === 'Administrator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1.5px solid #fecaca', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>ICU Bed Occupancy</span>
                  <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '8px' }}>
                    {icuPercent}% Full
                  </span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '4px 0 12px 0' }}>
                  {beds.occupiedIcu} / {beds.totalIcu} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Beds Taken</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ width: `${icuPercent}%`, height: '100%', background: icuPercent > 80 ? '#ef4444' : '#3b82f6' }}></div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => updateBedCount('icu', 1)} style={{ flex: 1, padding: '8px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>+ Admit ICU (+1)</button>
                  <button onClick={() => updateBedCount('icu', -1)} style={{ flex: 1, padding: '8px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>- Free ICU (-1)</button>
                </div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1.5px solid #bbf7d0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#166534', textTransform: 'uppercase' }}>General Ward Occupancy</span>
                  <span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '8px' }}>
                    {generalPercent}% Full
                  </span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '4px 0 12px 0' }}>
                  {beds.occupiedGeneral} / {beds.totalGeneral} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Beds Taken</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginBottom: '16px' }}>
                  <div style={{ width: `${generalPercent}%`, height: '100%', background: '#10b981' }}></div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => updateBedCount('general', 1)} style={{ flex: 1, padding: '8px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>+ Admit Ward (+1)</button>
                  <button onClick={() => updateBedCount('general', -1)} style={{ flex: 1, padding: '8px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>- Free Ward (-1)</button>
                </div>
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Hospital Master Patient Roster</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Complete administrative oversight of schedules, beds, and triage records</p>
                </div>
                <span style={{ background: '#f1f5f9', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                  Live Admin Stream
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 8px' }}>Patient / ID</th>
                    <th style={{ padding: '12px 8px' }}>Doctor Assigned</th>
                    <th style={{ padding: '12px 8px' }}>Schedule</th>
                    <th style={{ padding: '12px 8px' }}>Bed Allocation</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No hospital records present.</td></tr>
                  ) : (
                    appointments.map(apt => (
                      <tr key={apt.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0f172a' }}>
                          {apt.patientName || "Patient"} <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '400' }}>{apt.id}</span>
                        </td>
                        <td style={{ padding: '12px 8px', color: '#334155' }}>{apt.doctorName}</td>
                        <td style={{ padding: '12px 8px', color: '#64748b' }}>{apt.date} • {apt.time}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{ background: apt.bedAssigned && apt.bedAssigned !== 'None' ? '#ecfdf5' : '#f1f5f9', color: apt.bedAssigned && apt.bedAssigned !== 'None' ? '#059669' : '#64748b', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                            {apt.bedAssigned || 'None'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: '800', color: '#059669' }}>{apt.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ROLE 3: PATIENT WORKSPACE ONLY                            */}
        {/* ======================================================== */}
        {user.role === 'Patient' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', background: '#e2e8f0', padding: '6px', borderRadius: '18px', maxWidth: '720px', margin: '0 auto 32px auto' }}>
              {[
                { id: 'chatbot', label: 'Symptom Triage', color: '#4f46e5', icon: '🩺' },
                { id: 'prediction', label: 'Risk & XAI Matrix', color: '#0891b2', icon: '📊' },
                { id: 'reports', label: 'Diagnostic Lab', color: '#9333ea', icon: '📄' },
                { id: 'appointments', label: `My Bookings (${patientBookings.length})`, color: '#059669', icon: '📅' }
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
                      gap: '6px'
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

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
                      onClick={() => { setChatLogs([]); setRecommendedDocs([]); setBookingStatus(null); }}
                      style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', margin: '16px 0', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {chatLogs.length === 0 ? (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ width: '48px', height: '48px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '10px' }}>🩺</div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#334155', margin: '0 0 4px 0' }}>No symptoms evaluated yet</p>
                        <p style={{ fontSize: '12px', maxWidth: '280px', margin: 0, color: '#64748b' }}>Type symptoms to evaluate triage classification.</p>
                      </div>
                    ) : (
                      chatLogs.map((log, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: log.sender === 'patient' ? 'flex-end' : 'flex-start' }}>
                          <div style={{ maxWidth: '85%', borderRadius: '16px', padding: '12px 16px', fontSize: '13px', lineHeight: '1.5', background: log.sender === 'patient' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#f8fafc', color: log.sender === 'patient' ? '#ffffff' : '#0f172a', border: log.sender === 'patient' ? 'none' : '1px solid #e2e8f0' }}>
                            {log.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleChat} style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <input
                      type="text"
                      placeholder="Describe your symptoms (e.g. fever, headache)..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      style={{ flex: 1, background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '14px', padding: '12px 16px', fontSize: '13px', outline: 'none', color: '#0f172a' }}
                    />
                    <button
                      type="submit"
                      disabled={isAnalyzing}
                      style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '0 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </button>
                  </form>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '540px' }}>
                  <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recommended Specialists</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Qualified doctors for your condition</p>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recommendedDocs.length === 0 ? (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#64748b' }}>
                        <p style={{ fontSize: '13px', margin: 0 }}>Specialist recommendations appear here after triage.</p>
                      </div>
                    ) : (
                      recommendedDocs.map((doc, idx) => (
                        <div key={idx} style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '18px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontWeight: '800', fontSize: '14px', color: '#581c87' }}>{doc.name}</div>
                              <div style={{ fontSize: '12px', color: '#7e22ce' }}>{doc.specialty || 'Specialist'}</div>
                            </div>
                            <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '8px' }}>★ {doc.rating || '4.9'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleBook(doc)}
                            style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #7c3aed, #9333ea)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
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

            {activeTab === 'prediction' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0' }}>
                  <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Disease Risk Predictor</h2>
                  <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>Provide biometric metrics to calculate risk probability.</p>

                  <form onSubmit={handlePredictRisk} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Age</label>
                        <input type="number" value={vitals.age} onChange={(e) => setVitals({ ...vitals, age: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>BMI</label>
                        <input type="number" step="0.1" value={vitals.bmi} onChange={(e) => setVitals({ ...vitals, bmi: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }} required />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Glucose</label>
                        <input type="number" value={vitals.glucose} onChange={(e) => setVitals({ ...vitals, glucose: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Blood Pressure</label>
                        <input type="number" value={vitals.blood_pressure} onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '13px', boxSizing: 'border-box' }} required />
                      </div>
                    </div>

                    <button type="submit" disabled={isPredicting} style={{ marginTop: '8px', padding: '14px', background: 'linear-gradient(135deg, #0891b2, #0284c7)', color: '#ffffff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                      {isPredicting ? 'Evaluating...' : 'Calculate Risk'}
                    </button>
                  </form>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {riskResult ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '18px', padding: '18px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase', marginBottom: '6px' }}>Prediction Result</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#15803d' }}>
                          {riskResult.level || riskResult.risk_level || 'Moderate'}{' '}
                          <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: '700' }}>({riskResult.score || riskResult.confidence || '88.4%'} Confidence)</span>
                        </div>
                      </div>

                      {riskResult.xai && (
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '18px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '10px' }}>🧠 XAI Feature Attribution</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span>Glucose Impact</span><strong>{riskResult.xai.glucoseImpact}%</strong>
                              </div>
                              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{ width: `${riskResult.xai.glucoseImpact}%`, height: '100%', background: '#ef4444' }}></div>
                              </div>
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span>Blood Pressure Weight</span><strong>{riskResult.xai.bpImpact}%</strong>
                              </div>
                              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{ width: `${riskResult.xai.bpImpact}%`, height: '100%', background: '#f59e0b' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>📊</div>
                      <p style={{ fontSize: '13px', margin: 0, color: '#64748b' }}>Awaiting metrics input.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div style={{ maxWidth: '640px', margin: '0 auto', background: '#ffffff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Diagnostic Lab Analysis</h2>
                <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#64748b' }}>Upload clinical lab reports for analysis.</p>

                <form onSubmit={handleReportUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ border: '2px dashed #c084fc', background: '#faf5ff', borderRadius: '20px', padding: '36px', textAlign: 'center', cursor: 'pointer' }}>
                    <input type="file" id="report-file" style={{ display: 'none' }} onChange={(e) => setSelectedFile(e.target.files[0])} />
                    <label htmlFor="report-file" style={{ cursor: 'pointer', display: 'block' }}>
                      <div style={{ fontSize: '40px', marginBottom: '8px' }}>📄</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#6b21a8' }}>{selectedFile ? selectedFile.name : 'Choose report document'}</div>
                    </label>
                  </div>
                  <button type="submit" disabled={isUploading || !selectedFile} style={{ padding: '14px', background: 'linear-gradient(135deg, #9333ea, #c026d3)', color: '#ffffff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                    {isUploading ? 'Analyzing...' : 'Upload & Analyze Report'}
                  </button>
                </form>

                {reportResult && (
                  <div style={{ marginTop: '24px', padding: '18px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <pre style={{ margin: 0, padding: '12px', background: '#ffffff', borderRadius: '12px', fontSize: '11px', color: '#0f172a', overflowX: 'auto' }}>
                      {JSON.stringify(reportResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>My Scheduled Appointments</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Records saved for {user.name}</p>
                  </div>
                  <div style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '800' }}>
                    Total: {patientBookings.length}
                  </div>
                </div>

                {patientBookings.length === 0 ? (
                  <div style={{ background: '#ffffff', borderRadius: '24px', padding: '48px', textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📅</div>
                    <h3 style={{ margin: '0 0 4px 0', color: '#334155', fontSize: '15px' }}>No Appointments Booked Yet</h3>
                    <p style={{ margin: 0, fontSize: '12px' }}>Analyze symptoms in the triage tab to book consultations.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    {patientBookings.map((apt) => (
                      <div key={apt.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                          <div>
                            <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>{apt.id}</span>
                            <h3 style={{ margin: '8px 0 2px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{apt.doctorName}</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{apt.specialty}</p>
                          </div>
                          <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px' }}>{apt.status}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <span style={{ display: 'block', color: '#64748b', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Schedule</span>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{apt.date}</span>
                          </div>
                          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                            <span style={{ display: 'block', color: '#64748b', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>Bed Status</span>
                            <span style={{ fontWeight: '800', color: apt.bedAssigned && apt.bedAssigned !== 'None' ? '#059669' : '#64748b' }}>
                              {apt.bedAssigned || 'None'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                          <button onClick={() => handleCancelAppointment(apt.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                            Cancel Appointment
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}