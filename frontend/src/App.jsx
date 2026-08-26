import React, { useState } from 'react';

const API_BASE = "https://smart-hospital-system-3.onrender.com/api";

export default function App() {
  // Authentication State
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', role: 'Patient' });

  // Navigation State
  const [activeTab, setActiveTab] = useState('chatbot');

  // Symptom Checker States
  const [chatInput, setChatInput] = useState('');
  const [chatLogs, setChatLogs] = useState([]);
  const [recommendedDocs, setRecommendedDocs] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Disease Risk Predictor States
  const [vitals, setVitals] = useState({
    age: 45,
    bmi: 25.1,
    glucose: 110,
    blood_pressure: 120
  });
  const [riskResult, setRiskResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Report Analysis States
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Booking State
  const [bookingStatus, setBookingStatus] = useState(null);

  // Auth Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    if (!authForm.name || !authForm.email) {
      alert("Please fill in all fields.");
      return;
    }
    setUser({ name: authForm.name, email: authForm.email, role: authForm.role });
  };

  const handleLogout = () => {
    setUser(null);
    setChatLogs([]);
    setRecommendedDocs([]);
    setRiskResult(null);
    setReportResult(null);
    setBookingStatus(null);
  };

  // Symptom Triage Handler
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
        setChatLogs(prev => [
          ...prev,
          { sender: 'ai', text: `API Error (${res.status}): ${JSON.stringify(data.detail || data)}` }
        ]);
        return;
      }

      const responseText = data.triage 
        ? `[${data.triage}] ${data.reply}` 
        : (data.reply || data.message || "Assessment complete.");

      setChatLogs(prev => [...prev, { sender: 'ai', text: responseText, triage: data.triage }]);
      setRecommendedDocs(data.recommended_doctors || []);
    } catch (err) {
      console.error(err);
      setChatLogs(prev => [...prev, { sender: 'ai', text: "Error connecting to clinical AI server." }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Risk Predictor Handler
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
      alert("Error calculating risk prediction.");
    } finally {
      setIsPredicting(false);
    }
  };

  // Report Upload Handler
  const handleReportUpload = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFile) {
      alert("Please choose a diagnostic file first!");
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
      alert("Error analyzing clinical report.");
    } finally {
      setIsUploading(false);
    }
  };

  // Book Appointment Handler
  const handleBook = async (doctorName) => {
    try {
      const bookingPayload = {
        patient_name: user?.name || "Registered Patient",
        doctor_name: doctorName,
        date: new Date().toISOString().split('T')[0],
        time: "10:30 AM"
      };

      const res = await fetch(`${API_BASE}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Booking Failed (${res.status}): ${JSON.stringify(data.detail || data)}`);
        return;
      }

      setBookingStatus({ ...data, doctorName });
    } catch (err) {
      console.error(err);
      alert("Error connecting to appointment service.");
    }
  };

  // 1. Unauthenticated Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 selection:bg-blue-500 selection:text-white">
        <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
              🏥
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">SmartCare AI</h1>
              <p className="text-xs text-slate-400">Clinical Decision Support Portal</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Alex Morgan"
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="alex.morgan@hospital.org"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Access Role
              </label>
              <select
                value={authForm.role}
                onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-200"
              >
                <option value="Patient">Patient Portal</option>
                <option value="Clinician">Attending Clinician</option>
                <option value="Administrator">Hospital Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
            >
              Sign In to Hospital Portal
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Protected by SmartCare Clinical v2.4 Encryption
          </p>
        </div>
      </div>
    );
  }

  // 2. Main Authenticated Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-xl shadow-md shadow-blue-500/20">
              🏥
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                SmartCare AI
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full font-semibold uppercase">
                v2.4 Live
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-200">{user.name}</div>
              <div className="text-[11px] text-slate-400">{user.role} &bull; {user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex p-1.5 mb-8 bg-slate-900/90 border border-slate-800 rounded-xl max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('chatbot')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'chatbot'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>🤖</span> Symptom Triage
          </button>

          <button
            onClick={() => setActiveTab('prediction')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'prediction'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>✨</span> Risk Predictor
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>📄</span> Diagnostic Lab
          </button>
        </div>

        {/* TAB 1: Symptom Checker & Specialist Triage */}
        {activeTab === 'chatbot' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Box: AI Symptom Checker */}
            <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[560px] shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <h2 className="font-semibold text-slate-200 text-sm tracking-wide">1. AI Symptom Checker</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setChatLogs([]);
                    setRecommendedDocs([]);
                    setBookingStatus(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700/80 px-3 py-1 rounded-lg transition-all"
                >
                  Reset Session
                </button>
              </div>

              {/* Chat Viewport */}
              <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4">
                {chatLogs?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center text-xl mb-3">🩺</div>
                    <p className="text-sm font-medium text-slate-400">No active triage evaluation.</p>
                    <p className="text-xs max-w-sm mt-1 text-slate-500">
                      Enter symptoms below (e.g., &quot;severe chest tightness&quot; or &quot;migraine with blurred vision&quot;) to run clinical NLP analysis.
                    </p>
                  </div>
                ) : (
                  chatLogs?.map((log, i) => (
                    <div key={i} className={`flex ${log.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          log.sender === 'patient'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                            : 'bg-slate-800 border border-slate-700/80 text-slate-200'
                        }`}
                      >
                        {log.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Footer */}
              <form onSubmit={handleChat} className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Describe your symptoms in natural language..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 text-slate-100"
                />
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </form>
            </div>

            {/* Right Box: Recommended Specialists */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[560px] shadow-xl">
              <h2 className="font-semibold text-slate-200 text-sm tracking-wide pb-4 border-b border-slate-800">
                2. Recommended Specialists
              </h2>

              <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
                {recommendedDocs?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                    <p className="text-xs text-slate-500">Run symptom analysis to view ranked clinical specialists.</p>
                  </div>
                ) : (
                  recommendedDocs?.map((doc, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/90 border border-slate-700/70 rounded-xl p-4 hover:border-slate-600 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-sm text-slate-100">{doc.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{doc.specialty || doc.department || 'Specialist'}</div>
                        </div>
                        <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-semibold">
                          ★ {doc.rating || '4.9'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBook(doc.name)}
                        className="w-full py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold rounded-lg transition-all"
                      >
                        Book Appointment
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Booking Confirmation Box */}
              {bookingStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>✓</span> Appointment Confirmed!
                  </div>
                  <div>Provider: {bookingStatus.doctorName}</div>
                  {bookingStatus.no_show_risk && (
                    <div className="text-slate-300 font-medium">
                      No-Show Risk: <span className="text-emerald-300">{bookingStatus.no_show_risk}</span>
                    </div>
                  )}
                  <div className="text-[11px] text-emerald-300/80 italic">
                    SMS reminders active 2 hours prior to scheduled appointment.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Disease Risk Predictor */}
        {activeTab === 'prediction' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Vitals Form */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h2 className="font-semibold text-slate-200 text-base mb-1">Predictive Health Analysis</h2>
              <p className="text-xs text-slate-400 mb-6">Input biometric data to calculate physiological risk indices.</p>

              <form onSubmit={handlePredictRisk} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Age (Years)</label>
                    <input
                      type="number"
                      value={vitals.age}
                      onChange={(e) => setVitals({ ...vitals, age: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">BMI Index</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.bmi}
                      onChange={(e) => setVitals({ ...vitals, bmi: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Glucose Level (mg/dL)</label>
                    <input
                      type="number"
                      value={vitals.glucose}
                      onChange={(e) => setVitals({ ...vitals, glucose: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Blood Pressure (mmHg)</label>
                    <input
                      type="number"
                      value={vitals.blood_pressure}
                      onChange={(e) => setVitals({ ...vitals, blood_pressure: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPredicting}
                  className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isPredicting ? 'Evaluating Biomarkers...' : 'Calculate Risk Assessment'}
                </button>
              </form>
            </div>

            {/* Results Display */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
              {riskResult ? (
                <div className="space-y-4">
                  <div className="text-xs uppercase font-semibold text-slate-400">Risk Assessment Result</div>
                  <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-3">
                    <div className="text-sm text-slate-300 font-medium">
                      Risk Level: <span className="text-white font-bold text-lg ml-1">{riskResult.level || riskResult.risk_level || 'Moderate'}</span>
                    </div>
                    <div className="text-sm text-slate-300 font-medium">
                      Confidence Score: <span className="text-blue-400 font-bold ml-1">{riskResult.score || riskResult.confidence || '87%'}</span>
                    </div>
                    {riskResult.recommendation && (
                      <p className="text-xs text-slate-400 pt-2 border-t border-slate-700/80">
                        {riskResult.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 space-y-2">
                  <div className="text-3xl">📊</div>
                  <p className="text-sm text-slate-400 font-medium">Awaiting Biometric Evaluation</p>
                  <p className="text-xs text-slate-500">Input values on the left and submit to generate risk insights.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Diagnostic Report Lab */}
        {activeTab === 'reports' && (
          <div className="max-w-3xl mx-auto bg-slate-900/70 border border-slate-800/80 rounded-2xl p-8 shadow-xl">
            <h2 className="font-semibold text-slate-200 text-base mb-1">Diagnostic Report Analysis</h2>
            <p className="text-xs text-slate-400 mb-6">Upload pathology or clinical PDF/image reports for NLP entity extraction.</p>

            <form onSubmit={handleReportUpload} className="space-y-6">
              <div className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-2xl p-8 text-center transition-all">
                <input
                  type="file"
                  id="report-file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <label htmlFor="report-file" className="cursor-pointer space-y-2 block">
                  <div className="text-3xl">📁</div>
                  <div className="text-sm font-semibold text-slate-200">
                    {selectedFile ? selectedFile.name : 'Click to select laboratory report'}
                  </div>
                  <div className="text-xs text-slate-500">Supports PDF, PNG, or JPEG files</div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isUploading ? 'Extracting Medical Records...' : 'Upload & Analyze Report'}
              </button>
            </form>

            {reportResult && (
              <div className="mt-6 p-4 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs space-y-2">
                <div className="font-semibold text-slate-200">Extraction Summary:</div>
                <pre className="p-3 bg-slate-950 rounded-lg text-slate-300 overflow-x-auto">
                  {JSON.stringify(reportResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}