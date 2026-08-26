import React, { useState, useEffect } from 'react';

const API_BASE = "https://smart-hospital-system-3.onrender.com/api";

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', role: 'Patient' });

  // Navigation
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

  // 1. Clean Authentication Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-800">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner">
              ✚
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">SmartCare Clinical</h1>
            <p className="text-xs text-slate-500 mt-1">Enterprise Hospital AI Decision Suite</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Dr. Alex Morgan"
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-slate-900 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="alex.morgan@hospital.org"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-slate-900 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Portal Role
              </label>
              <select
                value={authForm.role}
                onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-slate-800"
              >
                <option value="Patient">Patient Workspace</option>
                <option value="Clinician">Clinical Practitioner</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.99] mt-2"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Main Clinical Dashboard (Spacious & Clean Layout)
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col antialiased">
      {/* Top Professional Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
              ✚
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900">SmartCare AI</span>
              <span className="ml-2.5 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Clinical Live
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-5">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800">{user.name}</div>
              <div className="text-[11px] text-slate-500">{user.role} &bull; {user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* Navigation Tabs Bar */}
        <div className="flex p-1 mb-8 bg-slate-200/60 rounded-2xl max-w-2xl mx-auto shadow-inner">
          {[
            { id: 'chatbot', label: 'Symptom Triage', icon: '🩺' },
            { id: 'prediction', label: 'Risk Predictor', icon: '📊' },
            { id: 'reports', label: 'Diagnostic Lab', icon: '📄' },
            { id: 'appointments', label: `My Bookings (${appointments.length})`, icon: '📅' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Symptom Checker & Specialist Directory */}
        {activeTab === 'chatbot' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Interactive Triage Chat */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col h-[580px]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">AI Symptom Classification</h2>
                  <p className="text-xs text-slate-500">Natural language NLP diagnostic assistant</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setChatLogs([]);
                    setRecommendedDocs([]);
                    setBookingStatus(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all"
                >
                  Clear Session
                </button>
              </div>

              {/* Chat Viewport */}
              <div className="flex-1 overflow-y-auto my-5 space-y-4 pr-1">
                {chatLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl mb-3 border border-slate-100">
                      🩺
                    </div>
                    <p className="text-sm font-medium text-slate-600">No symptoms evaluated yet</p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Type your current symptoms in plain words below to generate diagnostic recommendations.
                    </p>
                  </div>
                ) : (
                  chatLogs.map((log, i) => (
                    <div key={i} className={`flex ${log.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          log.sender === 'patient'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-50 border border-slate-200/70 text-slate-800 shadow-sm'
                        }`}
                      >
                        {log.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleChat} className="flex gap-2 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Describe your symptoms (e.g., sharp headache with photophobia)..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 placeholder-slate-400 text-slate-900"
                />
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </form>
            </div>

            {/* Right Column: Specialists */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col h-[580px]">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 text-sm">Recommended Specialists</h2>
                <p className="text-xs text-slate-500">Ranked by symptom alignment</p>
              </div>

              <div className="flex-1 overflow-y-auto my-4 space-y-3.5 pr-1">
                {recommendedDocs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <p className="text-xs text-slate-400">Run symptom analysis to view qualified medical practitioners.</p>
                  </div>
                ) : (
                  recommendedDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-indigo-200 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-sm text-slate-900">{doc.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{doc.specialty || 'Specialist'}</div>
                        </div>
                        <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-lg">
                          ★ {doc.rating || '4.9'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBook(doc)}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all"
                      >
                        Book Consultation
                      </button>
                    </div>
                  ))
                )}
              </div>

              {bookingStatus && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>✓</span> Consultation Confirmed
                  </div>
                  <div>Doctor: <strong>{bookingStatus.doctorName}</strong></div>
                  <div className="text-slate-600">
                    Calculated No-Show Risk: <span className="font-semibold text-slate-800">{bookingStatus.no_show_risk || "18.5%"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Biometric Risk Predictor */}
        {activeTab === 'prediction' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
              <h2 className="font-bold text-slate-900 text-base mb-1">Physiological Risk Matrix</h2>
              <p className="text-xs text-slate-500 mb-6">Enter biometric measurements for multivariate disease risk scoring.</p>

              <form onSubmit={handlePredictRisk} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Patient Age</label>
                    <input
                      type="number"
                      value={vitals.age}
                      onChange={(e) => setVitals({ ...vitals, age: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Body Mass Index (BMI)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.bmi}
                      onChange={(e) => setVitals({ ...vitals, bmi: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fasting Glucose (mg/dL)</label>
                    <input
                      type="number"
                      value={vitals.glucose}
                      onChange={(e) => setVitals({ ...vitals, glucose: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Resting BP (mmHg)</label>
                    <input
                      type="number"
                      value={vitals.blood_pressure}
                      onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPredicting}
                  className="w-full mt-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50"
                >
                  {isPredicting ? 'Evaluating Risk Parameters...' : 'Calculate Risk Assessment'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col justify-center">
              {riskResult ? (
                <div className="space-y-4">
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-400">Clinical Risk Output</div>
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-sm font-medium text-slate-600">Calculated Risk Level:</span>
                      <span className="text-base font-bold text-slate-900">{riskResult.level || riskResult.risk_level || 'Moderate'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-sm font-medium text-slate-600">Statistical Confidence:</span>
                      <span className="text-base font-bold text-indigo-600">{riskResult.score || riskResult.confidence || '88.4%'}</span>
                    </div>
                    {riskResult.recommendation && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {riskResult.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 space-y-2 py-8">
                  <div className="text-3xl">📊</div>
                  <p className="text-sm font-semibold text-slate-600">Biometric Scoring Inactive</p>
                  <p className="text-xs text-slate-400">Provide parameters on the left to produce statistical health forecasts.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Diagnostic Report Extraction */}
        {activeTab === 'reports' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <h2 className="font-bold text-slate-900 text-base mb-1">Diagnostic Report Analysis</h2>
            <p className="text-xs text-slate-500 mb-6">Upload laboratory sheets or clinical PDF/PNG findings for automated NLP extraction.</p>

            <form onSubmit={handleReportUpload} className="space-y-6">
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-3xl p-10 text-center transition-all bg-slate-50/50">
                <input
                  type="file"
                  id="report-file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <label htmlFor="report-file" className="cursor-pointer space-y-2.5 block">
                  <div className="text-3xl">📁</div>
                  <div className="text-sm font-semibold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Select diagnostic report document'}
                  </div>
                  <div className="text-xs text-slate-400">PDF, PNG, or JPEG formats supported</div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm shadow-md shadow-indigo-600/10 transition-all disabled:opacity-50"
              >
                {isUploading ? 'Extracting Medical Records...' : 'Upload & Analyze Document'}
              </button>
            </form>

            {reportResult && (
              <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                <div className="font-semibold text-slate-800">Extraction Summary:</div>
                <pre className="p-4 bg-white border border-slate-200 rounded-xl text-slate-700 overflow-x-auto text-[11px]">
                  {JSON.stringify(reportResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Booked Consultations */}
        {activeTab === 'appointments' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Patient Consultations & History</h2>
                <p className="text-xs text-slate-500">Live ledger of scheduled clinical appointments for {user.name}.</p>
              </div>
              <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold">
                Total Consultations: {appointments.length}
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 shadow-sm">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="text-slate-800 font-semibold text-sm">No Scheduled Consultations</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Run a triage assessment in the Symptom Triage tab and select a recommended specialist to add an appointment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-6 shadow-sm space-y-4 transition-all"
                  >
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                          {apt.id}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-2">{apt.doctorName}</h3>
                        <p className="text-xs text-slate-500">{apt.specialty}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        {apt.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] font-medium uppercase">Schedule</span>
                        <span className="text-slate-800 font-semibold">{apt.date} &bull; {apt.time}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] font-medium uppercase">No-Show Risk</span>
                        <span className="text-emerald-600 font-semibold">{apt.noShowRisk}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline transition-all"
                      >
                        Cancel Consultation
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
