import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionButtons?: { label: string; action: () => void }[];
}

export const AiHealthAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello! I am your AI Health Assistant. How can I assist you with your health or hospital services today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Helper to send assistant reply
  const addAssistantMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper to handle user submit
  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      addAssistantMessage(`I have received your query regarding "${text}". Our health systems are reviewing this details. Is there anything else you'd like to check?`);
    }, 800);
  };

  // Quick Action Handlers
  const handleAction = (actionKey: string) => {
    switch (actionKey) {
      case 'find_doctor':
        navigate('/doctors');
        break;
      case 'find_department':
        navigate('/departments');
        break;
      case 'book_appointment':
        navigate('/appointments/book');
        break;
      case 'analyze_report':
        setIsAnalyzing(true);
        addAssistantMessage('Please upload or select your medical report document (PDF, JPG) to begin AI analysis.');
        setTimeout(() => setIsAnalyzing(false), 1000);
        break;
      case 'explain_term':
        const term = prompt('Enter the medical term or acronym you would like explained:');
        if (term) {
          handleSend(`Explain medical term: ${term}`);
        }
        break;
      case 'view_appointments':
        navigate('/appointments');
        break;
      case 'view_prescriptions':
        navigate('/prescriptions');
        break;
      case 'emergency_help':
        alert('🚨 EMERGENCY PROTOCOL TRIGGERED!\n\nCalling Emergency Dispatch Hotline: +1 (800) 555-0199\nLocation tracking enabled for immediate ambulance dispatch.');
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🤖</span> AI Health Assistant
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Instant triage support, report analysis, appointment booking, and emergency assistance.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
        >
          &larr; Back to Dashboard
        </button>
      </div>

      {/* Emergency Alert Banner */}
      <div style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '14px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🚨</span>
          <div>
            <strong style={{ color: '#991b1b', fontSize: '14px', display: 'block' }}>Experiencing a Medical Emergency?</strong>
            <span style={{ color: '#b91c1c', fontSize: '12px' }}>If you have severe chest pain, shortness of breath, or uncontrollable bleeding, call emergency services immediately.</span>
          </div>
        </div>
        <button
          onClick={() => handleAction('emergency_help')}
          style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
        >
          🚑 Emergency Call (+1 800 555-0199)
        </button>
      </div>

      {/* Quick Action Buttons Grid */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
          Quick Actions & Services
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          
          <button
            onClick={() => handleAction('find_doctor')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#0f172a', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <span style={{ fontSize: '22px' }}>👨‍⚕️</span> Find a Doctor
          </button>

          <button
            onClick={() => handleAction('find_department')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#0f172a', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <span style={{ fontSize: '22px' }}>🏥</span> Find a Department
          </button>

          <button
            onClick={() => handleAction('book_appointment')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0d9488', border: 'none', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#ffffff', textAlign: 'left', boxShadow: '0 2px 4px rgba(13,148,136,0.2)' }}
          >
            <span style={{ fontSize: '22px' }}>📅</span> Book Appointment
          </button>

          <button
            onClick={() => handleAction('analyze_report')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#0f172a', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <span style={{ fontSize: '22px' }}>📊</span> Analyze Report
          </button>

          <button
            onClick={() => handleAction('explain_term')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#0f172a', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <span style={{ fontSize: '22px' }}>💡</span> Explain Medical Term
          </button>

          <button
            onClick={() => handleAction('view_appointments')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#0f172a', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <span style={{ fontSize: '22px' }}>📋</span> View Appointments
          </button>

          <button
            onClick={() => handleAction('view_prescriptions')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#0f172a', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
          >
            <span style={{ fontSize: '22px' }}>💊</span> View Prescriptions
          </button>

          <button
            onClick={() => handleAction('emergency_help')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#dc2626', textAlign: 'left' }}
          >
            <span style={{ fontSize: '22px' }}>🆘</span> Emergency Help
          </button>

        </div>
      </div>

      {/* Main Interactive AI Chat Window */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', height: '520px', overflow: 'hidden' }}>
        
        {/* Chat Header */}
        <div style={{ backgroundColor: '#f8fafc', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>💬</span>
            <div>
              <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>Health Assistant Consultation</strong>
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>● AI Online & Ready</span>
            </div>
          </div>
          {isAnalyzing && <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600' }}>Processing document...</span>}
        </div>

        {/* Messages Body */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#fbfcfd' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                backgroundColor: msg.sender === 'user' ? '#0d9488' : '#ffffff',
                color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                padding: '12px 16px',
                borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                fontSize: '14px',
                lineHeight: '1.5',
                border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}>
                {msg.text}
              </div>
              <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', padding: '0 4px' }}>
                {msg.timestamp}
              </span>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Type symptoms, medical questions, or ask for guidance..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            onClick={() => handleSend()}
            style={{
              backgroundColor: '#0d9488',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
};
