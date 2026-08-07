// src/App.jsx
import React, { useState } from 'react';

const API_BASE = "https://smart-hospital-system-3.onrender.com/api/chatbot"; 

export default function App() {
  const [activeTab, setActiveTab] = useState('chatbot');

  // States
  const [chatInput, setChatInput] = useState('');
  const [chatLogs, setChatLogs] = useState([]);
  const [recommendedDocs, setRecommendedDocs] = useState([]);
  const [vitals, setVitals] = useState({ age: 45, bmi: 25.1, glucose: 110, blood_pressure: 120 });
  const [riskResult, setRiskResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);

  // Handlers
  const handleChat = async () => {
    if (!chatInput) return;
    const userMsg = chatInput;
    setChatLogs(prev => [...prev, { sender: 'patient', text: userMsg }]);
    setChatInput('');

    try {
      const res = await fetch(`${API_BASE}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setChatLogs(prev => [...prev, { sender: 'ai', text: `${data.triage} - ${data.reply}` }]);
      setRecommendedDocs(data.recommended_doctors);
    } catch (err) {
      setChatLogs(prev => [...prev, { sender: 'ai', text: "Error: Ensure Python backend is running on port 8000!" }]);
    }
  };

  const handlePredictRisk = async () => {
  try {
    // 1. Convert string input fields in vitals to numbers (if needed)
    const formattedVitals = {
      age: Number(vitals.age),
      bmi: Number(vitals.bmi),
      glucose: Number(vitals.glucose),
      blood_pressure: Number(vitals.blood_pressure || vitals.bloodPressure)
    };

    const res = await fetch(`${API_BASE}/predict-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedVitals)
    });

    const data = await res.json();

    // 2. Check if backend returned an error status (like 404 or 422)
    if (!res.ok) {
      console.error("Backend Error Response:", data);
      alert(`API Error (${res.status}): ${JSON.stringify(data.detail)}`);
      return;
    }

    // 3. Success! Set the result
    setRiskResult(data);

  } catch (err) {
    console.error("Network Error:", err);
    alert("Error connecting to backend!");
  }
};

  const handleReportUpload = async (e) => {
  if (e) e.preventDefault();

  try {
    const formData = new FormData();
    // 'file' must match the parameter name expected in your FastAPI endpoint (e.g., file: UploadFile)
    formData.append('file', selectedFile); 

    const res = await fetch(`${API_BASE}/upload-report`, { // Double-check exact route in /docs
      method: 'POST',
      body: formData // Send FormData directly without JSON.stringify or custom Content-Type header
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Report upload error:", data);
      alert(`Upload Failed (${res.status}): ${JSON.stringify(data.detail)}`);
      return;
    }

    setReportAnalysis(data);

  } catch (err) {
    console.error("Network error during upload:", err);
    alert("Error uploading report to backend!");
  }
};

  const handleReportUpload = async (e) => {
  if (e) e.preventDefault();

  try {
    const formData = new FormData();
    // 'file' must match the parameter name expected in your FastAPI endpoint (e.g., file: UploadFile)
    formData.append('file', selectedFile); 

    const res = await fetch(`${API_BASE}/upload-report`, { // Double-check exact route in /docs
      method: 'POST',
      body: formData // Send FormData directly without JSON.stringify or custom Content-Type header
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Report upload error:", data);
      alert(`Upload Failed (${res.status}): ${JSON.stringify(data.detail)}`);
      return;
    }

    setReportAnalysis(data);

  } catch (err) {
    console.error("Network error during upload:", err);
    alert("Error uploading report to backend!");
  }
};

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">🏥 SmartCare AI Hospital Platform</h1>
        <span className="bg-blue-700 text-xs px-3 py-1 rounded-full border border-blue-400">AI v2.4 Active</span>
      </header>

      <div className="flex border-b bg-white px-6 gap-4 text-sm font-medium text-slate-600">
        {['chatbot', 'prediction', 'reports'] ?.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 capitalize border-b-2 transition-all ${
              activeTab === tab ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent'
            }`}
          >
            {tab === 'chatbot' && '🤖 Symptom Triage & Recommendations'}
            {tab === 'prediction' && '🔮 Disease Predictor'}
            {tab === 'reports' && '📑 Report Analysis'}
          </button>
        ))}
      </div>

      <main className="max-w-5xl mx-auto p-6">
        {activeTab === 'chatbot' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-4 rounded-xl shadow-sm border flex flex-col h-[450px]">
              <h2 className="font-semibold mb-2">1. AI Symptom Checker</h2>
              <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-50 rounded-lg">
                {chatLogs?.length === 0 && (
                  <p className="text-xs text-slate-400 text-center mt-10">Type symptoms below (e.g., "I have chest tightness and fatigue")</p>
                )}
                {chatLogs ?.map((log, i) => (
                  <div key={i} className={`flex ${log.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-lg text-sm max-w-[80%] ${log.sender === 'patient' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'}`}>
                      {log.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-blue-500"
                  placeholder="Describe your symptoms..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChat()}
                />
                <button onClick={handleChat} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Analyze</button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <h2 className="font-semibold mb-3">2. Recommended Specialists</h2>
              {recommendedDocs ?.length === 0 ? (
                <p className="text-xs text-slate-400">Run the symptom checker to get personalized doctor recommendations.</p>
              ) : (
                <div className="space-y-3">
                  {recommendedDocs ?.map(doc => (
                    <div key={doc.id} className="p-3 border rounded-lg hover:border-blue-300">
                      <p className="font-semibold text-sm">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.specialty} • ⭐ {doc.rating}</p>
                      <button onClick={() => handleBook(doc.name)} className="mt-2 w-full bg-slate-100 hover:bg-blue-50 text-blue-600 border text-xs py-1.5 rounded font-medium">
                        Book Appointment
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {bookingStatus && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  <p className="font-bold">✓ Booking Confirmed!</p>
                  <p>No-Show Risk: <strong>{bookingStatus.ai_insights.no_show_risk}</strong></p>
                  <p className="text-[10px] mt-1 text-slate-500">{bookingStatus.ai_insights.reminder_strategy}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'prediction' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border max-w-xl mx-auto">
            <h2 className="font-semibold text-lg mb-4">3. Health Risk Predictor</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Age</label>
                <input type="number" value={vitals.age} onChange={e => setVitals({...vitals, age: +e.target.value})} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">BMI</label>
                <input type="number" value={vitals.bmi} onChange={e => setVitals({...vitals, bmi: +e.target.value})} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Glucose (mg/dL)</label>
                <input type="number" value={vitals.glucose} onChange={e => setVitals({...vitals, glucose: +e.target.value})} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Blood Pressure (mmHg)</label>
                <input type="number" value={vitals.blood_pressure} onChange={e => setVitals({...vitals, blood_pressure: +e.target.value})} className="w-full border p-2 rounded" />
              </div>
            </div>
            <button onClick={handlePredictRisk} className="mt-5 w-full bg-blue-600 text-white py-2 rounded-lg font-medium text-sm">
              Calculate Risk Assessment
            </button>

            {riskResult && (
              <div className="mt-5 p-4 bg-slate-50 rounded-lg border">
                <p className="text-xs text-slate-500">Score: {riskResult.risk_score}</p>
                <p className={`text-base font-bold mt-1 ${riskResult.risk_level === 'High Risk' ? 'text-red-600' : 'text-emerald-600'}`}>
                  Level: {riskResult.risk_level}
                </p>
                <p className="text-xs text-slate-600 mt-2">{riskResult.recommendation}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border max-w-xl mx-auto">
            <h2 className="font-semibold text-lg mb-2">4. Medical Report & Scan Analyzer</h2>
            <p className="text-xs text-slate-500 mb-4">Upload a lab report PDF or X-Ray image for AI interpretation.</p>
            <input type="file" onChange={e => setSelectedFile(e.target.files[0])} className="block w-full text-xs text-slate-500 mb-4" />
            <button onClick={handleReportUpload} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium text-sm">
              Analyze Document
            </button>

            {reportResult && (
              <div className="mt-5 p-4 bg-blue-50/50 rounded-lg border text-xs space-y-2">
                <p className="font-semibold text-blue-900">File: {reportResult.file_processed}</p>
                <p className="text-slate-700"><strong>Findings:</strong> {reportResult.ai_findings}</p>
                <p className="text-slate-600"><strong>Explanation:</strong> {reportResult.simplified_explanation}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}