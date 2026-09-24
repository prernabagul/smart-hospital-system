import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  actionRoute?: string;
  actionText?: string;
}

const medicalTermsDb: Record<string, string> = {
  mri: "Magnetic Resonance Imaging (MRI) is a non-invasive imaging technology that produces detailed 3D anatomical images. It uses strong magnetic fields and radio waves to generate images of organs, soft tissues, bones, and internal structures without using harmful radiation.",
  hypertension: "Hypertension is the medical term for high blood pressure (130/80 mmHg or higher). Left untreated, it can increase the risk of heart disease, stroke, and kidney issues.",
  cbc: "Complete Blood Count (CBC) is a common blood test that measures red blood cells, white blood cells, hemoglobin, hematocrit, and platelets to evaluate overall health and detect disorders like anemia or infection.",
  hyperglycemia: "Hyperglycemia means high blood sugar levels. It commonly occurs in individuals with diabetes when the body has too little insulin or cannot use insulin properly.",
  electrocardiogram: "An Electrocardiogram (ECG/EKG) records the electrical signals in your heart to check for heart conditions, abnormal rhythms, or previous heart attacks.",
  ecg: "An Electrocardiogram (ECG/EKG) records the electrical signals in your heart to check for heart conditions, abnormal rhythms, or previous heart attacks.",
};

export const AIChatbot: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! I am your AI Health Assistant. How can I help you today? You can select a quick prompt below or type your question.',
    },
  ]);
  const [input, setInput] = useState('');

  const processResponse = (userInput: string, history: Message[]): Message => {
    const cleanInput = userInput.trim().toLowerCase();
    const lastBotMsg = history.filter((m) => m.sender === 'bot').slice(-1)[0]?.text.toLowerCase() || '';

    // 1. Initial Quick Prompts
    if (cleanInput === 'explain a medical term') {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'I can explain medical terms! Please type the exact term (e.g., MRI, Hypertension, CBC, Hyperglycemia).',
      };
    }

    if (cleanInput === 'which doctor should i consult?') {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Tell me your symptoms (e.g., chest pain, skin rash, persistent headache), and I will match you with a specialist.',
      };
    }

    if (cleanInput === 'help me book an appointment') {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'To book an appointment, please mention your preferred department (e.g., Cardiology, Dermatology, General Medicine).',
      };
    }

    if (cleanInput === 'analyze my lab report') {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'You can paste your lab test values here (e.g., "Hemoglobin: 10.5 g/dL") for a quick metric breakdown.',
        actionRoute: '/report-analysis',
        actionText: 'Go to Full Lab Analyzer →',
      };
    }

    // 2. Department & Doctor Booking Logic (Handles replies after "book an appointment")
    if (
      lastBotMsg.includes('preferred department') ||
      cleanInput.includes('dermatology') ||
      cleanInput.includes('cardiology') ||
      cleanInput.includes('medicine') ||
      cleanInput.includes('neurology')
    ) {
      let deptName = 'General Medicine';
      if (cleanInput.includes('dermatology') || cleanInput.includes('skin')) deptName = 'Dermatology';
      if (cleanInput.includes('cardiology') || cleanInput.includes('heart')) deptName = 'Cardiology';
      if (cleanInput.includes('neurology') || cleanInput.includes('brain')) deptName = 'Neurology';

      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `We have active specialists available in **${deptName}**! Click below to view available time slots and finalize your booking.`,
        actionRoute: '/doctors',
        actionText: `Book ${deptName} Doctor Now →`,
      };
    }

    // 3. Medical Term Lookup
    if (lastBotMsg.includes('exact term') || medicalTermsDb[cleanInput]) {
      if (medicalTermsDb[cleanInput]) {
        return {
          id: Date.now().toString(),
          sender: 'bot',
          text: medicalTermsDb[cleanInput],
        };
      }
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: `"${userInput}" refers to clinical medical terminology. For precise guidance regarding this condition, consulting a specialist is recommended.`,
        actionRoute: '/doctors',
        actionText: 'Find Specialist Doctor →',
      };
    }

    // 4. Symptom Matching
    if (cleanInput.includes('chest') || cleanInput.includes('heart')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Based on your symptoms, consulting a **Cardiologist** is recommended.',
        actionRoute: '/doctors',
        actionText: 'Find Cardiology Doctors →',
      };
    }
    if (cleanInput.includes('skin') || cleanInput.includes('rash')) {
      return {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Based on your symptoms, consulting a **Dermatologist** is recommended.',
        actionRoute: '/doctors',
        actionText: 'Find Dermatology Doctors →',
      };
    }

    // 5. Default Fallback with Routing Action
    return {
      id: Date.now().toString(),
      sender: 'bot',
      text: `For assistance regarding "${userInput}", you can search for specialists or schedule an appointment using our doctor directory.`,
      actionRoute: '/doctors',
      actionText: 'View All Doctors →',
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
    };

    const newHistory = [...messages, userMsg];
    const botMsg = processResponse(text, messages);

    setMessages([...newHistory, botMsg]);
    if (!textToSend) setInput('');
  };

  return (
    <div style={{ maxWidth: '850px', margin: '30px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', backgroundColor: '#00897b', color: '#fff', borderRadius: '12px 12px 0 0' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>🤖 AI Health Assistant</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
          Instant medical term explanation, appointment booking & doctor recommendations
        </p>
      </div>

      {/* Chat Box */}
      <div
        style={{
          border: '1px solid #e0e0e0',
          borderTop: 'none',
          height: '420px',
          overflowY: 'auto',
          padding: '20px',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              backgroundColor: msg.sender === 'user' ? '#00897b' : '#ffffff',
              color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
              padding: '12px 16px',
              borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            <div>{msg.text}</div>
            {msg.actionRoute && (
              <button
                onClick={() => navigate(msg.actionRoute!)}
                style={{
                  marginTop: '10px',
                  padding: '8px 14px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-block',
                }}
              >
                {msg.actionText}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Quick Option Pills */}
      <div style={{ padding: '12px', backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderTop: 'none', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          'Which doctor should I consult?',
          'Explain a medical term',
          'Help me book an appointment',
          'Analyze my lab report',
        ].map((option) => (
          <button
            key={option}
            onClick={() => handleSend(option)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#e0f2f1',
              color: '#00695c',
              border: '1px solid #80cbd2',
              borderRadius: '20px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', marginTop: '8px', gap: '8px' }}
      >
        <input
          type="text"
          placeholder="Ask a health question or type a department like Dermatology..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 24px',
            backgroundColor: '#00897b',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AIChatbot;